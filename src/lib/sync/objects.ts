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

  // AI-friendly high-level methods

  // AI-friendly shape creation with smart defaults
  async createShapeWithDefaults(
    canvasId: string,
    type: 'rect' | 'circle' | 'text',
    position: { x: number; y: number },
    options: {
      size?: { width: number; height: number }
      radius?: number
      text?: string
      fill?: string
      stroke?: string
      strokeWidth?: number
      fontSize?: number
      fontFamily?: string
      fontWeight?: string
    } = {},
    userId: string
  ): Promise<Shape> {
    console.log('🤖 createShapeWithDefaults called:', {
      canvasId,
      type,
      position,
      options,
      userId
    })
    const defaults = {
      fill: '#3B82F6',
      stroke: '#1E40AF',
      strokeWidth: 2,
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal'
    }

    // Filter out undefined values from options to prevent Firestore errors
    const cleanOptions = Object.fromEntries(
      Object.entries(options).filter(([_, value]) => value !== undefined)
    )

    const shapeData = {
      type,
      x: position.x,
      y: position.y,
      ...defaults,
      ...cleanOptions
    }

    if (type === 'rect') {
      const rectData = {
        ...shapeData,
        width:
          cleanOptions.size &&
          typeof cleanOptions.size === 'object' &&
          'width' in cleanOptions.size
            ? cleanOptions.size.width
            : 100,
        height:
          cleanOptions.size &&
          typeof cleanOptions.size === 'object' &&
          'height' in cleanOptions.size
            ? cleanOptions.size.height
            : 60
      }
      // Ensure no undefined values
      Object.keys(rectData).forEach(key => {
        if ((rectData as any)[key] === undefined) {
          delete (rectData as any)[key]
        }
      })
      return this.createObject(canvasId, rectData as any, userId)
    } else if (type === 'circle') {
      const circleData = {
        ...shapeData,
        radius: cleanOptions.radius || 50
      }
      // Ensure no undefined values
      Object.keys(circleData).forEach(key => {
        if ((circleData as any)[key] === undefined) {
          delete (circleData as any)[key]
        }
      })
      const shape = await this.createObject(canvasId, circleData as any, userId)
      console.log('🤖 createShapeWithDefaults created circle:', shape)
      return shape
    } else if (type === 'text') {
      const textData = {
        ...shapeData,
        text: cleanOptions.text || 'Text',
        fontSize: cleanOptions.fontSize || 16
      }
      // Ensure no undefined values
      Object.keys(textData).forEach(key => {
        if ((textData as any)[key] === undefined) {
          delete (textData as any)[key]
        }
      })
      return this.createObject(canvasId, textData as any, userId)
    }

    throw new Error(`Unsupported shape type: ${type}`)
  }

  // AI-friendly batch operations
  async createMultipleShapes(
    canvasId: string,
    shapes: Array<{
      type: 'rect' | 'circle' | 'text'
      position: { x: number; y: number }
      options?: {
        size?: { width: number; height: number }
        radius?: number
        text?: string
        fill?: string
        stroke?: string
        strokeWidth?: number
        fontSize?: number
        fontFamily?: string
        fontWeight?: string
      }
    }>,
    userId: string
  ): Promise<Shape[]> {
    const shapeData = shapes.map(shape => {
      const defaults = {
        fill: '#3B82F6',
        stroke: '#1E40AF',
        strokeWidth: 2,
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal'
      }

      const baseData = {
        type: shape.type,
        x: shape.position.x,
        y: shape.position.y,
        ...defaults,
        ...shape.options
      }

      if (shape.type === 'rect') {
        return {
          ...baseData,
          width: shape.options?.size?.width || 100,
          height: shape.options?.size?.height || 60
        }
      } else if (shape.type === 'circle') {
        return {
          ...baseData,
          radius: shape.options?.radius || 50
        }
      } else if (shape.type === 'text') {
        return {
          ...baseData,
          text: shape.options?.text || 'Text',
          fontSize: shape.options?.fontSize || 16
        }
      }

      throw new Error(`Unsupported shape type: ${shape.type}`)
    })

    return this.batchCreateObjects(canvasId, shapeData as any, userId)
  }

  // Smart layout operations
  async arrangeShapesInGrid(
    canvasId: string,
    shapeIds: string[],
    gridConfig: { rows: number; cols: number; spacing: number },
    userId: string
  ): Promise<void> {
    const shapes = await this.getAllObjects(canvasId)
    const targetShapes = shapes.filter(shape => shapeIds.includes(shape.id))

    if (targetShapes.length === 0) return

    const updates = []
    const { rows, cols, spacing } = gridConfig

    // Calculate grid positions
    for (let i = 0; i < targetShapes.length && i < rows * cols; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols

      const x = col * (100 + spacing) // Assuming average width of 100
      const y = row * (60 + spacing) // Assuming average height of 60

      updates.push({
        objectId: targetShapes[i].id,
        updates: { x, y }
      })
    }

    if (updates.length > 0) {
      await this.batchUpdateObjects(canvasId, updates, userId)
    }
  }

  async arrangeShapesInRow(
    canvasId: string,
    shapeIds: string[],
    spacing: number,
    userId: string
  ): Promise<void> {
    const shapes = await this.getAllObjects(canvasId)
    const targetShapes = shapes.filter(shape => shapeIds.includes(shape.id))

    if (targetShapes.length === 0) return

    // Calculate the average Y position to align all shapes horizontally
    const averageY =
      targetShapes.reduce((sum, shape) => sum + shape.y, 0) /
      targetShapes.length

    const updates = []
    let currentX = 0

    for (const shape of targetShapes) {
      updates.push({
        objectId: shape.id,
        updates: { x: currentX, y: averageY }
      })

      // Move to next position
      if (shape.type === 'rect') {
        currentX += (shape as any).width + spacing
      } else if (shape.type === 'circle') {
        currentX += (shape as any).radius * 2 + spacing
      } else {
        currentX += 100 + spacing // Default width for text
      }
    }

    if (updates.length > 0) {
      await this.batchUpdateObjects(canvasId, updates, userId)
    }
  }

  async spaceShapesEvenly(
    canvasId: string,
    shapeIds: string[],
    direction: 'horizontal' | 'vertical',
    padding: number,
    userId: string
  ): Promise<void> {
    const shapes = await this.getAllObjects(canvasId)
    const targetShapes = shapes.filter(shape => shapeIds.includes(shape.id))

    if (targetShapes.length < 2) return

    const updates = []

    if (direction === 'horizontal') {
      // Sort shapes by current X position
      const sortedShapes = [...targetShapes].sort((a, b) => a.x - b.x)

      // Calculate total width needed
      let totalWidth = 0
      for (const shape of sortedShapes) {
        if (shape.type === 'rect') {
          totalWidth += (shape as any).width
        } else if (shape.type === 'circle') {
          totalWidth += (shape as any).radius * 2
        } else {
          totalWidth += 100 // Default width for text
        }
      }

      // Add padding between shapes
      totalWidth += padding * (sortedShapes.length - 1)

      // Calculate starting X position (center the group)
      const startX = sortedShapes[0].x
      let currentX = startX

      // Position each shape with even spacing
      for (const shape of sortedShapes) {
        updates.push({
          objectId: shape.id,
          updates: { x: currentX }
        })

        // Move to next position
        if (shape.type === 'rect') {
          currentX += (shape as any).width + padding
        } else if (shape.type === 'circle') {
          currentX += (shape as any).radius * 2 + padding
        } else {
          currentX += 100 + padding // Default width for text
        }
      }
    } else {
      // Vertical spacing
      // Sort shapes by current Y position
      const sortedShapes = [...targetShapes].sort((a, b) => a.y - b.y)

      // Calculate total height needed
      let totalHeight = 0
      for (const shape of sortedShapes) {
        if (shape.type === 'rect') {
          totalHeight += (shape as any).height
        } else if (shape.type === 'circle') {
          totalHeight += (shape as any).radius * 2
        } else {
          totalHeight += 20 // Default height for text
        }
      }

      // Add padding between shapes
      totalHeight += padding * (sortedShapes.length - 1)

      // Calculate starting Y position
      const startY = sortedShapes[0].y
      let currentY = startY

      // Position each shape with even spacing
      for (const shape of sortedShapes) {
        updates.push({
          objectId: shape.id,
          updates: { y: currentY }
        })

        // Move to next position
        if (shape.type === 'rect') {
          currentY += (shape as any).height + padding
        } else if (shape.type === 'circle') {
          currentY += (shape as any).radius * 2 + padding
        } else {
          currentY += 20 + padding // Default height for text
        }
      }
    }

    if (updates.length > 0) {
      await this.batchUpdateObjects(canvasId, updates, userId)
    }
  }

  // Complex shape operations
  async createFormLayout(
    canvasId: string,
    formConfig: {
      fields: Array<{
        type: 'text' | 'password' | 'button'
        label: string
        placeholder?: string
      }>
      position: { x: number; y: number }
      styling?: {
        backgroundColor?: string
        borderColor?: string
        textColor?: string
        borderWidth?: number
        borderRadius?: number
        padding?: number
      }
    },
    userId: string
  ): Promise<Shape[]> {
    const { fields, position, styling = {} } = formConfig
    const shapes: any[] = []

    const defaultStyling = {
      backgroundColor: '#FFFFFF',
      borderColor: '#D1D5DB',
      textColor: '#374151',
      borderWidth: 1,
      borderRadius: 4,
      padding: 8
    }

    const finalStyling = { ...defaultStyling, ...styling }

    let currentY = position.y

    // Create form container (with lower zIndex to appear behind fields)
    const containerHeight = fields.length * 60 + 40 // 60px per field + padding
    shapes.push({
      type: 'rect',
      x: position.x,
      y: position.y,
      width: 300,
      height: containerHeight,
      fill: finalStyling.backgroundColor,
      stroke: finalStyling.borderColor,
      strokeWidth: finalStyling.borderWidth,
      cornerRadius: finalStyling.borderRadius,
      zIndex: 0 // Ensure container appears behind form fields
    })

    // Create form fields
    for (const field of fields) {
      // Label
      shapes.push({
        type: 'text',
        x: position.x + finalStyling.padding,
        y: currentY + 5,
        text: field.label,
        fontSize: 14,
        fill: finalStyling.textColor,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        zIndex: 1 // Ensure labels appear above container
      })

      // Input field
      shapes.push({
        type: 'rect',
        x: position.x + finalStyling.padding,
        y: currentY + 25,
        width: 260,
        height: 30,
        fill: '#FFFFFF',
        stroke: finalStyling.borderColor,
        strokeWidth: finalStyling.borderWidth,
        cornerRadius: finalStyling.borderRadius,
        zIndex: 1 // Ensure input fields appear above container
      })

      // Placeholder text
      if (field.placeholder) {
        shapes.push({
          type: 'text',
          x: position.x + finalStyling.padding + 8,
          y: currentY + 35,
          text: field.placeholder,
          fontSize: 12,
          fill: '#9CA3AF',
          fontFamily: 'Arial',
          fontWeight: 'normal',
          zIndex: 2 // Ensure placeholder text appears above input fields
        })
      }

      currentY += 60
    }

    return this.batchCreateObjects(canvasId, shapes, userId)
  }

  async createNavigationBar(
    canvasId: string,
    navConfig: {
      items: Array<{ label: string; href?: string }>
      position: { x: number; y: number }
      styling?: {
        backgroundColor?: string
        textColor?: string
        borderColor?: string
        borderWidth?: number
        borderRadius?: number
        padding?: number
      }
    },
    userId: string
  ): Promise<Shape[]> {
    const { items, position, styling = {} } = navConfig
    const shapes: any[] = []

    const defaultStyling = {
      backgroundColor: '#1F2937',
      textColor: '#FFFFFF',
      borderColor: '#374151',
      borderWidth: 1,
      borderRadius: 4,
      padding: 12
    }

    const finalStyling = { ...defaultStyling, ...styling }

    // Calculate dimensions
    const itemWidth = 120
    const navWidth = items.length * itemWidth + finalStyling.padding * 2
    const navHeight = 50

    // Create navigation container (with lower zIndex to appear behind text)
    shapes.push({
      type: 'rect',
      x: position.x,
      y: position.y,
      width: navWidth,
      height: navHeight,
      fill: finalStyling.backgroundColor,
      stroke: finalStyling.borderColor,
      strokeWidth: finalStyling.borderWidth,
      cornerRadius: finalStyling.borderRadius,
      zIndex: 0 // Ensure container appears behind navigation text
    })

    // Create navigation items
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const itemX = position.x + finalStyling.padding + i * itemWidth
      const itemY = position.y + navHeight / 2 - 8 // Center vertically

      shapes.push({
        type: 'text',
        x: itemX,
        y: itemY,
        text: item.label,
        fontSize: 14,
        fill: finalStyling.textColor,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        textAlign: 'center',
        zIndex: 1 // Ensure navigation text appears above container
      })
    }

    return this.batchCreateObjects(canvasId, shapes, userId)
  }

  async createCardLayout(
    canvasId: string,
    cardConfig: {
      cardConfig: {
        title: string
        description: string
        imageUrl?: string
        imageAlt?: string
      }
      position: { x: number; y: number }
      styling?: {
        backgroundColor?: string
        borderColor?: string
        textColor?: string
        titleColor?: string
        borderWidth?: number
        borderRadius?: number
        padding?: number
        cardWidth?: number
        cardHeight?: number
      }
    },
    userId: string
  ): Promise<Shape[]> {
    const { cardConfig: config, position, styling = {} } = cardConfig
    const shapes: any[] = []

    const defaultStyling = {
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      textColor: '#374151',
      titleColor: '#111827',
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      cardWidth: 300,
      cardHeight: 400
    }

    const finalStyling = { ...defaultStyling, ...styling }

    // Create card container (background)
    shapes.push({
      type: 'rect',
      x: position.x,
      y: position.y,
      width: finalStyling.cardWidth,
      height: finalStyling.cardHeight,
      fill: finalStyling.backgroundColor,
      stroke: finalStyling.borderColor,
      strokeWidth: finalStyling.borderWidth,
      cornerRadius: finalStyling.borderRadius,
      zIndex: 0 // Background layer
    })

    let currentY = position.y + finalStyling.padding

    // Create image placeholder (if imageUrl provided)
    if (config.imageUrl) {
      const imageHeight = 120
      shapes.push({
        type: 'rect',
        x: position.x + finalStyling.padding,
        y: currentY,
        width: finalStyling.cardWidth - finalStyling.padding * 2,
        height: imageHeight,
        fill: '#F3F4F6',
        stroke: '#D1D5DB',
        strokeWidth: 1,
        cornerRadius: 4,
        zIndex: 1
      })

      // Image placeholder text
      shapes.push({
        type: 'text',
        x: position.x + finalStyling.padding + 10,
        y: currentY + imageHeight / 2 - 8,
        text: config.imageAlt || 'Image',
        fontSize: 12,
        fill: '#9CA3AF',
        fontFamily: 'Arial',
        fontWeight: 'normal',
        zIndex: 2
      })

      currentY += imageHeight + finalStyling.padding
    }

    // Create title
    shapes.push({
      type: 'text',
      x: position.x + finalStyling.padding,
      y: currentY,
      text: config.title,
      fontSize: 18,
      fill: finalStyling.titleColor,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      zIndex: 1
    })

    currentY += 30

    // Create description
    const maxDescriptionWidth =
      finalStyling.cardWidth - finalStyling.padding * 2
    const words = config.description.split(' ')
    const lines = []
    let currentLine = ''

    // Simple text wrapping
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      if (testLine.length * 8 <= maxDescriptionWidth) {
        // Rough character width estimation
        currentLine = testLine
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine) lines.push(currentLine)

    // Create description text lines
    lines.forEach((line, index) => {
      shapes.push({
        type: 'text',
        x: position.x + finalStyling.padding,
        y: currentY + index * 20,
        text: line,
        fontSize: 14,
        fill: finalStyling.textColor,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        zIndex: 1
      })
    })

    return this.batchCreateObjects(canvasId, shapes, userId)
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
