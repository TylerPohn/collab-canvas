// AI Agent API Layer - Main exports
export { AIAgentService } from './agent'
export { AIContextManager, getAIContextManager } from './context'
export {
  aiRateLimiter,
  sanitizeTextInput,
  validateAIParameters
} from './security'
export { AIToolSchemas, createAITools } from './tools'
export { validateAICommand } from './validation'

// Types
export type {
  AICanvasState,
  AICommand,
  AIContext,
  AIOperation,
  AIValidationResult,
  FormStyling,
  NavStyling,
  ShapeOptions
} from './types'

// React Hook
export { useAIAgent } from '../../hooks/useAIAgent'
