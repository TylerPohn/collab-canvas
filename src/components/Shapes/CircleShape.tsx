import type Konva from 'konva'
import React, { memo } from 'react'
import { Circle } from 'react-konva'
import type { CircleShape as CircleShapeType } from '../../lib/types'

interface CircleShapeProps {
  shape: CircleShapeType
  isSelected: boolean
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragStart: () => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
}

const CircleShape: React.FC<CircleShapeProps> = memo(
  ({
    shape,
    isSelected: _isSelected,
    onSelect,
    onDragStart,
    onDragMove,
    onDragEnd,
    onTransformEnd
  }) => {
    return (
      <Circle
        id={shape.id}
        x={shape.x}
        y={shape.y}
        radius={shape.radius}
        fill={shape.fill || '#10b981'}
        stroke={shape.stroke || 'transparent'}
        strokeWidth={shape.strokeWidth || 0}
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

CircleShape.displayName = 'CircleShape'

export default CircleShape
