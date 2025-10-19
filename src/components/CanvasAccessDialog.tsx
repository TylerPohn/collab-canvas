import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import React, { useState } from 'react'

interface CanvasAccessDialogProps {
  open: boolean
  onClose: () => void
  onAccess: (password: string) => Promise<boolean>
  canvasName: string
  isLoading?: boolean
}

const CanvasAccessDialog: React.FC<CanvasAccessDialogProps> = ({
  open,
  onClose,
  onAccess,
  canvasName,
  isLoading = false
}) => {
  const theme = useTheme()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError('Password is required')
      return
    }

    try {
      const success = await onAccess(password)
      if (success) {
        setPassword('')
        setError('')
        onClose()
      } else {
        setError('Incorrect password')
      }
    } catch (err) {
      setError('Failed to verify password')
    }
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LockIcon sx={{ fontSize: 32, color: 'warning.main' }} />
          </Box>
        </Box>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Password Required
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          This canvas is password protected
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the password to access <strong>"{canvasName}"</strong>
          </Typography>
        </Box>

        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={password}
          onChange={e => {
            setPassword(e.target.value)
            setError('')
          }}
          onKeyPress={handleKeyPress}
          error={!!error}
          helperText={error}
          disabled={isLoading}
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
                  disabled={isLoading}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, gap: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !password.trim()}
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
          {isLoading ? 'Verifying...' : 'Access Canvas'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CanvasAccessDialog
