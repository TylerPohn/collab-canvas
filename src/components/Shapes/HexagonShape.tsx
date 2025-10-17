import type Konva from 'konva'
import React, { memo } from 'react'
import { RegularPolygon } from 'react-konva'
import { getCanvasBlendMode } from '../../lib/blendModes'
import type { HexagonShape as HexagonShapeType } from '../../lib/types'

interface HexagonShapeProps {
  shape: HexagonShapeType
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragStart: () => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
}

const HexagonShape: React.FC<HexagonShapeProps> = memo(
  ({ shape, onSelect, onDragStart, onDragMove, onDragEnd, onTransformEnd }) => {
    return (
      <RegularPolygon
        id={shape.id}
        x={shape.x}
        y={shape.y}
        scaleX={shape.scaleX || 1}
        scaleY={shape.scaleY || 1}
        sides={shape.sides}
        radius={shape.radius}
        fill={shape.fill || '#8b5cf6'}
        stroke={shape.stroke || 'transparent'}
        strokeWidth={shape.strokeWidth || 0}
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

HexagonShape.displayName = 'HexagonShape'

export default HexagonShape
