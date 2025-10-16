import {
  alpha,
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material'
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom'
import ConnectionStatus from './components/ConnectionStatus'
import ProfileMenu from './components/ProfileMenu'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './components/providers/AuthProvider'
import { ToastProvider } from './contexts/ToastContext'
import CanvasPage from './pages/CanvasPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'

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
                    <ConnectionStatus />
                    <ProfileMenu />
                  </Box>
                </Toolbar>
              </Container>
            </AppBar>

            {/* Main Content */}
            <Box component="main">
              <Routes>
                {/* Landing page - redirect to canvas if authenticated, otherwise show welcome */}
                <Route path="/" element={<LandingPage />} />

                {/* Login page */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected canvas route */}
                <Route
                  path="/canvas"
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
