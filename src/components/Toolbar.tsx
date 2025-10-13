import React from 'react'

export type ToolType = 'select' | 'rectangle' | 'circle' | 'text'

interface ToolbarProps {
  selectedTool: ToolType
  onToolSelect: (tool: ToolType) => void
  onDelete: () => void
  onDuplicate: () => void
  canDelete: boolean
  canDuplicate: boolean
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  onDelete,
  onDuplicate,
  canDelete,
  canDuplicate
}) => {
  const tools: { type: ToolType; label: string; icon: string }[] = [
    { type: 'select', label: 'Select', icon: '↖' },
    { type: 'rectangle', label: 'Rectangle', icon: '▭' },
    { type: 'circle', label: 'Circle', icon: '○' },
    { type: 'text', label: 'Text', icon: 'T' }
  ]

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
      {/* Shape Tools */}
      <div className="flex items-center gap-2">
        {tools.map(tool => (
          <button
            key={tool.type}
            onClick={() => onToolSelect(tool.type)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${
                selectedTool === tool.type
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }
            `}
            title={tool.label}
          >
            <span className="mr-2">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Action Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onDuplicate}
          disabled={!canDuplicate}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${
              canDuplicate
                ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            }
          `}
          title="Duplicate (⌘D)"
        >
          <span className="mr-2">⧉</span>
          Duplicate
        </button>

        <button
          onClick={onDelete}
          disabled={!canDelete}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${
              canDelete
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            }
          `}
          title="Delete (Del)"
        >
          <span className="mr-2">🗑</span>
          Delete
        </button>
      </div>

      {/* Tool Info */}
      <div className="ml-auto text-sm text-gray-500">
        {selectedTool === 'select' && 'Click and drag to select objects'}
        {selectedTool === 'rectangle' && 'Click and drag to create rectangle'}
        {selectedTool === 'circle' && 'Click and drag to create circle'}
        {selectedTool === 'text' && 'Click to add text'}
      </div>
    </div>
  )
}

export default Toolbar
