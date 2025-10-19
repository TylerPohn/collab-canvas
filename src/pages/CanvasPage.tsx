import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AIPanel from '../components/AIPanel'
import AIThinkingIndicator from '../components/AIThinkingIndicator'
import CanvasAccessDialog from '../components/CanvasAccessDialog'
import CanvasAccessLoader from '../components/CanvasAccessLoader'
import CanvasStage from '../components/CanvasStage'
import DesignPaletteMUI from '../components/DesignPaletteMUI'
import GuestUserBanner from '../components/GuestUserBanner'
import LayersPanel from '../components/LayersPanel'
import PresenceList from '../components/PresenceList'
import ToolbarMUI from '../components/ToolbarMUI'
import { useAIAgent } from '../hooks/useAIAgent'
import { useAIExecutionState } from '../hooks/useAIExecutionState'
import { useAuth } from '../hooks/useAuth'
import { useCanvasAccess } from '../hooks/useCanvasAccess'
import { usePresence } from '../hooks/usePresence'
import {
  useCanvasMeta,
  useShapeMutations,
  useShapeOperations,
  useShapes,
  useViewportPersistence
} from '../hooks/useShapes'
import { useThumbnailGeneration } from '../hooks/useThumbnailGeneration'
import { useToast } from '../hooks/useToast'
import { updateLastAccessed } from '../lib/firebase/firestore'
import { getGuestUserId, getGuestUserName } from '../lib/guestUser'
import type { Shape } from '../lib/types'
import { type ToolType } from '../lib/types'
import { useSelectionStore } from '../store/selection'

const CanvasPage: React.FC = () => {
  const { canvasId } = useParams<{ canvasId: string }>()
  const navigate = useNavigate()
  const [selectedTool, setSelectedTool] = useState<ToolType>('select')
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isDesignPaletteOpen, setIsDesignPaletteOpen] = useState(true)
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [isLayersOpen, setIsLayersOpen] = useState(false)
  const [showAccessDialog, setShowAccessDialog] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  const { selectedIds, hasSelection, clearSelection, selectShape } =
    useSelectionStore()
  const { user } = useAuth()
  const { showError, showSuccess } = useToast()

  // Guest user handling for default-canvas
  const isDefaultCanvas = canvasId === 'default-canvas'
  const guestUserId = isDefaultCanvas && !user ? getGuestUserId() : null
  const guestUserName = isDefaultCanvas && !user ? getGuestUserName() : null
  const effectiveUserId = user?.uid || guestUserId || ''

  // Check canvas access
  const {
    hasAccess,
    needsPassword,
    isLoading: isCheckingAccess,
    verifyPassword
  } = useCanvasAccess(canvasId || '')

  // Redirect if no canvas ID
  useEffect(() => {
    if (!canvasId) {
      navigate('/dashboard')
    }
  }, [canvasId, navigate])

  // Handle access checking
  useEffect(() => {
    if (!isCheckingAccess && !hasAccess && needsPassword) {
      setShowAccessDialog(true)
    } else if (!isCheckingAccess && !hasAccess && !needsPassword) {
      // No access and no password needed - redirect to dashboard
      navigate('/dashboard')
    }
  }, [isCheckingAccess, hasAccess, needsPassword, navigate])

  // Update last accessed time when user has access
  useEffect(() => {
    if (hasAccess && effectiveUserId && canvasId) {
      updateLastAccessed(canvasId, effectiveUserId)
    }
  }, [hasAccess, effectiveUserId, canvasId])

  // PR #8: Canvas metadata and persistence
  const {
    canvasMeta,
    isLoading: canvasMetaLoading,
    error: canvasMetaError,
    initializeCanvas,
    updateCanvasMeta
  } = useCanvasMeta(canvasId || '', effectiveUserId)

  const { saveViewport, restoreViewport } = useViewportPersistence(
    canvasId || '',
    effectiveUserId
  )

  // AI Agent hook
  useAIAgent(canvasId || '', effectiveUserId)

  // Shared AI execution state for thinking indicator
  const { isExecuting } = useAIExecutionState()

  // PR #7: Use React Query hooks for shape management
  const {
    shapes,
    isLoading: shapesLoading,
    error: shapesError
  } = useShapes(canvasId || '')

  // Thumbnail generation
  const { setStageRef } = useThumbnailGeneration({
    canvasId: canvasId || '',
    shapes,
    viewport: restoreViewport(),
    onThumbnailGenerated: useCallback(
      (thumbnail: string) => {
        // Update canvas metadata with thumbnail
        if (canvasMeta && canvasId) {
          updateCanvasMeta({ thumbnail })
        }
      },
      [canvasMeta, canvasId, updateCanvasMeta]
    )
  })

  // Cache max zIndex calculation to avoid recalculating on every render
  const maxZIndex = useMemo(
    () => shapes.reduce((max, shape) => Math.max(max, shape.zIndex || 0), 0),
    [shapes]
  )

  const {
    createShape,
    updateShape,
    deleteShape,
    batchCreateShapes,
    batchUpdateShapes,
    batchDeleteShapes
  } = useShapeMutations(canvasId || '', effectiveUserId)

  // Get debounced update for real-time drag updates
  const { debouncedUpdate, debouncedBatchUpdate } = useShapeOperations(
    canvasId || '',
    effectiveUserId
  )

  // Presence functionality (disabled for guests)
  const {
    presence,
    updateCursor,
    error: presenceError
  } = usePresence({
    canvasId: canvasId || '',
    enabled: !!user && !!canvasId // Only enable for authenticated users
  })

  // Keyboard shortcuts will be added after function declarations

  // PR #8: Initialize canvas on mount (only if user has access)
  useEffect(() => {
    if (effectiveUserId && !canvasMetaLoading && hasAccess) {
      initializeCanvas()
    }
  }, [effectiveUserId, canvasMetaLoading, hasAccess, initializeCanvas])

  // Manage initialization state to prevent flashing
  useEffect(() => {
    if (
      !isCheckingAccess &&
      hasAccess &&
      !shapesLoading &&
      !canvasMetaLoading &&
      canvasSize.width > 0 &&
      canvasSize.height > 0
    ) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsInitializing(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setIsInitializing(true)
    }
  }, [
    isCheckingAccess,
    hasAccess,
    shapesLoading,
    canvasMetaLoading,
    canvasSize.width,
    canvasSize.height
  ])

  // Handle password verification
  const handlePasswordAccess = async (password: string): Promise<boolean> => {
    return await verifyPassword(password)
  }

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

  const handleToggleLayers = () => {
    setIsLayersOpen(!isLayersOpen)
  }

  // PR #7: Handle shape creation with React Query
  const handleShapeCreate = useCallback(
    async (
      shapeData: Omit<
        Shape,
        'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
      >
    ): Promise<Shape> => {
      if (!effectiveUserId) {
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
    [createShape, effectiveUserId, showSuccess, showError, selectShape]
  )

  // PR #7: Handle shape updates with React Query
  const handleShapeUpdate = useCallback(
    async (id: string, updates: Partial<Shape>) => {
      if (!effectiveUserId) return

      try {
        await updateShape(id, updates)
      } catch (error) {
        console.error('Failed to update shape:', error)
        showError('Failed to update shape', 'Your changes could not be saved')
      }
    },
    [updateShape, effectiveUserId, showError]
  )

  // PR #13.1: Handle debounced shape updates for real-time drag
  const handleShapeUpdateDebounced = useCallback(
    (id: string, updates: Partial<Shape>) => {
      if (!effectiveUserId) return
      debouncedUpdate(id, updates)
    },
    [debouncedUpdate, effectiveUserId]
  )

  // PR #15.3: Handle debounced batch updates for multi-object movement
  const handleShapeBatchUpdateDebounced = useCallback(
    (updates: Array<{ objectId: string; updates: Partial<Shape> }>) => {
      if (!effectiveUserId) return
      debouncedBatchUpdate(updates)
    },
    [debouncedBatchUpdate, effectiveUserId]
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
      if (!effectiveUserId) return

      const shapesToDuplicate = shapes.filter(shape => ids.includes(shape.id))

      // Calculate zIndex for duplicated shapes (highest existing zIndex + 1)
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
    [
      shapes,
      maxZIndex,
      batchCreateShapes,
      effectiveUserId,
      showSuccess,
      showError
    ]
  )

  // Toolbar handlers
  const handleToolbarDelete = useCallback(() => {
    if (selectedIds.length > 0) {
      handleShapeDelete(selectedIds)
    }
  }, [selectedIds, handleShapeDelete])

  const handleToolbarDuplicate = useCallback(() => {
    if (selectedIds.length > 0) {
      handleShapeDuplicate(selectedIds)
    }
  }, [selectedIds, handleShapeDuplicate])

  // Handle batch shape creation (for paste operations)
  const handleShapeBatchCreate = useCallback(
    async (
      shapes: Omit<
        Shape,
        'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
      >[]
    ) => {
      try {
        const createdShapes = await batchCreateShapes(shapes)
        // Automatically select the newly created shapes
        const newShapeIds = createdShapes.map(shape => shape.id)
        useSelectionStore.getState().selectMultiple(newShapeIds)
        return createdShapes
      } catch (error) {
        console.error('Failed to create shapes:', error)
        showError('Failed to create shapes', 'Please try again')
        throw error
      }
    },
    [batchCreateShapes, showError]
  )

  // Handle Mermaid import
  const handleImportMermaid = useCallback(
    async (mermaidCode: string, diagramType: string) => {
      if (!effectiveUserId) return

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
      effectiveUserId,
      canvasSize,
      maxZIndex,
      createShape,
      showSuccess,
      showError,
      clearSelection,
      selectShape
    ]
  )

  // Show access checking loader
  if (isCheckingAccess) {
    return <CanvasAccessLoader message="Checking access..." />
  }

  // Show access denied if no access and no password needed
  if (!hasAccess && !needsPassword) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this canvas.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Guest user banner */}
      {isDefaultCanvas && !user && (
        <GuestUserBanner guestName={guestUserName || 'Guest'} />
      )}

      <ToolbarMUI
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
        onDelete={handleToolbarDelete}
        onDuplicate={handleToolbarDuplicate}
        canDelete={hasSelection()}
        canDuplicate={hasSelection()}
        onToggleDesignPalette={handleToggleDesignPalette}
        isDesignPaletteOpen={isDesignPaletteOpen}
        onToggleAI={() => setIsAIOpen(!isAIOpen)}
        isAIOpen={isAIOpen}
        onToggleLayers={handleToggleLayers}
        isLayersOpen={isLayersOpen}
        onImportMermaid={handleImportMermaid}
        onBackToDashboard={() => navigate('/dashboard')}
        onCanvasSettings={() => {
          // TODO: Open canvas settings dialog
          console.log('Open canvas settings')
        }}
        onShareCanvas={() => {
          // TODO: Open share dialog
          console.log('Share canvas')
        }}
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
        {isInitializing ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 mx-auto"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {isCheckingAccess
                    ? 'Checking access...'
                    : shapesLoading
                      ? 'Loading shapes...'
                      : canvasMetaLoading
                        ? 'Loading canvas...'
                        : 'Setting up canvas...'}
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
              onShapeBatchCreate={handleShapeBatchCreate}
              onCursorMove={updateCursor}
              onViewportChange={saveViewport}
              initialViewport={restoreViewport()}
              onToolSelect={handleToolSelect}
              onStageRef={setStageRef}
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
          onShapeBatchUpdateDebounced={handleShapeBatchUpdateDebounced}
          currentUser={user}
          presence={presence}
        />

        {/* AI Panel */}
        <AIPanel
          canvasId={canvasId || ''}
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
        />

        {/* Layers Panel */}
        <LayersPanel
          isOpen={isLayersOpen}
          onClose={() => setIsLayersOpen(false)}
          shapes={shapes}
          selectedIds={selectedIds}
          onShapeSelect={selectShape}
          onShapeUpdate={handleShapeUpdate}
          onShapesReorder={batchUpdateShapes}
        />

        {/* AI Thinking Indicator */}
        <AIThinkingIndicator isExecuting={isExecuting} />
      </div>

      {/* Password Access Dialog */}
      <CanvasAccessDialog
        open={showAccessDialog}
        onClose={() => {
          setShowAccessDialog(false)
          navigate('/dashboard')
        }}
        onAccess={handlePasswordAccess}
        canvasName={canvasMeta?.name || 'Untitled Canvas'}
        isLoading={false}
      />
    </div>
  )
}

export default CanvasPage
