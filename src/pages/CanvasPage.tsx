import React, { useCallback, useEffect, useState } from 'react'
import CanvasStage from '../components/CanvasStage'
import PresenceList from '../components/PresenceList'
import Toolbar, { type ToolType } from '../components/Toolbar'
import { useAuth } from '../hooks/useAuth'
import { usePresence } from '../hooks/usePresence'
import type { Shape } from '../lib/types'
import { useSelectionStore } from '../store/selection'

const CanvasPage: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select')
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [shapes, setShapes] = useState<Shape[]>([])

  const { selectedIds, hasSelection } = useSelectionStore()
  const { user } = useAuth()

  // Use a fixed canvas ID for now (in a real app, this would come from URL params)
  const canvasId = 'default-canvas'

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

  // Generate unique ID for shapes
  const generateId = () => {
    return `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Handle shape creation
  const handleShapeCreate = useCallback(
    (
      shapeData: Omit<
        Shape,
        'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
      >
    ) => {
      const now = Date.now()
      const newShape = {
        ...shapeData,
        id: generateId(),
        createdAt: now,
        createdBy: 'current-user', // TODO: Get from auth context in future PRs
        updatedAt: now,
        updatedBy: 'current-user'
      } as Shape

      setShapes(prev => [...prev, newShape])
    },
    []
  )

  // Handle shape updates
  const handleShapeUpdate = useCallback(
    (id: string, updates: Partial<Shape>) => {
      setShapes(prev =>
        prev.map(shape =>
          shape.id === id
            ? ({
                ...shape,
                ...updates,
                updatedAt: Date.now(),
                updatedBy: 'current-user'
              } as Shape)
            : shape
        )
      )
    },
    []
  )

  // Handle shape deletion
  const handleShapeDelete = useCallback((ids: string[]) => {
    setShapes(prev => prev.filter(shape => !ids.includes(shape.id)))
  }, [])

  // Handle shape duplication
  const handleShapeDuplicate = useCallback(
    (ids: string[]) => {
      const shapesToDuplicate = shapes.filter(shape => ids.includes(shape.id))
      const now = Date.now()

      const duplicatedShapes = shapesToDuplicate.map(
        shape =>
          ({
            ...shape,
            id: generateId(),
            x: shape.x + 20, // Offset duplicated shapes
            y: shape.y + 20,
            createdAt: now,
            createdBy: 'current-user',
            updatedAt: now,
            updatedBy: 'current-user'
          }) as Shape
      )

      setShapes(prev => [...prev, ...duplicatedShapes])
    },
    [shapes]
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

        {/* Connection status indicator */}
        {presenceError && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              Connection error: {presenceError}
            </div>
          </div>
        )}
        {canvasSize.width > 0 && canvasSize.height > 0 ? (
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
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading canvas...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CanvasPage
