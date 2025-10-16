import {
  ArrowForward as ArrowForwardIcon,
  Favorite as FavoriteIcon,
  Palette as PaletteIcon,
  People as PeopleIcon,
  Public as PublicIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fade,
  Paper,
  Slide,
  Typography,
  useTheme
} from '@mui/material'
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const LandingPage: React.FC = () => {
  const { user, loading } = useAuth()
  const theme = useTheme()

  // Show loading while checking auth status
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
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              border: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              borderTop: `3px solid ${theme.palette.primary.main}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              mx: 'auto',
              mb: 2,
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          />
          <Typography variant="body1" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Box>
    )
  }

  // Redirect authenticated users to canvas
  if (user) {
    return <Navigate to="/canvas" replace />
  }

  // Feature data for the showcase
  const features = [
    {
      icon: PeopleIcon,
      title: 'Real-time Collaboration',
      description: 'Work together with multiple users in real-time',
      color: theme.palette.primary.main
    },
    {
      icon: SpeedIcon,
      title: 'Lightning Fast',
      description: 'Optimized performance for smooth interactions',
      color: theme.palette.secondary.main
    },
    {
      icon: PaletteIcon,
      title: 'Creative Tools',
      description: 'Rich set of drawing and design tools',
      color: '#FF6B6B'
    },
    {
      icon: SecurityIcon,
      title: 'Secure & Private',
      description: 'Your work is protected with enterprise security',
      color: '#4ECDC4'
    },
    {
      icon: PublicIcon,
      title: 'Cross Platform',
      description: 'Access from any device, anywhere',
      color: '#45B7D1'
    },
    {
      icon: FavoriteIcon,
      title: 'User Friendly',
      description: 'Intuitive interface designed for everyone',
      color: '#FFA07A'
    }
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            filter: 'blur(40px)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`,
            filter: 'blur(60px)'
          }}
        />

        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '6rem' },
                  fontWeight: 800,
                  mb: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1
                }}
              >
                Welcome to{' '}
                <Box component="span" sx={{ display: 'block' }}>
                  Collab Canvas
                </Box>
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                  color: 'text.secondary',
                  mb: 6,
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Create, collaborate, and bring your ideas to life with our
                real-time collaborative canvas platform
              </Typography>

              {/* Call-to-Action Button */}
              <Slide direction="up" in timeout={1500}>
                <Button
                  component="a"
                  href="/login"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    px: 6,
                    py: 2,
                    borderRadius: 3,
                    minWidth: 200,
                    height: 60,
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
                  Get Started
                </Button>
              </Slide>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Feature Showcase */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Fade in timeout={2000}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                mb: 2,
                color: 'text.primary'
              }}
            >
              Powerful Features
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                maxWidth: '600px',
                mx: 'auto',
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              Everything you need to create amazing collaborative experiences
            </Typography>
          </Box>
        </Fade>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 4
          }}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Slide direction="up" in timeout={2000 + index * 200} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: 'none',
                    background: `rgba(255, 255, 255, 0.7)`,
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                      background: `rgba(255, 255, 255, 0.9)`
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: alpha(feature.color, 0.1),
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            background: alpha(feature.color, 0.2),
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <IconComponent
                          sx={{
                            fontSize: 32,
                            color: feature.color
                          }}
                        />
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: 'text.primary'
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            lineHeight: 1.6
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            )
          })}
        </Box>
      </Container>

      {/* Bottom CTA Section */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <Fade in timeout={3000}>
          <Paper
            elevation={8}
            sx={{
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                p: { xs: 6, md: 8 },
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
              }}
            >
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  mb: 2,
                  color: 'text.primary'
                }}
              >
                Ready to Start Collaborating?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: '600px',
                  mx: 'auto',
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}
              >
                Join thousands of creators who are already using Collab Canvas
                to bring their ideas to life
              </Typography>
              <Button
                component="a"
                href="/login"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  px: 6,
                  py: 2,
                  borderRadius: 3,
                  minWidth: 200,
                  height: 60,
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
                Start Creating Now
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  )
}

export default LandingPage
