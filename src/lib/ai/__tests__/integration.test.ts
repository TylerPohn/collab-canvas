import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CanvasTools } from '../langchain-agent'
import type { AIContext } from '../types'

// Integration test to verify the LangChain agent system works end-to-end
describe('LangChain Agent Integration', () => {
  let canvasTools: CanvasTools
  let mockObjectSync: any
  let mockContext: AIContext

  beforeEach(() => {
    // Mock the object sync service
    mockObjectSync = {
      createShapeWithDefaults: vi.fn(),
      updateObject: vi.fn(),
      getObject: vi.fn(),
      arrangeShapesInGrid: vi.fn(),
      getAllObjects: vi.fn()
    }

    // Create test context
    mockContext = {
      canvasId: 'integration-test-canvas',
      userId: 'integration-test-user',
      sessionId: 'integration-test-session',
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

  it('should create and manipulate shapes in sequence', async () => {
    // Mock successful shape creation
    const mockShape1 = { id: 'shape-1', type: 'rect', x: 100, y: 100 }
    const mockShape2 = { id: 'shape-2', type: 'circle', x: 200, y: 200 }

    mockObjectSync.createShapeWithDefaults
      .mockResolvedValueOnce(mockShape1)
      .mockResolvedValueOnce(mockShape2)

    // Test creating multiple shapes
    const result1 = await canvasTools.createShape.func({
      type: 'rect',
      position: { x: 100, y: 100 },
      size: { width: 150, height: 80 },
      fill: '#3B82F6'
    })

    const result2 = await canvasTools.createShape.func({
      type: 'circle',
      position: { x: 200, y: 200 },
      radius: 50,
      fill: '#10B981'
    })

    // Verify both shapes were created
    expect(result1).toContain(
      'Created rect shape at position (100, 100) with ID: shape-1'
    )
    expect(result2).toContain(
      'Created circle shape at position (200, 200) with ID: shape-2'
    )

    expect(mockObjectSync.createShapeWithDefaults).toHaveBeenCalledTimes(2)
  })

  it('should handle complex workflow: create, move, resize', async () => {
    const mockShape = {
      id: 'workflow-shape',
      type: 'rect',
      x: 100,
      y: 100,
      width: 100,
      height: 100
    }

    mockObjectSync.createShapeWithDefaults.mockResolvedValue(mockShape)
    mockObjectSync.getObject.mockResolvedValue(mockShape)

    // Step 1: Create shape
    await canvasTools.createShape.func({
      type: 'rect',
      position: { x: 100, y: 100 },
      size: { width: 100, height: 100 }
    })

    // Step 2: Move shape
    await canvasTools.moveShape.func({
      shapeId: 'workflow-shape',
      position: { x: 200, y: 200 }
    })

    // Step 3: Resize shape
    await canvasTools.resizeShape.func({
      shapeId: 'workflow-shape',
      size: { width: 200, height: 150 }
    })

    // Verify all operations were called
    expect(mockObjectSync.createShapeWithDefaults).toHaveBeenCalledWith(
      'integration-test-canvas',
      'rect',
      { x: 100, y: 100 },
      { size: { width: 100, height: 100 } },
      'integration-test-user'
    )

    expect(mockObjectSync.updateObject).toHaveBeenCalledWith(
      'integration-test-canvas',
      'workflow-shape',
      { x: 200, y: 200 },
      'integration-test-user'
    )

    expect(mockObjectSync.updateObject).toHaveBeenCalledWith(
      'integration-test-canvas',
      'workflow-shape',
      { width: 200, height: 150 },
      'integration-test-user'
    )
  })

  it('should handle grid arrangement workflow', async () => {
    // Mock shape creation
    mockObjectSync.createShapeWithDefaults.mockResolvedValue({ id: 'shape-1' })

    // Create shapes
    for (let i = 0; i < 4; i++) {
      await canvasTools.createShape.func({
        type: i % 2 === 0 ? 'rect' : 'circle',
        position: { x: i * 50, y: i * 50 }
      })
    }

    // Arrange in grid
    await canvasTools.arrangeInGrid.func({
      shapeIds: ['shape-1', 'shape-2', 'shape-3', 'shape-4'],
      rows: 2,
      cols: 2,
      spacing: 20
    })

    // Verify grid arrangement was called
    expect(mockObjectSync.arrangeShapesInGrid).toHaveBeenCalledWith(
      'integration-test-canvas',
      ['shape-1', 'shape-2', 'shape-3', 'shape-4'],
      { rows: 2, cols: 2, spacing: 20 },
      'integration-test-user'
    )
  })

  it('should handle error scenarios gracefully', async () => {
    // Test context not available
    canvasTools.currentContext = null

    await expect(
      canvasTools.createShape.func({
        type: 'rect',
        position: { x: 100, y: 100 }
      })
    ).rejects.toThrow('No context available for tool execution')

    // Test shape not found
    canvasTools.currentContext = mockContext
    mockObjectSync.getObject.mockResolvedValue(null)

    await expect(
      canvasTools.resizeShape.func({
        shapeId: 'nonexistent-shape',
        size: { width: 200, height: 150 }
      })
    ).rejects.toThrow('Shape with ID nonexistent-shape not found')
  })

  it('should maintain context across operations', () => {
    // Verify context is properly maintained
    expect(canvasTools.currentContext).toBe(mockContext)
    expect(canvasTools.currentContext?.canvasId).toBe('integration-test-canvas')
    expect(canvasTools.currentContext?.userId).toBe('integration-test-user')
  })

  it('should provide all required tools', () => {
    const tools = canvasTools.getAllTools()

    expect(tools).toHaveLength(5)

    const toolNames = tools.map(tool => tool.name)
    expect(toolNames).toContain('createShape')
    expect(toolNames).toContain('moveShape')
    expect(toolNames).toContain('resizeShape')
    expect(toolNames).toContain('arrangeInGrid')
    expect(toolNames).toContain('getCanvasState')
  })
})
