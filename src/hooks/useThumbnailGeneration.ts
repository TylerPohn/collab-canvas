import { useCallback, useEffect, useRef } from 'react'
import { generateCanvasThumbnail } from '../lib/thumbnail'
import type { Shape, ViewportState } from '../lib/types'

interface UseThumbnailGenerationProps {
  canvasId: string
  shapes: Shape[]
  viewport: ViewportState
  onThumbnailGenerated: (thumbnail: string) => void
  pollingInterval?: number
}

/**
 * Hook for generating canvas thumbnails with polling-based change detection
 */
export function useThumbnailGeneration({
  canvasId,
  shapes,
  viewport,
  onThumbnailGenerated,
  pollingInterval = 10000 // 10 seconds between polls
}: UseThumbnailGenerationProps) {
  const stageRef = useRef<any>(null)
  const lastThumbnailRef = useRef<string>('')
  const retryCountRef = useRef<number>(0)
  const previousHashRef = useRef<number>(0)
  const shapesRef = useRef<Shape[]>(shapes)
  const maxRetries = 3

  // Hash generation function for shapes array
  const generateShapesHash = useCallback((shapes: Shape[]) => {
    const str = JSON.stringify(shapes)
    // Simple hash function
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }, [])

  // Thumbnail generation function (no timing checks - handled by polling)
  const generateThumbnail = useCallback(async () => {
    try {
      console.log(
        `🖼️ [Thumbnail] Generating thumbnail for canvas ${canvasId} with ${shapes.length} shapes`
      )

      // Try to get thumbnail from Konva Stage if available
      if (stageRef.current) {
        const startTime = performance.now()

        const thumbnail = generateCanvasThumbnail(stageRef.current, {
          width: 300,
          height: 200,
          quality: 0.8
        })

        const endTime = performance.now()
        console.log(
          `🖼️ [Thumbnail] Generated in ${(endTime - startTime).toFixed(2)}ms`
        )

        // Validate thumbnail
        if (!thumbnail || thumbnail === 'data:,') {
          throw new Error('Generated empty thumbnail')
        }

        // Only update if thumbnail has changed
        if (thumbnail !== lastThumbnailRef.current) {
          lastThumbnailRef.current = thumbnail
          onThumbnailGenerated(thumbnail)
          retryCountRef.current = 0 // Reset retry count on success
          console.log(
            `✅ [Thumbnail] Successfully updated thumbnail for canvas ${canvasId}`
          )
        } else {
          console.log(
            `⏭️ [Thumbnail] Thumbnail unchanged for canvas ${canvasId}`
          )
        }
      } else {
        console.warn(
          `⚠️ [Thumbnail] No stage reference available for canvas ${canvasId}`
        )
      }
    } catch (error) {
      console.error(
        `❌ [Thumbnail] Failed to generate thumbnail for canvas ${canvasId}:`,
        error
      )

      // Retry logic for transient failures
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        console.log(
          `🔄 [Thumbnail] Retrying thumbnail generation (attempt ${retryCountRef.current}/${maxRetries})`
        )
        setTimeout(() => {
          generateThumbnail()
        }, 1000 * retryCountRef.current) // Exponential backoff
      } else {
        console.error(
          `💥 [Thumbnail] Max retries exceeded for canvas ${canvasId}`
        )
        retryCountRef.current = 0 // Reset for future attempts
      }
    }
  }, [canvasId, onThumbnailGenerated, shapes.length])

  // Update shapes ref when shapes change
  useEffect(() => {
    shapesRef.current = shapes
  }, [shapes])

  // Polling-based thumbnail generation - check for changes every 10 seconds
  useEffect(() => {
    if (shapes.length === 0) {
      console.log(`⏭️ [Thumbnail] No shapes - skipping polling`)
      return
    }

    console.log(
      `🔄 [Thumbnail] Starting polling for canvas ${canvasId} (${pollingInterval}ms interval)`
    )

    const interval = setInterval(() => {
      const currentHash = generateShapesHash(shapesRef.current)
      if (currentHash !== previousHashRef.current) {
        console.log(
          `🔍 [Thumbnail] Canvas state changed - hash: ${previousHashRef.current} → ${currentHash}`
        )
        previousHashRef.current = currentHash
        generateThumbnail()
      } else {
        console.log(`⏭️ [Thumbnail] No changes detected (hash: ${currentHash})`)
      }
    }, pollingInterval)

    return () => {
      console.log(`🛑 [Thumbnail] Stopping polling for canvas ${canvasId}`)
      clearInterval(interval)
    }
  }, [generateThumbnail, generateShapesHash, pollingInterval, canvasId])

  // Set stage reference for thumbnail generation
  const setStageRef = useCallback(
    (stage: any) => {
      console.log(`🎯 [Thumbnail] Stage reference set for canvas ${canvasId}`)
      stageRef.current = stage
    },
    [canvasId]
  )

  // Manual thumbnail regeneration function (bypasses polling)
  const regenerateThumbnail = useCallback(() => {
    console.log(
      `🔄 [Thumbnail] Manual thumbnail regeneration requested for canvas ${canvasId}`
    )
    retryCountRef.current = 0
    // Update hash to prevent immediate re-generation on next poll
    previousHashRef.current = generateShapesHash(shapesRef.current)
    generateThumbnail()
  }, [generateThumbnail, generateShapesHash, canvasId])

  return {
    setStageRef,
    generateThumbnail: generateThumbnail,
    regenerateThumbnail
  }
}
