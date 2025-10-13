import React from 'react'
import { useAuth } from '../hooks/useAuth'

const CanvasPage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Canvas Workspace
          </h2>
          <p className="text-gray-600 mb-4">
            Welcome, {user?.displayName || user?.email}!
          </p>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Canvas Features Coming Soon
            </h3>
            <ul className="text-left text-gray-600 space-y-1">
              <li>• Real-time collaborative canvas</li>
              <li>• Shape creation and manipulation</li>
              <li>• Multi-user presence and cursors</li>
              <li>• Pan and zoom functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CanvasPage
