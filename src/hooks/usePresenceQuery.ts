import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { presenceService } from '../lib/sync/presence'
import type { UserPresence } from '../lib/types'

// Query keys for presence
export const presenceKeys = {
  all: ['presence'] as const,
  canvas: (canvasId: string) =>
    [...presenceKeys.all, 'canvas', canvasId] as const,
  user: (canvasId: string, userId: string) =>
    [...presenceKeys.canvas(canvasId), 'user', userId] as const
}

// Hook to subscribe to presence updates for a canvas
export function usePresenceQuery(canvasId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: presenceKeys.canvas(canvasId),
    queryFn: async (): Promise<UserPresence[]> => {
      // This is a subscription-based query, so we return an empty array initially
      // The actual data will be updated via the subscription in usePresence
      return []
    },
    enabled,
    staleTime: 0, // Always consider stale to allow real-time updates
    gcTime: 0, // Don't cache presence data
    refetchOnWindowFocus: false, // Don't refetch on window focus for real-time data
    refetchOnMount: false // Don't refetch on mount for real-time data
  })
}

// Hook to join a presence room
export function useJoinPresenceRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      canvasId,
      user
    }: {
      canvasId: string
      user: { uid: string; displayName: string | null; photoURL: string | null }
    }) => {
      await presenceService.joinRoom(canvasId, user)
    },
    onSuccess: (_, { canvasId }) => {
      // Invalidate presence queries for this canvas
      queryClient.invalidateQueries({
        queryKey: presenceKeys.canvas(canvasId)
      })
    },
    onError: error => {
      console.error('Failed to join presence room:', error)
    }
  })
}

// Hook to leave a presence room
export function useLeavePresenceRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      canvasId,
      userId
    }: {
      canvasId: string
      userId: string
    }) => {
      await presenceService.leaveRoom(canvasId, userId)
    },
    onSuccess: (_, { canvasId }) => {
      // Invalidate presence queries for this canvas
      queryClient.invalidateQueries({
        queryKey: presenceKeys.canvas(canvasId)
      })
    },
    onError: error => {
      console.error('Failed to leave presence room:', error)
    }
  })
}

// Hook to update cursor position
export function useUpdateCursor() {
  return useMutation({
    mutationFn: async ({
      canvasId,
      userId,
      cursor
    }: {
      canvasId: string
      userId: string
      cursor: { x: number; y: number }
    }) => {
      presenceService.updateCursor(canvasId, userId, cursor)
    },
    onError: error => {
      console.error('Failed to update cursor:', error)
    }
  })
}

// Hook to get presence subscription
export function usePresenceSubscription(
  canvasId: string,
  callback: (presence: UserPresence[]) => void,
  enabled: boolean = true
) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: [...presenceKeys.canvas(canvasId), 'subscription'],
    queryFn: async () => {
      if (!enabled) return null

      // Set up the subscription
      const unsubscribe = presenceService.subscribeToPresence(
        canvasId,
        presence => {
          // Update the query cache with new presence data
          queryClient.setQueryData(presenceKeys.canvas(canvasId), presence)
          // Call the callback
          callback(presence)
        }
      )

      return unsubscribe
    },
    enabled,
    staleTime: Infinity, // Never consider stale for subscriptions
    gcTime: Infinity, // Keep subscription active
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}
