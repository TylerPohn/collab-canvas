import type Konva from 'konva'
import React, { memo } from 'react'
import { Line } from 'react-konva'
import { getCanvasBlendMode } from '../../lib/blendModes'
import type { LineShape as LineShapeType } from '../../lib/types'

interface LineShapeProps {
  shape: LineShapeType
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragStart: () => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
}

const LineShape: React.FC<LineShapeProps> = memo(
  ({ shape, onSelect, onDragStart, onDragMove, onDragEnd, onTransformEnd }) => {
    return (
      <Line
        id={shape.id}
        x={shape.x}
        y={shape.y}
        points={[0, 0, shape.endX - shape.x, shape.endY - shape.y]}
        stroke={shape.stroke || '#3b82f6'}
        strokeWidth={shape.strokeWidth || 2}
        rotation={shape.rotation || 0}
        opacity={shape.opacity ?? 1}
        globalCompositeOperation={getCanvasBlendMode(
          shape.blendMode || 'normal'
        )}
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

LineShape.displayName = 'LineShape'

export default LineShape
