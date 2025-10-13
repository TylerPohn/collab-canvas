import { QueryClient } from '@tanstack/react-query'
import {
  batchCreateObjects,
  batchDeleteObjects,
  batchUpdateObjects,
  createObject,
  deleteObject,
  getAllObjects,
  getObject,
  subscribeToObjects,
  updateObject
} from '../firebase/firestore'
import type { Shape } from '../types'

// Query keys for React Query
export const objectKeys = {
  all: ['objects'] as const,
  lists: () => [...objectKeys.all, 'list'] as const,
  list: (canvasId: string) => [...objectKeys.lists(), canvasId] as const,
  details: () => [...objectKeys.all, 'detail'] as const,
  detail: (canvasId: string, objectId: string) =>
    [...objectKeys.details(), canvasId, objectId] as const
}

// PR #7: React Query + Firestore snapshot bridge
export class ObjectSyncService {
  private queryClient: QueryClient
  private subscriptions: Map<string, () => void> = new Map()

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient
  }

  // Subscribe to objects for a canvas
  subscribeToObjects(canvasId: string) {
    const queryKey = objectKeys.list(canvasId)

    // Clean up existing subscription
    this.unsubscribeFromObjects(canvasId)

    const unsubscribe = subscribeToObjects(canvasId, objects => {
      // Update React Query cache with latest objects
      this.queryClient.setQueryData(queryKey, objects)
    })

    this.subscriptions.set(canvasId, unsubscribe)
    return unsubscribe
  }

  // Unsubscribe from objects
  unsubscribeFromObjects(canvasId: string) {
    const unsubscribe = this.subscriptions.get(canvasId)
    if (unsubscribe) {
      unsubscribe()
      this.subscriptions.delete(canvasId)
    }
  }

  // Clean up all subscriptions
  cleanup() {
    this.subscriptions.forEach(unsubscribe => unsubscribe())
    this.subscriptions.clear()
  }

  // PR #7: Optimistic updates with conflict resolution
  async createObject(
    canvasId: string,
    object: Omit<
      Shape,
      'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
    >,
    userId: string
  ): Promise<Shape> {
    const queryKey = objectKeys.list(canvasId)
    const now = Date.now()

    // Generate ID
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create optimistic object
    const optimisticObject: Shape = {
      ...object,
      id,
      createdAt: now,
      createdBy: userId,
      updatedAt: now,
      updatedBy: userId
    } as Shape

    // Optimistic update
    this.queryClient.setQueryData(queryKey, (old: Shape[] = []) => [
      ...old,
      optimisticObject
    ])

    try {
      // Create in Firestore
      await createObject(canvasId, optimisticObject, userId)

      // Return the created object
      return optimisticObject
    } catch (error) {
      // Rollback optimistic update
      this.queryClient.setQueryData(queryKey, (old: Shape[] = []) =>
        old.filter(obj => obj.id !== id)
      )
      throw error
    }
  }

  async updateObject(
    canvasId: string,
    objectId: string,
    updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>,
    userId: string
  ): Promise<void> {
    const queryKey = objectKeys.list(canvasId)
    const now = Date.now()

    // Optimistic update
    this.queryClient.setQueryData(queryKey, (old: Shape[] = []) =>
      old.map(obj =>
        obj.id === objectId
          ? {
              ...obj,
              ...updates,
              updatedAt: now,
              updatedBy: userId
            }
          : obj
      )
    )

    try {
      // Update in Firestore
      await updateObject(canvasId, objectId, updates, userId)
    } catch (error) {
      // Rollback optimistic update - refetch from server
      this.queryClient.invalidateQueries({ queryKey })
      throw error
    }
  }

  async deleteObject(canvasId: string, objectId: string): Promise<void> {
    const queryKey = objectKeys.list(canvasId)

    // Store original object for rollback
    const originalObjects =
      this.queryClient.getQueryData<Shape[]>(queryKey) || []
    const originalObject = originalObjects.find(obj => obj.id === objectId)

    // Optimistic update
    this.queryClient.setQueryData(queryKey, (old: Shape[] = []) =>
      old.filter(obj => obj.id !== objectId)
    )

    try {
      // Delete in Firestore
      await deleteObject(canvasId, objectId)
    } catch (error) {
      // Rollback optimistic update
      if (originalObject) {
        this.queryClient.setQueryData(queryKey, (old: Shape[] = []) => [
          ...old,
          originalObject
        ])
      }
      throw error
    }
  }

  async batchCreateObjects(
    canvasId: string,
    objects: Omit<
      Shape,
      'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
    >[],
    userId: string
  ): Promise<Shape[]> {
    const queryKey = objectKeys.list(canvasId)
    const now = Date.now()

    // Generate IDs and create optimistic objects
    const optimisticObjects: Shape[] = objects.map(object => ({
      ...object,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      createdBy: userId,
      updatedAt: now,
      updatedBy: userId
    })) as Shape[]

    // Optimistic update
    this.queryClient.setQueryData(queryKey, (old: Shape[] = []) => [
      ...old,
      ...optimisticObjects
    ])

    try {
      // Batch create in Firestore
      await batchCreateObjects(canvasId, optimisticObjects, userId)
      return optimisticObjects
    } catch (error) {
      // Rollback optimistic update
      this.queryClient.setQueryData(queryKey, (old: Shape[] = []) =>
        old.filter(obj => !optimisticObjects.some(opt => opt.id === obj.id))
      )
      throw error
    }
  }

  async batchUpdateObjects(
    canvasId: string,
    updates: Array<{
      objectId: string
      updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
    }>,
    userId: string
  ): Promise<void> {
    const queryKey = objectKeys.list(canvasId)
    const now = Date.now()

    // Store original objects for rollback
    const originalObjects =
      this.queryClient.getQueryData<Shape[]>(queryKey) || []

    // Optimistic update
    this.queryClient.setQueryData(queryKey, (old: Shape[] = []) =>
      old.map(obj => {
        const update = updates.find(u => u.objectId === obj.id)
        return update
          ? {
              ...obj,
              ...update.updates,
              updatedAt: now,
              updatedBy: userId
            }
          : obj
      })
    )

    try {
      // Batch update in Firestore
      await batchUpdateObjects(canvasId, updates, userId)
    } catch (error) {
      // Rollback optimistic update
      this.queryClient.setQueryData(queryKey, originalObjects)
      throw error
    }
  }

  async batchDeleteObjects(
    canvasId: string,
    objectIds: string[]
  ): Promise<void> {
    const queryKey = objectKeys.list(canvasId)

    // Store original objects for rollback
    const originalObjects =
      this.queryClient.getQueryData<Shape[]>(queryKey) || []

    // Optimistic update
    this.queryClient.setQueryData(queryKey, (old: Shape[] = []) =>
      old.filter(obj => !objectIds.includes(obj.id))
    )

    try {
      // Batch delete in Firestore
      await batchDeleteObjects(canvasId, objectIds)
    } catch (error) {
      // Rollback optimistic update
      this.queryClient.setQueryData(queryKey, originalObjects)
      throw error
    }
  }

  // PR #7: Conflict resolution - last write wins
  async resolveConflicts(canvasId: string): Promise<void> {
    const queryKey = objectKeys.list(canvasId)

    // Invalidate and refetch to get latest server state
    await this.queryClient.invalidateQueries({ queryKey })
  }

  // Get single object
  async getObject(canvasId: string, objectId: string): Promise<Shape | null> {
    return await getObject(canvasId, objectId)
  }

  // Get all objects
  async getAllObjects(canvasId: string): Promise<Shape[]> {
    return await getAllObjects(canvasId)
  }
}

// Export singleton instance
let objectSyncService: ObjectSyncService | null = null

export function getObjectSyncService(
  queryClient: QueryClient
): ObjectSyncService {
  if (!objectSyncService) {
    objectSyncService = new ObjectSyncService(queryClient)
  }
  return objectSyncService
}
