import { ThemeProvider, createTheme } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LangChainAIPanel from '../LangChainAIPanel'

// Mock the hooks
vi.mock('../../hooks/useLangChainAgent', () => ({
  useLangChainAgent: vi.fn()
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

describe('LangChainAIPanel', () => {
  let queryClient: QueryClient
  let mockProcessNaturalLanguage: any

  const theme = createTheme()

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })

    mockProcessNaturalLanguage = vi.fn()

    const { useAuth } = await import('../../hooks/useAuth')
    const { useLangChainAgent } = await import('../../hooks/useLangChainAgent')

    ;(useAuth as any).mockReturnValue({
      user: { uid: 'test-user' }
    })
    ;(useLangChainAgent as any).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      isProcessing: false,
      error: null
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = (props = {}) => {
    const defaultProps = {
      canvasId: 'test-canvas',
      isOpen: true,
      onClose: vi.fn(),
      ...props
    }

    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LangChainAIPanel {...defaultProps} />
        </ThemeProvider>
      </QueryClientProvider>
    )
  }

  it('should render when open', () => {
    renderComponent()

    expect(screen.getByText('LangChain AI')).toBeInTheDocument()
    expect(screen.getByText('v2.0')).toBeInTheDocument()
    expect(screen.getByText('Natural Language Commands')).toBeInTheDocument()
    expect(screen.getByText('Example Prompts')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    renderComponent({ isOpen: false })

    expect(screen.queryByText('LangChain AI')).not.toBeInTheDocument()
  })

  it('should display processing state', async () => {
    const { useLangChainAgent } = await import('../../hooks/useLangChainAgent')
    ;(useLangChainAgent as any).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      isProcessing: true,
      error: null
    })

    renderComponent()

    expect(
      screen.getByText('LangChain agent is thinking...')
    ).toBeInTheDocument()
  })

  it('should display error state', async () => {
    const { useLangChainAgent } = await import('../../hooks/useLangChainAgent')
    ;(useLangChainAgent as any).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      isProcessing: false,
      error: 'Test error message'
    })

    renderComponent()

    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should handle natural language input', async () => {
    mockProcessNaturalLanguage.mockResolvedValue({
      output: 'Created a blue rectangle'
    })

    renderComponent()

    const input = screen.getByPlaceholderText(
      /Tell the AI what you want to create/
    )
    const sendButton = screen.getByText('Send to AI Agent')

    fireEvent.change(input, { target: { value: 'Create a blue rectangle' } })
    fireEvent.click(sendButton)

    expect(mockProcessNaturalLanguage).toHaveBeenCalledWith(
      'Create a blue rectangle'
    )
  })

  it('should handle Enter key press', async () => {
    mockProcessNaturalLanguage.mockResolvedValue({
      output: 'Created a blue rectangle'
    })

    renderComponent()

    const input = screen.getByPlaceholderText(
      /Tell the AI what you want to create/
    )

    fireEvent.change(input, { target: { value: 'Create a blue rectangle' } })
    fireEvent.keyPress(input, { key: 'Enter', ctrlKey: true })

    expect(mockProcessNaturalLanguage).toHaveBeenCalledWith(
      'Create a blue rectangle'
    )
  })

  it('should not send empty input', () => {
    renderComponent()

    const sendButton = screen.getByText('Send to AI Agent')
    expect(sendButton).toBeDisabled()
  })

  it('should disable input when processing', async () => {
    const { useLangChainAgent } = await import('../../hooks/useLangChainAgent')
    ;(useLangChainAgent as any).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      isProcessing: true,
      error: null
    })

    renderComponent()

    const input = screen.getByPlaceholderText(
      /Tell the AI what you want to create/
    )
    const sendButton = screen.getByText('Send to AI Agent')

    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('should display example prompts', () => {
    renderComponent()

    expect(
      screen.getByText('Create a blue rectangle in the center of the canvas')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Add a green circle next to the rectangle')
    ).toBeInTheDocument()
    expect(
      screen.getByText("Create some text that says 'Hello World'")
    ).toBeInTheDocument()
  })

  it('should populate input when example prompt is clicked', () => {
    renderComponent()

    const examplePrompt = screen.getByText(
      'Create a blue rectangle in the center of the canvas'
    )
    fireEvent.click(examplePrompt)

    const input = screen.getByPlaceholderText(
      /Tell the AI what you want to create/
    )
    expect(input).toHaveValue(
      'Create a blue rectangle in the center of the canvas'
    )
  })

  it('should close panel when close button is clicked', () => {
    const mockOnClose = vi.fn()
    renderComponent({ onClose: mockOnClose })

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should display conversation history', async () => {
    mockProcessNaturalLanguage.mockResolvedValue({
      output: 'Created a blue rectangle'
    })

    renderComponent()

    const input = screen.getByPlaceholderText(
      /Tell the AI what you want to create/
    )
    const sendButton = screen.getByText('Send to AI Agent')

    fireEvent.change(input, { target: { value: 'Create a blue rectangle' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Create a blue rectangle')).toBeInTheDocument()
    })
  })

  it('should display tips section', () => {
    renderComponent()

    expect(screen.getByText('LangChain AI Tips')).toBeInTheDocument()
    expect(
      screen.getByText(
        /This AI uses LangChain for better natural language understanding/
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(/The agent can reason about complex multi-step tasks/)
    ).toBeInTheDocument()
  })
})
