import { useEffect, useRef, useState } from 'react'
import type { UserPresence } from '../lib/types'
import { useAuth } from './useAuth'
import {
  useJoinPresenceRoom,
  useLeavePresenceRoom,
  usePresenceSubscription,
  useUpdateCursor as useUpdateCursorMutation
} from './usePresenceQuery'

export interface UsePresenceOptions {
  canvasId: string
  enabled?: boolean
}

export interface UsePresenceReturn {
  presence: UserPresence[]
  isConnected: boolean
  updateCursor: (cursor: { x: number; y: number }) => void
  error: string | null
}

export function usePresence({
  canvasId,
  enabled = true
}: UsePresenceOptions): UsePresenceReturn {
  const { user } = useAuth()
  const [presence, setPresence] = useState<UserPresence[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasJoinedRef = useRef(false)

  console.log(
    `[usePresence] Hook called for canvas: ${canvasId}, enabled: ${enabled}, user: ${user?.uid}`
  )

  // React Query mutations
  const joinRoomMutation = useJoinPresenceRoom()
  const leaveRoomMutation = useLeavePresenceRoom()
  const updateCursorMutation = useUpdateCursorMutation()

  // React Query subscription
  usePresenceSubscription(
    canvasId,
    newPresence => {
      console.log(`[usePresence] Received presence update:`, newPresence)
      setPresence(newPresence)
    },
    enabled && !!user
  )

  // Join room when user is available and enabled
  useEffect(() => {
    if (!enabled || !user || !canvasId || hasJoinedRef.current) {
      return
    }

    const joinRoom = async () => {
      try {
        console.log(
          `[usePresence] Joining room for canvas: ${canvasId}, user: ${user.uid}`
        )
        setError(null)
        await joinRoomMutation.mutateAsync({
          canvasId,
          user: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL
          }
        })
        hasJoinedRef.current = true
        setIsConnected(true)
        console.log(`[usePresence] Successfully joined room`)
      } catch (err) {
        console.error('[usePresence] Failed to join presence room:', err)
        setError(err instanceof Error ? err.message : 'Failed to join room')
        setIsConnected(false)
      }
    }

    joinRoom()

    // Cleanup function
    return () => {
      if (hasJoinedRef.current && user) {
        try {
          leaveRoomMutation.mutate({
            canvasId,
            userId: user.uid
          })
        } catch (error) {
          console.error('Error leaving room:', error)
        }
        hasJoinedRef.current = false
        setIsConnected(false)
      }
    }
  }, [
    enabled,
    user,
    canvasId,
    joinRoomMutation.mutateAsync,
    leaveRoomMutation.mutate
  ])

  // Update error state from mutations
  useEffect(() => {
    if (joinRoomMutation.error) {
      setError(
        joinRoomMutation.error instanceof Error
          ? joinRoomMutation.error.message
          : 'Failed to join room'
      )
    } else if (leaveRoomMutation.error) {
      setError(
        leaveRoomMutation.error instanceof Error
          ? leaveRoomMutation.error.message
          : 'Failed to leave room'
      )
    } else if (updateCursorMutation.error) {
      setError(
        updateCursorMutation.error instanceof Error
          ? updateCursorMutation.error.message
          : 'Failed to update cursor'
      )
    }
  }, [
    joinRoomMutation.error,
    leaveRoomMutation.error,
    updateCursorMutation.error
  ])

  // Update cursor position
  const updateCursor = (cursor: { x: number; y: number }) => {
    if (!user || !canvasId || !isConnected) {
      console.log(
        `[usePresence] updateCursor skipped - user: ${!!user}, canvasId: ${canvasId}, connected: ${isConnected}`
      )
      return
    }

    console.log(`[usePresence] Updating cursor position:`, cursor)
    updateCursorMutation.mutate({
      canvasId,
      userId: user.uid,
      cursor
    })
  }

  console.log(`[usePresence] Returning state:`, {
    presence,
    isConnected,
    error
  })

  return {
    presence,
    isConnected,
    updateCursor,
    error
  }
}
