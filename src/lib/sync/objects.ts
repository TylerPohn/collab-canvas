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
import { securityLogger, shapeRateLimiter } from '../security'
import type { Shape } from '../types'

// Performance optimization constants
const DRAG_DEBOUNCE_MS = 50
const MAX_BATCH_SIZE = 10
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000

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
  private debouncedUpdates: Map<string, ReturnType<typeof setTimeout>> =
    new Map()
  private pendingUpdates: Map<
    string,
    {
      objectId: string
      updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
      userId: string
    }
  > = new Map()

  // PR #15.3: Batch update system for multi-object movement
  private debouncedBatchUpdates: Map<string, ReturnType<typeof setTimeout>> =
    new Map()
  private pendingBatchUpdates: Map<
    string,
    {
      updates: Array<{
        objectId: string
        updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
      }>
      userId: string
    }
  > = new Map()

  // PR #13.9.5: Operation queuing for offline scenarios
  private operationQueue: Array<{
    id: string
    type: 'create' | 'update' | 'delete' | 'batchUpdate'
    canvasId: string
    data: any
    userId: string
    retryCount: number
    timestamp: number
  }> = []
  private isOnline: boolean = navigator.onLine
  private isProcessingQueue: boolean = false

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient
    this.setupNetworkMonitoring()
  }

  // PR #13.9.5: Setup network monitoring for offline/online detection
  private setupNetworkMonitoring() {
    const handleOnline = () => {
      this.isOnline = true
      console.log('[ObjectSync] Network online - processing queued operations')
      this.processOperationQueue()
    }

    const handleOffline = () => {
      this.isOnline = false
      console.log('[ObjectSync] Network offline - queuing operations')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  // PR #13.9.5: Add operation to queue
  private addToQueue(
    type: 'create' | 'update' | 'delete' | 'batchUpdate',
    canvasId: string,
    data: any,
    userId: string
  ): string {
    const operationId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.operationQueue.push({
      id: operationId,
      type,
      canvasId,
      data,
      userId,
      retryCount: 0,
      timestamp: Date.now()
    })

    console.log(`[ObjectSync] Queued operation: ${type} (${operationId})`)
    return operationId
  }

  // PR #13.9.5: Process queued operations when back online
  private async processOperationQueue() {
    if (
      this.isProcessingQueue ||
      !this.isOnline ||
      this.operationQueue.length === 0
    ) {
      return
    }

    this.isProcessingQueue = true
    console.log(
      `[ObjectSync] Processing ${this.operationQueue.length} queued operations`
    )

    const operationsToProcess = [...this.operationQueue]
    this.operationQueue = []

    for (const operation of operationsToProcess) {
      try {
        await this.executeQueuedOperation(operation)
        console.log(
          `[ObjectSync] Successfully processed queued operation: ${operation.id}`
        )
      } catch (error) {
        console.error(
          `[ObjectSync] Failed to process queued operation: ${operation.id}`,
          error
        )

        // Retry if we haven't exceeded max attempts
        if (operation.retryCount < MAX_RETRY_ATTEMPTS) {
          operation.retryCount++
          this.operationQueue.push(operation)
          console.log(
            `[ObjectSync] Retrying operation ${operation.id} (attempt ${operation.retryCount})`
          )
        } else {
          console.error(
            `[ObjectSync] Max retries exceeded for operation: ${operation.id}`
          )
          // TODO: Could emit an event here for UI to show failed operations
        }
      }
    }

    this.isProcessingQueue = false

    // If there are still operations in the queue (retries), process them after a delay
    if (this.operationQueue.length > 0) {
      setTimeout(() => this.processOperationQueue(), RETRY_DELAY_MS)
    }
  }

  // PR #13.9.5: Execute a queued operation
  private async executeQueuedOperation(operation: any) {
    switch (operation.type) {
      case 'create':
        await createObject(
          operation.canvasId,
          operation.data.object,
          operation.userId
        )
        break
      case 'update':
        await updateObject(
          operation.canvasId,
          operation.data.objectId,
          operation.data.updates,
          operation.userId
        )
        break
      case 'delete':
        await deleteObject(operation.canvasId, operation.data.objectId)
        break
      case 'batchUpdate':
        await this.smartBatchUpdateObjects(
          operation.canvasId,
          operation.data.updates,
          operation.userId
        )
        break
      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }
  }

  // PR #13.9.5: Check if error is network-related
  private isNetworkError(error: any): boolean {
    if (!error) return false

    // Check for common network error patterns
    const errorMessage = error.message?.toLowerCase() || ''
    const networkErrorPatterns = [
      'network error',
      'connection failed',
      'timeout',
      'offline',
      'unreachable',
      'fetch failed',
      'connection refused',
      'no internet',
      'network request failed'
    ]

    return (
      networkErrorPatterns.some(pattern => errorMessage.includes(pattern)) ||
      error.code === 'unavailable' ||
      error.code === 'deadline-exceeded' ||
      (error.status >= 500 && error.status < 600)
    )
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

    // Clean up debounced updates
    this.debouncedUpdates.forEach(timeout => clearTimeout(timeout))
    this.debouncedUpdates.clear()
    this.pendingUpdates.clear()

    // Clean up debounced batch updates
    this.debouncedBatchUpdates.forEach(timeout => clearTimeout(timeout))
    this.debouncedBatchUpdates.clear()
    this.pendingBatchUpdates.clear()
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
    // Rate limiting check
    if (!shapeRateLimiter.isAllowed(userId)) {
      securityLogger.log({
        type: 'rate_limit_exceeded',
        userId,
        details: `Shape creation rate limit exceeded for user ${userId}`,
        severity: 'medium'
      })
      throw new Error(
        'Rate limit exceeded. Please slow down your shape creation.'
      )
    }

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
    this.queryClient.setQueryData(queryKey, (old: Shape[] = []) => {
      const newShapes = [...old, optimisticObject]
      return newShapes
    })

    // PR #13.9.5: If offline, queue the operation instead of failing
    if (!this.isOnline) {
      this.addToQueue('create', canvasId, { object: optimisticObject }, userId)
      return optimisticObject
    }

    try {
      // Create in Firestore
      await createObject(canvasId, optimisticObject, userId)

      // Return the created object
      return optimisticObject
    } catch (error) {
      console.error(`[ObjectSync] Failed to write to Firestore:`, error)

      // PR #13.9.5: If network error, queue the operation instead of rolling back
      if (this.isNetworkError(error)) {
        this.addToQueue(
          'create',
          canvasId,
          { object: optimisticObject },
          userId
        )
        return optimisticObject
      }

      // Rollback optimistic update for non-network errors
      this.queryClient.setQueryData(queryKey, (old: Shape[] = []) => {
        const rolledBack = old.filter(obj => obj.id !== id)
        return rolledBack
      })
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

    // PR #13.9.5: If offline, queue the operation instead of failing
    if (!this.isOnline) {
      this.addToQueue('update', canvasId, { objectId, updates }, userId)
      return
    }

    try {
      // Update in Firestore
      await updateObject(canvasId, objectId, updates, userId)
    } catch (error) {
      // PR #13.9.5: If network error, queue the operation instead of rolling back
      if (this.isNetworkError(error)) {
        this.addToQueue('update', canvasId, { objectId, updates }, userId)
        return
      }

      // Rollback optimistic update for non-network errors
      this.queryClient.invalidateQueries({ queryKey })
      throw error
    }
  }

  // PR #9: Debounced update for smooth dragging/resizing
  debouncedUpdateObject(
    canvasId: string,
    objectId: string,
    updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>,
    userId: string
  ): void {
    const queryKey = objectKeys.list(canvasId)
    const now = Date.now()
    const updateKey = `${canvasId}-${objectId}`

    // Always apply optimistic update immediately for smooth UI
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

    // Store pending update
    this.pendingUpdates.set(updateKey, { objectId, updates, userId })

    // Clear existing debounce timeout
    const existingTimeout = this.debouncedUpdates.get(updateKey)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new debounce timeout
    const timeout = setTimeout(async () => {
      const pendingUpdate = this.pendingUpdates.get(updateKey)
      if (pendingUpdate) {
        try {
          // PR #13.9.5: Use the main updateObject method which handles offline queuing
          await this.updateObject(
            canvasId,
            objectId,
            pendingUpdate.updates,
            userId
          )
          this.pendingUpdates.delete(updateKey)
        } catch (error) {
          console.error('Debounced update failed:', error)
          // Only rollback for non-network errors
          if (!this.isNetworkError(error)) {
            this.queryClient.invalidateQueries({ queryKey })
          }
        }
      }
      this.debouncedUpdates.delete(updateKey)
    }, DRAG_DEBOUNCE_MS)

    this.debouncedUpdates.set(updateKey, timeout)
  }

  // PR #15.3: Debounced batch update for multi-object movement
  debouncedBatchUpdateObjects(
    canvasId: string,
    updates: Array<{
      objectId: string
      updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
    }>,
    userId: string
  ): void {
    const queryKey = objectKeys.list(canvasId)
    const now = Date.now()
    const batchKey = `${canvasId}-batch`

    // Always apply optimistic updates immediately for smooth UI
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

    // Store pending batch update
    this.pendingBatchUpdates.set(batchKey, { updates, userId })

    // Clear existing debounce timeout
    const existingTimeout = this.debouncedBatchUpdates.get(batchKey)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new debounce timeout
    const timeout = setTimeout(async () => {
      const pendingBatch = this.pendingBatchUpdates.get(batchKey)
      if (pendingBatch) {
        try {
          await this.smartBatchUpdateObjects(
            canvasId,
            pendingBatch.updates,
            userId
          )
          this.pendingBatchUpdates.delete(batchKey)
        } catch (error) {
          console.error('Debounced batch update failed:', error)
          // Rollback optimistic updates
          this.queryClient.invalidateQueries({ queryKey })
        }
      }
      this.debouncedBatchUpdates.delete(batchKey)
    }, DRAG_DEBOUNCE_MS)

    this.debouncedBatchUpdates.set(batchKey, timeout)
  }

  async deleteObject(
    canvasId: string,
    objectId: string,
    userId?: string
  ): Promise<void> {
    const queryKey = objectKeys.list(canvasId)

    // Store original object for rollback
    const originalObjects =
      this.queryClient.getQueryData<Shape[]>(queryKey) || []
    const originalObject = originalObjects.find(obj => obj.id === objectId)

    // Optimistic update
    this.queryClient.setQueryData(queryKey, (old: Shape[] = []) =>
      old.filter(obj => obj.id !== objectId)
    )

    // PR #13.9.5: If offline, queue the operation instead of failing
    if (!this.isOnline && userId) {
      this.addToQueue('delete', canvasId, { objectId }, userId)
      return
    }

    try {
      // Delete in Firestore
      await deleteObject(canvasId, objectId)
    } catch (error) {
      // PR #13.9.5: If network error, queue the operation instead of rolling back
      if (this.isNetworkError(error) && userId) {
        this.addToQueue('delete', canvasId, { objectId }, userId)
        return
      }

      // Rollback optimistic update for non-network errors
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

  // PR #9: Smart batch update that chunks large updates
  async smartBatchUpdateObjects(
    canvasId: string,
    updates: Array<{
      objectId: string
      updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
    }>,
    userId: string
  ): Promise<void> {
    // If updates are small, use regular batch update
    if (updates.length <= MAX_BATCH_SIZE) {
      return this.batchUpdateObjects(canvasId, updates, userId)
    }

    // For large updates, chunk them into smaller batches
    const chunks: Array<
      Array<{
        objectId: string
        updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
      }>
    > = []

    for (let i = 0; i < updates.length; i += MAX_BATCH_SIZE) {
      chunks.push(updates.slice(i, i + MAX_BATCH_SIZE))
    }

    // Process chunks sequentially to avoid overwhelming Firestore
    for (const chunk of chunks) {
      await this.batchUpdateObjects(canvasId, chunk, userId)
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
