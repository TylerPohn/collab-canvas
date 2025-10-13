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
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to Collab Canvas
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        A real-time collaborative canvas application
      </p>
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ready to Collaborate!
          </h3>
          <p className="text-gray-600 mb-4">
            Create, edit, and collaborate on shapes in real-time with other
            users.
          </p>
          <div className="space-y-2 text-left text-gray-600">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Real-time collaborative canvas
            </div>
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Shape creation and manipulation
            </div>
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Multi-user presence and cursors
            </div>
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Firebase authentication
            </div>
          </div>
          <div className="mt-6">
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
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
