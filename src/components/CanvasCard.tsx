import {
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Public as PublicIcon,
  Share as ShareIcon
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme
} from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CanvasListItem } from '../lib/types'

interface CanvasCardProps {
  canvas: CanvasListItem
  onEdit?: (canvas: CanvasListItem) => void
  onDelete?: (canvas: CanvasListItem) => void
  onShare?: (canvas: CanvasListItem) => void
  showOwner?: boolean
}

const CanvasCard: React.FC<CanvasCardProps> = ({
  canvas,
  onEdit,
  onDelete,
  onShare,
  showOwner = true
}) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleOpenCanvas = () => {
    navigate(`/canvas/${canvas.id}`)
  }

  const handleEdit = () => {
    onEdit?.(canvas)
    handleClose()
  }

  const handleDelete = () => {
    onDelete?.(canvas)
    handleClose()
  }

  const handleShare = () => {
    onShare?.(canvas)
    handleClose()
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getAccessTypeIcon = () => {
    switch (canvas.accessType) {
      case 'public':
        return <PublicIcon fontSize="small" />
      case 'link':
        return <ShareIcon fontSize="small" />
      default:
        return <LockIcon fontSize="small" />
    }
  }

  const getAccessTypeColor = () => {
    switch (canvas.accessType) {
      case 'public':
        return theme.palette.success.main
      case 'link':
        return theme.palette.info.main
      default:
        return theme.palette.grey[500]
    }
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.2s ease-in-out',
        position: 'relative', // Add relative positioning for absolute menu button
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
          borderColor: alpha(theme.palette.primary.main, 0.3)
        }
      }}
    >
      <CardActionArea
        onClick={handleOpenCanvas}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* Thumbnail */}
        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          {canvas.thumbnail ? (
            <CardMedia
              component="img"
              height="200"
              image={canvas.thumbnail}
              alt={canvas.name}
              sx={{
                objectFit: 'cover',
                backgroundColor: alpha(theme.palette.grey[100], 0.5)
              }}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.grey[100], 0.5),
                color: theme.palette.grey[400]
              }}
            >
              <Typography variant="h6" color="inherit">
                No Preview
              </Typography>
            </Box>
          )}

          {/* Access type indicator */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 0.5
            }}
          >
            <Chip
              icon={getAccessTypeIcon()}
              label={canvas.accessType}
              size="small"
              sx={{
                backgroundColor: alpha(getAccessTypeColor(), 0.1),
                color: getAccessTypeColor(),
                border: `1px solid ${alpha(getAccessTypeColor(), 0.3)}`,
                '& .MuiChip-icon': {
                  color: getAccessTypeColor()
                }
              }}
            />
            {canvas.hasPassword && (
              <Chip
                icon={<LockIcon />}
                label="Protected"
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
                }}
              />
            )}
          </Box>
        </Box>

        {/* Content */}
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {canvas.name}
            </Typography>

            {canvas.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {canvas.description}
              </Typography>
            )}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 'auto'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showOwner && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {canvas.isOwner ? 'You' : canvas.ownerName}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(canvas.lastModified)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>

      {/* Menu button - moved outside CardActionArea to fix nested button error */}
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          opacity: 0.7,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(4px)',
          '&:hover': {
            opacity: 1,
            backgroundColor: alpha(theme.palette.action.hover, 0.1)
          }
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem onClick={handleOpenCanvas}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Open Canvas
        </MenuItem>

        {canvas.isOwner && onEdit && (
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Settings
          </MenuItem>
        )}

        {(canvas.accessType === 'link' || canvas.accessType === 'public') &&
          onShare && (
            <MenuItem onClick={handleShare}>
              <ShareIcon fontSize="small" sx={{ mr: 1 }} />
              Share Link
            </MenuItem>
          )}

        {canvas.isOwner && onDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </Card>
  )
}

export default CanvasCard
