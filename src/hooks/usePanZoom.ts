import type Konva from 'konva'
import { useCallback, useRef, useState } from 'react'

interface Viewport {
  x: number
  y: number
  scale: number
}

interface PanZoomState {
  viewport: Viewport
  handleWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void
  handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void
  handleMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void
  handleMouseUp: (e: Konva.KonvaEventObject<MouseEvent>) => void
  isDragging: boolean
}

const MIN_SCALE = 0.1
const MAX_SCALE = 5.0
const SCALE_FACTOR = 0.001

export const usePanZoom = (): PanZoomState => {
  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    scale: 1.0
  })

  const [isDragging, setIsDragging] = useState(false)
  const lastPointerPosition = useRef({ x: 0, y: 0 })

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = e.target.getStage()
    if (!stage) return

    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()

    if (!pointer) return

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale
    }

    const newScale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, oldScale - e.evt.deltaY * SCALE_FACTOR)
    )

    setViewport(() => ({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
      scale: newScale
    }))
  }, [])

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Only start dragging if clicking on empty space (not on a shape)
      const stage = e.target.getStage()
      if (e.target === stage) {
        setIsDragging(true)
        lastPointerPosition.current = {
          x: e.evt.clientX,
          y: e.evt.clientY
        }
      }
    },
    []
  )

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDragging) return

      const currentPointerPosition = {
        x: e.evt.clientX,
        y: e.evt.clientY
      }

      const deltaX = currentPointerPosition.x - lastPointerPosition.current.x
      const deltaY = currentPointerPosition.y - lastPointerPosition.current.y

      setViewport(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))

      lastPointerPosition.current = currentPointerPosition
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  return {
    viewport,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging
  }
}
