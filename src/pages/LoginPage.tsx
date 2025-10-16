import { Google as GoogleIcon } from '@mui/icons-material'
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Typography,
  useTheme
} from '@mui/material'
import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const LoginPage: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/canvas" replace />
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true)
      setError(null)
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
      setError('Failed to sign in. Please try again.')
    } finally {
      setIsSigningIn(false)
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress
              size={48}
              sx={{ mb: 3, color: theme.palette.primary.main }}
            />
            <Typography variant="h6" gutterBottom color="text.primary">
              Loading...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preparing your canvas experience
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        py: 3,
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Box sx={{ p: 4, textAlign: 'center' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Welcome to Collab Canvas
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Join the collaborative canvas experience
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              variant="outlined"
              size="large"
              fullWidth
              startIcon={
                isSigningIn ? <CircularProgress size={20} /> : <GoogleIcon />
              }
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                borderColor: theme.palette.grey[300],
                color: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                },
                '&:disabled': {
                  borderColor: theme.palette.grey[300],
                  color: theme.palette.text.disabled
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {isSigningIn ? 'Signing in...' : 'Continue with Google'}
            </Button>

            {/* Footer */}
            <Box sx={{ mt: 4, pt: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                By signing in, you agree to our terms of service and privacy
                policy.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default LoginPage
