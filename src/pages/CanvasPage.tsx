import React, { useEffect, useState } from 'react'
import CanvasStage from '../components/CanvasStage'
import Toolbar, { type ToolType } from '../components/Toolbar'

const CanvasPage: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select')
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // Update canvas size on window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight - 60 // Account for toolbar height
      })
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool)
  }

  const handleDelete = () => {
    // TODO: Implement delete functionality in PR #5
    console.log('Delete selected objects')
  }

  const handleDuplicate = () => {
    // TODO: Implement duplicate functionality in PR #5
    console.log('Duplicate selected objects')
  }

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        canDelete={false} // Will be implemented in PR #5
        canDuplicate={false} // Will be implemented in PR #5
      />

      <div className="flex-1 relative">
        {canvasSize.width > 0 && canvasSize.height > 0 ? (
          <CanvasStage width={canvasSize.width} height={canvasSize.height} />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading canvas...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CanvasPage
