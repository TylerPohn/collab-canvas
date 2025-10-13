import type Konva from 'konva'
import React, { memo } from 'react'
import { Text } from 'react-konva'
import type { TextShape as TextShapeType } from '../../lib/types'

interface TextShapeProps {
  shape: TextShapeType
  isSelected: boolean
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
  onDoubleClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
  isEditing?: boolean
}

const TextShape: React.FC<TextShapeProps> = memo(
  ({
    shape,
    isSelected,
    onSelect,
    onDragEnd,
    onTransformEnd,
    onDoubleClick,
    isEditing
  }) => {
    // Hide the text shape when it's being edited
    if (isEditing) {
      return null
    }

    return (
      <Text
        id={shape.id}
        x={shape.x}
        y={shape.y}
        text={shape.text}
        fontSize={shape.fontSize || 16}
        fill={shape.fill || '#374151'}
        stroke={isSelected ? '#1f2937' : 'transparent'}
        strokeWidth={isSelected ? 1 : 0}
        rotation={shape.rotation || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={onDoubleClick}
        onDblTap={onDoubleClick}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowBlur={2}
        shadowOffset={{ x: 1, y: 1 }}
        shadowOpacity={0.2}
        fontFamily="Inter, system-ui, sans-serif"
        fontStyle="normal"
      />
    )
  }
)

TextShape.displayName = 'TextShape'

export default TextShape
