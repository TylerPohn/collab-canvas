import type Konva from 'konva'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Layer, Stage, Transformer } from 'react-konva'
import { useCanvasShortcuts } from '../hooks/useCanvasShortcuts'
import { usePanZoom } from '../hooks/usePanZoom'
import type {
  CircleShape as CircleShapeType,
  RectangleShape as RectangleShapeType,
  Shape,
  TextShape as TextShapeType,
  ToolType
} from '../lib/types'
import { useSelectionStore } from '../store/selection'
import CircleShape from './Shapes/CircleShape'
import RectangleShape from './Shapes/RectangleShape'
import TextShape from './Shapes/TextShape'

interface CanvasStageProps {
  width: number
  height: number
  selectedTool: ToolType
  shapes: Shape[]
  onShapeCreate: (
    shape: Omit<
      Shape,
      'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
    >
  ) => void
  onShapeUpdate: (id: string, updates: Partial<Shape>) => void
  onShapeDelete: (ids: string[]) => void
  onShapeDuplicate: (ids: string[]) => void
}

const CanvasStage: React.FC<CanvasStageProps> = ({
  width,
  height,
  selectedTool,
  shapes,
  onShapeCreate,
  onShapeUpdate,
  onShapeDelete,
  onShapeDuplicate
}) => {
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingStart, setDrawingStart] = useState<{
    x: number
    y: number
  } | null>(null)

  const {
    viewport,
    handleWheel,
    handleMouseDown: handlePanMouseDown,
    handleMouseMove: handlePanMouseMove,
    handleMouseUp: handlePanMouseUp,
    isDragging
  } = usePanZoom()

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
        clearSelection()

        if (selectedTool !== 'select') {
          const pointer = stage.getPointerPosition()
          if (pointer) {
            setIsDrawing(true)
            setDrawingStart(pointer)
          }
        } else {
          // Handle pan/zoom for select tool
          handlePanMouseDown(e)
        }
      }
    },
    [selectedTool, clearSelection, handlePanMouseDown]
  )

  const handleStageMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isDrawing && drawingStart && selectedTool !== 'select') {
        // Handle drawing preview (could add visual feedback here)
      } else if (selectedTool === 'select') {
        handlePanMouseMove(e)
      }
    },
    [isDrawing, drawingStart, selectedTool, handlePanMouseMove]
  )

  const handleStageMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isDrawing && drawingStart && selectedTool !== 'select') {
        const stage = e.target.getStage()
        if (stage) {
          const pointer = stage.getPointerPosition()
          if (pointer) {
            // Create shape based on tool
            const shapeData = {
              type:
                selectedTool === 'rectangle'
                  ? 'rect'
                  : (selectedTool as 'rect' | 'circle' | 'text'),
              x: Math.min(drawingStart.x, pointer.x),
              y: Math.min(drawingStart.y, pointer.y),
              ...(selectedTool === 'rectangle' && {
                width: Math.abs(pointer.x - drawingStart.x),
                height: Math.abs(pointer.y - drawingStart.y)
              }),
              ...(selectedTool === 'circle' && {
                radius: Math.abs(pointer.x - drawingStart.x) / 2
              }),
              ...(selectedTool === 'text' && {
                text: 'Text',
                fontSize: 16
              })
            }

            onShapeCreate(shapeData)
          }
        }
        setIsDrawing(false)
        setDrawingStart(null)
      } else if (selectedTool === 'select') {
        handlePanMouseUp(e)
      }
    },
    [isDrawing, drawingStart, selectedTool, onShapeCreate, handlePanMouseUp]
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
          useSelectionStore.getState().selectMultiple([...currentSelection, id])
        }
      } else {
        // Single select
        selectShape(id)
      }
    },
    [selectShape]
  )

  // Handle shape drag end
  const handleShapeDragEnd = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target
      onShapeUpdate(id, {
        x: node.x(),
        y: node.y()
      })
    },
    [onShapeUpdate]
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
        onShapeUpdate(id, {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation()
        })
      }
    },
    [shapes, onShapeUpdate]
  )

  // Update stage position and scale
  useEffect(() => {
    if (stageRef.current) {
      const stage = stageRef.current
      stage.position({ x: viewport.x, y: viewport.y })
      stage.scale({ x: viewport.scale, y: viewport.scale })
      stage.batchDraw()
    }
  }, [viewport])

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
            : selectedTool === 'select'
              ? 'grab'
              : 'crosshair'
        }}
      >
        <Layer>
          {/* Render shapes */}
          {shapes.map(shape => {
            const commonProps = {
              key: shape.id,
              shape,
              isSelected: isSelected(shape.id),
              onSelect: (e: Konva.KonvaEventObject<MouseEvent>) =>
                handleShapeSelect(shape.id, e),
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
                  <TextShape {...commonProps} shape={shape as TextShapeType} />
                )
              default:
                return null
            }
          })}

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
      </Stage>

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

export default CanvasStage
