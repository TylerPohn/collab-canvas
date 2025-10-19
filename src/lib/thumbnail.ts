import type Konva from 'konva'

/**
 * Generate a thumbnail from a Konva Stage
 * @param stage - The Konva Stage instance
 * @param options - Thumbnail generation options
 * @returns Base64 data URL of the thumbnail
 */
export function generateCanvasThumbnail(
  stage: Konva.Stage,
  options: {
    width?: number
    height?: number
    quality?: number
    mimeType?: string
  } = {}
): string {
  const {
    width = 300,
    height = 200,
    quality = 0.8,
    mimeType = 'image/jpeg'
  } = options

  try {
    // Get all layers and calculate content bounds
    const layers = stage.getLayers()
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    let hasContent = false

    // Calculate bounds of all shapes in all layers
    layers.forEach(layer => {
      const children = layer.getChildren()
      children.forEach(child => {
        // Skip invisible or non-drawable nodes
        if (!child.visible() || child.getClassName() === 'Transformer') {
          return
        }

        const box = child.getClientRect()
        if (box.width > 0 && box.height > 0) {
          hasContent = true
          minX = Math.min(minX, box.x)
          minY = Math.min(minY, box.y)
          maxX = Math.max(maxX, box.x + box.width)
          maxY = Math.max(maxY, box.y + box.height)
        }
      })
    })

    // If no content found, fall back to stage bounds
    if (!hasContent) {
      const stageBox = stage.getClientRect()
      minX = stageBox.x
      minY = stageBox.y
      maxX = stageBox.x + stageBox.width
      maxY = stageBox.y + stageBox.height
    }

    // Add padding around content
    const padding = 20
    const contentWidth = maxX - minX + padding * 2
    const contentHeight = maxY - minY + padding * 2

    // Calculate scale to fit content in thumbnail dimensions
    // const scaleX = (width - padding * 2) / contentWidth
    // const scaleY = (height - padding * 2) / contentHeight
    // const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down

    // Calculate final dimensions and position
    // const finalWidth = contentWidth * scale
    // const finalHeight = contentHeight * scale

    // Generate thumbnail with content bounds
    const dataURL = stage.toDataURL({
      x: minX - padding,
      y: minY - padding,
      width: contentWidth,
      height: contentHeight,
      pixelRatio: 2, // Use fixed pixelRatio for quality, not for scaling
      mimeType,
      quality
    })

    return dataURL
  } catch (error) {
    console.error('Failed to generate thumbnail from stage:', error)

    // Fallback to simple stage capture
    try {
      const stageBox = stage.getClientRect()
      const scaleX = width / stageBox.width
      const scaleY = height / stageBox.height
      const scale = Math.min(scaleX, scaleY, 1)

      const tempStage = stage.clone()
      tempStage.scale({ x: scale, y: scale })
      tempStage.position({ x: 0, y: 0 })

      return tempStage.toDataURL({
        mimeType,
        quality,
        pixelRatio: 1
      })
    } catch (fallbackError) {
      console.error('Fallback thumbnail generation also failed:', fallbackError)
      throw new Error('Unable to generate thumbnail')
    }
  }
}

/**
 * Generate a thumbnail from canvas shapes data
 * This is a fallback method when we don't have access to the Konva Stage
 * @param shapes - Array of shapes to render
 * @param viewport - Current viewport state
 * @param options - Thumbnail generation options
 * @returns Base64 data URL of the thumbnail
 */
export function generateThumbnailFromShapes(
  shapes: any[],
  _viewport: { x: number; y: number; scale: number },
  options: {
    width?: number
    height?: number
    quality?: number
    mimeType?: string
  } = {}
): string {
  const {
    width = 300,
    height = 200,
    quality = 0.8,
    mimeType = 'image/jpeg'
  } = options

  // Create a canvas element for thumbnail generation
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  canvas.width = width
  canvas.height = height

  // Set background
  ctx.fillStyle = '#f9fafb'
  ctx.fillRect(0, 0, width, height)

  // Calculate bounds of all shapes
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  shapes.forEach(shape => {
    if (shape.x !== undefined) minX = Math.min(minX, shape.x)
    if (shape.y !== undefined) minY = Math.min(minY, shape.y)
    if (shape.x !== undefined && shape.width !== undefined) {
      maxX = Math.max(maxX, shape.x + shape.width)
    }
    if (shape.y !== undefined && shape.height !== undefined) {
      maxY = Math.max(maxY, shape.y + shape.height)
    }
  })

  // If no shapes, return empty thumbnail
  if (minX === Infinity) {
    return canvas.toDataURL(mimeType, quality)
  }

  // Calculate scale to fit content
  const contentWidth = maxX - minX
  const contentHeight = maxY - minY
  const scaleX = (width - 20) / contentWidth // 20px padding
  const scaleY = (height - 20) / contentHeight
  const scale = Math.min(scaleX, scaleY, 1)

  // Calculate offset to center content
  const offsetX = (width - contentWidth * scale) / 2 - minX * scale
  const offsetY = (height - contentHeight * scale) / 2 - minY * scale

  // Render shapes (simplified version)
  ctx.save()
  ctx.translate(offsetX, offsetY)
  ctx.scale(scale, scale)

  shapes.forEach(shape => {
    if (shape.type === 'rectangle') {
      ctx.fillStyle = shape.fill || '#3b82f6'
      ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
    } else if (shape.type === 'circle') {
      ctx.beginPath()
      ctx.arc(
        shape.x + shape.width / 2,
        shape.y + shape.height / 2,
        shape.width / 2,
        0,
        2 * Math.PI
      )
      ctx.fillStyle = shape.fill || '#3b82f6'
      ctx.fill()
    } else if (shape.type === 'text') {
      ctx.fillStyle = shape.fill || '#000000'
      ctx.font = `${shape.fontSize || 16}px Arial`
      ctx.fillText(shape.text || '', shape.x, shape.y + (shape.fontSize || 16))
    }
    // Add more shape types as needed
  })

  ctx.restore()

  return canvas.toDataURL(mimeType, quality)
}

/**
 * Debounce function for thumbnail generation
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}
