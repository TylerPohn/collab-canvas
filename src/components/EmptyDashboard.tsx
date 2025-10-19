import {
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Palette as PaletteIcon
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

interface EmptyDashboardProps {
  onCreateCanvas: () => void
}

const EmptyDashboard: React.FC<EmptyDashboardProps> = ({ onCreateCanvas }) => {
  const theme = useTheme()

  return (
    <Container maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          p: 8,
          textAlign: 'center',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
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
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <DashboardIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          </Box>
        </Box>

        {/* Content */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Welcome to Collab Canvas
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
        >
          Create your first collaborative canvas and start bringing your ideas
          to life. Share with others, work together in real-time, and build
          amazing things.
        </Typography>

        {/* Features */}
        <Box sx={{ mb: 6 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 4,
              flexWrap: 'wrap'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaletteIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                Creative Tools
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DashboardIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                Real-time Collaboration
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                Easy Sharing
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* CTA Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={onCreateCanvas}
          sx={{
            px: 6,
            py: 2,
            borderRadius: 3,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          Create Your First Canvas
        </Button>

        {/* Help text */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 4, opacity: 0.8 }}
        >
          You can always create more canvases from the dashboard
        </Typography>
      </Paper>
    </Container>
  )
}

export default EmptyDashboard
