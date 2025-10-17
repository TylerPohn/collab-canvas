import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { AIAgentService } from '../lib/ai/agent'
import type { AICommand } from '../lib/ai/types'
import { useAIExecutionState } from './useAIExecutionState'

interface CommandParameters {
  [key: string]: string | number | boolean | object | undefined
}

export function useAIAgent(canvasId: string, userId: string) {
  const queryClient = useQueryClient()
  const { isExecuting, setIsExecuting } = useAIExecutionState()
  const [lastCommand, setLastCommand] = useState<AICommand | null>(null)
  const [error, setError] = useState<string | null>(null)

  const aiAgent = useMemo(() => new AIAgentService(queryClient), [queryClient])

  const executeCommand = useCallback(
    async (command: string, parameters: CommandParameters) => {
      setIsExecuting(true)
      setError(null)
      try {
        const result = await aiAgent.executeCommand(
          canvasId,
          userId,
          command,
          parameters
        )
        setLastCommand(result.command)
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
    [aiAgent, canvasId, userId, setIsExecuting]
  )

  const executeComplexCommand = useCallback(
    async (command: string, parameters: CommandParameters) => {
      setIsExecuting(true)
      setError(null)
      try {
        const result = await aiAgent.executeComplexCommand(
          canvasId,
          userId,
          command,
          parameters
        )
        setLastCommand(result.command)
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
    [aiAgent, canvasId, userId, setIsExecuting]
  )

  const getCanvasState = useCallback(async () => {
    try {
      return await aiAgent.getCanvasState(canvasId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    }
  }, [aiAgent, canvasId])

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
    [aiAgent, canvasId, userId, setIsExecuting]
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
