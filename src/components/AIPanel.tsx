import React, { useState } from 'react'
import { useAIAgent } from '../hooks/useAIAgent'
import { useAuth } from '../hooks/useAuth'

interface AIPanelProps {
  canvasId: string
  isOpen: boolean
  onClose: () => void
}

const AIPanel: React.FC<AIPanelProps> = ({ canvasId, isOpen, onClose }) => {
  const { user } = useAuth()
  const {
    executeCommand,
    executeComplexCommand,
    processNaturalLanguage,
    isExecuting,
    error,
    lastCommand
  } = useAIAgent(canvasId, user?.uid || '')

  const [lastResult, setLastResult] = useState<string | null>(null)

  const handleExecuteCommand = async (command: string, parameters: any) => {
    setLastResult(null)

    try {
      console.log('🤖 AI Command:', {
        command,
        parameters,
        canvasId,
        userId: user?.uid
      })

      // Use the real AI agent to execute the command
      const result = await executeCommand(command, parameters)

      console.log('🤖 AI Agent returned:', result)

      if (result && result.id) {
        const successMessage = `✅ Successfully executed ${command} with parameters: ${JSON.stringify(parameters)}`
        setLastResult(successMessage)
      } else {
        setLastResult(
          `⚠️ Command executed but unexpected result: ${JSON.stringify(result)}`
        )
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Command failed:', errorMessage)
      setLastResult(`❌ Error: ${errorMessage}`)
    }
  }

  const handleNaturalLanguage = async (userInput: string) => {
    setLastResult(null)

    try {
      console.log('🤖 Natural Language Input:', {
        userInput,
        canvasId,
        userId: user?.uid
      })

      // Use OpenAI to process natural language
      const result = await processNaturalLanguage(userInput)

      const successMessage = `✅ AI understood: "${userInput}" and executed: ${result.description}`
      setLastResult(successMessage)
      console.log('🤖 Natural language result:', result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Natural language processing failed:', errorMessage)
      setLastResult(`❌ Error: ${errorMessage}`)
    }
  }

  const sampleCommands = [
    {
      name: 'Create Rectangle',
      command: 'createShape',
      parameters: {
        type: 'rect',
        position: { x: 100, y: 100 },
        size: { width: 150, height: 80 },
        fill: '#3B82F6'
      }
    },
    {
      name: 'Create Circle',
      command: 'createShape',
      parameters: {
        type: 'circle',
        position: { x: 300, y: 200 },
        radius: 50,
        fill: '#10B981'
      }
    },
    {
      name: 'Create Text',
      command: 'createText',
      parameters: {
        text: 'Hello AI!',
        position: { x: 200, y: 300 },
        fontSize: 24,
        fill: '#F59E0B'
      }
    },
    {
      name: 'Create Login Form',
      command: 'createLoginForm',
      parameters: {
        position: { x: 400, y: 100 }
      }
    },
    {
      name: 'Create Navigation Bar',
      command: 'createNavigationBar',
      parameters: {
        items: [{ label: 'Home' }, { label: 'About' }, { label: 'Contact' }],
        position: { x: 50, y: 50 }
      }
    },
    {
      name: 'Get Canvas State',
      command: 'getCanvasState',
      parameters: {
        includeShapes: true,
        includeViewport: true
      }
    }
  ]

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '20px',
        width: '400px',
        maxHeight: 'calc(100vh - 100px)',
        backgroundColor: 'white',
        border: '2px solid #3B82F6',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        padding: '20px',
        overflowY: 'auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '1px solid #E5E7EB'
        }}
      >
        <h2
          style={{
            margin: 0,
            color: '#1F2937',
            fontSize: '18px',
            fontWeight: '600'
          }}
        >
          🤖 AI Agent
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6B7280',
            padding: '4px'
          }}
        >
          ×
        </button>
      </div>

      {/* Status */}
      {isExecuting && (
        <div
          style={{
            backgroundColor: '#DBEAFE',
            color: '#1E40AF',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}
        >
          ⏳ Executing AI command...
        </div>
      )}

      {(error || lastResult?.includes('❌')) && (
        <div
          style={{
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}
        >
          ❌ Error: {error || lastResult}
        </div>
      )}

      {lastResult && !lastResult.includes('❌') && (
        <div
          style={{
            backgroundColor: '#D1FAE5',
            color: '#065F46',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}
        >
          {lastResult}
        </div>
      )}

      {/* Sample Commands */}
      <div style={{ marginBottom: '16px' }}>
        <h3
          style={{
            margin: '0 0 12px 0',
            color: '#374151',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Sample Commands
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sampleCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleExecuteCommand(cmd.command, cmd.parameters)}
              disabled={isExecuting}
              style={{
                backgroundColor: isExecuting ? '#F3F4F6' : '#3B82F6',
                color: isExecuting ? '#9CA3AF' : 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isExecuting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={e => {
                if (!isExecuting) {
                  e.currentTarget.style.backgroundColor = '#2563EB'
                }
              }}
              onMouseLeave={e => {
                if (!isExecuting) {
                  e.currentTarget.style.backgroundColor = '#3B82F6'
                }
              }}
            >
              {cmd.name}
            </button>
          ))}
        </div>
      </div>

      {/* Natural Language Input */}
      <div style={{ marginBottom: '16px' }}>
        <h3
          style={{
            margin: '0 0 12px 0',
            color: '#374151',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Natural Language
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            placeholder="Tell the AI what you want (e.g., 'create a blue rectangle')"
            style={{
              padding: '10px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                const input = e.currentTarget.value
                if (input) {
                  handleNaturalLanguage(input)
                  e.currentTarget.value = ''
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector(
                'input[placeholder*="Tell the AI"]'
              ) as HTMLInputElement
              if (input?.value) {
                handleNaturalLanguage(input.value)
                input.value = ''
              }
            }}
            disabled={isExecuting}
            style={{
              backgroundColor: isExecuting ? '#F3F4F6' : '#8B5CF6',
              color: isExecuting ? '#9CA3AF' : 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isExecuting ? 'not-allowed' : 'pointer'
            }}
          >
            Ask AI
          </button>
        </div>
      </div>

      {/* Manual Command Input */}
      <div style={{ marginBottom: '16px' }}>
        <h3
          style={{
            margin: '0 0 12px 0',
            color: '#374151',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Manual Command
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            placeholder="Command (e.g., createShape)"
            style={{
              padding: '10px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                const command = e.currentTarget.value
                if (command) {
                  handleExecuteCommand(command, {})
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector(
                'input[placeholder*="Command"]'
              ) as HTMLInputElement
              if (input?.value) {
                handleExecuteCommand(input.value, {})
                input.value = ''
              }
            }}
            disabled={isExecuting}
            style={{
              backgroundColor: isExecuting ? '#F3F4F6' : '#10B981',
              color: isExecuting ? '#9CA3AF' : 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isExecuting ? 'not-allowed' : 'pointer'
            }}
          >
            Execute Command
          </button>
        </div>
      </div>

      {/* Info */}
      <div
        style={{
          backgroundColor: '#F9FAFB',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6B7280',
          lineHeight: '1.4'
        }}
      >
        <strong>💡 Tips:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
          <li>Use natural language: "create a blue rectangle"</li>
          <li>Click sample buttons for quick commands</li>
          <li>Check browser console for detailed logs</li>
          <li>Commands will create shapes on the canvas</li>
          <li>All operations sync in real-time</li>
        </ul>
      </div>
    </div>
  )
}

export default AIPanel
