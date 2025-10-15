import type Konva from 'konva'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Circle, Layer, Rect, Stage, Text, Transformer } from 'react-konva'
import { useCanvasShortcuts } from '../hooks/useCanvasShortcuts'
import { usePanZoom } from '../hooks/usePanZoom'
import type {
  CircleShape as CircleShapeType,
  RectangleShape as RectangleShapeType,
  Shape,
  TextShape as TextShapeType,
  ToolType,
  UserPresence,
  ViewportState
} from '../lib/types'
import { useSelectionStore } from '../store/selection'
import CursorLayer from './CursorLayer'
import CircleShape from './Shapes/CircleShape'
import RectangleShape from './Shapes/RectangleShape'
import TextShape from './Shapes/TextShape'
import TextEditor from './TextEditor'

interface CanvasStageProps {
  width: number
  height: number
  selectedTool: ToolType
  shapes: Shape[]
  presence: UserPresence[]
  currentUserId: string
  onShapeCreate: (
    shape: Omit<
      Shape,
      'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
    >
  ) => Promise<Shape>
  onShapeUpdate: (id: string, updates: Partial<Shape>) => void
  onShapeDelete: (ids: string[]) => void
  onShapeDuplicate: (ids: string[]) => void
  onCursorMove: (cursor: { x: number; y: number }) => void
  onViewportChange?: (viewport: ViewportState) => void
  initialViewport?: ViewportState
}

const CanvasStage: React.FC<CanvasStageProps> = memo(
  ({
    width,
    height,
    selectedTool,
    shapes,
    presence,
    currentUserId,
    onShapeCreate,
    onShapeUpdate,
    onShapeDelete,
    onShapeDuplicate,
    onCursorMove,
    onViewportChange,
    initialViewport
  }) => {
    const stageRef = useRef<Konva.Stage>(null)
    const transformerRef = useRef<Konva.Transformer>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [drawingStart, setDrawingStart] = useState<{
      x: number
      y: number
    } | null>(null)
    const [previewShape, setPreviewShape] = useState<{
      type: 'rect' | 'circle' | 'text'
      x: number
      y: number
      width?: number
      height?: number
      radius?: number
      text?: string
      fontSize?: number
    } | null>(null)
    const [editingTextId, setEditingTextId] = useState<string | null>(null)
    const [isSelecting, setIsSelecting] = useState(false)
    const [selectionStart, setSelectionStart] = useState<{
      x: number
      y: number
    } | null>(null)
    const [selectionRect, setSelectionRect] = useState<{
      x: number
      y: number
      width: number
      height: number
    } | null>(null)
    const [initialShapePositions, setInitialShapePositions] = useState<
      Map<string, { x: number; y: number }>
    >(new Map())
    const [dragOffset, setDragOffset] = useState<{
      x: number
      y: number
    } | null>(null)

    const {
      viewport,
      handleWheel,
      handleMouseDown: handlePanMouseDown,
      handleMouseMove: handlePanMouseMove,
      handleMouseUp: handlePanMouseUp,
      isDragging,
      setViewport
    } = usePanZoom(initialViewport)

    const { selectedIds, selectShape, clearSelection, isSelected } =
      useSelectionStore()

    // Update transformer when selection changes
    useEffect(() => {
      if (transformerRef.current && selectedIds.length === 1) {
        const selectedNode = stageRef.current?.findOne(`#${selectedIds[0]}`)
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode])
          transformerRef.current.getLayer()?.batchDraw()
        }
      } else if (transformerRef.current) {
        transformerRef.current.nodes([])
        transformerRef.current.getLayer()?.batchDraw()
      }
    }, [selectedIds])

    // Keyboard shortcuts
    const handleDelete = useCallback(() => {
      if (selectedIds.length > 0) {
        onShapeDelete(selectedIds)
        clearSelection()
      }
    }, [selectedIds, onShapeDelete, clearSelection])

    const handleDuplicate = useCallback(() => {
      if (selectedIds.length > 0) {
        onShapeDuplicate(selectedIds)
      }
    }, [selectedIds, onShapeDuplicate])

    const handleNudge = useCallback(
      (direction: 'up' | 'down' | 'left' | 'right') => {
        if (selectedIds.length === 0) return

        const nudgeAmount = 5
        let deltaX = 0
        let deltaY = 0

        switch (direction) {
          case 'up':
            deltaY = -nudgeAmount
            break
          case 'down':
            deltaY = nudgeAmount
            break
          case 'left':
            deltaX = -nudgeAmount
            break
          case 'right':
            deltaX = nudgeAmount
            break
        }

        selectedIds.forEach(id => {
          onShapeUpdate(id, {
            x: shapes.find(s => s.id === id)!.x + deltaX,
            y: shapes.find(s => s.id === id)!.y + deltaY
          })
        })
      },
      [selectedIds, shapes, onShapeUpdate]
    )

    useCanvasShortcuts({
      onDelete: handleDelete,
      onDuplicate: handleDuplicate,
      onNudge: handleNudge
    })

    // Handle stage mouse events
    const handleStageMouseDown = useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage()
        if (!stage) return

        // If clicking on empty space, clear selection and start drawing if tool is selected
        if (e.target === stage) {
          if (selectedTool === 'pan') {
            // Handle pan tool
            handlePanMouseDown(e)
          } else if (selectedTool === 'select') {
            // Handle selection tool - start selection rectangle
            const pointer = stage.getPointerPosition()
            if (pointer) {
              // Transform to world coordinates
              const worldX = (pointer.x - viewport.x) / viewport.scale
              const worldY = (pointer.y - viewport.y) / viewport.scale
              setIsSelecting(true)
              setSelectionStart({ x: worldX, y: worldY })
              setSelectionRect({ x: worldX, y: worldY, width: 0, height: 0 })
              // Don't clear selection immediately - let user drag to select multiple
            }
          } else {
            // Handle drawing tools (rectangle, circle, text)
            clearSelection()
            const pointer = stage.getPointerPosition()
            if (pointer) {
              // Transform to world coordinates
              const worldX = (pointer.x - viewport.x) / viewport.scale
              const worldY = (pointer.y - viewport.y) / viewport.scale
              setIsDrawing(true)
              setDrawingStart({ x: worldX, y: worldY })
            }
          }
        }
      },
      [
        selectedTool,
        clearSelection,
        handlePanMouseDown,
        viewport.x,
        viewport.y,
        viewport.scale
      ]
    )

    const handleStageMouseMove = useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>) => {
        // Track cursor position for presence
        const stage = e.target.getStage()
        if (stage) {
          const pointer = stage.getPointerPosition()
          if (pointer) {
            // Transform pointer position to world coordinates
            const worldX = (pointer.x - viewport.x) / viewport.scale
            const worldY = (pointer.y - viewport.y) / viewport.scale
            onCursorMove({ x: worldX, y: worldY })
          }
        }

        if (isSelecting && selectionStart && selectedTool === 'select') {
          // Handle selection rectangle preview
          const stage = e.target.getStage()
          if (stage) {
            const pointer = stage.getPointerPosition()
            if (pointer) {
              // Transform to world coordinates
              const worldX = (pointer.x - viewport.x) / viewport.scale
              const worldY = (pointer.y - viewport.y) / viewport.scale

              // Update selection rectangle
              setSelectionRect({
                x: Math.min(selectionStart.x, worldX),
                y: Math.min(selectionStart.y, worldY),
                width: Math.abs(worldX - selectionStart.x),
                height: Math.abs(worldY - selectionStart.y)
              })
            }
          }
        } else if (isDrawing && drawingStart && selectedTool !== 'select') {
          // Handle drawing preview
          const stage = e.target.getStage()
          if (stage) {
            const pointer = stage.getPointerPosition()
            if (pointer) {
              // Transform to world coordinates
              const worldX = (pointer.x - viewport.x) / viewport.scale
              const worldY = (pointer.y - viewport.y) / viewport.scale

              // Create preview shape based on tool
              let previewData: {
                type: 'rect' | 'circle' | 'text'
                x: number
                y: number
                width?: number
                height?: number
                radius?: number
                text?: string
                fontSize?: number
              }

              if (selectedTool === 'rectangle') {
                previewData = {
                  type: 'rect',
                  x: Math.min(drawingStart.x, worldX),
                  y: Math.min(drawingStart.y, worldY),
                  width: Math.abs(worldX - drawingStart.x),
                  height: Math.abs(worldY - drawingStart.y)
                }
              } else if (selectedTool === 'circle') {
                previewData = {
                  type: 'circle',
                  x: (drawingStart.x + worldX) / 2,
                  y: (drawingStart.y + worldY) / 2,
                  radius: Math.abs(worldX - drawingStart.x) / 2
                }
              } else if (selectedTool === 'text') {
                previewData = {
                  type: 'text',
                  x: Math.min(drawingStart.x, worldX),
                  y: Math.min(drawingStart.y, worldY),
                  text: 'Text',
                  fontSize: 16
                }
              } else {
                // Fallback for select tool (shouldn't happen)
                previewData = {
                  type: 'rect',
                  x: 0,
                  y: 0
                }
              }

              setPreviewShape(previewData)
            }
          }
        } else if (selectedTool === 'pan') {
          handlePanMouseMove(e)
        }
      },
      [
        isSelecting,
        selectionStart,
        isDrawing,
        drawingStart,
        selectedTool,
        handlePanMouseMove,
        viewport.x,
        viewport.y,
        viewport.scale,
        onCursorMove
      ]
    )

    const handleStageMouseUp = useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (isSelecting && selectionStart && selectedTool === 'select') {
          // Complete selection rectangle
          if (
            selectionRect &&
            selectionRect.width > 5 &&
            selectionRect.height > 5
          ) {
            // Find shapes that intersect with the selection rectangle
            const shapesInSelection = shapes.filter(shape => {
              const shapeBounds = {
                x: shape.x,
                y: shape.y,
                width:
                  shape.type === 'circle' ? shape.radius * 2 : shape.width || 0,
                height:
                  shape.type === 'circle' ? shape.radius * 2 : shape.height || 0
              }

              // Check if shapes intersect with selection rectangle
              return !(
                shapeBounds.x + shapeBounds.width < selectionRect.x ||
                selectionRect.x + selectionRect.width < shapeBounds.x ||
                shapeBounds.y + shapeBounds.height < selectionRect.y ||
                selectionRect.y + selectionRect.height < shapeBounds.y
              )
            })

            // Select all shapes in the selection rectangle
            if (shapesInSelection.length > 0) {
              useSelectionStore
                .getState()
                .selectMultiple(shapesInSelection.map(s => s.id))
            } else {
              // If no shapes in selection, clear selection
              clearSelection()
            }
          } else {
            // If selection rectangle is too small, clear selection
            clearSelection()
          }

          setIsSelecting(false)
          setSelectionStart(null)
          setSelectionRect(null)
        } else if (isDrawing && drawingStart && selectedTool !== 'select') {
          const stage = e.target.getStage()
          if (stage) {
            const pointer = stage.getPointerPosition()
            if (pointer) {
              // Transform to world coordinates
              const worldX = (pointer.x - viewport.x) / viewport.scale
              const worldY = (pointer.y - viewport.y) / viewport.scale

              // Create shape based on tool
              let shapeData: Omit<
                Shape,
                'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
              >

              // Calculate zIndex for new shape (highest existing zIndex + 1)
              const maxZIndex = shapes.reduce(
                (max, shape) => Math.max(max, shape.zIndex || 0),
                0
              )
              const newZIndex = maxZIndex + 1

              if (selectedTool === 'rectangle') {
                shapeData = {
                  type: 'rect',
                  x: Math.min(drawingStart.x, worldX),
                  y: Math.min(drawingStart.y, worldY),
                  width: Math.abs(worldX - drawingStart.x),
                  height: Math.abs(worldY - drawingStart.y),
                  zIndex: newZIndex
                }
              } else if (selectedTool === 'circle') {
                shapeData = {
                  type: 'circle',
                  x: (drawingStart.x + worldX) / 2,
                  y: (drawingStart.y + worldY) / 2,
                  radius: Math.abs(worldX - drawingStart.x) / 2,
                  zIndex: newZIndex
                }
              } else if (selectedTool === 'text') {
                shapeData = {
                  type: 'text',
                  x: Math.min(drawingStart.x, worldX),
                  y: Math.min(drawingStart.y, worldY),
                  text: 'Text',
                  fontSize: 16,
                  fontFamily: 'Arial',
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textDecoration: 'none',
                  zIndex: newZIndex
                }
              } else {
                // Fallback for select tool (shouldn't happen)
                shapeData = {
                  type: 'rect',
                  x: 0,
                  y: 0,
                  width: 0,
                  height: 0,
                  zIndex: newZIndex
                }
              }

              // For text shapes, automatically enter edit mode after creation
              if (selectedTool === 'text') {
                onShapeCreate(shapeData)
                  .then(createdShape => {
                    if (createdShape && createdShape.type === 'text') {
                      setEditingTextId(createdShape.id)
                    }
                  })
                  .catch(error => {
                    console.error('Failed to create text shape:', error)
                  })
              } else {
                onShapeCreate(shapeData)
              }
            }
          }
          setIsDrawing(false)
          setDrawingStart(null)
          setPreviewShape(null)
        } else if (selectedTool === 'pan') {
          handlePanMouseUp(e)
        }
      },
      [
        isSelecting,
        selectionStart,
        selectionRect,
        shapes,
        isDrawing,
        drawingStart,
        selectedTool,
        onShapeCreate,
        handlePanMouseUp,
        viewport.x,
        viewport.y,
        viewport.scale,
        clearSelection
      ]
    )

    // Handle shape selection
    const handleShapeSelect = useCallback(
      (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true

        if (e.evt.ctrlKey || e.evt.metaKey) {
          // Multi-select with Ctrl/Cmd
          const currentSelection = useSelectionStore.getState().selectedIds
          if (currentSelection.includes(id)) {
            useSelectionStore.getState().toggleSelection(id)
          } else {
            useSelectionStore
              .getState()
              .selectMultiple([...currentSelection, id])
          }
        } else {
          // Single select
          selectShape(id)
        }
      },
      [selectShape]
    )

    // Handle shape drag start - capture initial positions for multi-drag
    const handleShapeDragStart = useCallback(
      (id: string) => {
        // If multiple shapes are selected, capture their initial positions
        if (selectedIds.length > 1 && selectedIds.includes(id)) {
          const positions = new Map<string, { x: number; y: number }>()
          selectedIds.forEach(selectedId => {
            const shape = shapes.find(s => s.id === selectedId)
            if (shape) {
              positions.set(selectedId, { x: shape.x, y: shape.y })
            }
          })
          setInitialShapePositions(positions)
        }
      },
      [selectedIds, shapes]
    )

    // Handle shape drag move - update cursor position during drag
    const handleShapeDragMove = useCallback(
      (e: Konva.KonvaEventObject<DragEvent>) => {
        const stage = e.target.getStage()
        if (stage) {
          const pointer = stage.getPointerPosition()
          if (pointer) {
            // Transform pointer position to world coordinates
            const worldX = (pointer.x - viewport.x) / viewport.scale
            const worldY = (pointer.y - viewport.y) / viewport.scale
            onCursorMove({ x: worldX, y: worldY })
          }
        }

        // If we're dragging a shape that's part of a multi-selection, calculate drag offset
        const draggedShapeId = e.target.id()
        if (
          selectedIds.length > 1 &&
          selectedIds.includes(draggedShapeId) &&
          initialShapePositions.size > 0
        ) {
          const initialPos = initialShapePositions.get(draggedShapeId)
          if (initialPos) {
            const node = e.target
            const currentX = node.x()
            const currentY = node.y()
            const offsetX = currentX - initialPos.x
            const offsetY = currentY - initialPos.y
            setDragOffset({ x: offsetX, y: offsetY })
          }
        }
      },
      [
        viewport.x,
        viewport.y,
        viewport.scale,
        onCursorMove,
        selectedIds,
        initialShapePositions
      ]
    )

    // Handle shape drag end
    const handleShapeDragEnd = useCallback(
      (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target
        const newX = node.x()
        const newY = node.y()

        // If multiple shapes are selected and we have initial positions
        if (selectedIds.length > 1 && initialShapePositions.size > 0) {
          const initialPos = initialShapePositions.get(id)
          if (initialPos) {
            // Calculate the drag offset
            const deltaX = newX - initialPos.x
            const deltaY = newY - initialPos.y

            // Apply the same offset to all selected shapes
            selectedIds.forEach(selectedId => {
              const initialPos = initialShapePositions.get(selectedId)
              if (initialPos) {
                onShapeUpdate(selectedId, {
                  x: initialPos.x + deltaX,
                  y: initialPos.y + deltaY
                })
              }
            })

            // Clear the initial positions and drag offset
            setInitialShapePositions(new Map())
            setDragOffset(null)
          }
        } else {
          // Single shape drag
          onShapeUpdate(id, {
            x: newX,
            y: newY
          })
        }
      },
      [selectedIds, initialShapePositions, onShapeUpdate]
    )

    // Handle shape transform end
    const handleShapeTransformEnd = useCallback(
      (id: string, e: Konva.KonvaEventObject<Event>) => {
        const node = e.target
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()

        // Reset scale and apply to dimensions
        node.scaleX(1)
        node.scaleY(1)

        const shape = shapes.find(s => s.id === id)
        if (!shape) return

        if (shape.type === 'rect') {
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation()
          })
        } else if (shape.type === 'circle') {
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            radius: Math.max(
              5,
              (node as Konva.Circle).radius() * Math.max(scaleX, scaleY)
            ),
            rotation: node.rotation()
          })
        } else if (shape.type === 'text') {
          // For text shapes, scale affects fontSize
          const currentFontSize = shape.fontSize || 16
          const newFontSize = Math.max(
            8,
            currentFontSize * Math.max(scaleX, scaleY)
          )

          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            fontSize: newFontSize,
            rotation: node.rotation()
          })
        }
      },
      [shapes, onShapeUpdate]
    )

    // Handle text double-click for editing
    const handleTextDoubleClick = useCallback(
      (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        setEditingTextId(id)
        clearSelection()
      },
      [clearSelection]
    )

    // Handle text editing save
    const handleTextSave = useCallback(
      (id: string, newText: string) => {
        onShapeUpdate(id, { text: newText })
        setEditingTextId(null)
      },
      [onShapeUpdate]
    )

    // Handle text editing cancel
    const handleTextCancel = useCallback(() => {
      setEditingTextId(null)
    }, [])

    // Update stage position and scale
    useEffect(() => {
      if (stageRef.current) {
        const stage = stageRef.current
        stage.position({ x: viewport.x, y: viewport.y })
        stage.scale({ x: viewport.scale, y: viewport.scale })
        stage.batchDraw()
      }
    }, [viewport])

    // PR #8: Save viewport changes
    useEffect(() => {
      if (onViewportChange) {
        onViewportChange(viewport)
      }
    }, [viewport, onViewportChange])

    // PR #8: Restore viewport from initial state
    useEffect(() => {
      if (initialViewport && setViewport) {
        setViewport(initialViewport)
      }
    }, [initialViewport, setViewport])

    return (
      <div className="w-full h-full bg-gray-50 relative overflow-hidden">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onWheel={handleWheel}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          draggable={false}
          style={{
            cursor: isDragging
              ? 'grabbing'
              : selectedTool === 'pan'
                ? 'grab'
                : selectedTool === 'select'
                  ? isSelecting
                    ? 'crosshair'
                    : 'default'
                  : 'crosshair'
          }}
        >
          <Layer>
            {/* Render shapes sorted by zIndex */}
            {shapes
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map(shape => {
                const commonProps = {
                  key: shape.id,
                  shape,
                  isSelected: isSelected(shape.id),
                  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) =>
                    handleShapeSelect(shape.id, e),
                  onDragStart: () => handleShapeDragStart(shape.id),
                  onDragMove: handleShapeDragMove,
                  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
                    handleShapeDragEnd(shape.id, e),
                  onTransformEnd: (e: Konva.KonvaEventObject<Event>) =>
                    handleShapeTransformEnd(shape.id, e)
                }

                switch (shape.type) {
                  case 'rect':
                    return (
                      <RectangleShape
                        {...commonProps}
                        shape={shape as RectangleShapeType}
                      />
                    )
                  case 'circle':
                    return (
                      <CircleShape
                        {...commonProps}
                        shape={shape as CircleShapeType}
                      />
                    )
                  case 'text':
                    return (
                      <TextShape
                        {...commonProps}
                        shape={shape as TextShapeType}
                        onDoubleClick={(
                          e: Konva.KonvaEventObject<MouseEvent>
                        ) => handleTextDoubleClick(shape.id, e)}
                        isEditing={editingTextId === shape.id}
                      />
                    )
                  default:
                    return null
                }
              })}

            {/* Preview shape during drawing */}
            {previewShape && (
              <>
                {previewShape.type === 'rect' && (
                  <Rect
                    x={previewShape.x}
                    y={previewShape.y}
                    width={previewShape.width || 0}
                    height={previewShape.height || 0}
                    fill="rgba(59, 130, 246, 0.3)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[5, 5]}
                    listening={false}
                  />
                )}
                {previewShape.type === 'circle' && (
                  <Circle
                    x={previewShape.x}
                    y={previewShape.y}
                    radius={previewShape.radius || 0}
                    fill="rgba(16, 185, 129, 0.3)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dash={[5, 5]}
                    listening={false}
                  />
                )}
                {previewShape.type === 'text' && (
                  <Text
                    x={previewShape.x}
                    y={previewShape.y}
                    text={previewShape.text || 'Text'}
                    fontSize={previewShape.fontSize || 16}
                    fill="rgba(55, 65, 81, 0.3)"
                    stroke="#374151"
                    strokeWidth={1}
                    dash={[3, 3]}
                    listening={false}
                    fontFamily="Inter, system-ui, sans-serif"
                  />
                )}
              </>
            )}

            {/* Selection rectangle during multi-select */}
            {selectionRect && (
              <Rect
                x={selectionRect.x}
                y={selectionRect.y}
                width={selectionRect.width}
                height={selectionRect.height}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            )}

            {/* Multi-drag preview shapes */}
            {dragOffset &&
              selectedIds.length > 1 &&
              initialShapePositions.size > 0 && (
                <>
                  {selectedIds.map(shapeId => {
                    const shape = shapes.find(s => s.id === shapeId)
                    const initialPos = initialShapePositions.get(shapeId)
                    if (!shape || !initialPos) return null

                    const previewX = initialPos.x + dragOffset.x
                    const previewY = initialPos.y + dragOffset.y

                    switch (shape.type) {
                      case 'rect':
                        return (
                          <Rect
                            key={`preview-${shapeId}`}
                            x={previewX}
                            y={previewY}
                            width={shape.width}
                            height={shape.height}
                            fill="rgba(59, 130, 246, 0.2)"
                            stroke="#3b82f6"
                            strokeWidth={1}
                            dash={[3, 3]}
                            listening={false}
                            rotation={shape.rotation || 0}
                          />
                        )
                      case 'circle':
                        return (
                          <Circle
                            key={`preview-${shapeId}`}
                            x={previewX}
                            y={previewY}
                            radius={shape.radius}
                            fill="rgba(16, 185, 129, 0.2)"
                            stroke="#10b981"
                            strokeWidth={1}
                            dash={[3, 3]}
                            listening={false}
                            rotation={shape.rotation || 0}
                          />
                        )
                      case 'text':
                        return (
                          <Text
                            key={`preview-${shapeId}`}
                            x={previewX}
                            y={previewY}
                            text={shape.text}
                            fontSize={shape.fontSize || 16}
                            fill="rgba(55, 65, 81, 0.2)"
                            stroke="#374151"
                            strokeWidth={1}
                            dash={[2, 2]}
                            listening={false}
                            fontFamily="Inter, system-ui, sans-serif"
                            rotation={shape.rotation || 0}
                          />
                        )
                      default:
                        return null
                    }
                  })}
                </>
              )}

            {/* Transformer for selected shapes */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit resize
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox
                }
                return newBox
              }}
            />
          </Layer>

          {/* Cursor layer for other users */}
          <CursorLayer
            presence={presence}
            currentUserId={currentUserId}
            viewport={viewport}
          />
        </Stage>

        {/* Text Editor */}
        {editingTextId &&
          (() => {
            const editingShape = shapes.find(
              s => s.id === editingTextId && s.type === 'text'
            ) as TextShapeType | undefined
            return editingShape ? (
              <TextEditor
                shape={editingShape}
                isVisible={true}
                onSave={text => handleTextSave(editingTextId, text)}
                onCancel={handleTextCancel}
                stagePosition={{ x: viewport.x, y: viewport.y }}
                stageScale={viewport.scale}
              />
            ) : null
          })()}

        {/* Canvas info overlay */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm text-sm text-gray-600">
          <div>Scale: {viewport.scale.toFixed(2)}x</div>
          <div>
            Position: ({Math.round(viewport.x)}, {Math.round(viewport.y)})
          </div>
          <div>Selected: {selectedIds.length}</div>
        </div>
      </div>
    )
  }
)

// PR #9: Add display name for debugging
CanvasStage.displayName = 'CanvasStage'

export default CanvasStage
