import type Konva from 'konva'
import React, {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  Arrow,
  Circle,
  Ellipse,
  Layer,
  Line,
  Rect,
  RegularPolygon,
  Stage,
  Star,
  Text,
  Transformer
} from 'react-konva'
import { useCanvasShortcuts } from '../hooks/useCanvasShortcuts'
import { usePanZoom } from '../hooks/usePanZoom'
import {
  createImageShape,
  handleClipboardImage,
  uploadImage
} from '../lib/imageUpload'
import type {
  ArrowShape as ArrowShapeType,
  CircleShape as CircleShapeType,
  EllipseShape as EllipseShapeType,
  HexagonShape as HexagonShapeType,
  ImageShape as ImageShapeType,
  LineShape as LineShapeType,
  MermaidShape as MermaidShapeType,
  RectangleShape as RectangleShapeType,
  Shape,
  StarShape as StarShapeType,
  TextShape as TextShapeType,
  ToolType,
  UserPresence,
  ViewportState
} from '../lib/types'
import { useDesignPaletteStore } from '../store/designPalette'
import { useSelectionStore } from '../store/selection'
import CursorLayer from './CursorLayer'
import ArrowShape from './Shapes/ArrowShape'
import CircleShape from './Shapes/CircleShape'
import EllipseShape from './Shapes/EllipseShape'
import HexagonShape from './Shapes/HexagonShape'
import ImageShape from './Shapes/ImageShape'
import LineShape from './Shapes/LineShape'
import MermaidShape from './Shapes/MermaidShape'
import RectangleShape from './Shapes/RectangleShape'
import StarShape from './Shapes/StarShape'
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
  onShapeUpdateDebounced: (id: string, updates: Partial<Shape>) => void
  onShapeBatchUpdateDebounced: (
    updates: Array<{ objectId: string; updates: Partial<Shape> }>
  ) => void
  onShapeDelete: (ids: string[]) => void
  onShapeDuplicate: (ids: string[]) => void
  onCursorMove: (cursor: { x: number; y: number }) => void
  onViewportChange?: (viewport: ViewportState) => void
  initialViewport?: ViewportState
  onToolSelect?: (tool: ToolType) => void
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
    onShapeUpdateDebounced,
    onShapeBatchUpdateDebounced,
    onShapeDelete,
    onShapeDuplicate,
    onCursorMove,
    onViewportChange,
    initialViewport,
    onToolSelect
  }) => {
    const stageRef = useRef<Konva.Stage>(null)
    const transformerRef = useRef<Konva.Transformer>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [drawingStart, setDrawingStart] = useState<{
      x: number
      y: number
    } | null>(null)
    const [previewShape, setPreviewShape] = useState<{
      type:
        | 'rect'
        | 'circle'
        | 'text'
        | 'mermaid'
        | 'line'
        | 'arrow'
        | 'ellipse'
        | 'hexagon'
        | 'star'
      x: number
      y: number
      width?: number
      height?: number
      radius?: number
      text?: string
      fontSize?: number
      endX?: number
      endY?: number
      radiusX?: number
      radiusY?: number
      sides?: number
      outerRadius?: number
      innerRadius?: number
      points?: number
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
    const [lastBatchUpdateTime, setLastBatchUpdateTime] = useState<number>(0)

    const {
      viewport,
      handleWheel,
      handleMouseDown: handlePanMouseDown,
      handleMouseMove: handlePanMouseMove,
      handleMouseUp: handlePanMouseUp,
      isDragging,
      setViewport
    } = usePanZoom(initialViewport)

    const { selectedIds, selectShape, clearSelection } = useSelectionStore()

    const { getDefaultTextProperties, getDefaultShapeProperties } =
      useDesignPaletteStore()

    // Update transformer when selection changes
    useEffect(() => {
      if (transformerRef.current && selectedIds.length > 0) {
        const selectedNodes = selectedIds
          .map(id => stageRef.current?.findOne(`#${id}`))
          .filter(Boolean) as Konva.Node[]

        if (selectedNodes.length > 0) {
          transformerRef.current.nodes(selectedNodes)
          transformerRef.current.getLayer()?.batchDraw()
        } else {
          // If no valid nodes found (e.g., after deletion), clear transformer
          transformerRef.current.nodes([])
          transformerRef.current.getLayer()?.batchDraw()
        }
      } else if (transformerRef.current) {
        transformerRef.current.nodes([])
        transformerRef.current.getLayer()?.batchDraw()
      }
    }, [selectedIds, shapes])

    // Keyboard shortcuts
    const handleDelete = useCallback(() => {
      if (selectedIds.length > 0) {
        // Clear transformer immediately to prevent showing handles for deleted shapes
        if (transformerRef.current) {
          transformerRef.current.nodes([])
          transformerRef.current.getLayer()?.batchDraw()
        }
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
      onNudge: handleNudge,
      onToolSelect: onToolSelect
        ? (tool: string) => onToolSelect(tool as ToolType)
        : undefined
    })

    // Handle clipboard paste for images
    useEffect(() => {
      const handlePaste = async (e: ClipboardEvent) => {
        if (selectedTool === 'image') {
          e.preventDefault()
          try {
            const imageResult = await handleClipboardImage()
            const imageShape = createImageShape(imageResult, 100, 100) // Default position
            await onShapeCreate(imageShape)
          } catch (error) {
            console.error('Failed to paste image:', error)
            // TODO: Show error toast
          }
        }
      }

      document.addEventListener('paste', handlePaste)
      return () => {
        document.removeEventListener('paste', handlePaste)
      }
    }, [selectedTool, onShapeCreate])

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
          } else if (selectedTool === 'image') {
            // Handle image tool - open file picker
            clearSelection()
            const pointer = stage.getPointerPosition()
            if (pointer) {
              // Transform to world coordinates
              const worldX = (pointer.x - viewport.x) / viewport.scale
              const worldY = (pointer.y - viewport.y) / viewport.scale

              // Create file input
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.onchange = async e => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  try {
                    const imageResult = await uploadImage(file)
                    const imageShape = createImageShape(
                      imageResult,
                      worldX,
                      worldY
                    )
                    await onShapeCreate(imageShape)
                  } catch (error) {
                    console.error('Failed to upload image:', error)
                    // TODO: Show error toast
                  }
                }
              }
              input.click()
            }
          } else {
            // Handle drawing tools (rectangle, circle, text, line, arrow, ellipse, hexagon, star)
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
        viewport.scale,
        onShapeCreate
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
                type:
                  | 'rect'
                  | 'circle'
                  | 'text'
                  | 'mermaid'
                  | 'line'
                  | 'arrow'
                  | 'ellipse'
                  | 'hexagon'
                  | 'star'
                x: number
                y: number
                width?: number
                height?: number
                radius?: number
                text?: string
                fontSize?: number
                endX?: number
                endY?: number
                radiusX?: number
                radiusY?: number
                sides?: number
                outerRadius?: number
                innerRadius?: number
                points?: number
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
                const textDefaults = getDefaultTextProperties()
                previewData = {
                  type: 'text',
                  x: Math.min(drawingStart.x, worldX),
                  y: Math.min(drawingStart.y, worldY),
                  text: 'Text',
                  fontSize: textDefaults.fontSize
                }
              } else if (selectedTool === 'line') {
                previewData = {
                  type: 'line',
                  x: drawingStart.x,
                  y: drawingStart.y,
                  endX: worldX,
                  endY: worldY
                }
              } else if (selectedTool === 'arrow') {
                previewData = {
                  type: 'arrow',
                  x: drawingStart.x,
                  y: drawingStart.y,
                  endX: worldX,
                  endY: worldY
                }
              } else if (selectedTool === 'ellipse') {
                previewData = {
                  type: 'ellipse',
                  x: (drawingStart.x + worldX) / 2,
                  y: (drawingStart.y + worldY) / 2,
                  radiusX: Math.abs(worldX - drawingStart.x) / 2,
                  radiusY: Math.abs(worldY - drawingStart.y) / 2
                }
              } else if (selectedTool === 'hexagon') {
                previewData = {
                  type: 'hexagon',
                  x: (drawingStart.x + worldX) / 2,
                  y: (drawingStart.y + worldY) / 2,
                  radius: Math.abs(worldX - drawingStart.x) / 2,
                  sides: 6
                }
              } else if (selectedTool === 'star') {
                previewData = {
                  type: 'star',
                  x: (drawingStart.x + worldX) / 2,
                  y: (drawingStart.y + worldY) / 2,
                  outerRadius: Math.abs(worldX - drawingStart.x) / 2,
                  innerRadius: Math.abs(worldX - drawingStart.x) / 4,
                  points: 5
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
        onCursorMove,
        getDefaultTextProperties
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
                const shapeDefaults = getDefaultShapeProperties()
                shapeData = {
                  type: 'rect',
                  x: Math.min(drawingStart.x, worldX),
                  y: Math.min(drawingStart.y, worldY),
                  width: Math.abs(worldX - drawingStart.x),
                  height: Math.abs(worldY - drawingStart.y),
                  fill: shapeDefaults.fill,
                  stroke: shapeDefaults.stroke,
                  strokeWidth: shapeDefaults.strokeWidth,
                  rotation: shapeDefaults.rotation,
                  cornerRadius: shapeDefaults.cornerRadius,
                  zIndex: newZIndex
                }
              } else if (selectedTool === 'circle') {
                const shapeDefaults = getDefaultShapeProperties()
                shapeData = {
                  type: 'circle',
                  x: (drawingStart.x + worldX) / 2,
                  y: (drawingStart.y + worldY) / 2,
                  radius: Math.abs(worldX - drawingStart.x) / 2,
                  fill: shapeDefaults.fill,
                  stroke: shapeDefaults.stroke,
                  strokeWidth: shapeDefaults.strokeWidth,
                  rotation: shapeDefaults.rotation,
                  zIndex: newZIndex
                }
              } else if (selectedTool === 'text') {
                const textDefaults = getDefaultTextProperties()
                const shapeDefaults = getDefaultShapeProperties()
                shapeData = {
                  type: 'text',
                  x: Math.min(drawingStart.x, worldX),
                  y: Math.min(drawingStart.y, worldY),
                  text: 'Text',
                  fontSize: textDefaults.fontSize,
                  fontFamily: textDefaults.fontFamily,
                  fontWeight: textDefaults.fontWeight,
                  fontStyle: textDefaults.fontStyle,
                  textDecoration: textDefaults.textDecoration,
                  fill: shapeDefaults.fill,
                  stroke: shapeDefaults.stroke,
                  strokeWidth: shapeDefaults.strokeWidth,
                  rotation: shapeDefaults.rotation,
                  zIndex: newZIndex
                }
              } else if (selectedTool === 'line') {
                const shapeDefaults = getDefaultShapeProperties()
                shapeData = {
                  type: 'line',
                  x: drawingStart.x,
                  y: drawingStart.y,
                  endX: worldX,
                  endY: worldY,
                  stroke: shapeDefaults.stroke,
                  strokeWidth: shapeDefaults.strokeWidth,
                  rotation: shapeDefaults.rotation,
                  zIndex: newZIndex
                } as LineShapeType
              } else if (selectedTool === 'arrow') {
                const shapeDefaults = getDefaultShapeProperties()
                shapeData = {
                  type: 'arrow',
                  x: drawingStart.x,
                  y: drawingStart.y,
                  endX: worldX,
                  endY: worldY,
                  arrowType: 'end',
                  stroke: shapeDefaults.stroke,
                  strokeWidth: shapeDefaults.strokeWidth,
                  rotation: shapeDefaults.rotation,
                  zIndex: newZIndex
                } as ArrowShapeType
              } else if (selectedTool === 'ellipse') {
                const shapeDefaults = getDefaultShapeProperties()
                shapeData = {
                  type: 'ellipse',
                  x: (drawingStart.x + worldX) / 2,
                  y: (drawingStart.y + worldY) / 2,
                  radiusX: Math.abs(worldX - drawingStart.x) / 2,
                  radiusY: Math.abs(worldY - drawingStart.y) / 2,
                  fill: shapeDefaults.fill,
                  stroke: shapeDefaults.stroke,
                  strokeWidth: shapeDefaults.strokeWidth,
                  rotation: shapeDefaults.rotation,
                  zIndex: newZIndex
                } as EllipseShapeType
              } else if (selectedTool === 'hexagon') {
                const shapeDefaults = getDefaultShapeProperties()
                shapeData = {
                  type: 'hexagon',
                  x: (drawingStart.x + worldX) / 2,
                  y: (drawingStart.y + worldY) / 2,
                  radius: Math.abs(worldX - drawingStart.x) / 2,
                  sides: 6,
                  fill: shapeDefaults.fill,
                  stroke: shapeDefaults.stroke,
                  strokeWidth: shapeDefaults.strokeWidth,
                  rotation: shapeDefaults.rotation,
                  zIndex: newZIndex
                } as HexagonShapeType
              } else if (selectedTool === 'star') {
                const shapeDefaults = getDefaultShapeProperties()
                shapeData = {
                  type: 'star',
                  x: (drawingStart.x + worldX) / 2,
                  y: (drawingStart.y + worldY) / 2,
                  outerRadius: Math.abs(worldX - drawingStart.x) / 2,
                  innerRadius: Math.abs(worldX - drawingStart.x) / 4,
                  points: 5,
                  starType: '5-point',
                  fill: shapeDefaults.fill,
                  stroke: shapeDefaults.stroke,
                  strokeWidth: shapeDefaults.strokeWidth,
                  rotation: shapeDefaults.rotation,
                  zIndex: newZIndex
                } as StarShapeType
              } else {
                // Fallback for select tool (shouldn't happen)
                const shapeDefaults = getDefaultShapeProperties()
                shapeData = {
                  type: 'rect',
                  x: 0,
                  y: 0,
                  width: 0,
                  height: 0,
                  fill: shapeDefaults.fill,
                  stroke: shapeDefaults.stroke,
                  strokeWidth: shapeDefaults.strokeWidth,
                  rotation: shapeDefaults.rotation,
                  cornerRadius: shapeDefaults.cornerRadius,
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
        clearSelection,
        getDefaultShapeProperties,
        getDefaultTextProperties
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
        } else if (e.evt.shiftKey) {
          // Multi-select with Shift
          const currentSelection = useSelectionStore.getState().selectedIds
          if (currentSelection.includes(id)) {
            // If already selected, remove from selection
            useSelectionStore.getState().toggleSelection(id)
          } else {
            // Add to selection
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

        // Only process shape updates if we're actually dragging (not just hovering)
        if (!e.target.isDragging()) {
          return
        }

        const node = e.target
        const draggedShapeId = node.id()
        const currentX = node.x()
        const currentY = node.y()

        // PR #15.3: Use batch updates for multi-object movement
        if (
          selectedIds.length > 1 &&
          selectedIds.includes(draggedShapeId) &&
          initialShapePositions.size > 0
        ) {
          const initialPos = initialShapePositions.get(draggedShapeId)
          if (initialPos) {
            const offsetX = currentX - initialPos.x
            const offsetY = currentY - initialPos.y
            setDragOffset({ x: offsetX, y: offsetY })

            // Create batch update for all selected shapes
            const batchUpdates = selectedIds
              .map(selectedId => {
                const initialPos = initialShapePositions.get(selectedId)
                if (initialPos) {
                  return {
                    objectId: selectedId,
                    updates: {
                      x: initialPos.x + offsetX,
                      y: initialPos.y + offsetY
                    }
                  }
                }
                return null
              })
              .filter(Boolean) as Array<{
              objectId: string
              updates: Partial<Shape>
            }>

            // Throttle batch updates to prevent flashing (16ms = ~60fps)
            const now = Date.now()
            if (now - lastBatchUpdateTime > 16) {
              startTransition(() => {
                onShapeBatchUpdateDebounced(batchUpdates)
              })
              setLastBatchUpdateTime(now)
            }
          }
        } else {
          // PR #13.1: Update position in real-time during drag for single object
          onShapeUpdateDebounced(draggedShapeId, {
            x: currentX,
            y: currentY
          })
        }
      },
      [
        viewport.x,
        viewport.y,
        viewport.scale,
        onCursorMove,
        onShapeUpdateDebounced,
        onShapeBatchUpdateDebounced,
        selectedIds,
        initialShapePositions,
        lastBatchUpdateTime
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

            // Apply the same offset to all selected shapes using batch update
            const finalBatchUpdates = selectedIds
              .map(selectedId => {
                const initialPos = initialShapePositions.get(selectedId)
                if (initialPos) {
                  return {
                    objectId: selectedId,
                    updates: {
                      x: initialPos.x + deltaX,
                      y: initialPos.y + deltaY
                    }
                  }
                }
                return null
              })
              .filter(Boolean) as Array<{
              objectId: string
              updates: Partial<Shape>
            }>

            // Send final batch update
            startTransition(() => {
              onShapeBatchUpdateDebounced(finalBatchUpdates)
            })

            // Clear the initial positions and drag offset
            setInitialShapePositions(new Map())
            setDragOffset(null)
            setLastBatchUpdateTime(0)
          }
        } else {
          // Single shape drag
          onShapeUpdate(id, {
            x: newX,
            y: newY
          })
        }
      },
      [
        selectedIds,
        initialShapePositions,
        onShapeUpdate,
        onShapeBatchUpdateDebounced
      ]
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
          // For text shapes, save scale values to database
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: scaleX,
            scaleY: scaleY
          })
          // Reset scale after saving to database
          node.scaleX(1)
          node.scaleY(1)
        } else if (shape.type === 'mermaid') {
          // For mermaid shapes, scale affects width and height
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(50, node.width() * scaleX),
            height: Math.max(50, node.height() * scaleY),
            rotation: node.rotation()
          })
        } else if (shape.type === 'image') {
          // For image shapes, scale affects width and height
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation()
          })
        } else if (shape.type === 'line') {
          // For line shapes, scale affects endX and endY
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            endX: shape.x + (shape.endX - shape.x) * scaleX,
            endY: shape.y + (shape.endY - shape.y) * scaleY,
            rotation: node.rotation()
          })
        } else if (shape.type === 'arrow') {
          // For arrow shapes, scale affects endX and endY
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            endX: shape.x + (shape.endX - shape.x) * scaleX,
            endY: shape.y + (shape.endY - shape.y) * scaleY,
            rotation: node.rotation()
          })
        } else if (shape.type === 'ellipse') {
          // For ellipse shapes, scale affects radiusX and radiusY
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            radiusX: Math.max(5, shape.radiusX * scaleX),
            radiusY: Math.max(5, shape.radiusY * scaleY),
            rotation: node.rotation()
          })
        } else if (shape.type === 'hexagon') {
          // For hexagon shapes, save scale values to database
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: scaleX,
            scaleY: scaleY
          })
          // Reset scale after saving to database
          node.scaleX(1)
          node.scaleY(1)
        } else if (shape.type === 'star') {
          // For star shapes, save scale values to database
          onShapeUpdate(id, {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: scaleX,
            scaleY: scaleY
          })
          // Reset scale after saving to database
          node.scaleX(1)
          node.scaleY(1)
        }
      },
      [shapes, onShapeUpdate]
    )

    // Handle multi-select transform end
    const handleMultiTransformEnd = useCallback(() => {
      if (selectedIds.length <= 1) return

      const transformer = transformerRef.current
      if (!transformer) return

      const nodes = transformer.nodes()

      // Create batch updates for all transformed shapes
      const batchUpdates = nodes
        .map(node => {
          const id = node.id()
          const shape = shapes.find(s => s.id === id)
          if (!shape) return null

          const scaleX = node.scaleX()
          const scaleY = node.scaleY()

          // Reset scale and apply to dimensions
          node.scaleX(1)
          node.scaleY(1)

          let updates: Partial<Shape> = {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation()
          }

          if (shape.type === 'rect') {
            updates = {
              ...updates,
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY)
            }
          } else if (shape.type === 'circle') {
            updates = {
              ...updates,
              radius: Math.max(
                5,
                (node as Konva.Circle).radius() * Math.max(scaleX, scaleY)
              )
            }
          } else if (shape.type === 'text') {
            // For text shapes, save scale values to database
            updates = {
              ...updates,
              scaleX: scaleX,
              scaleY: scaleY
            }
            node.scaleX(1)
            node.scaleY(1)
          } else if (shape.type === 'mermaid') {
            updates = {
              ...updates,
              width: Math.max(50, node.width() * scaleX),
              height: Math.max(50, node.height() * scaleY)
            }
          } else if (shape.type === 'image') {
            updates = {
              ...updates,
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY)
            }
          } else if (shape.type === 'line') {
            updates = {
              ...updates,
              endX: shape.x + (shape.endX - shape.x) * scaleX,
              endY: shape.y + (shape.endY - shape.y) * scaleY
            }
          } else if (shape.type === 'arrow') {
            updates = {
              ...updates,
              endX: shape.x + (shape.endX - shape.x) * scaleX,
              endY: shape.y + (shape.endY - shape.y) * scaleY
            }
          } else if (shape.type === 'ellipse') {
            updates = {
              ...updates,
              radiusX: Math.max(5, shape.radiusX * scaleX),
              radiusY: Math.max(5, shape.radiusY * scaleY)
            }
          } else if (shape.type === 'hexagon') {
            // For hexagon shapes, save scale values to database
            updates = {
              ...updates,
              scaleX: scaleX,
              scaleY: scaleY
            }
            node.scaleX(1)
            node.scaleY(1)
          } else if (shape.type === 'star') {
            // For star shapes, save scale values to database
            updates = {
              ...updates,
              scaleX: scaleX,
              scaleY: scaleY
            }
            node.scaleX(1)
            node.scaleY(1)
          }

          return {
            objectId: id,
            updates
          }
        })
        .filter(Boolean) as Array<{ objectId: string; updates: Partial<Shape> }>

      if (batchUpdates.length > 0) {
        onShapeBatchUpdateDebounced(batchUpdates)
      }
    }, [selectedIds, shapes, onShapeBatchUpdateDebounced])

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
                  case 'mermaid':
                    return (
                      <MermaidShape
                        {...commonProps}
                        shape={shape as MermaidShapeType}
                      />
                    )
                  case 'line':
                    return (
                      <LineShape
                        {...commonProps}
                        shape={shape as LineShapeType}
                      />
                    )
                  case 'arrow':
                    return (
                      <ArrowShape
                        {...commonProps}
                        shape={shape as ArrowShapeType}
                      />
                    )
                  case 'ellipse':
                    return (
                      <EllipseShape
                        {...commonProps}
                        shape={shape as EllipseShapeType}
                      />
                    )
                  case 'hexagon':
                    return (
                      <HexagonShape
                        {...commonProps}
                        shape={shape as HexagonShapeType}
                      />
                    )
                  case 'star':
                    return (
                      <StarShape
                        {...commonProps}
                        shape={shape as StarShapeType}
                      />
                    )
                  case 'image':
                    return (
                      <ImageShape
                        {...commonProps}
                        shape={shape as ImageShapeType}
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
                {previewShape.type === 'mermaid' && (
                  <Rect
                    x={previewShape.x}
                    y={previewShape.y}
                    width={previewShape.width || 0}
                    height={previewShape.height || 0}
                    fill="rgba(168, 85, 247, 0.3)"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dash={[5, 5]}
                    listening={false}
                  />
                )}
                {previewShape.type === 'line' && (
                  <Line
                    x={previewShape.x}
                    y={previewShape.y}
                    points={[
                      0,
                      0,
                      (previewShape.endX || 0) - previewShape.x,
                      (previewShape.endY || 0) - previewShape.y
                    ]}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[5, 5]}
                    listening={false}
                  />
                )}
                {previewShape.type === 'arrow' && (
                  <Arrow
                    x={previewShape.x}
                    y={previewShape.y}
                    points={[
                      0,
                      0,
                      (previewShape.endX || 0) - previewShape.x,
                      (previewShape.endY || 0) - previewShape.y
                    ]}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    pointerLength={10}
                    pointerWidth={10}
                    pointerAtEnding={true}
                    dash={[5, 5]}
                    listening={false}
                  />
                )}
                {previewShape.type === 'ellipse' && (
                  <Ellipse
                    x={previewShape.x}
                    y={previewShape.y}
                    radiusX={previewShape.radiusX || 0}
                    radiusY={previewShape.radiusY || 0}
                    fill="rgba(16, 185, 129, 0.3)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dash={[5, 5]}
                    listening={false}
                  />
                )}
                {previewShape.type === 'hexagon' && (
                  <RegularPolygon
                    x={previewShape.x}
                    y={previewShape.y}
                    sides={previewShape.sides || 6}
                    radius={previewShape.radius || 0}
                    fill="rgba(139, 92, 246, 0.3)"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dash={[5, 5]}
                    listening={false}
                  />
                )}
                {previewShape.type === 'star' && (
                  <Star
                    x={previewShape.x}
                    y={previewShape.y}
                    numPoints={previewShape.points || 5}
                    outerRadius={previewShape.outerRadius || 0}
                    innerRadius={previewShape.innerRadius || 0}
                    fill="rgba(245, 158, 11, 0.3)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dash={[5, 5]}
                    listening={false}
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
              onTransformEnd={handleMultiTransformEnd}
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
