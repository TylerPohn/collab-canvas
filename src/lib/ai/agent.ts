import { getObjectSyncService } from '../sync/objects'
import type { ViewportState } from '../types'
import { getAIContextManager } from './context'
import { openaiService } from './openai'
import { aiRateLimiter, validateAIParameters } from './security'
import { createAITools } from './tools'
import type { AICanvasState, AICommand, AIContext, AIOperation } from './types'
import { validateAICommand } from './validation'

export class AIAgentService {
  private objectSync: any
  private contextManager = getAIContextManager()
  private aiTools: any

  constructor(queryClient: any) {
    this.objectSync = getObjectSyncService(queryClient)
    this.aiTools = createAITools(queryClient)
  }

  // Main entry point for AI commands
  async executeCommand(
    canvasId: string,
    userId: string,
    command: string,
    parameters: Record<string, any>
  ): Promise<AICommand> {
    console.log('🤖 AIAgentService.executeCommand called:', {
      canvasId,
      userId,
      command,
      parameters
    })

    // Check rate limiting
    if (!aiRateLimiter.isAllowed(userId)) {
      throw new Error('Rate limit exceeded. Please slow down your AI requests.')
    }

    // Validate parameters for security
    if (!validateAIParameters(parameters)) {
      throw new Error('Invalid or potentially dangerous parameters detected.')
    }

    const context = await this.getOrCreateContext(canvasId, userId)

    // Validate command
    const validationResult = await validateAICommand(command, parameters)
    if (!validationResult.valid) {
      throw new Error(`Invalid command: ${validationResult.error}`)
    }

    // Use sanitized parameters
    const sanitizedParams = validationResult.sanitizedParams || parameters

    // Create command record
    const aiCommand: AICommand = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: this.determineCommandType(command),
      description: command,
      parameters: sanitizedParams,
      timestamp: Date.now(),
      userId
    }

    // Execute command
    await this.executeCommandWithContext(aiCommand, context)

    // Record the request for rate limiting
    aiRateLimiter.recordRequest(userId)

    return aiCommand
  }

  // Execute multi-step complex commands
  async executeComplexCommand(
    canvasId: string,
    userId: string,
    command: string,
    parameters: Record<string, any>
  ): Promise<AICommand> {
    // Check rate limiting
    if (!aiRateLimiter.isAllowed(userId)) {
      throw new Error('Rate limit exceeded. Please slow down your AI requests.')
    }

    const context = await this.getOrCreateContext(canvasId, userId)

    // Parse complex command into steps
    const steps = await this.parseComplexCommand(command, parameters)

    // Execute steps sequentially
    for (const step of steps) {
      await this.executeOperation(step, context)
    }

    // Record the request for rate limiting
    aiRateLimiter.recordRequest(userId)

    return {
      id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'complex',
      description: command,
      parameters,
      timestamp: Date.now(),
      userId
    }
  }

  // Get current canvas state for AI context
  async getCanvasState(canvasId: string): Promise<AICanvasState> {
    const shapes = await this.objectSync.getAllObjects(canvasId)
    // Get viewport from context or default
    const viewport: ViewportState = { x: 0, y: 0, scale: 1 }

    return {
      shapes,
      viewport,
      metadata: {
        totalShapes: shapes.length,
        lastUpdated: Date.now(),
        canvasSize: { width: 1920, height: 1080 } // Default canvas size
      }
    }
  }

  private async getOrCreateContext(
    canvasId: string,
    userId: string
  ): Promise<AIContext> {
    return await this.contextManager.getContext(canvasId, userId)
  }

  private determineCommandType(command: string): AICommand['type'] {
    const manipulateKeywords = ['move', 'resize', 'rotate', 'change']
    const layoutKeywords = ['arrange', 'align', 'space', 'grid', 'row']
    const complexKeywords = ['form', 'navigation', 'layout', 'design']

    const lowerCommand = command.toLowerCase()

    if (complexKeywords.some(keyword => lowerCommand.includes(keyword))) {
      return 'complex'
    } else if (layoutKeywords.some(keyword => lowerCommand.includes(keyword))) {
      return 'layout'
    } else if (
      manipulateKeywords.some(keyword => lowerCommand.includes(keyword))
    ) {
      return 'manipulate'
    } else {
      return 'create'
    }
  }

  private async parseComplexCommand(
    command: string,
    parameters: Record<string, any>
  ): Promise<AIOperation[]> {
    // This will be implemented to parse complex commands into steps
    // For now, return a simple operation based on command type

    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes('login form')) {
      return [
        {
          id: `op-${Date.now()}-1`,
          commandId: `cmd-${Date.now()}`,
          type: 'createLoginForm',
          parameters,
          status: 'pending',
          timestamp: Date.now()
        }
      ]
    } else if (
      lowerCommand.includes('navigation') ||
      lowerCommand.includes('nav')
    ) {
      return [
        {
          id: `op-${Date.now()}-1`,
          commandId: `cmd-${Date.now()}`,
          type: 'createNavigationBar',
          parameters,
          status: 'pending',
          timestamp: Date.now()
        }
      ]
    } else {
      // Default to simple create operation
      return [
        {
          id: `op-${Date.now()}`,
          commandId: `cmd-${Date.now()}`,
          type: 'create',
          parameters,
          status: 'pending',
          timestamp: Date.now()
        }
      ]
    }
  }

  private async executeCommandWithContext(
    command: AICommand,
    context: AIContext
  ): Promise<void> {
    console.log('🤖 executeCommandWithContext:', {
      command: command.description,
      availableTools: Object.keys(this.aiTools)
    })

    // Find the appropriate tool for this command
    const tool = this.aiTools[command.description]

    if (!tool) {
      console.error('❌ No tool found for command:', command.description)
      throw new Error(`No tool found for command: ${command.description}`)
    }

    console.log('🤖 Found tool:', tool.name)

    // Create operation record
    const operation: AIOperation = {
      id: `op-${Date.now()}`,
      commandId: command.id,
      type: command.description,
      parameters: command.parameters,
      status: 'executing',
      timestamp: Date.now()
    }

    try {
      // Execute the tool
      const result = await tool.execute(command.parameters, context)

      // Update operation status
      operation.status = 'completed'
      operation.result = result

      // Update context
      this.contextManager.updateContext(
        context.canvasId,
        context.userId,
        operation
      )
    } catch (error) {
      // Update operation status
      operation.status = 'failed'
      operation.error = error instanceof Error ? error.message : 'Unknown error'

      // Update context
      this.contextManager.updateContext(
        context.canvasId,
        context.userId,
        operation
      )

      throw error
    }
  }

  private async executeOperation(
    operation: AIOperation,
    context: AIContext
  ): Promise<void> {
    // Find the appropriate tool for this operation
    const tool = this.aiTools[operation.type]

    if (!tool) {
      throw new Error(`No tool found for operation: ${operation.type}`)
    }

    try {
      // Update operation status
      operation.status = 'executing'

      // Execute the tool
      const result = await tool.execute(operation.parameters, context)

      // Update operation status
      operation.status = 'completed'
      operation.result = result

      // Update context
      this.contextManager.updateContext(
        context.canvasId,
        context.userId,
        operation
      )
    } catch (error) {
      // Update operation status
      operation.status = 'failed'
      operation.error = error instanceof Error ? error.message : 'Unknown error'

      // Update context
      this.contextManager.updateContext(
        context.canvasId,
        context.userId,
        operation
      )

      throw error
    }
  }

  // Process natural language commands using OpenAI
  async processNaturalLanguage(
    canvasId: string,
    userId: string,
    userInput: string
  ): Promise<AICommand> {
    console.log('🤖 Processing natural language:', {
      canvasId,
      userId,
      userInput
    })

    try {
      // Get available tools for OpenAI
      const tools = Object.values(this.aiTools).map((tool: any) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }))

      // Use OpenAI to understand the user's intent
      const openaiResponse = await openaiService.generateResponse(
        `User wants to: ${userInput}. Available commands: ${tools.map(t => t.name).join(', ')}. 
         Please determine the best command to execute and provide the parameters.`,
        tools
      )

      console.log('🤖 OpenAI response:', openaiResponse)

      // Extract the function call from OpenAI response
      const functionCall = openaiResponse.choices?.[0]?.message?.tool_calls?.[0]

      if (functionCall) {
        const command = functionCall.function.name
        const parameters = JSON.parse(functionCall.function.arguments)

        console.log(
          '🤖 OpenAI determined command:',
          command,
          'with parameters:',
          parameters
        )

        // Execute the determined command
        return await this.executeCommand(canvasId, userId, command, parameters)
      } else {
        // If no function call, try to map common phrases to commands
        console.log('🤖 No function call from OpenAI, trying simple mapping...')

        const lowerInput = userInput.toLowerCase()
        let command = ''
        let parameters: any = {}

        if (lowerInput.includes('rectangle') || lowerInput.includes('rect')) {
          command = 'createShape'
          parameters = {
            type: 'rect',
            position: { x: 200, y: 200 },
            size: { width: 150, height: 80 },
            fill: '#3B82F6'
          }
        } else if (lowerInput.includes('circle')) {
          command = 'createShape'
          parameters = {
            type: 'circle',
            position: { x: 200, y: 200 },
            radius: 50,
            fill: '#10B981'
          }
        } else if (lowerInput.includes('text')) {
          command = 'createShape'
          parameters = {
            type: 'text',
            position: { x: 200, y: 200 },
            text: 'Hello World',
            fontSize: 16,
            fill: '#000000'
          }
        } else {
          throw new Error(
            'Could not determine appropriate command from user input. Try: "create a rectangle", "create a circle", or "create text"'
          )
        }

        console.log(
          '🤖 Mapped to command:',
          command,
          'with parameters:',
          parameters
        )
        return await this.executeCommand(canvasId, userId, command, parameters)
      }
    } catch (error) {
      console.error('❌ Natural language processing failed:', error)
      throw new Error(
        `Failed to process natural language: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
