import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { getLangChainAgent } from '../lib/ai/langchain-agent'

export interface UseLangChainAgentReturn {
  processNaturalLanguage: (input: string) => Promise<any>
  isProcessing: boolean
  error: string | null
  lastResult: any
}

export function useLangChainAgent(
  canvasId: string,
  userId: string
): UseLangChainAgentReturn {
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)

  const processNaturalLanguage = useCallback(
    async (input: string) => {
      if (!input.trim()) {
        setError('Input cannot be empty')
        return null
      }

      setIsProcessing(true)
      setError(null)

      try {
        const agent = getLangChainAgent(queryClient)
        const result = await agent.processNaturalLanguage(
          canvasId,
          userId,
          input
        )

        setLastResult(result)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        console.error('LangChain Agent error:', err)
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [canvasId, userId, queryClient]
  )

  return {
    processNaturalLanguage,
    isProcessing,
    error,
    lastResult
  }
}
