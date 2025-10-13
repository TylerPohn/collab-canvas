import type Konva from 'konva'
import React, { useEffect, useRef } from 'react'
import { Layer, Stage } from 'react-konva'
import { usePanZoom } from '../hooks/usePanZoom'

interface CanvasStageProps {
  width: number
  height: number
}

const CanvasStage: React.FC<CanvasStageProps> = ({ width, height }) => {
  const stageRef = useRef<Konva.Stage>(null)

  const {
    viewport,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging
  } = usePanZoom()

  useEffect(() => {
    if (stageRef.current) {
      const stage = stageRef.current
      stage.position({ x: viewport.x, y: viewport.y })
      stage.scale({ x: viewport.scale, y: viewport.scale })
      stage.batchDraw()
    }
  }, [viewport])

  return (
    <div className="w-full h-full bg-gray-50 relative overflow-hidden">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        draggable={false} // We handle dragging manually for better control
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <Layer>{/* Shapes will be added here in future PRs */}</Layer>
      </Stage>

      {/* Canvas info overlay */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm text-sm text-gray-600">
        <div>Scale: {viewport.scale.toFixed(2)}x</div>
        <div>
          Position: ({Math.round(viewport.x)}, {Math.round(viewport.y)})
        </div>
      </div>
    </div>
  )
}

export default CanvasStage
