import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { getObjectSyncService, objectKeys } from '../lib/sync/objects'
import type { Shape } from '../lib/types'

// PR #7: React Query hooks for object sync with optimistic updates
export function useShapes(canvasId: string) {
  const queryClient = useQueryClient()
  const objectSync = getObjectSyncService(queryClient)

  // Query for all objects in the canvas
  const {
    data: shapes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: objectKeys.list(canvasId),
    queryFn: () => objectSync.getAllObjects(canvasId),
    staleTime: 0, // Always consider stale to ensure real-time updates
    refetchOnWindowFocus: false
  })

  // Subscribe to real-time updates
  useEffect(() => {
    if (canvasId) {
      const unsubscribe = objectSync.subscribeToObjects(canvasId)
      return unsubscribe
    }
  }, [canvasId, objectSync])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      objectSync.unsubscribeFromObjects(canvasId)
    }
  }, [canvasId, objectSync])

  return {
    shapes,
    isLoading,
    error,
    refetch
  }
}

// PR #7: Mutations with optimistic updates
export function useShapeMutations(canvasId: string, userId: string) {
  const queryClient = useQueryClient()
  const objectSync = getObjectSyncService(queryClient)

  // Create shape mutation
  const createShapeMutation = useMutation({
    mutationFn: (
      shape: Omit<
        Shape,
        'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
      >
    ) => objectSync.createObject(canvasId, shape, userId),
    onError: error => {
      console.error('Failed to create shape:', error)
    }
  })

  // Update shape mutation
  const updateShapeMutation = useMutation({
    mutationFn: ({
      objectId,
      updates
    }: {
      objectId: string
      updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
    }) => objectSync.updateObject(canvasId, objectId, updates, userId),
    onError: error => {
      console.error('Failed to update shape:', error)
    }
  })

  // Delete shape mutation
  const deleteShapeMutation = useMutation({
    mutationFn: (objectId: string) =>
      objectSync.deleteObject(canvasId, objectId),
    onError: error => {
      console.error('Failed to delete shape:', error)
    }
  })

  // Batch create shapes mutation
  const batchCreateShapesMutation = useMutation({
    mutationFn: (
      shapes: Omit<
        Shape,
        'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
      >[]
    ) => objectSync.batchCreateObjects(canvasId, shapes, userId),
    onError: error => {
      console.error('Failed to batch create shapes:', error)
    }
  })

  // Batch update shapes mutation
  const batchUpdateShapesMutation = useMutation({
    mutationFn: (
      updates: Array<{
        objectId: string
        updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
      }>
    ) => objectSync.batchUpdateObjects(canvasId, updates, userId),
    onError: error => {
      console.error('Failed to batch update shapes:', error)
    }
  })

  // Batch delete shapes mutation
  const batchDeleteShapesMutation = useMutation({
    mutationFn: (objectIds: string[]) =>
      objectSync.batchDeleteObjects(canvasId, objectIds),
    onError: error => {
      console.error('Failed to batch delete shapes:', error)
    }
  })

  // Convenience methods
  const createShape = useCallback(
    (
      shape: Omit<
        Shape,
        'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
      >
    ) => {
      return createShapeMutation.mutateAsync(shape)
    },
    [createShapeMutation]
  )

  const updateShape = useCallback(
    (
      objectId: string,
      updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
    ) => {
      return updateShapeMutation.mutateAsync({ objectId, updates })
    },
    [updateShapeMutation]
  )

  const deleteShape = useCallback(
    (objectId: string) => {
      return deleteShapeMutation.mutateAsync(objectId)
    },
    [deleteShapeMutation]
  )

  const batchCreateShapes = useCallback(
    (
      shapes: Omit<
        Shape,
        'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
      >[]
    ) => {
      return batchCreateShapesMutation.mutateAsync(shapes)
    },
    [batchCreateShapesMutation]
  )

  const batchUpdateShapes = useCallback(
    (
      updates: Array<{
        objectId: string
        updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
      }>
    ) => {
      return batchUpdateShapesMutation.mutateAsync(updates)
    },
    [batchUpdateShapesMutation]
  )

  const batchDeleteShapes = useCallback(
    (objectIds: string[]) => {
      return batchDeleteShapesMutation.mutateAsync(objectIds)
    },
    [batchDeleteShapesMutation]
  )

  // PR #7: Conflict resolution
  const resolveConflicts = useCallback(async () => {
    await objectSync.resolveConflicts(canvasId)
  }, [objectSync, canvasId])

  return {
    // Individual mutations
    createShape,
    updateShape,
    deleteShape,

    // Batch mutations
    batchCreateShapes,
    batchUpdateShapes,
    batchDeleteShapes,

    // Conflict resolution
    resolveConflicts,

    // Mutation states
    isCreating: createShapeMutation.isPending,
    isUpdating: updateShapeMutation.isPending,
    isDeleting: deleteShapeMutation.isPending,
    isBatchCreating: batchCreateShapesMutation.isPending,
    isBatchUpdating: batchUpdateShapesMutation.isPending,
    isBatchDeleting: batchDeleteShapesMutation.isPending,

    // Errors
    createError: createShapeMutation.error,
    updateError: updateShapeMutation.error,
    deleteError: deleteShapeMutation.error,
    batchCreateError: batchCreateShapesMutation.error,
    batchUpdateError: batchUpdateShapesMutation.error,
    batchDeleteError: batchDeleteShapesMutation.error
  }
}

// Hook for single shape
export function useShape(canvasId: string, objectId: string) {
  const queryClient = useQueryClient()
  const objectSync = getObjectSyncService(queryClient)

  const {
    data: shape,
    isLoading,
    error
  } = useQuery({
    queryKey: objectKeys.detail(canvasId, objectId),
    queryFn: () => objectSync.getObject(canvasId, objectId),
    enabled: !!canvasId && !!objectId
  })

  return {
    shape,
    isLoading,
    error
  }
}

// Hook for shape operations with debouncing (for drag/resize)
export function useShapeOperations(canvasId: string, userId: string) {
  const { updateShape, batchUpdateShapes } = useShapeMutations(canvasId, userId)

  // Debounced update for smooth dragging
  const debouncedUpdate = useCallback(
    (
      objectId: string,
      updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
    ) => {
      debounce(() => updateShape(objectId, updates), 100)()
    },
    [updateShape]
  )

  // Batch update for multiple shapes
  const batchUpdate = useCallback(
    (
      updates: Array<{
        objectId: string
        updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
      }>
    ) => {
      batchUpdateShapes(updates)
    },
    [batchUpdateShapes]
  )

  return {
    updateShape,
    debouncedUpdate,
    batchUpdate
  }
}

// Simple debounce utility
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
