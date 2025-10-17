import React, { useCallback, useEffect, useState } from 'react'
import AIPanel from '../components/AIPanel'
import AIThinkingIndicator from '../components/AIThinkingIndicator'
import CanvasStage from '../components/CanvasStage'
import DesignPaletteMUI from '../components/DesignPaletteMUI'
import PresenceList from '../components/PresenceList'
import ToolbarMUI from '../components/ToolbarMUI'
import { useAIAgent } from '../hooks/useAIAgent'
import { useAIExecutionState } from '../hooks/useAIExecutionState'
import { useAuth } from '../hooks/useAuth'
import { usePresence } from '../hooks/usePresence'
import {
  useCanvasMeta,
  useShapeMutations,
  useShapeOperations,
  useShapes,
  useViewportPersistence
} from '../hooks/useShapes'
import { useToast } from '../hooks/useToast'
import type { Shape } from '../lib/types'
import { type ToolType } from '../lib/types'
import { useSelectionStore } from '../store/selection'

const CanvasPage: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select')
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isDesignPaletteOpen, setIsDesignPaletteOpen] = useState(true)
  const [isAIOpen, setIsAIOpen] = useState(false)

  const { selectedIds, hasSelection, clearSelection, selectShape } =
    useSelectionStore()
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

  // AI Agent hook
  useAIAgent(canvasId, user?.uid || '')

  // Shared AI execution state for thinking indicator
  const { isExecuting } = useAIExecutionState()

  // PR #7: Use React Query hooks for shape management
  const {
    shapes,
    isLoading: shapesLoading,
    error: shapesError
  } = useShapes(canvasId)

  const {
    createShape,
    updateShape,
    deleteShape,
    batchCreateShapes,
    batchDeleteShapes
  } = useShapeMutations(canvasId, user?.uid || '')

  // Get debounced update for real-time drag updates
  const { debouncedUpdate, debouncedBatchUpdate } = useShapeOperations(
    canvasId,
    user?.uid || ''
  )

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

  const handleToggleDesignPalette = () => {
    setIsDesignPaletteOpen(!isDesignPaletteOpen)
  }

  // PR #7: Handle shape creation with React Query
  const handleShapeCreate = useCallback(
    async (
      shapeData: Omit<
        Shape,
        'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
      >
    ): Promise<Shape> => {
      if (!user?.uid) {
        throw new Error('User not authenticated')
      }

      try {
        const createdShape = await createShape(shapeData)
        // Automatically select the newly created shape
        selectShape(createdShape.id)
        showSuccess('Shape created', 'Your shape has been added to the canvas')
        return createdShape
      } catch (error) {
        console.error('Failed to create shape:', error)
        showError('Failed to create shape', 'Please try again')
        throw error
      }
    },
    [createShape, user?.uid, showSuccess, showError, selectShape]
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

  // PR #13.1: Handle debounced shape updates for real-time drag
  const handleShapeUpdateDebounced = useCallback(
    (id: string, updates: Partial<Shape>) => {
      if (!user?.uid) return
      debouncedUpdate(id, updates)
    },
    [debouncedUpdate, user?.uid]
  )

  // PR #15.3: Handle debounced batch updates for multi-object movement
  const handleShapeBatchUpdateDebounced = useCallback(
    (updates: Array<{ objectId: string; updates: Partial<Shape> }>) => {
      if (!user?.uid) return
      debouncedBatchUpdate(updates)
    },
    [debouncedBatchUpdate, user?.uid]
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

      // Calculate zIndex for duplicated shapes (highest existing zIndex + 1)
      const maxZIndex = shapes.reduce(
        (max, shape) => Math.max(max, shape.zIndex || 0),
        0
      )
      const newZIndex = maxZIndex + 1

      const duplicatedShapes = shapesToDuplicate.map(shape => ({
        ...shape,
        x: shape.x + 20, // Offset duplicated shapes
        y: shape.y + 20,
        zIndex: newZIndex // Ensure duplicated shapes appear on top
      }))

      try {
        const createdShapes = await batchCreateShapes(duplicatedShapes)
        // Automatically select the newly duplicated shapes
        const newShapeIds = createdShapes.map(shape => shape.id)
        useSelectionStore.getState().selectMultiple(newShapeIds)
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

  // Handle Mermaid import
  const handleImportMermaid = useCallback(
    async (mermaidCode: string, diagramType: string) => {
      if (!user?.uid) return

      try {
        // Clear any existing selections
        clearSelection()

        // Render the Mermaid diagram to get actual dimensions
        const { mermaidRenderer } = await import('../lib/mermaid/renderer')
        const renderResult = await mermaidRenderer.renderDiagram(mermaidCode)

        // Use actual dimensions from Mermaid render result
        const actualWidth = Math.max(200, renderResult.width) // Minimum 200px width
        const actualHeight = Math.max(150, renderResult.height) // Minimum 150px height

        // Calculate position for the imported diagram (center of viewport)
        const centerX = canvasSize.width / 2 - actualWidth / 2
        const centerY = canvasSize.height / 2 - actualHeight / 2

        // Calculate zIndex for new shape (highest existing zIndex + 1)
        const maxZIndex = shapes.reduce(
          (max, shape) => Math.max(max, shape.zIndex || 0),
          0
        )
        const newZIndex = maxZIndex + 1

        const mermaidShape = {
          type: 'mermaid' as const,
          x: centerX,
          y: centerY,
          width: actualWidth,
          height: actualHeight,
          mermaidCode,
          diagramType,
          renderedSvg: renderResult.svg, // Cache the rendered SVG
          fill: '#ffffff',
          stroke: '#e5e7eb',
          strokeWidth: 1,
          rotation: 0,
          zIndex: newZIndex
        } as Omit<
          Shape,
          'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
        >

        // Create the shape and get the created shape with ID
        const createdShape = await createShape(mermaidShape)

        // Select the newly created shape
        selectShape(createdShape.id)

        showSuccess('Mermaid diagram imported', 'Diagram added to canvas')
      } catch (error) {
        console.error('Failed to import Mermaid diagram:', error)
        showError('Failed to import diagram', 'Please try again')
      }
    },
    [
      user?.uid,
      canvasSize,
      shapes,
      createShape,
      showSuccess,
      showError,
      clearSelection,
      selectShape
    ]
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ToolbarMUI
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        canDelete={hasSelection()}
        canDuplicate={hasSelection()}
        onToggleDesignPalette={handleToggleDesignPalette}
        isDesignPaletteOpen={isDesignPaletteOpen}
        onToggleAI={() => setIsAIOpen(!isAIOpen)}
        isAIOpen={isAIOpen}
        onImportMermaid={handleImportMermaid}
      />

      <div className="flex-1 relative">
        {/* Presence list overlay */}
        {user && (
          <div className="absolute top-4 right-4 z-10">
            <PresenceList
              presence={presence}
              currentUserId={user.uid}
              currentUser={{
                displayName: user.displayName,
                photoURL: user.photoURL
              }}
            />
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
              onShapeUpdateDebounced={handleShapeUpdateDebounced}
              onShapeBatchUpdateDebounced={handleShapeBatchUpdateDebounced}
              onShapeDelete={handleShapeDelete}
              onShapeDuplicate={handleShapeDuplicate}
              onCursorMove={updateCursor}
              onViewportChange={saveViewport}
              initialViewport={restoreViewport()}
              onToolSelect={handleToolSelect}
            />
          </div>
        )}

        {/* Design Palette */}
        <DesignPaletteMUI
          isOpen={isDesignPaletteOpen}
          onToggle={handleToggleDesignPalette}
          shapes={shapes}
          onShapeUpdate={handleShapeUpdate}
          onShapeUpdateDebounced={handleShapeUpdateDebounced}
          currentUser={user}
          presence={presence}
        />

        {/* AI Panel */}
        <AIPanel
          canvasId={canvasId}
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
        />

        {/* AI Thinking Indicator */}
        <AIThinkingIndicator isExecuting={isExecuting} />
      </div>
    </div>
  )
}

export default CanvasPage
