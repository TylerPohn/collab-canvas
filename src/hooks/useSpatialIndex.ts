import RBush from 'rbush'
import { useEffect, useMemo, useRef } from 'react'
import type { Shape } from '../lib/types'

interface SpatialShape {
  minX: number
  minY: number
  maxX: number
  maxY: number
  shape: Shape
}

export function useSpatialIndex(shapes: Shape[]) {
  const rtree = useRef(new RBush<SpatialShape>())

  const spatialShapes = useMemo(() => {
    return shapes.map(shape => {
      const bounds = getShapeBounds(shape)
      return {
        minX: bounds.x,
        minY: bounds.y,
        maxX: bounds.x + bounds.width,
        maxY: bounds.y + bounds.height,
        shape
      }
    })
  }, [shapes])

  useEffect(() => {
    rtree.current.clear()
    rtree.current.load(spatialShapes)
  }, [spatialShapes])

  const queryShapes = (bounds: {
    x: number
    y: number
    width: number
    height: number
  }) => {
    const results = rtree.current.search({
      minX: bounds.x,
      minY: bounds.y,
      maxX: bounds.x + bounds.width,
      maxY: bounds.y + bounds.height
    })
    return results.map(item => item.shape)
  }

  return { queryShapes }
}

function getShapeBounds(shape: Shape) {
  switch (shape.type) {
    case 'rect':
      return {
        x: shape.x,
        y: shape.y,
        width: shape.width || 0,
        height: shape.height || 0
      }
    case 'circle':
      const radius = shape.radius || 0
      return {
        x: shape.x - radius,
        y: shape.y - radius,
        width: radius * 2,
        height: radius * 2
      }
    case 'text':
      // Estimate text bounds
      const fontSize = shape.fontSize || 16
      const textLength = shape.text?.length || 0
      return {
        x: shape.x,
        y: shape.y,
        width: textLength * fontSize * 0.6,
        height: fontSize * 1.2
      }
    case 'ellipse':
      const radiusX = shape.radiusX || 0
      const radiusY = shape.radiusY || 0
      return {
        x: shape.x - radiusX,
        y: shape.y - radiusY,
        width: radiusX * 2,
        height: radiusY * 2
      }
    case 'line':
      return {
        x: Math.min(shape.x, shape.endX || shape.x),
        y: Math.min(shape.y, shape.endY || shape.y),
        width: Math.abs((shape.endX || shape.x) - shape.x),
        height: Math.abs((shape.endY || shape.y) - shape.y)
      }
    case 'arrow':
      return {
        x: Math.min(shape.x, shape.endX || shape.x),
        y: Math.min(shape.y, shape.endY || shape.y),
        width: Math.abs((shape.endX || shape.x) - shape.x),
        height: Math.abs((shape.endY || shape.y) - shape.y)
      }
    case 'star':
      const starRadius = shape.radius || 0
      return {
        x: shape.x - starRadius,
        y: shape.y - starRadius,
        width: starRadius * 2,
        height: starRadius * 2
      }
    case 'hexagon':
      const hexRadius = shape.radius || 0
      return {
        x: shape.x - hexRadius,
        y: shape.y - hexRadius,
        width: hexRadius * 2,
        height: hexRadius * 2
      }
    case 'mermaid':
      // Estimate mermaid diagram bounds
      return {
        x: shape.x,
        y: shape.y,
        width: shape.width || 400,
        height: shape.height || 300
      }
    case 'image':
      return {
        x: shape.x,
        y: shape.y,
        width: shape.width || 100,
        height: shape.height || 100
      }
    default:
      return { x: shape.x, y: shape.y, width: 100, height: 100 }
  }
}
