import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Circle, Group, Layer, Text } from 'react-konva'
import type { UserPresence } from '../lib/types'

// PR #9: Cursor interpolation for smooth motion
interface InterpolatedCursor {
  x: number
  y: number
  targetX: number
  targetY: number
  lastUpdate: number
}

const INTERPOLATION_SPEED = 0.15 // How fast to interpolate (0-1)

export interface CursorLayerProps {
  presence: UserPresence[]
  currentUserId: string
  viewport: {
    x: number
    y: number
    scale: number
  }
}

const CursorLayer: React.FC<CursorLayerProps> = memo(
  ({ presence, currentUserId, viewport }: CursorLayerProps) => {
    // Filter out current user's presence - memoize to prevent infinite loops
    const otherUsers = useMemo(() => {
      const filtered = presence.filter(
        (p: UserPresence) => p.userId !== currentUserId
      )
      return filtered
    }, [presence, currentUserId])

    // PR #9: Cursor interpolation state
    const [interpolatedCursors, setInterpolatedCursors] = useState<
      Map<string, InterpolatedCursor>
    >(new Map())
    const animationFrameRef = useRef<number | undefined>(undefined)

    // Update interpolated cursors when presence changes
    useEffect(() => {
      setInterpolatedCursors(prev => {
        const newCursors = new Map(prev)

        otherUsers.forEach((user: UserPresence) => {
          // Skip users without cursor data
          if (!user.cursor) {
            return
          }

          // Use world coordinates directly - Stage will handle the transformation
          const transformedX = user.cursor.x
          const transformedY = user.cursor.y

          const existing = newCursors.get(user.userId)
          if (existing) {
            // Update target position
            existing.targetX = transformedX
            existing.targetY = transformedY
            existing.lastUpdate = Date.now()
          } else {
            // Create new interpolated cursor
            newCursors.set(user.userId, {
              x: transformedX,
              y: transformedY,
              targetX: transformedX,
              targetY: transformedY,
              lastUpdate: Date.now()
            })
          }
        })

        // Remove cursors for users who are no longer present
        const currentUserIds = new Set(
          otherUsers.map((u: UserPresence) => u.userId)
        )
        for (const [userId] of newCursors) {
          if (!currentUserIds.has(userId)) {
            newCursors.delete(userId)
          }
        }

        return newCursors
      })
    }, [otherUsers, viewport])

    // PR #9: Animation loop for cursor interpolation
    useEffect(() => {
      // Only start animation if there are cursors to animate
      if (interpolatedCursors.size === 0) {
        return
      }

      const animate = () => {
        setInterpolatedCursors(prev => {
          const newCursors = new Map(prev)
          let hasChanges = false

          for (const [, cursor] of newCursors) {
            const dx = cursor.targetX - cursor.x
            const dy = cursor.targetY - cursor.y

            // Only interpolate if there's a significant difference
            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
              cursor.x += dx * INTERPOLATION_SPEED
              cursor.y += dy * INTERPOLATION_SPEED
              hasChanges = true
            } else {
              // Snap to target if very close
              cursor.x = cursor.targetX
              cursor.y = cursor.targetY
            }
          }

          return hasChanges ? newCursors : prev
        })

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }, [interpolatedCursors.size])

    return (
      <Layer>
        {Array.from(interpolatedCursors.entries()).map(([userId, cursor]) => {
          const user = otherUsers.find((u: UserPresence) => u.userId === userId)
          if (!user) {
            return null
          }

          // Calculate cursor size inversely proportional to scale to maintain consistent visual size
          const cursorScale = 1 / viewport.scale
          const cursorRadius = 4 * cursorScale
          const cursorTipRadius = 2 * cursorScale
          const cursorTipOffset = 6 * cursorScale
          const labelFontSize = 12 * cursorScale
          const labelOffsetX = 12 * cursorScale
          const labelOffsetY = -8 * cursorScale
          const labelPadding = 4 * cursorScale

          return (
            <Group key={userId}>
              {/* Cursor pointer */}
              <Group x={cursor.x} y={cursor.y} rotation={0}>
                {/* Cursor body */}
                <Circle
                  x={0}
                  y={0}
                  radius={cursorRadius}
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth={1 * cursorScale}
                />

                {/* Cursor pointer tip */}
                <Circle
                  x={cursorTipOffset}
                  y={cursorTipOffset}
                  radius={cursorTipRadius}
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth={1 * cursorScale}
                />
              </Group>

              {/* User label */}
              <Text
                x={cursor.x + labelOffsetX}
                y={cursor.y + labelOffsetY}
                text={user.displayName || 'Anonymous'}
                fontSize={labelFontSize}
                fontFamily="Arial, sans-serif"
                fill="#374151"
                padding={labelPadding}
                background="#ffffff"
                cornerRadius={4 * cursorScale}
                shadowColor="#000000"
                shadowBlur={2 * cursorScale}
                shadowOffset={{ x: 0, y: 1 * cursorScale }}
                shadowOpacity={0.1}
              />
            </Group>
          )
        })}
      </Layer>
    )
  }
)

CursorLayer.displayName = 'CursorLayer'

export default CursorLayer
