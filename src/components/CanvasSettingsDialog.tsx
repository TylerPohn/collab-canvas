import {
  ContentCopy as ContentCopyIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
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
  FormControlLabel,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import React, { useCallback, useState } from 'react'
import {
  updateCanvasMeta,
  updateCanvasPermissions
} from '../lib/firebase/firestore'
import type { CanvasAccessType, CanvasMeta } from '../lib/types'

interface CanvasSettingsDialogProps {
  open: boolean
  onClose: () => void
  canvas: CanvasMeta
  onUpdate?: () => void
}

const CanvasSettingsDialog: React.FC<CanvasSettingsDialogProps> = ({
  open,
  onClose,
  canvas,
  onUpdate
}) => {
  const theme = useTheme()
  const [name, setName] = useState(canvas.name || '')
  const [description, setDescription] = useState(canvas.description || '')
  const [accessType, setAccessType] = useState<CanvasAccessType>(
    canvas.permissions.accessType
  )
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Update canvas permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async (updates: {
      name?: string
      description?: string
      accessType?: CanvasAccessType
      password?: string
    }) => {
      if (updates.accessType !== undefined || updates.password !== undefined) {
        await updateCanvasPermissions(
          canvas.id,
          {
            accessType: updates.accessType,
            password: updates.password
          },
          canvas.permissions.ownerId
        )
      }

      if (updates.name !== undefined || updates.description !== undefined) {
        await updateCanvasMeta(
          canvas.id,
          {
            name: updates.name,
            description: updates.description
          },
          canvas.permissions.ownerId
        )
      }
    },
    onSuccess: () => {
      onUpdate?.()
      onClose()
    },
    onError: error => {
      console.error('Failed to update canvas settings:', error)
    }
  })

  const handleSave = useCallback(() => {
    const updates: any = {}

    if (name !== canvas.name) {
      updates.name = name
    }

    if (description !== canvas.description) {
      updates.description = description
    }

    if (accessType !== canvas.permissions.accessType) {
      updates.accessType = accessType
    }

    if (
      accessType === 'link' &&
      password &&
      password !== canvas.permissions.password
    ) {
      updates.password = password
    }

    if (Object.keys(updates).length > 0) {
      updatePermissionsMutation.mutate(updates)
    } else {
      onClose()
    }
  }, [
    name,
    description,
    accessType,
    password,
    canvas,
    updatePermissionsMutation,
    onClose
  ])

  const getShareableLink = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/canvas/${canvas.id}`
  }

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(getShareableLink())
  }, [canvas.id])

  const accessTypeOptions = [
    {
      value: 'private',
      label: 'Private',
      description: 'Only you can access this canvas',
      icon: <LockIcon />,
      color: theme.palette.grey[500]
    },
    {
      value: 'link',
      label: 'Link-based',
      description: 'Anyone with the link can access',
      icon: <ShareIcon />,
      color: theme.palette.info.main
    },
    {
      value: 'public',
      label: 'Public',
      description: 'Visible in the public gallery',
      icon: <PublicIcon />,
      color: theme.palette.success.main
    }
  ]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Canvas Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your canvas access and details
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Basic Info */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Basic Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Canvas Name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter canvas name"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your canvas (optional)"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          </Box>

          {/* Access Type */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Access Control
            </Typography>
            <RadioGroup
              value={accessType}
              onChange={e => setAccessType(e.target.value as CanvasAccessType)}
            >
              {accessTypeOptions.map(option => (
                <Box
                  key={option.value}
                  sx={{
                    p: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 2,
                    mb: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: alpha(option.color, 0.3),
                      backgroundColor: alpha(option.color, 0.02)
                    }
                  }}
                >
                  <FormControlLabel
                    value={option.value}
                    control={<Radio />}
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          width: '100%'
                        }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: alpha(option.color, 0.1),
                            color: option.color
                          }}
                        >
                          {option.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {option.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>
                        {accessType === option.value && (
                          <Chip
                            label="Current"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Box>
              ))}
            </RadioGroup>
          </Box>

          {/* Password for link-based access */}
          {accessType === 'link' && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Password Protection
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Password (optional)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password to protect access"
                helperText="Leave empty for open access"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          )}

          {/* Shareable Link */}
          {(accessType === 'link' || accessType === 'public') && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
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
                  <TextField
                    fullWidth
                    value={getShareableLink()}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        '& input': {
                          fontFamily: 'monospace',
                          fontSize: '0.875rem'
                        }
                      }
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyLink}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    Copy
                  </Button>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Share this link to give others access to your canvas
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          disabled={updatePermissionsMutation.isPending}
          sx={{ borderRadius: 2, px: 3, py: 1.5 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={updatePermissionsMutation.isPending}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
            }
          }}
        >
          {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CanvasSettingsDialog
