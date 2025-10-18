import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  AddPhotoAlternate,
  Close,
  DragIndicator,
  Hexagon,
  RadioButtonUnchecked,
  Rectangle,
  ShowChart,
  Star,
  TextFields,
  TrendingFlat,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import {
  Box,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme
} from '@mui/material'
import type { Theme } from '@mui/material/styles'
import React from 'react'
import type { Shape } from '../lib/types'
import EllipseIcon from './icons/EllipseIcon'

interface LayersPanelProps {
  isOpen: boolean
  onClose: () => void
  shapes: Shape[]
  selectedIds: string[]
  onShapeSelect: (shapeId: string) => void
  onShapeUpdate: (shapeId: string, updates: Partial<Shape>) => void
  onShapesReorder: (
    updates: Array<{ objectId: string; updates: Partial<Shape> }>
  ) => void
}

// Sortable Layer Item Component
const SortableLayerItem: React.FC<{
  shape: Shape
  index: number
  isSelected: boolean
  isVisible: boolean
  shapeName: string
  totalLayers: number
  onShapeSelect: (shapeId: string) => void
  onVisibilityToggle: (shapeId: string, currentOpacity: number) => void
  getShapeIcon: (
    type: string
  ) => React.ComponentType<{ sx?: Record<string, unknown> }>
  theme: Theme
}> = ({
  shape,
  index,
  isSelected,
  isVisible,
  shapeName,
  totalLayers,
  onShapeSelect,
  onVisibilityToggle,
  getShapeIcon,
  theme
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: shape.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const IconComponent = getShapeIcon(shape.type)

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      onClick={() => onShapeSelect(shape.id)}
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        backgroundColor: isSelected
          ? theme.palette.primary.light + '20'
          : isDragging
            ? theme.palette.primary.light + '10'
            : 'transparent',
        borderLeft: isSelected
          ? `3px solid ${theme.palette.primary.main}`
          : '3px solid transparent',
        transform: isDragging ? 'rotate(2deg)' : 'none',
        boxShadow: isDragging ? theme.shadows[8] : 'none',
        opacity: isVisible ? 1 : 0.6,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          '& .drag-handle': {
            color: theme.palette.primary.main,
            transform: 'scale(1.1)'
          }
        },
        '&:active': {
          cursor: 'grabbing'
        },
        transition: 'all 0.2s ease-in-out'
      }}
    >
      {/* Drag Handle */}
      <ListItemIcon
        className="drag-handle"
        sx={{
          minWidth: 32,
          cursor: 'grab',
          transition: 'all 0.2s ease-in-out',
          '&:active': {
            cursor: 'grabbing'
          }
        }}
        {...attributes}
        {...listeners}
      >
        <DragIndicator
          sx={{
            fontSize: 16,
            color: theme.palette.text.disabled,
            transition: 'all 0.2s ease-in-out'
          }}
        />
      </ListItemIcon>

      {/* Shape Icon */}
      <ListItemIcon sx={{ minWidth: 40 }}>
        <IconComponent
          sx={{
            fontSize: 20,
            color: isSelected
              ? theme.palette.primary.main
              : isVisible
                ? theme.palette.text.secondary
                : theme.palette.text.disabled
          }}
        />
      </ListItemIcon>

      <ListItemText
        primary={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: isSelected ? 600 : 400,
                color: isSelected
                  ? theme.palette.primary.main
                  : isVisible
                    ? theme.palette.text.primary
                    : theme.palette.text.disabled,
                textDecoration: isVisible ? 'none' : 'line-through'
              }}
            >
              {shapeName}
            </Typography>
            <Chip
              label={`${index + 1}`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                backgroundColor: isSelected
                  ? theme.palette.primary.main
                  : theme.palette.grey[300],
                color: isSelected
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.secondary
              }}
            />
          </Box>
        }
        secondary={`Layer ${index + 1} of ${totalLayers}`}
        secondaryTypographyProps={{
          variant: 'caption',
          color: 'text.secondary'
        }}
      />

      <IconButton
        size="small"
        onClick={e => {
          e.stopPropagation()
          onVisibilityToggle(shape.id, shape.opacity ?? 1)
        }}
        sx={{
          minWidth: 32,
          height: 32,
          color: isVisible
            ? theme.palette.text.secondary
            : theme.palette.text.disabled
        }}
      >
        {isVisible ? (
          <Visibility fontSize="small" />
        ) : (
          <VisibilityOff fontSize="small" />
        )}
      </IconButton>
    </ListItem>
  )
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  isOpen,
  onClose,
  shapes,
  selectedIds,
  onShapeSelect,
  onShapeUpdate,
  onShapesReorder
}) => {
  const theme = useTheme()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Get shape type icon
  const getShapeIcon = (type: string) => {
    switch (type) {
      case 'rect':
        return Rectangle
      case 'circle':
        return RadioButtonUnchecked
      case 'text':
        return TextFields
      case 'line':
        return ShowChart
      case 'arrow':
        return TrendingFlat
      case 'ellipse':
        return EllipseIcon
      case 'hexagon':
        return Hexagon
      case 'star':
        return Star
      case 'image':
        return AddPhotoAlternate
      default:
        return Rectangle
    }
  }

  // Generate auto-generated name for shape
  const getShapeName = (shape: Shape, index: number) => {
    const typeNames: Record<string, string> = {
      rect: 'Rectangle',
      circle: 'Circle',
      text: 'Text',
      line: 'Line',
      arrow: 'Arrow',
      ellipse: 'Ellipse',
      hexagon: 'Hexagon',
      star: 'Star',
      image: 'Image'
    }
    return `${typeNames[shape.type] || 'Shape'} ${index + 1}`
  }

  // Sort shapes by zIndex (descending - top layer first in panel)
  const sortedShapes = [...shapes].sort(
    (a, b) => (b.zIndex || 0) - (a.zIndex || 0)
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedShapes.findIndex(shape => shape.id === active.id)
      const newIndex = sortedShapes.findIndex(shape => shape.id === over.id)

      // Create new order by moving the dragged item
      const newOrder = arrayMove(sortedShapes, oldIndex, newIndex)

      // Calculate new zIndex values following existing pattern
      const updates = newOrder.map((shape: Shape, index: number) => {
        // Reverse the index to get descending zIndex order
        const newZIndex = newOrder.length - 1 - index
        return {
          objectId: shape.id,
          updates: { zIndex: newZIndex }
        }
      })

      onShapesReorder(updates)
    }
  }

  // Handle visibility toggle
  const handleVisibilityToggle = (shapeId: string, currentOpacity: number) => {
    const newOpacity = currentOpacity === 0 ? 1 : 0
    onShapeUpdate(shapeId, { opacity: newOpacity })
  }

  if (!isOpen) {
    return null
  }

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Layers
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {sortedShapes.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            <Typography variant="body2">No layers yet</Typography>
            <Typography variant="caption" sx={{ mt: 1 }}>
              Create shapes to see them here
            </Typography>
          </Box>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedShapes.map(shape => shape.id)}
              strategy={verticalListSortingStrategy}
            >
              <List sx={{ p: 0 }}>
                {sortedShapes.map((shape, index) => {
                  const isSelected = selectedIds.includes(shape.id)
                  const shapeName = getShapeName(shape, index)
                  const isVisible = (shape.opacity ?? 1) > 0

                  return (
                    <SortableLayerItem
                      key={shape.id}
                      shape={shape}
                      index={index}
                      isSelected={isSelected}
                      isVisible={isVisible}
                      shapeName={shapeName}
                      totalLayers={sortedShapes.length}
                      onShapeSelect={onShapeSelect}
                      onVisibilityToggle={handleVisibilityToggle}
                      getShapeIcon={getShapeIcon}
                      theme={theme}
                    />
                  )
                })}
              </List>
            </SortableContext>
          </DndContext>
        )}
      </Box>
    </Drawer>
  )
}

export default LayersPanel
