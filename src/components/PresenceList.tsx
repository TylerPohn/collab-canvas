import { People as PeopleIcon } from '@mui/icons-material'
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Fade,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  useTheme
} from '@mui/material'
import React from 'react'
import type { UserPresence } from '../lib/types'

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
  const theme = useTheme()

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
      <Fade in timeout={500}>
        <Card
          sx={{
            minWidth: 200,
            maxWidth: 280,
            borderRadius: 3,
            background: `rgba(255, 255, 255, 0.95)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`
          }}
          className={className}
        >
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon
                  sx={{
                    fontSize: 18,
                    color: theme.palette.text.secondary
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '0.875rem'
                  }}
                >
                  Online
                </Typography>
              </Box>
              <Chip
                label="0"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                }}
              />
            </Box>
            <Box
              sx={{
                textAlign: 'center',
                py: 2
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.875rem'
                }}
              >
                No users online
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    )
  }

  return (
    <Fade in timeout={500}>
      <Card
        sx={{
          minWidth: 200,
          maxWidth: 280,
          borderRadius: 3,
          background: `rgba(255, 255, 255, 0.95)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`
        }}
        className={className}
      >
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon
                sx={{
                  fontSize: 18,
                  color: theme.palette.text.secondary
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: '0.875rem'
                }}
              >
                Online
              </Typography>
            </Box>
            <Chip
              label={allUsers.length}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                fontWeight: 500,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}
            />
          </Box>

          <List sx={{ py: 0 }}>
            {allUsers.map((user, index) => (
              <Fade
                key={user.userId}
                in
                timeout={600 + index * 100}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <ListItem
                  sx={{
                    px: 0,
                    py: 0.5,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 1
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 36 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: user.isCurrentUser
                            ? theme.palette.primary.main
                            : theme.palette.grey[400],
                          color: user.isCurrentUser
                            ? theme.palette.primary.contrastText
                            : theme.palette.grey[100]
                        }}
                        src={user.avatar || undefined}
                        alt={user.displayName || 'User avatar'}
                        onError={() => {
                          // Silently handle avatar load failures - this is common with Google profile pictures
                          // due to rate limiting (429 errors) and CORS restrictions
                        }}
                      >
                        {getInitials(user.displayName || 'Anonymous')}
                      </Avatar>
                      {/* Online indicator */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -1,
                          right: -1,
                          width: 8,
                          height: 8,
                          bgcolor: theme.palette.success.main,
                          border: `2px solid ${theme.palette.background.paper}`,
                          borderRadius: '50%',
                          animation: 'pulse 2s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.7 },
                            '100%': { opacity: 1 }
                          }
                        }}
                      />
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: user.isCurrentUser ? 600 : 500,
                          color: user.isCurrentUser
                            ? theme.palette.primary.main
                            : 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {user.isCurrentUser
                          ? 'me'
                          : user.displayName || 'Anonymous'}
                      </Typography>
                    }
                  />
                </ListItem>
              </Fade>
            ))}
          </List>
        </CardContent>
      </Card>
    </Fade>
  )
}

export default PresenceList
