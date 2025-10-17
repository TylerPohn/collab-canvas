import type Konva from 'konva'
import React, { memo } from 'react'
import { Ellipse } from 'react-konva'
import type { EllipseShape as EllipseShapeType } from '../../lib/types'

interface EllipseShapeProps {
  shape: EllipseShapeType
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragStart: () => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
}

const EllipseShape: React.FC<EllipseShapeProps> = memo(
  ({ shape, onSelect, onDragStart, onDragMove, onDragEnd, onTransformEnd }) => {
    return (
      <Ellipse
        id={shape.id}
        x={shape.x}
        y={shape.y}
        radiusX={shape.radiusX}
        radiusY={shape.radiusY}
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

EllipseShape.displayName = 'EllipseShape'

export default EllipseShape
