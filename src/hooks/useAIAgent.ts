import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { AIAgentService } from '../lib/ai/agent'
import type { AICommand } from '../lib/ai/types'

export function useAIAgent(canvasId: string, userId: string) {
  const queryClient = useQueryClient()
  const [isExecuting, setIsExecuting] = useState(false)
  const [lastCommand, setLastCommand] = useState<AICommand | null>(null)
  const [error, setError] = useState<string | null>(null)

  const aiAgent = new AIAgentService(queryClient)

  const executeCommand = useCallback(
    async (command: string, parameters: Record<string, any>) => {
      setIsExecuting(true)
      setError(null)
      try {
        const result = await aiAgent.executeCommand(
          canvasId,
          userId,
          command,
          parameters
        )
        setLastCommand(result)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        throw err
      } finally {
        setIsExecuting(false)
      }
    },
    [aiAgent, canvasId, userId]
  )

  const executeComplexCommand = useCallback(
    async (command: string, parameters: Record<string, any>) => {
      setIsExecuting(true)
      setError(null)
      try {
        const result = await aiAgent.executeComplexCommand(
          canvasId,
          userId,
          command,
          parameters
        )
        setLastCommand(result)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        throw err
      } finally {
        setIsExecuting(false)
      }
    },
    [aiAgent, canvasId, userId]
  )

  const getCanvasState = useCallback(async () => {
    try {
      return await aiAgent.getCanvasState(canvasId, userId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    }
  }, [aiAgent, canvasId, userId])

  const processNaturalLanguage = useCallback(
    async (userInput: string) => {
      setIsExecuting(true)
      setError(null)
      try {
        const result = await aiAgent.processNaturalLanguage(
          canvasId,
          userId,
          userInput
        )
        setLastCommand(result)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        throw err
      } finally {
        setIsExecuting(false)
      }
    },
    [aiAgent, canvasId, userId]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearLastCommand = useCallback(() => {
    setLastCommand(null)
  }, [])

  return {
    executeCommand,
    executeComplexCommand,
    getCanvasState,
    processNaturalLanguage,
    isExecuting,
    lastCommand,
    error,
    clearError,
    clearLastCommand
  }
}
