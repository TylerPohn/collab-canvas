import {
  Home as HomeIcon,
  Lock as LockIcon,
  Public as PublicIcon
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useTheme
} from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

interface CanvasAccessDeniedProps {
  canvasName?: string
  reason?: 'private' | 'password' | 'permission'
}

const CanvasAccessDenied: React.FC<CanvasAccessDeniedProps> = ({
  canvasName = 'this canvas',
  reason = 'permission'
}) => {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  const handleGoToGallery = () => {
    navigate('/gallery')
  }

  const getReasonInfo = () => {
    switch (reason) {
      case 'private':
        return {
          title: 'Private Canvas',
          description: `${canvasName} is private and only accessible by its owner.`,
          icon: <LockIcon sx={{ fontSize: 48, color: 'error.main' }} />,
          suggestion: 'Contact the canvas owner to request access.'
        }
      case 'password':
        return {
          title: 'Password Required',
          description: `${canvasName} is password protected.`,
          icon: <LockIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
          suggestion: 'You need the correct password to access this canvas.'
        }
      default:
        return {
          title: 'Access Denied',
          description: `You don't have permission to access ${canvasName}.`,
          icon: <LockIcon sx={{ fontSize: 48, color: 'error.main' }} />,
          suggestion:
            'Contact the canvas owner or check if you have the correct link.'
        }
    }
  }

  const reasonInfo = getReasonInfo()

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 8,
          textAlign: 'center',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.95)})`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4
          }}
        >
          <Box
            sx={{
              p: 3,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.error.main, 0.05)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {reasonInfo.icon}
          </Box>
        </Box>

        {/* Content */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: 'text.primary'
          }}
        >
          {reasonInfo.title}
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 2, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
        >
          {reasonInfo.description}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}
        >
          {reasonInfo.suggestion}
        </Typography>

        {/* Actions */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={handleGoToDashboard}
            sx={{
              px: 4,
              py: 2,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
              }
            }}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="outlined"
            startIcon={<PublicIcon />}
            onClick={handleGoToGallery}
            sx={{
              px: 4,
              py: 2,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Browse Gallery
          </Button>
        </Box>

        {/* Help text */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 4, opacity: 0.8 }}
        >
          Need help? Contact the canvas owner or check your permissions
        </Typography>
      </Paper>
    </Container>
  )
}

export default CanvasAccessDenied
