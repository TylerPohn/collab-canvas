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
import { getHealthCheck } from './lib/health'
import CanvasPage from './pages/CanvasPage'
import LoginPage from './pages/LoginPage'

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('checking...')

  useEffect(() => {
    // Check health status on app load
    getHealthCheck()
      .then(status => setHealthStatus(status.status))
      .catch(() => setHealthStatus('error'))
  }, [])

  return (
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
              <Route
                path="/"
                element={
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Welcome to Collab Canvas
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                      A real-time collaborative canvas application
                    </p>
                    <div className="space-y-4">
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Features Coming Soon
                        </h3>
                        <ul className="text-left text-gray-600 space-y-1">
                          <li>• Real-time collaborative canvas</li>
                          <li>• Shape creation and manipulation</li>
                          <li>• Multi-user presence and cursors</li>
                          <li>• Firebase authentication</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                }
              />

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
  )
}

export default App
