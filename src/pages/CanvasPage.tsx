import React, { useCallback, useEffect, useState } from 'react'
import CanvasStage from '../components/CanvasStage'
import EmptyCanvasState from '../components/EmptyCanvasState'
import PresenceList from '../components/PresenceList'
import Toolbar, { type ToolType } from '../components/Toolbar'
import { useAuth } from '../hooks/useAuth'
import { usePresence } from '../hooks/usePresence'
import {
  useCanvasMeta,
  useShapeMutations,
  useShapes,
  useViewportPersistence
} from '../hooks/useShapes'
import { useToast } from '../hooks/useToast'
import type { Shape } from '../lib/types'
import { useSelectionStore } from '../store/selection'

const CanvasPage: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select')
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const { selectedIds, hasSelection } = useSelectionStore()
  const { user } = useAuth()
  const { showError, showSuccess } = useToast()

  // Use a fixed canvas ID for now (in a real app, this would come from URL params)
  const canvasId = 'default-canvas'

  // PR #8: Canvas metadata and persistence
  const {
    canvasMeta,
    isLoading: canvasMetaLoading,
    error: canvasMetaError,
    initializeCanvas
  } = useCanvasMeta(canvasId, user?.uid || '')

  const { saveViewport, restoreViewport } = useViewportPersistence(
    canvasId,
    user?.uid || ''
  )

  // PR #7: Use React Query hooks for shape management
  const {
    shapes,
    isLoading: shapesLoading,
    error: shapesError
  } = useShapes(canvasId)

  console.log(`[CanvasPage] Current shapes state:`, {
    shapes,
    shapesLoading,
    shapesError
  })
  const {
    createShape,
    updateShape,
    deleteShape,
    batchCreateShapes,
    batchDeleteShapes
  } = useShapeMutations(canvasId, user?.uid || '')

  // Presence functionality
  const {
    presence,
    updateCursor,
    error: presenceError
  } = usePresence({
    canvasId,
    enabled: !!user
  })

  // PR #8: Initialize canvas on mount
  useEffect(() => {
    if (user?.uid && !canvasMetaLoading) {
      initializeCanvas()
    }
  }, [user?.uid, canvasMetaLoading, initializeCanvas])

  // PR #8: Save viewport on navigation/unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current viewport state before leaving
      if (canvasMeta) {
        // This will be handled by the viewport persistence hook
        // The debounced save will trigger on viewport changes
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Save state when tab becomes hidden
        handleBeforeUnload()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [canvasMeta])

  // Error handling via toasts
  useEffect(() => {
    if (presenceError) {
      showError('Connection Error', 'Unable to sync with other users')
    }
  }, [presenceError, showError])

  useEffect(() => {
    if (shapesError) {
      showError('Sync Error', 'Unable to load canvas data')
    }
  }, [shapesError, showError])

  useEffect(() => {
    if (canvasMetaError) {
      showError('Canvas Error', 'Unable to load canvas settings')
    }
  }, [canvasMetaError, showError])

  // Update canvas size on window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight - 60 // Account for toolbar height
      })
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool)
  }

  // PR #7: Handle shape creation with React Query
  const handleShapeCreate = useCallback(
    async (
      shapeData: Omit<
        Shape,
        'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
      >
    ) => {
      if (!user?.uid) return

      try {
        await createShape(shapeData)
        showSuccess('Shape created', 'Your shape has been added to the canvas')
      } catch (error) {
        console.error('Failed to create shape:', error)
        showError('Failed to create shape', 'Please try again')
      }
    },
    [createShape, user?.uid, showSuccess, showError]
  )

  // PR #7: Handle shape updates with React Query
  const handleShapeUpdate = useCallback(
    async (id: string, updates: Partial<Shape>) => {
      if (!user?.uid) return

      try {
        await updateShape(id, updates)
      } catch (error) {
        console.error('Failed to update shape:', error)
        showError('Failed to update shape', 'Your changes could not be saved')
      }
    },
    [updateShape, user?.uid, showError]
  )

  // PR #7: Handle shape deletion with React Query
  const handleShapeDelete = useCallback(
    async (ids: string[]) => {
      try {
        if (ids.length === 1) {
          await deleteShape(ids[0])
        } else {
          await batchDeleteShapes(ids)
        }
        showSuccess(
          'Shapes deleted',
          `${ids.length} shape${ids.length > 1 ? 's' : ''} removed from canvas`
        )
      } catch (error) {
        console.error('Failed to delete shapes:', error)
        showError('Failed to delete shapes', 'Please try again')
      }
    },
    [deleteShape, batchDeleteShapes, showSuccess, showError]
  )

  // PR #7: Handle shape duplication with React Query
  const handleShapeDuplicate = useCallback(
    async (ids: string[]) => {
      if (!user?.uid) return

      const shapesToDuplicate = shapes.filter(shape => ids.includes(shape.id))

      const duplicatedShapes = shapesToDuplicate.map(shape => ({
        ...shape,
        x: shape.x + 20, // Offset duplicated shapes
        y: shape.y + 20
      }))

      try {
        await batchCreateShapes(duplicatedShapes)
        showSuccess(
          'Shapes duplicated',
          `${ids.length} shape${ids.length > 1 ? 's' : ''} duplicated`
        )
      } catch (error) {
        console.error('Failed to duplicate shapes:', error)
        showError('Failed to duplicate shapes', 'Please try again')
      }
    },
    [shapes, batchCreateShapes, user?.uid, showSuccess, showError]
  )

  const handleDelete = () => {
    if (selectedIds.length > 0) {
      handleShapeDelete(selectedIds)
    }
  }

  const handleDuplicate = () => {
    if (selectedIds.length > 0) {
      handleShapeDuplicate(selectedIds)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        canDelete={hasSelection()}
        canDuplicate={hasSelection()}
      />

      <div className="flex-1 relative">
        {/* Presence list overlay */}
        {user && (
          <div className="absolute top-4 right-4 z-10">
            <PresenceList presence={presence} currentUserId={user.uid} />
          </div>
        )}

        {/* Loading or canvas content */}
        {shapesLoading ||
        canvasMetaLoading ||
        canvasSize.width === 0 ||
        canvasSize.height === 0 ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 mx-auto"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {shapesLoading
                    ? 'Loading shapes...'
                    : canvasMetaLoading
                      ? 'Loading canvas...'
                      : 'Initializing...'}
                </p>
                <p className="text-sm text-gray-500">
                  Setting up your collaborative workspace
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <CanvasStage
              width={canvasSize.width}
              height={canvasSize.height}
              selectedTool={selectedTool}
              shapes={shapes}
              presence={presence}
              currentUserId={user?.uid || ''}
              onShapeCreate={handleShapeCreate}
              onShapeUpdate={handleShapeUpdate}
              onShapeDelete={handleShapeDelete}
              onShapeDuplicate={handleShapeDuplicate}
              onCursorMove={updateCursor}
              onViewportChange={saveViewport}
              initialViewport={restoreViewport()}
            />

            {/* Show empty state when no shapes exist */}
            {shapes.length === 0 && (
              <EmptyCanvasState
                selectedTool={selectedTool}
                onGetStarted={() => setSelectedTool('rectangle')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CanvasPage
