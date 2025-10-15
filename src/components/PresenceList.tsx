import { Users } from 'lucide-react'
import React from 'react'
import type { UserPresence } from '../lib/types'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export interface PresenceListProps {
  presence: UserPresence[]
  currentUserId: string
  currentUser?: {
    displayName?: string | null
    photoURL?: string | null
  }
  className?: string
}

const PresenceList: React.FC<PresenceListProps> = ({
  presence,
  currentUserId,
  currentUser,
  className = ''
}) => {
  // Filter out current user and users without userId, then sort by display name
  const otherUsers = presence
    .filter(p => p.userId && p.userId !== currentUserId)
    .sort((a, b) =>
      (a.displayName || 'Anonymous').localeCompare(b.displayName || 'Anonymous')
    )

  const getInitials = (displayName: string) => {
    return displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Create a list that includes current user first, then other users
  const allUsers = [
    // Current user first
    ...(currentUser
      ? [
          {
            userId: currentUserId,
            displayName: currentUser.displayName || 'Me',
            avatar: currentUser.photoURL || undefined,
            isCurrentUser: true
          }
        ]
      : []),
    // Other users
    ...otherUsers.map(user => ({ ...user, isCurrentUser: false }))
  ]

  if (allUsers.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Online
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 hover:bg-green-100"
            >
              0
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No users online</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Online
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 hover:bg-green-100"
          >
            {allUsers.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {allUsers.map(user => (
            <div key={user.userId} className="flex items-center space-x-3">
              <div className="relative">
                <Avatar
                  className="h-6 w-6"
                  style={{ width: '20px', height: '20px' }}
                >
                  <AvatarImage
                    src={user.avatar || undefined}
                    alt={user.displayName || 'User avatar'}
                    onError={() => {
                      // Silently handle avatar load failures - this is common with Google profile pictures
                      // due to rate limiting (429 errors) and CORS restrictions
                    }}
                  />
                  <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                    {getInitials(user.displayName || 'Anonymous')}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-background rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-foreground truncate">
                {user.isCurrentUser ? 'me' : user.displayName || 'Anonymous'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PresenceList
