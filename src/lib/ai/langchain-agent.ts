import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents'
import { DynamicStructuredTool } from 'langchain/tools'
import { z } from 'zod'
import { getObjectSyncService } from '../sync/objects'
import { aiRateLimiter, validateAIParameters } from './security'
import type { AICanvasState, AIContext } from './types'

// Canvas-specific tool schemas using Zod
const PositionSchema = z.object({
  x: z.number().min(0).describe('X coordinate'),
  y: z.number().min(0).describe('Y coordinate')
})

const SizeSchema = z.object({
  width: z.number().min(1).describe('Width in pixels'),
  height: z.number().min(1).describe('Height in pixels')
})

const ColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/)
  .describe('Hex color code')

// Tool schemas
const CreateShapeSchema = z.object({
  type: z.enum(['rect', 'circle', 'text']).describe('Type of shape to create'),
  position: PositionSchema,
  size: SizeSchema.optional().describe('Size for rectangles'),
  radius: z.number().min(1).optional().describe('Radius for circles'),
  text: z.string().optional().describe('Text content for text shapes'),
  fill: ColorSchema.optional().describe('Fill color'),
  stroke: ColorSchema.optional().describe('Stroke color'),
  strokeWidth: z.number().min(0).optional().describe('Stroke width'),
  fontSize: z.number().min(8).max(72).optional().describe('Font size for text')
})

const MoveShapeSchema = z.object({
  shapeId: z.string().describe('ID of the shape to move'),
  position: PositionSchema
})

const ResizeShapeSchema = z.object({
  shapeId: z.string().describe('ID of the shape to resize'),
  size: SizeSchema.optional().describe('New size for rectangles'),
  radius: z.number().min(1).optional().describe('New radius for circles')
})

const ArrangeGridSchema = z.object({
  shapeIds: z
    .array(z.string())
    .min(2)
    .describe('Array of shape IDs to arrange'),
  rows: z.number().min(1).max(10).describe('Number of rows'),
  cols: z.number().min(1).max(10).describe('Number of columns'),
  spacing: z.number().min(0).default(20).describe('Spacing between shapes')
})

const GetCanvasStateSchema = z.object({
  includeShapes: z
    .boolean()
    .default(true)
    .describe('Include shapes in response'),
  includeViewport: z
    .boolean()
    .default(true)
    .describe('Include viewport in response')
})

// LangChain Tool definitions
export class CanvasTools {
  public objectSync: any
  public currentContext: AIContext | null = null

  constructor(queryClient: any) {
    this.objectSync = getObjectSyncService(queryClient)
  }

  createShape = new DynamicStructuredTool({
    name: 'createShape',
    description:
      'Create a new shape (rectangle, circle, or text) on the canvas',
    schema: CreateShapeSchema,
    func: async (params: z.infer<typeof CreateShapeSchema>) => {
      console.log('🤖 LangChain createShape tool executing:', params)

      if (!this.currentContext) {
        throw new Error('No context available for tool execution')
      }

      try {
        const options: any = {}
        if (params.size) options.size = params.size
        if (params.radius) options.radius = params.radius
        if (params.text) options.text = params.text
        if (params.fill) options.fill = params.fill
        if (params.stroke) options.stroke = params.stroke
        if (params.strokeWidth) options.strokeWidth = params.strokeWidth
        if (params.fontSize) options.fontSize = params.fontSize

        console.log('🤖 Creating shape with options:', options)

        const shape = await this.objectSync.createShapeWithDefaults(
          this.currentContext.canvasId,
          params.type,
          params.position,
          options,
          this.currentContext.userId
        )

        console.log('🤖 Shape created successfully:', shape)
        return `Created ${params.type} shape at position (${params.position.x}, ${params.position.y}) with ID: ${shape.id}`
      } catch (error) {
        console.error('🤖 Error creating shape:', error)
        throw new Error(
          `Failed to create shape: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }
  })

  moveShape = new DynamicStructuredTool({
    name: 'moveShape',
    description: 'Move a shape to a new position on the canvas',
    schema: MoveShapeSchema,
    func: async (params: z.infer<typeof MoveShapeSchema>) => {
      console.log('🤖 LangChain moveShape tool executing:', params)

      if (!this.currentContext) {
        throw new Error('No context available for tool execution')
      }

      await this.objectSync.updateObject(
        this.currentContext.canvasId,
        params.shapeId,
        { x: params.position.x, y: params.position.y },
        this.currentContext.userId
      )

      return `Moved shape ${params.shapeId} to position (${params.position.x}, ${params.position.y})`
    }
  })

  resizeShape = new DynamicStructuredTool({
    name: 'resizeShape',
    description: 'Resize a shape on the canvas',
    schema: ResizeShapeSchema,
    func: async (params: z.infer<typeof ResizeShapeSchema>) => {
      console.log('🤖 LangChain resizeShape tool executing:', params)

      if (!this.currentContext) {
        throw new Error('No context available for tool execution')
      }

      const currentShape = await this.objectSync.getObject(
        this.currentContext.canvasId,
        params.shapeId
      )
      if (!currentShape) {
        throw new Error(`Shape with ID ${params.shapeId} not found`)
      }

      const updates: any = {}
      if (currentShape.type === 'rect' && params.size) {
        updates.width = params.size.width
        updates.height = params.size.height
      } else if (
        currentShape.type === 'circle' &&
        params.radius !== undefined
      ) {
        updates.radius = params.radius
      }

      await this.objectSync.updateObject(
        this.currentContext.canvasId,
        params.shapeId,
        updates,
        this.currentContext.userId
      )

      return `Resized shape ${params.shapeId}`
    }
  })

  arrangeInGrid = new DynamicStructuredTool({
    name: 'arrangeInGrid',
    description: 'Arrange multiple shapes in a grid layout',
    schema: ArrangeGridSchema,
    func: async (params: z.infer<typeof ArrangeGridSchema>) => {
      console.log('🤖 LangChain arrangeInGrid tool executing:', params)

      if (!this.currentContext) {
        throw new Error('No context available for tool execution')
      }

      await this.objectSync.arrangeShapesInGrid(
        this.currentContext.canvasId,
        params.shapeIds,
        { rows: params.rows, cols: params.cols, spacing: params.spacing },
        this.currentContext.userId
      )

      return `Arranged ${params.shapeIds.length} shapes in a ${params.rows}x${params.cols} grid`
    }
  })

  getCanvasState = new DynamicStructuredTool({
    name: 'getCanvasState',
    description: 'Get the current state of the canvas including all shapes',
    schema: GetCanvasStateSchema,
    func: async (params: z.infer<typeof GetCanvasStateSchema>) => {
      console.log('🤖 LangChain getCanvasState tool executing:', params)

      if (!this.currentContext) {
        throw new Error('No context available for tool execution')
      }

      const shapes = await this.objectSync.getAllObjects(
        this.currentContext.canvasId
      )

      return `Canvas has ${shapes.length} shapes`
    }
  })

  // Get all tools as an array for LangChain
  getAllTools() {
    return [
      this.createShape,
      this.moveShape,
      this.resizeShape,
      this.arrangeInGrid,
      this.getCanvasState
    ]
  }
}

export class LangChainAgentService {
  private model: ChatOpenAI
  private tools: CanvasTools
  // private memory: BufferWindowMemory | null = null // Temporarily disabled
  private agent: AgentExecutor | null = null

  constructor(queryClient: any) {
    // Debug environment variables
    console.log('🔍 Environment variables debug:', {
      VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY
        ? 'SET'
        : 'NOT SET',
      allEnvVars: Object.keys(import.meta.env).filter(key =>
        key.startsWith('VITE_')
      ),
      openAIKeyLength: import.meta.env.VITE_OPENAI_API_KEY?.length || 0
    })

    // Initialize OpenAI model
    this.model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 2000,
      timeout: 30000,
      apiKey: import.meta.env.VITE_OPENAI_API_KEY
    })

    // Initialize tools
    this.tools = new CanvasTools(queryClient)

    // Initialize memory - temporarily disabled to fix output key issue
    // this.memory = new BufferWindowMemory({
    //   k: 10, // Keep last 10 exchanges
    //   returnMessages: true,
    //   memoryKey: 'chat_history',
    //   inputKey: 'input',
    //   outputKey: 'output'
    // })

    // Initialize agent asynchronously
    this.initializeAgent().catch(error => {
      console.error('❌ Failed to initialize LangChain agent:', error)
    })
  }

  private async initializeAgent() {
    try {
      console.log('🤖 Initializing LangChain agent...')

      // System prompt for the agent
      const systemPrompt = `You are an expert AI assistant for a collaborative canvas application. You help users create, manipulate, and design visual elements through natural language commands.

Your capabilities include:
- Creating shapes (rectangles, circles, text)
- Manipulating existing elements (move, resize, rotate)
- Creating complex layouts (forms, navigation, cards)
- Arranging elements in grids, rows, and custom layouts
- Understanding design patterns and best practices

Always consider:
- Visual hierarchy and spacing
- Color harmony and accessibility
- Responsive design principles
- User experience best practices

When users ask for complex designs, break them down into logical steps and execute them systematically.

Current canvas context: You have access to tools that can create, move, resize, and arrange shapes on the canvas. Always use the appropriate tools to accomplish the user's requests.`

      // Create the prompt template
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', systemPrompt],
        // Removed chat_history placeholder since memory is disabled
        ['human', '{input}'],
        new MessagesPlaceholder('agent_scratchpad')
      ])

      // Create the agent
      const tools = this.tools.getAllTools()
      console.log(
        '🤖 Available tools for agent:',
        tools.map(t => t.name)
      )

      const agent = await createOpenAIFunctionsAgent({
        llm: this.model,
        tools: tools,
        prompt
      })

      // Create the agent executor
      this.agent = new AgentExecutor({
        agent,
        tools: this.tools.getAllTools(),
        // Temporarily disable memory to fix the output key issue
        // memory: this.memory,
        verbose: true,
        maxIterations: 5,
        returnIntermediateSteps: true,
        handleParsingErrors: true
      })

      console.log('✅ LangChain agent initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize LangChain agent:', error)
      throw error
    }
  }

  private async ensureAgentInitialized(): Promise<void> {
    if (!this.agent) {
      console.log('🤖 Agent not initialized, waiting for initialization...')
      // Wait for initialization with a timeout
      const maxWaitTime = 10000 // 10 seconds
      const startTime = Date.now()

      while (!this.agent && Date.now() - startTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (!this.agent) {
        throw new Error('Agent initialization timeout. Please try again.')
      }
    }
  }

  async processNaturalLanguage(
    canvasId: string,
    userId: string,
    userInput: string
  ): Promise<any> {
    console.log('🤖 LangChain Agent processing:', {
      canvasId,
      userId,
      userInput
    })

    // Check rate limiting
    if (!aiRateLimiter.isAllowed(userId)) {
      throw new Error('Rate limit exceeded. Please slow down your AI requests.')
    }

    // Validate input
    if (!validateAIParameters({ input: userInput })) {
      throw new Error('Invalid or potentially dangerous input detected.')
    }

    // Create context for tools
    const context: AIContext = {
      canvasId,
      userId,
      sessionId: `session-${Date.now()}`,
      operations: [],
      currentState: {
        shapes: [],
        viewport: { x: 0, y: 0, scale: 1 }
      }
    }

    // Update tools with context
    this.updateToolsContext(context)

    try {
      // Ensure agent is initialized
      await this.ensureAgentInitialized()

      // Execute the agent
      console.log('🤖 About to invoke agent with input:', userInput)
      const result = await this.agent!.invoke({
        input: userInput
      })
      console.log('🤖 Agent execution completed, result:', result)

      // Record the request for rate limiting
      aiRateLimiter.recordRequest(userId)

      console.log('🤖 LangChain Agent result:', result)

      // Ensure result has expected structure
      if (!result) {
        throw new Error('Agent returned null result')
      }

      // Ensure result has output property
      if (!result.output && !result.text) {
        console.warn('⚠️ Agent result missing output/text:', result)
        // Create a fallback result
        return {
          output: 'Command executed successfully',
          intermediateSteps: result.intermediateSteps || [],
          ...result
        }
      }

      return result
    } catch (error) {
      console.error('❌ LangChain Agent error:', error)
      throw new Error(
        `Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private updateToolsContext(context: AIContext) {
    // Store context in the tools class for access by tool functions
    this.tools.currentContext = context
  }

  async getCanvasState(canvasId: string): Promise<AICanvasState> {
    const shapes = await this.tools.objectSync.getAllObjects(canvasId)
    return {
      shapes,
      viewport: { x: 0, y: 0, scale: 1 },
      metadata: {
        totalShapes: shapes.length,
        lastUpdated: Date.now(),
        canvasSize: { width: 1920, height: 1080 }
      }
    }
  }
}

// Export singleton instance
let langChainAgentInstance: LangChainAgentService | null = null

export function getLangChainAgent(queryClient?: any): LangChainAgentService {
  if (!langChainAgentInstance) {
    if (!queryClient) {
      throw new Error(
        'QueryClient is required for LangChain agent initialization'
      )
    }
    console.log('🤖 Creating new LangChain agent instance...')
    langChainAgentInstance = new LangChainAgentService(queryClient)
  }
  return langChainAgentInstance
}
