import { z } from 'zod'
import { AIToolSchemas } from './tools'
import type { AIValidationResult } from './types'

export async function validateAICommand(
  command: string,
  parameters: Record<string, any>
): Promise<AIValidationResult> {
  try {
    // Map command string to schema
    const schema = getSchemaForCommand(command)
    if (!schema) {
      return {
        valid: false,
        error: `Unknown command: ${command}`
      }
    }

    // Validate parameters
    const result = schema.safeParse(parameters)
    if (!result.success) {
      return {
        valid: false,
        error: `Invalid parameters: ${result.error.message}`
      }
    }

    // Sanitize parameters
    const sanitizedParams = sanitizeParameters(result.data)

    return {
      valid: true,
      sanitizedParams
    }
  } catch (error) {
    return {
      valid: false,
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

function getSchemaForCommand(command: string): z.ZodSchema | null {
  const commandMap: Record<string, keyof typeof AIToolSchemas> = {
    createShape: 'createShape',
    createText: 'createText',
    moveShape: 'moveShape',
    moveShapeByOthers: 'moveShapeByOthers',
    resizeShape: 'resizeShape',
    resizeLarger: 'resizeLarger',
    resizeSmaller: 'resizeSmaller',
    rotateShape: 'rotateShape',
    rotateShapeClockwise: 'rotateShapeClockwise',
    rotateShapeCounterclockwise: 'rotateShapeCounterclockwise',
    arrangeInGrid: 'arrangeInGrid',
    arrangeInRow: 'arrangeInRow',
    spaceEvenly: 'spaceEvenly',
    deleteAllShapes: 'deleteAllShapes',
    createLoginForm: 'createLoginForm',
    createNavigationBar: 'createNavigationBar',
    createCardLayout: 'createCardLayout',
    getCanvasState: 'getCanvasState',
    findShapes: 'findShapes'
  }

  const schemaKey = commandMap[command]
  return schemaKey ? AIToolSchemas[schemaKey] : null
}

function sanitizeParameters(params: any): any {
  // Implement parameter sanitization
  // - Trim strings
  // - Clamp numeric values to valid ranges
  // - Remove potentially dangerous content

  if (typeof params === 'object' && params !== null) {
    const sanitized: any = {}

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        // Trim strings and limit length
        sanitized[key] = value.trim().slice(0, 1000)
      } else if (typeof value === 'number') {
        // Clamp numeric values to reasonable ranges
        if (key.includes('x') || key.includes('y')) {
          sanitized[key] = Math.max(0, Math.min(10000, value))
        } else if (key.includes('width') || key.includes('height')) {
          sanitized[key] = Math.max(1, Math.min(5000, value))
        } else if (key.includes('radius')) {
          sanitized[key] = Math.max(1, Math.min(1000, value))
        } else if (key.includes('fontSize')) {
          sanitized[key] = Math.max(8, Math.min(72, value))
        } else if (key.includes('degrees')) {
          sanitized[key] = Math.max(-360, Math.min(360, value))
        } else {
          sanitized[key] = value
        }
      } else if (Array.isArray(value)) {
        // Sanitize array elements
        sanitized[key] = value.map(item =>
          typeof item === 'string' ? item.trim().slice(0, 100) : item
        )
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  return params
}
