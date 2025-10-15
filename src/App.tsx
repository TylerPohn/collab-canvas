import { Globe, Heart, Palette, Shield, Users, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom'
import ProfileMenu from './components/ProfileMenu'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './components/providers/AuthProvider'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { ToastProvider } from './contexts/ToastContext'
import { useAuth } from './hooks/useAuth'
import { getHealthCheck } from './lib/health'
import CanvasPage from './pages/CanvasPage'
import LoginPage from './pages/LoginPage'

// Landing page component that redirects authenticated users to canvas
const LandingPage: React.FC = () => {
  const { user, loading } = useAuth()

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect authenticated users to canvas
  if (user) {
    return <Navigate to="/canvas" replace />
  }

  // Feature data for the showcase
  const features = [
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Work together with multiple users in real-time'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for smooth interactions'
    },
    {
      icon: Palette,
      title: 'Creative Tools',
      description: 'Rich set of drawing and design tools'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your work is protected with enterprise security'
    },
    {
      icon: Globe,
      title: 'Cross Platform',
      description: 'Access from any device, anywhere'
    },
    {
      icon: Heart,
      title: 'User Friendly',
      description: 'Intuitive interface designed for everyone'
    }
  ]

  // Show modern welcome page for unauthenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-6 lg:px-8 pt-20 pb-12">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Collab Canvas
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Create, collaborate, and bring your ideas to life with our real-time
            collaborative canvas platform
          </p>

          {/* Call-to-Action Button */}
          <div className="flex justify-center mb-16">
            <Button
              size="lg"
              className="text-xl px-12 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 rounded-lg min-w-[200px] no-underline"
              style={{
                height: '60px',
                fontSize: '1.25rem',
                fontWeight: '600',
                textDecoration: 'none'
              }}
              asChild
            >
              <a href="/login" style={{ textDecoration: 'none' }}>
                Get Started
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="container mx-auto px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create amazing collaborative experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card
                key={index}
                className="group text-center hover:shadow-md transition-all duration-200 border-0 bg-card/50 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-200">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground text-base">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="container mx-auto px-6 lg:px-8 pb-20">
        <Card className="max-w-4xl mx-auto text-center border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-lg">
          <CardContent className="p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Start Collaborating?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using Collab Canvas to
              bring their ideas to life
            </p>
            <Button
              size="lg"
              className="text-xl px-12 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 rounded-lg min-w-[200px] no-underline"
              style={{
                height: '60px',
                fontSize: '1.25rem',
                fontWeight: '600',
                textDecoration: 'none'
              }}
              asChild
            >
              <a href="/login" style={{ textDecoration: 'none' }}>
                Start Creating Now
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('checking...')

  useEffect(() => {
    // Check health status on app load
    getHealthCheck()
      .then(status => setHealthStatus(status.status))
      .catch(() => setHealthStatus('error'))
  }, [])

  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50 shadow-sm">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-foreground">
                      Collab Canvas
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          healthStatus === 'healthy'
                            ? 'bg-green-500'
                            : healthStatus === 'degraded'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      />
                      <span className="text-sm text-muted-foreground capitalize">
                        {healthStatus}
                      </span>
                    </div>
                    <ProfileMenu />
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main>
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
                      <CanvasPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
