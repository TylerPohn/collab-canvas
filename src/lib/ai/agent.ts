import { getObjectSyncService } from '../sync/objects'
import type { ViewportState } from '../types'
import { getAIContextManager } from './context'
import { openaiService } from './openai'
import { aiRateLimiter, validateAIParameters } from './security'
import { createAITools } from './tools'
import type {
  AICanvasState,
  AICommand,
  AICommandResult,
  AIContext,
  AIOperation
} from './types'
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
  ): Promise<AICommandResult> {
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

    // Execute command and capture result
    const result = await this.executeCommandWithContext(aiCommand, context)

    // Record the request for rate limiting
    aiRateLimiter.recordRequest(userId)

    return {
      command: aiCommand,
      result
    }
  }

  // Execute multi-step complex commands
  async executeComplexCommand(
    canvasId: string,
    userId: string,
    command: string,
    parameters: Record<string, any>
  ): Promise<AICommandResult> {
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
      command: {
        id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'complex',
        description: command,
        parameters,
        timestamp: Date.now(),
        userId
      },
      result: { success: true, message: 'Complex command completed' }
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
  ): Promise<any> {
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

      return result
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
        parameters: this.convertZodToJsonSchema(tool.parameters)
      }))

      console.log(
        '🤖 Tools being sent to OpenAI:',
        JSON.stringify(tools, null, 2)
      )

      // Initialize conversation history for tool chaining
      const messages = [
        {
          role: 'system',
          content: `You are an AI assistant that helps users create and manipulate shapes on a collaborative canvas. You must use the provided tools to execute commands. Always call the appropriate function when a user requests an action. Do not just describe what to do - actually execute the function call.

IMPORTANT: When specifying colors, always use hex color codes (e.g., #FF0000 for red, #00FF00 for green, #0000FF for blue). Do not use named colors like "red", "blue", "green".

For visual effects:
- Opacity: Use values between 0 (transparent) and 1 (opaque)
- Blend modes: Use supported Canvas 2D modes (normal, multiply, overlay, screen, darken, lighten, color-dodge, color-burn, hard-light, soft-light, difference, exclusion)

For movement commands:
1. For directional movements with distance (e.g., "move 300px to the right"), use moveShape and CALCULATE the new position: new_x = current_x + distance
2. For movements relative to OTHER shapes (e.g., "move to the right of other shapes"), use moveShapeByOthers
3. Always find the shape first using getCanvasState or findShapes to get current position and shapeId
4. Do the math: right = +x, left = -x, down = +y, up = -y

For creation commands with positioning:
1. For "create X to the right/left/above/below of other shapes", first use getCanvasState or findShapes to locate existing shapes
2. Then use createShape with calculated position based on existing shapes
3. Calculate position: right = max_x + spacing, left = min_x - spacing, above = min_y - spacing, below = max_y + spacing

For layout commands (arrange, grid, row, column, space, align):
1. First use getCanvasState to get all shapes and their IDs
2. Then use the appropriate layout tool (arrangeInGrid, arrangeInRow, arrangeInColumn, spaceEvenly, alignShapes, distributeShapes) with the shape IDs from step 1
3. For arrangeInGrid: use rows and cols parameters (e.g., "2x3 grid" = rows: 2, cols: 3)
4. For arrangeInColumn: arrange shapes vertically in a column with specified spacing
5. For alignShapes: align shapes to left/center/right (horizontal) or top/middle/bottom (vertical)
6. For distributeShapes: distribute shapes evenly with specified spacing (requires 3+ shapes)

For style commands (color, style):
1. For changeColor: change fill, stroke, opacity, or blend mode of a specific shape
2. For copyStyle: copy style properties from source shape to target shapes
3. CRITICAL: When user says "copy style of X to Y":
   - sourceShapeId = X (the shape to copy FROM)
   - targetShapeIds = [Y] (the shape to copy TO)
   - Example: "copy style of blue rectangle to circle" means:
     * sourceShapeId = blue rectangle ID
     * targetShapeIds = [circle ID]
4. Always use hex color codes (e.g., #FF0000 for red, #00FF00 for green)
5. For opacity: use values between 0 (transparent) and 1 (opaque)
6. For blend modes: use supported Canvas 2D modes (normal, multiply, overlay, screen, darken, lighten, color-dodge, color-burn, hard-light, soft-light, difference, exclusion)

For duplication commands:
1. For duplicateShape: create a copy of a shape with optional offset positioning
2. Default offset is 50px right and 50px down if not specified
3. Returns the new shape ID for reference

For multi-shape creation commands:
1. For createMultipleShapes: create multiple shapes with optional layout parameter
2. Examples: "create 3 red squares" (row by default), "create 5 blue circles in a column", "create 9 green stars in a grid"
3. Parameters: count (1-20), type (rect/circle/ellipse/star/hexagon/line/arrow), properties (size/fill/stroke/opacity/blendMode), layout (row/column/grid)
4. Layout types:
   - row (default): shapes in horizontal row
   - column: shapes in vertical column  
   - grid: shapes in grid layout (auto-calculates rows/cols)
5. For grid layouts: "create 9 blue circles in a grid" → use layout: { type: 'grid' } (auto 3x3)
6. For column layouts: "create 5 circles in a column" → use layout: { type: 'column' }
7. For custom grids: "create 6 squares in 2 rows" → use layout: { type: 'grid', rows: 2, cols: 3 }
8. Grid auto-calculation: square root rounded up (9→3x3, 6→2x3, 8→3x3)

For alternating shape creation commands:
1. For createAlternatingShapes: create shapes that alternate between types
2. Examples: "create alternating circles and rectangles", "alternate red squares and blue circles"
3. Pattern: array of shape definitions (type + properties) that repeats
4. Count: total number of shapes (pattern repeats as needed)
5. Example: pattern of [circle, rect] with count 6 creates: circle, rect, circle, rect, circle, rect
6. Supports row, column, and grid layouts
7. Natural language: "create 6 alternating circles and rectangles" → pattern: [{type: 'circle'}, {type: 'rect'}], count: 6

CRITICAL: When findShapes returns 0 results:
1. DO NOT proceed with empty shape IDs - this will cause validation errors
2. Try using getCanvasState to see all available shapes on the canvas
3. If the requested shape truly doesn't exist, inform the user that the shape was not found
4. For copyStyle operations: ensure you have BOTH source and target shape IDs before proceeding
5. If you can't find the required shapes, suggest creating them first or ask for clarification

You can make multiple tool calls in sequence. If you need to find shapes first, make that call, then use the results to complete the layout action.`
        },
        {
          role: 'user',
          content: `User wants to: ${userInput}. 
           You must use one of the available tools to execute this request. Available tools: ${tools.map(t => t.name).join(', ')}. 
           Execute the appropriate tool with the correct parameters. If you need to find a shape first, do that, then use the results to complete the action.`
        }
      ]

      // Tool chaining loop - allow up to 3 tool calls
      const maxIterations = 3
      let currentIteration = 0
      let lastCommand: AICommand | null = null

      while (currentIteration < maxIterations) {
        currentIteration++
        console.log(
          `🤖 Tool chaining iteration ${currentIteration}/${maxIterations}`
        )

        // Use OpenAI to understand the user's intent
        const openaiResponse = await openaiService.generateResponseWithMessages(
          messages,
          tools
        )

        console.log('🤖 OpenAI response:', openaiResponse)

        // Extract the function call from OpenAI response
        const functionCall =
          openaiResponse.choices?.[0]?.message?.tool_calls?.[0]

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
          const { command: executedCommand, result: toolResult } =
            await this.executeCommand(canvasId, userId, command, parameters)
          lastCommand = executedCommand

          // Add the tool call and result to conversation history
          messages.push({
            role: 'assistant',
            content: '',
            tool_calls: [functionCall]
          } as any)

          // Add the tool result to conversation history
          messages.push({
            role: 'tool',
            content: JSON.stringify(toolResult),
            tool_call_id: functionCall.id
          } as any)

          // Check if this was a "find" operation that needs follow-up
          if (
            this.isFindOperation(command) &&
            this.needsFollowUp(userInput, command)
          ) {
            console.log(
              '🤖 Find operation detected, checking if follow-up needed'
            )
            // Continue to next iteration to allow follow-up tool call
            continue
          } else {
            // Single operation or completed workflow
            console.log('🤖 Operation completed, returning result')
            return executedCommand
          }
        } else {
          // If no function call, try to map common phrases to commands
          console.log(
            '🤖 No function call from OpenAI, trying simple mapping...'
          )

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
          const { command: executedCommand } = await this.executeCommand(
            canvasId,
            userId,
            command,
            parameters
          )
          return executedCommand
        }
      }

      // If we've reached max iterations, return the last command
      if (lastCommand) {
        console.log('🤖 Reached max iterations, returning last command')
        return lastCommand
      }

      throw new Error('Could not complete the requested operation')
    } catch (error) {
      console.error('❌ Natural language processing failed:', error)
      throw new Error(
        `Failed to process natural language: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Helper method to check if a command is a "find" operation
  private isFindOperation(command: string): boolean {
    return command === 'findShapes' || command === 'getCanvasState'
  }

  // Helper method to check if a find operation needs follow-up
  private needsFollowUp(userInput: string, command: string): boolean {
    const lowerInput = userInput.toLowerCase()
    const isMovementCommand =
      lowerInput.includes('move') ||
      lowerInput.includes('resize') ||
      lowerInput.includes('rotate')
    const isPositionalCreation =
      lowerInput.includes('create') &&
      (lowerInput.includes('to the right of') ||
        lowerInput.includes('to the left of') ||
        lowerInput.includes('above') ||
        lowerInput.includes('below') ||
        lowerInput.includes('next to') ||
        lowerInput.includes('beside'))
    const isLayoutCommand =
      lowerInput.includes('arrange') ||
      lowerInput.includes('grid') ||
      lowerInput.includes('row') ||
      lowerInput.includes('column') ||
      lowerInput.includes('space') ||
      lowerInput.includes('align') ||
      lowerInput.includes('layout') ||
      lowerInput.includes('organize') ||
      lowerInput.includes('distribute') ||
      lowerInput.includes('line up') ||
      lowerInput.includes('position')
    // NEW: Style commands that need shape lookup first
    const isStyleCommand =
      lowerInput.includes('copy style') ||
      lowerInput.includes('change color') ||
      lowerInput.includes('color') ||
      lowerInput.includes('style')
    // NEW: Duplication commands that need shape lookup first
    const isDuplicationCommand =
      lowerInput.includes('duplicate') ||
      lowerInput.includes('clone') ||
      lowerInput.includes('copy')
    return (
      this.isFindOperation(command) &&
      (isMovementCommand ||
        isPositionalCreation ||
        isLayoutCommand ||
        isStyleCommand ||
        isDuplicationCommand)
    )
  }

  // Convert Zod schema to JSON Schema format for OpenAI
  private convertZodToJsonSchema(zodSchema: any): any {
    if (!zodSchema || !zodSchema._def) {
      return { type: 'object', properties: {} }
    }

    const def = zodSchema._def

    // Handle ZodObject
    if (def.typeName === 'ZodObject') {
      const properties: any = {}
      const required: string[] = []

      // Get the shape object
      const shape = def.shape()

      for (const [key, value] of Object.entries(shape)) {
        const fieldSchema = this.convertZodFieldToJsonSchema(value as any)
        properties[key] = fieldSchema

        // Check if field is required (not optional or default)
        const fieldDef = (value as any)._def
        if (
          fieldDef &&
          fieldDef.typeName !== 'ZodOptional' &&
          fieldDef.typeName !== 'ZodDefault'
        ) {
          required.push(key)
        }
      }

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined
      }
    }

    return { type: 'object', properties: {} }
  }

  private convertZodFieldToJsonSchema(zodField: any): any {
    if (!zodField || !zodField._def) {
      return { type: 'string' }
    }

    const def = zodField._def

    // Handle different Zod field types based on def.typeName
    switch (def.typeName) {
      case 'ZodString':
        return { type: 'string' }
      case 'ZodNumber':
        return { type: 'number' }
      case 'ZodBoolean':
        return { type: 'boolean' }
      case 'ZodArray':
        return {
          type: 'array',
          items: this.convertZodFieldToJsonSchema(def.type)
        }
      case 'ZodObject':
        return this.convertZodToJsonSchema(zodField)
      case 'ZodEnum':
        return {
          type: 'string',
          enum: Object.values(def.values || {})
        }
      case 'ZodOptional':
        return this.convertZodFieldToJsonSchema(def.innerType)
      case 'ZodDefault':
        return {
          ...this.convertZodFieldToJsonSchema(def.innerType),
          default: def.defaultValue()
        }
      default:
        console.log('🤖 Unknown field typeName:', def.typeName)
        return { type: 'string' }
    }
  }
}
