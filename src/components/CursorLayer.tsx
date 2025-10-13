import React from 'react'
import { Circle, Group, Layer, Text } from 'react-konva'
import type { UserPresence } from '../lib/types'

export interface CursorLayerProps {
  presence: UserPresence[]
  currentUserId: string
  viewport: {
    x: number
    y: number
    scale: number
  }
}

const CursorLayer: React.FC<CursorLayerProps> = ({
  presence,
  currentUserId,
  viewport
}) => {
  // Filter out current user's presence
  const otherUsers = presence.filter(p => p.userId !== currentUserId)

  return (
    <Layer>
      {otherUsers.map(user => {
        // Transform cursor position based on viewport
        const transformedX = (user.cursor.x - viewport.x) / viewport.scale
        const transformedY = (user.cursor.y - viewport.y) / viewport.scale

        return (
          <Group key={user.userId}>
            {/* Cursor pointer */}
            <Group x={transformedX} y={transformedY} rotation={0}>
              {/* Cursor body */}
              <Circle
                x={0}
                y={0}
                radius={4}
                fill="#3b82f6"
                stroke="#1e40af"
                strokeWidth={1}
              />

              {/* Cursor pointer tip */}
              <Circle
                x={6}
                y={6}
                radius={2}
                fill="#3b82f6"
                stroke="#1e40af"
                strokeWidth={1}
              />
            </Group>

            {/* User label */}
            <Text
              x={transformedX + 12}
              y={transformedY - 8}
              text={user.displayName}
              fontSize={12}
              fontFamily="Arial, sans-serif"
              fill="#374151"
              padding={4}
              background="#ffffff"
              cornerRadius={4}
              shadowColor="#000000"
              shadowBlur={2}
              shadowOffset={{ x: 0, y: 1 }}
              shadowOpacity={0.1}
            />
          </Group>
        )
      })}
    </Layer>
  )
}

export default CursorLayer
