import {
  ContentCopy as ContentCopyIcon,
  OpenInNew as OpenInNewIcon,
  QrCode as QrCodeIcon,
  Share as ShareIcon
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme
} from '@mui/material'
import React, { useCallback, useState } from 'react'
import type { CanvasMeta } from '../lib/types'

interface ShareLinkDialogProps {
  open: boolean
  onClose: () => void
  canvas: CanvasMeta
}

const ShareLinkDialog: React.FC<ShareLinkDialogProps> = ({
  open,
  onClose,
  canvas
}) => {
  const theme = useTheme()
  const [copied, setCopied] = useState(false)

  const getShareableLink = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/canvas/${canvas.id}`
  }

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getShareableLink())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }, [canvas.id])

  const handleOpenLink = useCallback(() => {
    window.open(getShareableLink(), '_blank')
  }, [canvas.id])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: canvas.name || 'Untitled Canvas',
          text: `Check out this canvas: ${canvas.name || 'Untitled Canvas'}`,
          url: getShareableLink()
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    } else {
      handleCopyLink()
    }
  }, [canvas.name, getShareableLink, handleCopyLink])

  const getAccessTypeInfo = () => {
    switch (canvas.permissions.accessType) {
      case 'public':
        return {
          label: 'Public',
          color: theme.palette.success.main,
          description: 'Visible in the public gallery'
        }
      case 'link':
        return {
          label: 'Link-based',
          color: theme.palette.info.main,
          description: canvas.permissions.password
            ? 'Password protected'
            : 'Open access'
        }
      default:
        return {
          label: 'Private',
          color: theme.palette.grey[500],
          description: 'Only you can access'
        }
    }
  }

  const accessInfo = getAccessTypeInfo()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.95)})`,
          backdropFilter: 'blur(20px)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShareIcon sx={{ color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Share Canvas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {canvas.name || 'Untitled Canvas'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Access Type Info */}
          <Box
            sx={{
              p: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 2,
              backgroundColor: alpha(accessInfo.color, 0.05)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Chip
                label={accessInfo.label}
                size="small"
                sx={{
                  backgroundColor: alpha(accessInfo.color, 0.1),
                  color: accessInfo.color,
                  border: `1px solid ${alpha(accessInfo.color, 0.3)}`,
                  fontWeight: 600
                }}
              />
              {canvas.permissions.password && (
                <Chip
                  icon={<QrCodeIcon />}
                  label="Password Protected"
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {accessInfo.description}
            </Typography>
          </Box>

          {/* Shareable Link */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Shareable Link
            </Typography>
            <Box
              sx={{
                p: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.default, 0.5)
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      wordBreak: 'break-all',
                      color: 'text.primary'
                    }}
                  >
                    {getShareableLink()}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={copied ? <ContentCopyIcon /> : <ContentCopyIcon />}
                  onClick={handleCopyLink}
                  disabled={copied}
                  sx={{ borderRadius: 2, px: 3, minWidth: 100 }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Share Options */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Share Options
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                  }
                }}
              >
                {navigator.share ? 'Share' : 'Copy Link'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                onClick={handleOpenLink}
                sx={{ borderRadius: 2, px: 3, py: 1.5 }}
              >
                Open in New Tab
              </Button>
            </Box>
          </Box>

          {/* Instructions */}
          <Box
            sx={{
              p: 2,
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              borderRadius: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>How to share:</strong>
              {canvas.permissions.accessType === 'public'
                ? ' This canvas is public and visible in the gallery. Anyone can access it using the link above.'
                : canvas.permissions.accessType === 'link'
                  ? ' Share the link above with anyone you want to give access to. ' +
                    (canvas.permissions.password
                      ? 'They will need the password to access the canvas.'
                      : 'They can access the canvas immediately.')
                  : ' This canvas is private. Only you can access it.'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, px: 3, py: 1.5 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ShareLinkDialog
