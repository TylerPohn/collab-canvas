import type Konva from 'konva'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { Group, Image, Rect } from 'react-konva'
import { getCanvasBlendMode } from '../../lib/blendModes'
import { mermaidRenderer } from '../../lib/mermaid/renderer'
import type { MermaidShape as MermaidShapeType } from '../../lib/types'

interface MermaidShapeProps {
  shape: MermaidShapeType
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragStart: () => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
}

const MermaidShape: React.FC<MermaidShapeProps> = memo(
  ({ shape, onSelect, onDragStart, onDragMove, onDragEnd, onTransformEnd }) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Convert SVG string to HTMLImageElement
    const svgToImage = useCallback(
      (svgString: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new window.Image()
          img.onload = () => {
            resolve(img)
          }
          img.onerror = error => {
            console.error('SVG to image conversion failed:', error)
            reject(new Error('Failed to load SVG image'))
          }

          // Use data URL approach
          const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
          img.src = dataUrl
        })
      },
      []
    )

    // Render Mermaid diagram
    const renderDiagram = useCallback(async () => {
      if (!shape.mermaidCode) {
        setError('No Mermaid code provided')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Use cached SVG if available, otherwise render new one
        let svgString = shape.renderedSvg
        if (!svgString) {
          const result = await mermaidRenderer.renderDiagram(shape.mermaidCode)
          svgString = result.svg
        }

        // Convert SVG to image
        const img = await svgToImage(svgString)
        setImage(img)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to render Mermaid diagram:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to render diagram'
        )
        setIsLoading(false)
      }
    }, [shape.mermaidCode, shape.renderedSvg, svgToImage])

    // Re-render when Mermaid code changes
    useEffect(() => {
      renderDiagram()
    }, [renderDiagram])

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        // No cleanup needed for data URLs
      }
    }, [image])

    // Show loading state
    if (isLoading) {
      return (
        <Group
          id={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
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
        >
          <Rect
            width={shape.width}
            height={shape.height}
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth={1}
            cornerRadius={4}
          />
          <Rect
            x={shape.width / 2 - 20}
            y={shape.height / 2 - 10}
            width={40}
            height={20}
            fill="#e5e7eb"
            cornerRadius={2}
          />
        </Group>
      )
    }

    // Show error state
    if (error) {
      return (
        <Group
          id={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
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
        >
          <Rect
            width={shape.width}
            height={shape.height}
            fill="#fef2f2"
            stroke="#fca5a5"
            strokeWidth={2}
            cornerRadius={4}
          />
          <Rect
            x={shape.width / 2 - 30}
            y={shape.height / 2 - 10}
            width={60}
            height={20}
            fill="#fecaca"
            cornerRadius={2}
          />
        </Group>
      )
    }

    // Show rendered diagram
    return (
      <Group
        id={shape.id}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
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
      >
        {/* Transparent background rect to ensure click events are captured */}
        <Rect
          width={shape.width}
          height={shape.height}
          fill="transparent"
          listening={true}
        />
        {image && (
          <Image
            image={image}
            width={shape.width}
            height={shape.height}
            listening={false} // Let the Group handle events
            perfectDrawEnabled={false}
            hitGraphEnabled={false}
          />
        )}
      </Group>
    )
  }
)

MermaidShape.displayName = 'MermaidShape'

export default MermaidShape
