import { useEffect, useRef } from 'react'

export function usePerformanceMonitor() {
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())

  useEffect(() => {
    const measureFrame = () => {
      frameCount.current++
      const now = performance.now()

      if (now - lastTime.current >= 1000) {
        const fps = frameCount.current
        console.log(`Canvas FPS: ${fps}`)

        if (fps < 50) {
          console.warn('Canvas performance below 50fps')
        }

        frameCount.current = 0
        lastTime.current = now
      }

      requestAnimationFrame(measureFrame)
    }

    requestAnimationFrame(measureFrame)
  }, [])
}
