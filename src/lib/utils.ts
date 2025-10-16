import type { User, UserPresence } from './types'

/**
 * Get display name for a user ID, checking current user first, then presence list
 */
export function getUserDisplayName(
  userId: string,
  currentUser: User | null,
  presence: UserPresence[]
): string {
  // Check if it's the current user
  if (currentUser && userId === currentUser.uid) {
    return currentUser.displayName || 'You'
  }

  // Check presence list for other users
  const user = presence.find(p => p.userId === userId)
  return user?.displayName || 'Unknown User'
}

/**
 * Format timestamp for "last edited" display
 */
export function formatLastEdited(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  // Less than 1 minute
  if (diffMs < 60000) {
    return 'just now'
  }

  // Less than 1 hour
  if (diffMs < 3600000) {
    const minutes = Math.floor(diffMs / 60000)
    return `${minutes}m ago`
  }

  // Less than 24 hours
  if (diffMs < 86400000) {
    const hours = Math.floor(diffMs / 3600000)
    return `${hours}h ago`
  }

  // More than 24 hours - show date
  return date.toLocaleDateString()
}
