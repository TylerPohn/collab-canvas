import {
  removePresence,
  subscribeToPresence,
  updatePresence
} from '../firebase/firestore'
import type { UserPresence } from '../types'

// Heartbeat interval in milliseconds (30 seconds)
const HEARTBEAT_INTERVAL = 30 * 1000

// Cursor update throttling (100ms)
const CURSOR_THROTTLE_INTERVAL = 100

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

    // Set initial presence
    await updatePresence(canvasId, user.uid, {
      userId: user.uid,
      displayName: user.displayName || 'Anonymous',
      avatar: user.photoURL || undefined,
      cursor: { x: 0, y: 0 },
      lastSeen: Date.now(),
      isActive: true
    })

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

    // Remove presence from Firestore
    await removePresence(canvasId, userId)

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
    const throttleKey = `${canvasId}-${userId}`

    // Clear existing throttle timeout
    const existingTimeout = this.cursorThrottleTimeouts.get(throttleKey)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new throttle timeout
    const timeout = setTimeout(async () => {
      await updatePresence(canvasId, userId, {
        cursor,
        lastSeen: Date.now(),
        isActive: true
      })
      this.cursorThrottleTimeouts.delete(throttleKey)
    }, CURSOR_THROTTLE_INTERVAL)

    this.cursorThrottleTimeouts.set(throttleKey, timeout)
  }

  subscribeToPresence(
    canvasId: string,
    callback: (presence: UserPresence[]) => void
  ): () => void {
    return subscribeToPresence(canvasId, presence => {
      // Filter out stale presence (users who haven't been seen recently)
      const now = Date.now()
      const activePresence = presence.filter(
        p => p.isActive && now - p.lastSeen < PRESENCE_TIMEOUT
      )
      callback(activePresence)
    })
  }

  cleanup(): void {
    // Clear all heartbeats
    this.heartbeatIntervals.forEach(interval => clearInterval(interval))
    this.heartbeatIntervals.clear()

    // Clear all cursor throttles
    this.cursorThrottleTimeouts.forEach(timeout => clearTimeout(timeout))
    this.cursorThrottleTimeouts.clear()

    // Reset state
    this.currentCanvasId = null
    this.currentUserId = null
  }

  private startHeartbeat(canvasId: string, userId: string): void {
    const heartbeatKey = `${canvasId}-${userId}`

    const interval = setInterval(async () => {
      try {
        await updatePresence(canvasId, userId, {
          lastSeen: Date.now(),
          isActive: true
        })
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
