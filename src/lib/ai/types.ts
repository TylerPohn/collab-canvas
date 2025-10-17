import type { Shape, ViewportState } from '../types'

export interface AICommand {
  id: string
  type: 'create' | 'manipulate' | 'layout' | 'complex'
  description: string
  parameters: Record<string, any>
  timestamp: number
  userId: string
}

export interface AICommandResult {
  command: AICommand
  result: any
}

export interface AIOperation {
  id: string
  commandId: string
  type: string
  parameters: Record<string, any>
  status: 'pending' | 'executing' | 'completed' | 'failed'
  result?: any
  error?: string
  timestamp: number
}

export interface AIContext {
  canvasId: string
  userId: string
  sessionId: string
  operations: AIOperation[]
  currentState: {
    shapes: Shape[]
    viewport: ViewportState
  }
}

export interface ShapeOptions {
  fill?: string
  stroke?: string
  strokeWidth?: number
  rotation?: number
  cornerRadius?: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number
  zIndex?: number
}

export interface FormStyling {
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  borderWidth?: number
  borderRadius?: number
  padding?: number
}

export interface NavStyling {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  padding?: number
}

export interface AIValidationResult {
  valid: boolean
  error?: string
  sanitizedParams?: any
}

export interface AICanvasState {
  shapes: Shape[]
  viewport: ViewportState
  metadata: {
    totalShapes: number
    lastUpdated: number
    canvasSize: { width: number; height: number }
  }
}
