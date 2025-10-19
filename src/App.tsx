import {
  alpha,
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material'
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom'
import ConnectionStatus from './components/ConnectionStatus'
import ProfileMenu from './components/ProfileMenu'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './components/providers/AuthProvider'
import { ToastProvider } from './contexts/ToastContext'
import { useAuth } from './hooks/useAuth'
import CanvasPage from './pages/CanvasPage'
import DashboardPage from './pages/DashboardPage'
import GalleryPage from './pages/GalleryPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'

// Navigation component for authenticated users
const Navigation: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!user) return null

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <Box sx={{ display: 'flex', gap: 1, mr: 4 }}>
      <Button
        onClick={() => navigate('/dashboard')}
        variant={isActive('/dashboard') ? 'contained' : 'text'}
        size="small"
        sx={{
          borderRadius: 2,
          px: 2,
          py: 1,
          fontWeight: isActive('/dashboard') ? 600 : 500,
          color: isActive('/dashboard') ? 'white' : 'text.primary',
          '&:hover': {
            backgroundColor: isActive('/dashboard')
              ? 'primary.dark'
              : 'action.hover'
          }
        }}
      >
        Dashboard
      </Button>
      <Button
        onClick={() => navigate('/gallery')}
        variant={isActive('/gallery') ? 'contained' : 'text'}
        size="small"
        sx={{
          borderRadius: 2,
          px: 2,
          py: 1,
          fontWeight: isActive('/gallery') ? 600 : 500,
          color: isActive('/gallery') ? 'white' : 'text.primary',
          '&:hover': {
            backgroundColor: isActive('/gallery')
              ? 'primary.dark'
              : 'action.hover'
          }
        }}
      >
        Gallery
      </Button>
    </Box>
  )
}

function App() {
  const theme = useTheme()

  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <AppBar
              position="sticky"
              elevation={0}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                zIndex: theme.zIndex.appBar
              }}
            >
              <Container maxWidth="xl">
                <Toolbar
                  sx={{
                    minHeight: 64,
                    justifyContent: 'space-between',
                    px: { xs: 2, sm: 3 }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      variant="h6"
                      component="h1"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: '1.25rem',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      Collab Canvas
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Navigation />
                    <ConnectionStatus />
                    <ProfileMenu />
                  </Box>
                </Toolbar>
              </Container>
            </AppBar>

            {/* Main Content */}
            <Box component="main">
              <Routes>
                {/* Landing page - redirect to dashboard if authenticated, otherwise show welcome */}
                <Route path="/" element={<LandingPage />} />

                {/* Login page */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected dashboard route */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected gallery route */}
                <Route
                  path="/gallery"
                  element={
                    <ProtectedRoute>
                      <GalleryPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected canvas route with dynamic ID */}
                <Route
                  path="/canvas/:canvasId"
                  element={
                    <ProtectedRoute>
                      <Box
                        sx={{
                          height: 'calc(100vh - 64px)',
                          overflow: 'hidden'
                        }}
                      >
                        <CanvasPage />
                      </Box>
                    </ProtectedRoute>
                  }
                />

                {/* Redirect old canvas route to dashboard */}
                <Route
                  path="/canvas"
                  element={<Navigate to="/dashboard" replace />}
                />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
