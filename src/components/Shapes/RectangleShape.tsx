import type Konva from 'konva'
import React, { memo } from 'react'
import { Rect } from 'react-konva'
import type { RectangleShape as RectangleShapeType } from '../../lib/types'

interface RectangleShapeProps {
  shape: RectangleShapeType
  isSelected: boolean
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragStart: () => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
}

const RectangleShape: React.FC<RectangleShapeProps> = memo(
  ({
    shape,
    isSelected,
    onSelect,
    onDragStart,
    onDragMove,
    onDragEnd,
    onTransformEnd
  }) => {
    return (
      <Rect
        id={shape.id}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill={shape.fill || '#3b82f6'}
        stroke={isSelected ? '#1d4ed8' : 'transparent'}
        strokeWidth={isSelected ? 2 : 0}
        rotation={shape.rotation || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowBlur={4}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.3}
      />
    )
  }
)

RectangleShape.displayName = 'RectangleShape'

export default RectangleShape
