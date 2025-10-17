import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLangChainAgent } from '../useLangChainAgent'

// Mock the LangChain agent
vi.mock('../../lib/ai/langchain-agent', () => ({
  getLangChainAgent: vi.fn(() => ({
    processNaturalLanguage: vi.fn()
  }))
}))

describe('useLangChainAgent', () => {
  let queryClient: QueryClient
  let mockAgent: any

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })

    mockAgent = {
      processNaturalLanguage: vi.fn()
    }

    const { getLangChainAgent } = await import('../../lib/ai/langchain-agent')
    ;(getLangChainAgent as any).mockReturnValue(mockAgent)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should initialize with correct default state', () => {
    const { result } = renderHook(
      () => useLangChainAgent('test-canvas', 'test-user'),
      { wrapper }
    )

    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.lastResult).toBe(null)
    expect(typeof result.current.processNaturalLanguage).toBe('function')
  })

  it('should process natural language input successfully', async () => {
    const mockResult = {
      output: 'Created a blue rectangle',
      intermediateSteps: []
    }
    mockAgent.processNaturalLanguage.mockResolvedValue(mockResult)

    const { result } = renderHook(
      () => useLangChainAgent('test-canvas', 'test-user'),
      { wrapper }
    )

    await act(async () => {
      const response = await result.current.processNaturalLanguage(
        'Create a blue rectangle'
      )
      expect(response).toEqual(mockResult)
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.lastResult).toEqual(mockResult)
    })

    expect(mockAgent.processNaturalLanguage).toHaveBeenCalledWith(
      'test-canvas',
      'test-user',
      'Create a blue rectangle'
    )
  })

  it('should handle processing state correctly', async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    mockAgent.processNaturalLanguage.mockReturnValue(promise)

    const { result } = renderHook(
      () => useLangChainAgent('test-canvas', 'test-user'),
      { wrapper }
    )

    act(() => {
      result.current.processNaturalLanguage('Create a blue rectangle')
    })

    expect(result.current.isProcessing).toBe(true)
    expect(result.current.error).toBe(null)

    await act(async () => {
      resolvePromise!({ output: 'Success' })
      await promise
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
    })
  })

  it('should handle errors correctly', async () => {
    const mockError = new Error('Agent execution failed')
    mockAgent.processNaturalLanguage.mockRejectedValue(mockError)

    const { result } = renderHook(
      () => useLangChainAgent('test-canvas', 'test-user'),
      { wrapper }
    )

    await act(async () => {
      const response = await result.current.processNaturalLanguage(
        'Create a blue rectangle'
      )
      expect(response).toBe(null)
    })

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false)
      expect(result.current.error).toBe('Agent execution failed')
      expect(result.current.lastResult).toBe(null)
    })
  })

  it('should handle empty input', async () => {
    const { result } = renderHook(
      () => useLangChainAgent('test-canvas', 'test-user'),
      { wrapper }
    )

    await act(async () => {
      const response = await result.current.processNaturalLanguage('')
      expect(response).toBe(null)
    })

    expect(result.current.error).toBe('Input cannot be empty')
    expect(mockAgent.processNaturalLanguage).not.toHaveBeenCalled()
  })

  it('should handle whitespace-only input', async () => {
    const { result } = renderHook(
      () => useLangChainAgent('test-canvas', 'test-user'),
      { wrapper }
    )

    await act(async () => {
      const response = await result.current.processNaturalLanguage('   ')
      expect(response).toBe(null)
    })

    expect(result.current.error).toBe('Input cannot be empty')
    expect(mockAgent.processNaturalLanguage).not.toHaveBeenCalled()
  })

  it('should clear error state on new request', async () => {
    const { result } = renderHook(
      () => useLangChainAgent('test-canvas', 'test-user'),
      { wrapper }
    )

    // First request fails
    mockAgent.processNaturalLanguage.mockRejectedValueOnce(
      new Error('First error')
    )

    await act(async () => {
      await result.current.processNaturalLanguage('First request')
    })

    expect(result.current.error).toBe('First error')

    // Second request succeeds
    mockAgent.processNaturalLanguage.mockResolvedValueOnce({
      output: 'Success'
    })

    await act(async () => {
      await result.current.processNaturalLanguage('Second request')
    })

    await waitFor(() => {
      expect(result.current.error).toBe(null)
      expect(result.current.lastResult).toEqual({ output: 'Success' })
    })
  })

  it('should handle unknown error types', async () => {
    mockAgent.processNaturalLanguage.mockRejectedValue('Unknown error')

    const { result } = renderHook(
      () => useLangChainAgent('test-canvas', 'test-user'),
      { wrapper }
    )

    await act(async () => {
      await result.current.processNaturalLanguage('Create a blue rectangle')
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Unknown error occurred')
    })
  })
})
