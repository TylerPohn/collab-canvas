import { Logout as LogoutIcon } from '@mui/icons-material'
import {
  alpha,
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  useTheme
} from '@mui/material'
import React from 'react'
import { useAuth } from '../hooks/useAuth'

const ProfileMenu: React.FC = () => {
  const { user, logout } = useAuth()
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await logout()
      handleClose()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (!user) {
    return null
  }

  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          p: 0.5,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1)
          }
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: '0.875rem',
            fontWeight: 600,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
          }}
          src={user.photoURL || undefined}
          alt={user.displayName || 'User avatar'}
          onError={() => {
            // Silently handle avatar load failures - this is common with Google profile pictures
            // due to rate limiting (429 errors) and CORS restrictions
          }}
        >
          {getInitials()}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: 'text.primary' }}
          >
            {user.displayName || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default ProfileMenu
