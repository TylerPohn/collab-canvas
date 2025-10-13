import React from 'react'
import type { UserPresence } from '../lib/types'

export interface PresenceListProps {
  presence: UserPresence[]
  currentUserId: string
  className?: string
}

const PresenceList: React.FC<PresenceListProps> = ({
  presence,
  currentUserId,
  className = ''
}) => {
  // Filter out current user and sort by display name
  const otherUsers = presence
    .filter(p => p.userId !== currentUserId)
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  if (otherUsers.length === 0) {
    return null
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-3 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">
          Online ({otherUsers.length})
        </h3>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>

      <div className="space-y-2">
        {otherUsers.map(user => (
          <div
            key={user.userId}
            className="flex items-center space-x-2 text-sm"
          >
            {/* Avatar */}
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-6 h-6 rounded-full border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
            </div>

            {/* Display name */}
            <span className="text-gray-700 truncate max-w-24">
              {user.displayName}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PresenceList
