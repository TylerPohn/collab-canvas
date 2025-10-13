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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect authenticated users to canvas
  if (user) {
    return <Navigate to="/canvas" replace />
  }

  // Show welcome page for unauthenticated users
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">
        Welcome to Collab Canvas
      </h2>
      <p className="text-xl text-gray-600 mb-12">
        A real-time collaborative canvas application
      </p>
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Ready to Collaborate!
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Create, edit, and collaborate on shapes in real-time with other
            users.
          </p>
          <ul className="space-y-3 text-left text-gray-600 list-disc list-inside">
            <li>Real-time collaborative canvas</li>
            <li>Shape creation and manipulation</li>
            <li>Multi-user presence and cursors</li>
            <li>Firebase authentication</li>
          </ul>
          <div className="mt-8">
            <a
              href="/login"
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </a>
          </div>
        </div>
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
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-gray-900">
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
                      <span className="text-sm text-gray-600 capitalize">
                        {healthStatus}
                      </span>
                    </div>
                    <ProfileMenu />
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
