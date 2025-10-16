import React, { useState } from 'react'
import { useAIAgent } from '../hooks/useAIAgent'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'

interface AIAgentDemoProps {
  canvasId: string
}

const AIAgentDemo: React.FC<AIAgentDemoProps> = ({ canvasId }) => {
  const { user } = useAuth()
  const {
    executeCommand,
    executeComplexCommand,
    isExecuting,
    error,
    lastCommand
  } = useAIAgent(canvasId, user?.uid || '')

  const [command, setCommand] = useState('')
  const [parameters, setParameters] = useState('')

  const handleSimpleCommand = async () => {
    if (!command) return

    try {
      console.log('🤖 AI Command Debug:', {
        command,
        parameters,
        canvasId,
        userId: user?.uid
      })

      let parsedParams = {}
      if (parameters.trim()) {
        parsedParams = JSON.parse(parameters)
      }

      console.log('🤖 Parsed parameters:', parsedParams)

      const result = await executeCommand(command, parsedParams)
      console.log('🤖 Command result:', result)

      setCommand('')
      setParameters('')
    } catch (err) {
      console.error('❌ Failed to execute command:', err)
    }
  }

  const handleComplexCommand = async () => {
    if (!command) return

    try {
      let parsedParams = {}
      if (parameters.trim()) {
        parsedParams = JSON.parse(parameters)
      }

      await executeComplexCommand(command, parsedParams)
      setCommand('')
      setParameters('')
    } catch (err) {
      console.error('Failed to execute complex command:', err)
    }
  }

  const exampleCommands = [
    {
      name: 'Create Rectangle',
      command: 'createShape',
      params: {
        type: 'rect',
        position: { x: 100, y: 100 },
        size: { width: 150, height: 80 },
        fill: '#3B82F6'
      }
    },
    {
      name: 'Create Circle',
      command: 'createShape',
      params: {
        type: 'circle',
        position: { x: 200, y: 200 },
        radius: 50,
        fill: '#EF4444'
      }
    },
    {
      name: 'Create Text',
      command: 'createText',
      params: {
        text: 'Hello AI!',
        position: { x: 300, y: 300 },
        fontSize: 24,
        fill: '#059669'
      }
    },
    {
      name: 'Create Login Form',
      command: 'createLoginForm',
      params: { position: { x: 400, y: 100 } }
    },
    {
      name: 'Create Navigation Bar',
      command: 'createNavigationBar',
      params: {
        items: [{ label: 'Home' }, { label: 'About' }, { label: 'Contact' }],
        position: { x: 50, y: 50 }
      }
    }
  ]

  const handleExampleCommand = (example: (typeof exampleCommands)[0]) => {
    setCommand(example.command)
    setParameters(JSON.stringify(example.params, null, 2))
  }

  if (!user) {
    return (
      <Card className="p-4">
        <p className="text-sm text-gray-600">
          Please log in to use AI agent features.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">AI Agent Demo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Test the AI agent with various commands. The AI can create shapes,
          forms, and layouts.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}

      {lastCommand && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">
            Last command executed: {lastCommand.description}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Command</label>
          <Input
            value={command}
            onChange={e => setCommand(e.target.value)}
            placeholder="e.g., createShape, createText, createLoginForm"
            disabled={isExecuting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Parameters (JSON)
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md text-sm font-mono"
            value={parameters}
            onChange={e => setParameters(e.target.value)}
            placeholder='{"type": "rect", "position": {"x": 100, "y": 100}}'
            rows={4}
            disabled={isExecuting}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSimpleCommand}
            disabled={isExecuting || !command}
            className="flex-1"
          >
            {isExecuting ? 'Executing...' : 'Execute Command'}
          </Button>
          <Button
            onClick={handleComplexCommand}
            disabled={isExecuting || !command}
            variant="outline"
            className="flex-1"
          >
            Execute Complex
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Example Commands</h4>
        <div className="grid grid-cols-1 gap-2">
          {exampleCommands.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleExampleCommand(example)}
              disabled={isExecuting}
              className="justify-start text-left"
            >
              {example.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <strong>Available Commands:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>createShape - Create rectangles, circles, or text</li>
          <li>moveShape - Move shapes to new positions</li>
          <li>resizeShape - Resize shapes</li>
          <li>rotateShape - Rotate shapes</li>
          <li>arrangeInGrid - Arrange shapes in a grid</li>
          <li>arrangeInRow - Arrange shapes in a row</li>
          <li>createLoginForm - Create a login form</li>
          <li>createNavigationBar - Create a navigation bar</li>
          <li>getCanvasState - Get current canvas state</li>
          <li>findShapes - Find shapes by criteria</li>
        </ul>
      </div>
    </Card>
  )
}

export default AIAgentDemo
