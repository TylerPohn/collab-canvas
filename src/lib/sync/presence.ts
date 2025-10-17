import {
  off,
  onDisconnect,
  onValue,
  ref,
  remove,
  set,
  type DatabaseReference,
  type OnDisconnect,
  type Unsubscribe
} from 'firebase/database'
import { rtdb } from '../firebase/client'
import { presenceRateLimiter, securityLogger } from '../security'
import type { UserPresence } from '../types'

// Heartbeat interval in milliseconds (30 seconds)
const HEARTBEAT_INTERVAL = 30 * 1000

// PR #9: Optimized cursor update throttling (25ms for smoother experience)
const CURSOR_THROTTLE_INTERVAL = 25

// Presence timeout (60 seconds - user considered offline if no heartbeat)
const PRESENCE_TIMEOUT = 60 * 1000

export interface PresenceService {
  joinRoom: (
    canvasId: string,
    user: { uid: string; displayName: string | null; photoURL: string | null }
  ) => Promise<void>
  leaveRoom: (canvasId: string, userId: string) => Promise<void>
  updateCursor: (
    canvasId: string,
    userId: string,
    cursor: { x: number; y: number }
  ) => void
  subscribeToPresence: (
    canvasId: string,
    callback: (presence: UserPresence[]) => void
  ) => () => void
  cleanup: () => void
}

class PresenceServiceImpl implements PresenceService {
  private heartbeatIntervals = new Map<string, ReturnType<typeof setInterval>>()
  private cursorThrottleTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
  >()
  private currentCanvasId: string | null = null
  private currentUserId: string | null = null
  private presenceRefs = new Map<string, DatabaseReference>()
  private onDisconnectRefs = new Map<string, OnDisconnect>()

  async joinRoom(
    canvasId: string,
    user: { uid: string; displayName: string | null; photoURL: string | null }
  ): Promise<void> {
    // Clean up previous room if exists
    if (this.currentCanvasId && this.currentUserId) {
      await this.leaveRoom(this.currentCanvasId, this.currentUserId)
    }

    this.currentCanvasId = canvasId
    this.currentUserId = user.uid

    // Create RTDB reference for this user's presence
    const presenceRef = ref(rtdb, `presence/${canvasId}/${user.uid}`)
    this.presenceRefs.set(`${canvasId}-${user.uid}`, presenceRef)

    // Set initial presence data
    const initialPresence = {
      userInfo: {
        displayName: user.displayName || 'Anonymous',
        email: user.uid, // Using uid as email fallback
        avatar: user.photoURL || undefined
      },
      cursor: {
        x: 0,
        y: 0,
        timestamp: Date.now()
      },
      lastSeen: Date.now(),
      isOnline: true
    }

    // Set presence data
    await set(presenceRef, initialPresence)

    // Set up onDisconnect handler to automatically remove presence when user disconnects
    const onDisconnectRef = onDisconnect(presenceRef)
    this.onDisconnectRefs.set(`${canvasId}-${user.uid}`, onDisconnectRef)
    await onDisconnectRef.remove()

    // Start heartbeat
    this.startHeartbeat(canvasId, user.uid)
  }

  async leaveRoom(canvasId: string, userId: string): Promise<void> {
    // Clear heartbeat
    const heartbeatKey = `${canvasId}-${userId}`
    const heartbeatInterval = this.heartbeatIntervals.get(heartbeatKey)
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      this.heartbeatIntervals.delete(heartbeatKey)
    }

    // Clear cursor throttle
    const cursorThrottleKey = `${canvasId}-${userId}`
    const cursorThrottleTimeout =
      this.cursorThrottleTimeouts.get(cursorThrottleKey)
    if (cursorThrottleTimeout) {
      clearTimeout(cursorThrottleTimeout)
      this.cursorThrottleTimeouts.delete(cursorThrottleKey)
    }

    // Remove presence from RTDB
    const presenceRef = this.presenceRefs.get(`${canvasId}-${userId}`)
    if (presenceRef) {
      await remove(presenceRef)
      this.presenceRefs.delete(`${canvasId}-${userId}`)
    }

    // Cancel onDisconnect handler
    const onDisconnectRef = this.onDisconnectRefs.get(`${canvasId}-${userId}`)
    if (onDisconnectRef) {
      await onDisconnectRef.cancel()
      this.onDisconnectRefs.delete(`${canvasId}-${userId}`)
    }

    // Reset current state
    if (this.currentCanvasId === canvasId && this.currentUserId === userId) {
      this.currentCanvasId = null
      this.currentUserId = null
    }
  }

  updateCursor(
    canvasId: string,
    userId: string,
    cursor: { x: number; y: number }
  ): void {
    // Rate limiting check for cursor updates
    if (!presenceRateLimiter.isAllowed(userId)) {
      securityLogger.log({
        type: 'rate_limit_exceeded',
        userId,
        details: `Cursor update rate limit exceeded for user ${userId}`,
        severity: 'low'
      })
      return // Silently drop cursor updates if rate limited
    }

    const throttleKey = `${canvasId}-${userId}`

    // Clear existing throttle timeout
    const existingTimeout = this.cursorThrottleTimeouts.get(throttleKey)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new throttle timeout
    const timeout = setTimeout(async () => {
      const presenceRef = this.presenceRefs.get(`${canvasId}-${userId}`)
      if (presenceRef) {
        const cursorRef = ref(rtdb, `presence/${canvasId}/${userId}/cursor`)
        await set(cursorRef, {
          x: cursor.x,
          y: cursor.y,
          timestamp: Date.now()
        })

        // Update lastSeen
        const lastSeenRef = ref(rtdb, `presence/${canvasId}/${userId}/lastSeen`)
        await set(lastSeenRef, Date.now())
      }
      this.cursorThrottleTimeouts.delete(throttleKey)
    }, CURSOR_THROTTLE_INTERVAL)

    this.cursorThrottleTimeouts.set(throttleKey, timeout)
  }

  subscribeToPresence(
    canvasId: string,
    callback: (presence: UserPresence[]) => void
  ): () => void {
    const presenceRef = ref(rtdb, `presence/${canvasId}`)

    const unsubscribe: Unsubscribe = onValue(presenceRef, snapshot => {
      const data = snapshot.val()
      if (!data) {
        callback([])
        return
      }

      // Convert RTDB data to UserPresence format
      const presence: UserPresence[] = Object.entries(data)
        .map(([userId, userData]: [string, any]) => {
          // Filter out stale presence (users who haven't been seen recently)
          const now = Date.now()
          const isActive =
            userData.isOnline && now - userData.lastSeen < PRESENCE_TIMEOUT

          return {
            userId,
            displayName: userData.userInfo?.displayName || 'Anonymous',
            avatar: userData.userInfo?.avatar,
            cursor: {
              x: userData.cursor?.x || 0,
              y: userData.cursor?.y || 0
            },
            lastSeen: userData.lastSeen || now,
            isActive
          }
        })
        .filter(p => p.isActive)

      callback(presence)
    })

    return () => {
      off(presenceRef, 'value', unsubscribe)
    }
  }

  cleanup(): void {
    // Clear all heartbeats
    this.heartbeatIntervals.forEach(interval => clearInterval(interval))
    this.heartbeatIntervals.clear()

    // Clear all cursor throttles
    this.cursorThrottleTimeouts.forEach(timeout => clearTimeout(timeout))
    this.cursorThrottleTimeouts.clear()

    // Cancel all onDisconnect handlers
    this.onDisconnectRefs.forEach(onDisconnectRef => {
      onDisconnectRef.cancel().catch(console.error)
    })
    this.onDisconnectRefs.clear()

    // Clear presence refs
    this.presenceRefs.clear()

    // Reset state
    this.currentCanvasId = null
    this.currentUserId = null
  }

  private startHeartbeat(canvasId: string, userId: string): void {
    const heartbeatKey = `${canvasId}-${userId}`

    const interval = setInterval(async () => {
      try {
        const presenceRef = this.presenceRefs.get(`${canvasId}-${userId}`)
        if (presenceRef) {
          const lastSeenRef = ref(
            rtdb,
            `presence/${canvasId}/${userId}/lastSeen`
          )
          await set(lastSeenRef, Date.now())
        }
      } catch (error) {
        console.error('Failed to send heartbeat:', error)
      }
    }, HEARTBEAT_INTERVAL)

    this.heartbeatIntervals.set(heartbeatKey, interval)
  }
}

// Export singleton instance
export const presenceService = new PresenceServiceImpl()

// Utility function to create presence service
export function createPresenceService(): PresenceService {
  return new PresenceServiceImpl()
}
