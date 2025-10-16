import type { AIContext, AIOperation } from './types'

export class AIContextManager {
  private contexts: Map<string, AIContext> = new Map()
  private readonly MAX_CONTEXT_AGE = 30 * 60 * 1000 // 30 minutes

  // Get or create context for a user session
  async getContext(canvasId: string, userId: string): Promise<AIContext> {
    const contextKey = `${canvasId}-${userId}`

    let context = this.contexts.get(contextKey)

    if (!context || this.isContextExpired(context)) {
      context = await this.createNewContext(canvasId, userId)
      this.contexts.set(contextKey, context)
    }

    return context
  }

  // Update context with new operation
  updateContext(
    canvasId: string,
    userId: string,
    operation: AIOperation
  ): void {
    const contextKey = `${canvasId}-${userId}`
    const context = this.contexts.get(contextKey)

    if (context) {
      context.operations.push(operation)
      context.currentState = this.updateCurrentState(context, operation)
    }
  }

  // Clear expired contexts
  cleanupExpiredContexts(): void {
    const now = Date.now()

    for (const [key, context] of this.contexts.entries()) {
      if (context.operations.length > 0) {
        const oldestOperation = context.operations[0]
        if (now - oldestOperation.timestamp > this.MAX_CONTEXT_AGE) {
          this.contexts.delete(key)
        }
      } else {
        // Remove contexts with no operations that are older than 5 minutes
        const contextAge =
          now - parseInt(context.sessionId.split('-').pop() || '0')
        if (contextAge > 5 * 60 * 1000) {
          this.contexts.delete(key)
        }
      }
    }
  }

  // Get context for a specific session
  getContextBySession(sessionId: string): AIContext | null {
    for (const context of this.contexts.values()) {
      if (context.sessionId === sessionId) {
        return context
      }
    }
    return null
  }

  // Clear context for a specific user
  clearUserContext(canvasId: string, userId: string): void {
    const contextKey = `${canvasId}-${userId}`
    this.contexts.delete(contextKey)
  }

  // Get all active contexts (for debugging/monitoring)
  getAllContexts(): AIContext[] {
    return Array.from(this.contexts.values())
  }

  private async createNewContext(
    canvasId: string,
    userId: string
  ): Promise<AIContext> {
    // This would fetch current canvas state
    const currentState = {
      shapes: [],
      viewport: { x: 0, y: 0, scale: 1 }
    }

    return {
      canvasId,
      userId,
      sessionId: `${canvasId}-${userId}-${Date.now()}`,
      operations: [],
      currentState
    }
  }

  private isContextExpired(context: AIContext): boolean {
    if (context.operations.length === 0) return false

    const oldestOperation = context.operations[0]
    return Date.now() - oldestOperation.timestamp > this.MAX_CONTEXT_AGE
  }

  private updateCurrentState(
    context: AIContext,
    operation: AIOperation
  ): AIContext['currentState'] {
    // Update the current state based on the operation
    // This is a simplified version - real implementation would be more complex

    // For now, just return the current state
    // In a real implementation, we would:
    // 1. Parse the operation type and parameters
    // 2. Apply the operation to the current state
    // 3. Update shapes, viewport, etc. accordingly

    return context.currentState
  }
}

// Export singleton instance
let contextManager: AIContextManager | null = null

export function getAIContextManager(): AIContextManager {
  if (!contextManager) {
    contextManager = new AIContextManager()

    // Set up periodic cleanup
    setInterval(
      () => {
        contextManager?.cleanupExpiredContexts()
      },
      5 * 60 * 1000
    ) // Clean up every 5 minutes
  }
  return contextManager
}
