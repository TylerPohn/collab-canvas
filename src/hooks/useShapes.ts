import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import {
  createCanvas,
  getCanvas,
  updateCanvasMeta
} from '../lib/firebase/firestore'
import { getObjectSyncService, objectKeys } from '../lib/sync/objects'
import type { CanvasMeta, Shape, ViewportState } from '../lib/types'

// PR #7: React Query hooks for object sync with optimistic updates
export function useShapes(canvasId: string) {
  const queryClient = useQueryClient()
  const objectSync = getObjectSyncService(queryClient)

  console.log(`[useShapes] Hook called for canvas: ${canvasId}`)

  // Query for all objects in the canvas
  const {
    data: shapes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: objectKeys.list(canvasId),
    queryFn: () => {
      console.log(`[useShapes] Query function called for canvas: ${canvasId}`)
      return objectSync.getAllObjects(canvasId)
    },
    staleTime: 0, // Always consider stale to ensure real-time updates
    refetchOnWindowFocus: false
  })

  console.log(`[useShapes] Current shapes state:`, { shapes, isLoading, error })

  // Subscribe to real-time updates
  useEffect(() => {
    if (canvasId) {
      console.log(`[useShapes] Setting up subscription for canvas: ${canvasId}`)
      const unsubscribe = objectSync.subscribeToObjects(canvasId)
      return unsubscribe
    }
  }, [canvasId, objectSync])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log(
        `[useShapes] Cleaning up subscription for canvas: ${canvasId}`
      )
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
  const queryClient = useQueryClient()
  const objectSync = getObjectSyncService(queryClient)
  const { updateShape, batchUpdateShapes } = useShapeMutations(canvasId, userId)

  // PR #9: Use the new debounced update from ObjectSyncService
  const debouncedUpdate = useCallback(
    (
      objectId: string,
      updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
    ) => {
      objectSync.debouncedUpdateObject(canvasId, objectId, updates, userId)
    },
    [objectSync, canvasId, userId]
  )

  // PR #9: Use smart batch update for large operations
  const smartBatchUpdate = useCallback(
    async (
      updates: Array<{
        objectId: string
        updates: Partial<Omit<Shape, 'id' | 'createdAt' | 'createdBy'>>
      }>
    ) => {
      await objectSync.smartBatchUpdateObjects(canvasId, updates, userId)
    },
    [objectSync, canvasId, userId]
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
    batchUpdate,
    smartBatchUpdate
  }
}

// PR #8: Canvas metadata hooks for persistence and reconnect handling
export function useCanvasMeta(canvasId: string, userId: string) {
  const queryClient = useQueryClient()

  // Query for canvas metadata
  const {
    data: canvasMeta,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['canvas-meta', canvasId],
    queryFn: async () => {
      const canvas = await getCanvas(canvasId)
      return canvas?.meta || null
    },
    staleTime: 0, // Always consider stale to ensure real-time updates
    refetchOnWindowFocus: false
  })

  // Create canvas if it doesn't exist
  const createCanvasMutation = useMutation({
    mutationFn: async (
      meta: Omit<
        CanvasMeta,
        'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
      >
    ) => {
      await createCanvas(canvasId, meta, userId)
      return {
        ...meta,
        id: canvasId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: userId,
        updatedBy: userId
      }
    },
    onSuccess: newMeta => {
      queryClient.setQueryData(['canvas-meta', canvasId], newMeta)
    },
    onError: error => {
      console.error('Failed to create canvas:', error)
    }
  })

  // Update canvas metadata
  const updateCanvasMetaMutation = useMutation({
    mutationFn: async (
      updates: Partial<Omit<CanvasMeta, 'id' | 'createdAt' | 'createdBy'>>
    ) => {
      await updateCanvasMeta(canvasId, updates, userId)
      return {
        ...canvasMeta,
        ...updates,
        updatedAt: Date.now(),
        updatedBy: userId
      }
    },
    onSuccess: updatedMeta => {
      queryClient.setQueryData(['canvas-meta', canvasId], updatedMeta)
    },
    onError: error => {
      console.error('Failed to update canvas metadata:', error)
    }
  })

  // Initialize canvas if it doesn't exist
  const initializeCanvas = useCallback(async () => {
    if (!canvasMeta && !isLoading) {
      // Check if canvas already exists in Firestore before creating
      const existingCanvas = await getCanvas(canvasId)
      if (!existingCanvas) {
        await createCanvasMutation.mutateAsync({
          name: 'Untitled Canvas',
          viewport: { x: 0, y: 0, scale: 1 }
        })
      }
    }
  }, [canvasMeta, isLoading, createCanvasMutation.mutateAsync, canvasId])

  return {
    canvasMeta,
    isLoading,
    error,
    refetch,
    initializeCanvas,
    updateCanvasMeta: updateCanvasMetaMutation.mutateAsync,
    isCreating: createCanvasMutation.isPending,
    isUpdating: updateCanvasMetaMutation.isPending,
    createError: createCanvasMutation.error,
    updateError: updateCanvasMetaMutation.error
  }
}

// PR #8: Viewport persistence hook
export function useViewportPersistence(canvasId: string, userId: string) {
  const { canvasMeta, updateCanvasMeta } = useCanvasMeta(canvasId, userId)

  // Create debounced function once and reuse it
  const debouncedUpdateCanvasMeta = useCallback(
    debounce((viewport: ViewportState) => {
      updateCanvasMeta({ viewport })
    }, 500),
    [updateCanvasMeta]
  )

  // Save viewport state with debouncing
  const saveViewport = useCallback(
    (viewport: ViewportState) => {
      debouncedUpdateCanvasMeta(viewport)
    },
    [debouncedUpdateCanvasMeta]
  )

  // Restore viewport from saved state
  const restoreViewport = useCallback((): ViewportState => {
    return canvasMeta?.viewport || { x: 0, y: 0, scale: 1 }
  }, [canvasMeta])

  return {
    saveViewport,
    restoreViewport,
    savedViewport: canvasMeta?.viewport
  }
}

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
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
