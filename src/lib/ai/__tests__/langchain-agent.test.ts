import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CanvasTools, LangChainAgentService } from '../langchain-agent'
import type { AIContext } from '../types'

// Mock the dependencies
vi.mock('../../sync/objects', () => ({
  getObjectSyncService: vi.fn(() => ({
    createShapeWithDefaults: vi.fn(),
    updateObject: vi.fn(),
    getObject: vi.fn(),
    arrangeShapesInGrid: vi.fn(),
    getAllObjects: vi.fn()
  }))
}))

vi.mock('../security', () => ({
  aiRateLimiter: {
    isAllowed: vi.fn(() => true),
    recordRequest: vi.fn()
  },
  validateAIParameters: vi.fn(() => true)
}))

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    invoke: vi.fn()
  }))
}))

vi.mock('langchain/agents', () => ({
  AgentExecutor: vi.fn().mockImplementation(() => ({
    invoke: vi.fn()
  })),
  createOpenAIFunctionsAgent: vi.fn()
}))

vi.mock('langchain/memory', () => ({
  BufferWindowMemory: vi.fn().mockImplementation(() => ({}))
}))

vi.mock('langchain/tools', () => ({
  DynamicStructuredTool: vi.fn().mockImplementation(config => config)
}))

describe('CanvasTools', () => {
  let canvasTools: CanvasTools
  let mockObjectSync: any
  let mockContext: AIContext

  beforeEach(() => {
    mockObjectSync = {
      createShapeWithDefaults: vi.fn(),
      updateObject: vi.fn(),
      getObject: vi.fn(),
      arrangeShapesInGrid: vi.fn(),
      getAllObjects: vi.fn()
    }

    mockContext = {
      canvasId: 'test-canvas',
      userId: 'test-user',
      sessionId: 'test-session',
      operations: [],
      currentState: {
        shapes: [],
        viewport: { x: 0, y: 0, scale: 1 }
      }
    }

    canvasTools = new CanvasTools({})
    canvasTools.objectSync = mockObjectSync
    canvasTools.currentContext = mockContext
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createShape tool', () => {
    it('should create a rectangle shape', async () => {
      const mockShape = { id: 'shape-1', type: 'rect', x: 100, y: 100 }
      mockObjectSync.createShapeWithDefaults.mockResolvedValue(mockShape)

      const result = await canvasTools.createShape.func({
        type: 'rect',
        position: { x: 100, y: 100 },
        size: { width: 150, height: 80 },
        fill: '#3B82F6'
      })

      expect(mockObjectSync.createShapeWithDefaults).toHaveBeenCalledWith(
        'test-canvas',
        'rect',
        { x: 100, y: 100 },
        {
          size: { width: 150, height: 80 },
          fill: '#3B82F6'
        },
        'test-user'
      )

      expect(result).toContain(
        'Created rect shape at position (100, 100) with ID: shape-1'
      )
    })

    it('should create a circle shape', async () => {
      const mockShape = { id: 'shape-2', type: 'circle', x: 200, y: 200 }
      mockObjectSync.createShapeWithDefaults.mockResolvedValue(mockShape)

      const result = await canvasTools.createShape.func({
        type: 'circle',
        position: { x: 200, y: 200 },
        radius: 50,
        fill: '#10B981'
      })

      expect(mockObjectSync.createShapeWithDefaults).toHaveBeenCalledWith(
        'test-canvas',
        'circle',
        { x: 200, y: 200 },
        {
          radius: 50,
          fill: '#10B981'
        },
        'test-user'
      )

      expect(result).toContain(
        'Created circle shape at position (200, 200) with ID: shape-2'
      )
    })

    it('should throw error when no context is available', async () => {
      canvasTools.currentContext = null

      await expect(
        canvasTools.createShape.func({
          type: 'rect',
          position: { x: 100, y: 100 }
        })
      ).rejects.toThrow('No context available for tool execution')
    })
  })

  describe('moveShape tool', () => {
    it('should move a shape to new position', async () => {
      await canvasTools.moveShape.func({
        shapeId: 'shape-1',
        position: { x: 300, y: 400 }
      })

      expect(mockObjectSync.updateObject).toHaveBeenCalledWith(
        'test-canvas',
        'shape-1',
        { x: 300, y: 400 },
        'test-user'
      )
    })
  })

  describe('resizeShape tool', () => {
    it('should resize a rectangle', async () => {
      const mockShape = { id: 'shape-1', type: 'rect', width: 100, height: 100 }
      mockObjectSync.getObject.mockResolvedValue(mockShape)

      await canvasTools.resizeShape.func({
        shapeId: 'shape-1',
        size: { width: 200, height: 150 }
      })

      expect(mockObjectSync.updateObject).toHaveBeenCalledWith(
        'test-canvas',
        'shape-1',
        { width: 200, height: 150 },
        'test-user'
      )
    })

    it('should resize a circle', async () => {
      const mockShape = { id: 'shape-2', type: 'circle', radius: 50 }
      mockObjectSync.getObject.mockResolvedValue(mockShape)

      await canvasTools.resizeShape.func({
        shapeId: 'shape-2',
        radius: 75
      })

      expect(mockObjectSync.updateObject).toHaveBeenCalledWith(
        'test-canvas',
        'shape-2',
        { radius: 75 },
        'test-user'
      )
    })

    it('should throw error when shape not found', async () => {
      mockObjectSync.getObject.mockResolvedValue(null)

      await expect(
        canvasTools.resizeShape.func({
          shapeId: 'nonexistent-shape',
          size: { width: 200, height: 150 }
        })
      ).rejects.toThrow('Shape with ID nonexistent-shape not found')
    })
  })

  describe('arrangeInGrid tool', () => {
    it('should arrange shapes in a grid', async () => {
      await canvasTools.arrangeInGrid.func({
        shapeIds: ['shape-1', 'shape-2', 'shape-3', 'shape-4'],
        rows: 2,
        cols: 2,
        spacing: 20
      })

      expect(mockObjectSync.arrangeShapesInGrid).toHaveBeenCalledWith(
        'test-canvas',
        ['shape-1', 'shape-2', 'shape-3', 'shape-4'],
        { rows: 2, cols: 2, spacing: 20 },
        'test-user'
      )
    })
  })

  describe('getCanvasState tool', () => {
    it('should return canvas state', async () => {
      const mockShapes = [
        { id: 'shape-1', type: 'rect' },
        { id: 'shape-2', type: 'circle' }
      ]
      mockObjectSync.getAllObjects.mockResolvedValue(mockShapes)

      const result = await canvasTools.getCanvasState.func({
        includeShapes: true,
        includeViewport: true
      })

      expect(mockObjectSync.getAllObjects).toHaveBeenCalledWith('test-canvas')
      expect(result).toContain('Canvas has 2 shapes')
    })
  })

  describe('getAllTools', () => {
    it('should return all available tools', () => {
      const tools = canvasTools.getAllTools()

      expect(tools).toHaveLength(5)
      expect(tools[0]).toHaveProperty('name', 'createShape')
      expect(tools[1]).toHaveProperty('name', 'moveShape')
      expect(tools[2]).toHaveProperty('name', 'resizeShape')
      expect(tools[3]).toHaveProperty('name', 'arrangeInGrid')
      expect(tools[4]).toHaveProperty('name', 'getCanvasState')
    })
  })
})

describe('LangChainAgentService', () => {
  let agentService: LangChainAgentService
  let mockQueryClient: any

  beforeEach(() => {
    mockQueryClient = {}
    agentService = new LangChainAgentService(mockQueryClient)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('processNaturalLanguage', () => {
    it('should process natural language input successfully', async () => {
      const mockResult = {
        output: 'Created a blue rectangle',
        intermediateSteps: []
      }

      // Mock the agent's invoke method
      ;(agentService as any).agent = {
        invoke: vi.fn().mockResolvedValue(mockResult)
      }

      const result = await agentService.processNaturalLanguage(
        'test-canvas',
        'test-user',
        'Create a blue rectangle'
      )

      expect(result).toEqual(mockResult)
    })

    it('should throw error when rate limit exceeded', async () => {
      const { aiRateLimiter } = await import('../security')
      ;(aiRateLimiter.isAllowed as any).mockReturnValue(false)

      await expect(
        agentService.processNaturalLanguage(
          'test-canvas',
          'test-user',
          'Create a blue rectangle'
        )
      ).rejects.toThrow('Rate limit exceeded')
    })

    it('should throw error when input validation fails', async () => {
      const { aiRateLimiter, validateAIParameters } = await import(
        '../security'
      )
      ;(aiRateLimiter.isAllowed as any).mockReturnValue(true)
      ;(validateAIParameters as any).mockReturnValue(false)

      await expect(
        agentService.processNaturalLanguage(
          'test-canvas',
          'test-user',
          'Create a blue rectangle'
        )
      ).rejects.toThrow('Invalid or potentially dangerous input detected')
    })

    it('should throw error when agent is not initialized', async () => {
      const { aiRateLimiter, validateAIParameters } = await import(
        '../security'
      )
      ;(aiRateLimiter.isAllowed as any).mockReturnValue(true)
      ;(validateAIParameters as any).mockReturnValue(true)
      ;(agentService as any).agent = null

      await expect(
        agentService.processNaturalLanguage(
          'test-canvas',
          'test-user',
          'Create a blue rectangle'
        )
      ).rejects.toThrow('Agent not initialized')
    })
  })

  describe('getCanvasState', () => {
    it('should return canvas state', async () => {
      const mockShapes = [
        { id: 'shape-1', type: 'rect' },
        { id: 'shape-2', type: 'circle' }
      ]

      // Mock the objectSync service
      ;(agentService as any).tools.objectSync.getAllObjects.mockResolvedValue(
        mockShapes
      )

      const result = await agentService.getCanvasState('test-canvas')

      expect(result).toEqual({
        shapes: mockShapes,
        viewport: { x: 0, y: 0, scale: 1 },
        metadata: {
          totalShapes: 2,
          lastUpdated: expect.any(Number),
          canvasSize: { width: 1920, height: 1080 }
        }
      })
    })
  })
})
