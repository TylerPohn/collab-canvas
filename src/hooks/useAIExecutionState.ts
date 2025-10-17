import { create } from 'zustand'

interface AIExecutionState {
  isExecuting: boolean
  setIsExecuting: (executing: boolean) => void
}

// Global store for AI execution state
export const useAIExecutionStore = create<AIExecutionState>(set => ({
  isExecuting: false,
  setIsExecuting: (executing: boolean) => set({ isExecuting: executing })
}))

// Hook to access the global AI execution state
export const useAIExecutionState = () => {
  const { isExecuting, setIsExecuting } = useAIExecutionStore()
  return { isExecuting, setIsExecuting }
}
