import React from 'react'

interface EmptyCanvasStateProps {
  selectedTool: string
  onGetStarted?: () => void
}

const EmptyCanvasState: React.FC<EmptyCanvasStateProps> = ({
  selectedTool,
  onGetStarted
}) => {
  const getToolInstruction = () => {
    switch (selectedTool) {
      case 'rectangle':
        return 'Click and drag to create a rectangle'
      case 'circle':
        return 'Click and drag to create a circle'
      case 'text':
        return 'Click anywhere to add text'
      case 'select':
        return 'Select a tool from the toolbar to start creating'
      default:
        return 'Select a tool from the toolbar to start creating'
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Canvas Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Welcome to your canvas
        </h3>

        {/* Description */}
        <p className="text-gray-500 mb-6">{getToolInstruction()}</p>

        {/* Quick Start Guide */}
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Quick Start:
          </h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
              Choose a tool from the toolbar above
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
              Create shapes by clicking and dragging
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
              Use the select tool to move and resize
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
              Press Del to delete, Cmd+D to duplicate
            </li>
          </ul>
        </div>

        {/* Call to Action */}
        {onGetStarted && (
          <button
            onClick={onGetStarted}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors pointer-events-auto"
          >
            Get Started
          </button>
        )}
      </div>
    </div>
  )
}

export default EmptyCanvasState
