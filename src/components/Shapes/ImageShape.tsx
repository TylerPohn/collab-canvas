import type Konva from 'konva'
import React, { memo, useEffect, useState } from 'react'
import { Image as KonvaImage, Rect } from 'react-konva'
import { getCanvasBlendMode } from '../../lib/blendModes'
import type { ImageShape as ImageShapeType } from '../../lib/types'

interface ImageShapeProps {
  shape: ImageShapeType
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragStart: () => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
}

const ImageShape: React.FC<ImageShapeProps> = memo(
  ({ shape, onSelect, onDragStart, onDragMove, onDragEnd, onTransformEnd }) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null)

    useEffect(() => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
      }
      img.onerror = () => {
        console.error('Failed to load image:', shape.imageUrl)
      }
      img.src = shape.imageUrl
    }, [shape.imageUrl])

    if (!image) {
      // Show placeholder while loading
      return (
        <Rect
          id={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth={1}
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
        />
      )
    }

    return (
      <KonvaImage
        id={shape.id}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        image={image}
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

ImageShape.displayName = 'ImageShape'

export default ImageShape
