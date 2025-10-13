import React, { useCallback, useEffect, useState } from 'react'
import CanvasStage from '../components/CanvasStage'
import PresenceList from '../components/PresenceList'
import Toolbar, { type ToolType } from '../components/Toolbar'
import { useAuth } from '../hooks/useAuth'
import { usePresence } from '../hooks/usePresence'
import { useShapeMutations, useShapes } from '../hooks/useShapes'
import type { Shape } from '../lib/types'
import { useSelectionStore } from '../store/selection'

const CanvasPage: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select')
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const { selectedIds, hasSelection } = useSelectionStore()
  const { user } = useAuth()

  // Use a fixed canvas ID for now (in a real app, this would come from URL params)
  const canvasId = 'default-canvas'

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

  // Presence functionality
  const {
    presence,
    updateCursor,
    error: presenceError
  } = usePresence({
    canvasId,
    enabled: !!user
  })

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
      } catch (error) {
        console.error('Failed to create shape:', error)
      }
    },
    [createShape, user?.uid]
  )

  // PR #7: Handle shape updates with React Query
  const handleShapeUpdate = useCallback(
    async (id: string, updates: Partial<Shape>) => {
      if (!user?.uid) return

      try {
        await updateShape(id, updates)
      } catch (error) {
        console.error('Failed to update shape:', error)
      }
    },
    [updateShape, user?.uid]
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
      } catch (error) {
        console.error('Failed to delete shapes:', error)
      }
    },
    [deleteShape, batchDeleteShapes]
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
      } catch (error) {
        console.error('Failed to duplicate shapes:', error)
      }
    },
    [shapes, batchCreateShapes, user?.uid]
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

        {/* Connection status indicators */}
        {presenceError && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              Presence error: {presenceError}
            </div>
          </div>
        )}
        {shapesError && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              Shapes error: {shapesError.message}
            </div>
          </div>
        )}

        {/* Loading or canvas content */}
        {shapesLoading || canvasSize.width === 0 || canvasSize.height === 0 ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {shapesLoading ? 'Loading shapes...' : 'Loading canvas...'}
              </p>
            </div>
          </div>
        ) : (
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
          />
        )}
      </div>
    </div>
  )
}

export default CanvasPage
