import { z } from 'zod'
import { getObjectSyncService } from '../sync/objects'
import type { AIContext } from './types'

// Base schemas
const PositionSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0)
})

const SizeSchema = z.object({
  width: z.number().min(1),
  height: z.number().min(1)
})

const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/)

// AI Tool Function Schemas
export const AIToolSchemas = {
  // Creation Commands
  createShape: z.object({
    type: z.enum(['rect', 'circle', 'text']),
    position: PositionSchema,
    size: SizeSchema.optional(),
    radius: z.number().min(1).optional(),
    text: z.string().optional(),
    fill: ColorSchema.optional(),
    stroke: ColorSchema.optional(),
    strokeWidth: z.number().min(0).optional(),
    fontSize: z.number().min(8).max(72).optional()
  }),

  createText: z.object({
    text: z.string().min(1).max(500),
    position: PositionSchema,
    fontSize: z.number().min(8).max(72).default(16),
    fill: ColorSchema.default('#000000'),
    fontFamily: z.string().default('Arial'),
    fontWeight: z.enum(['normal', 'bold']).default('normal')
  }),

  // Manipulation Commands
  moveShape: z.object({
    shapeId: z.string().min(1),
    position: PositionSchema
  }),

  resizeShape: z.object({
    shapeId: z.string().min(1),
    size: SizeSchema.optional(),
    radius: z.number().min(1).optional()
  }),

  rotateShape: z.object({
    shapeId: z.string().min(1),
    degrees: z.number().min(-360).max(360)
  }),

  // Layout Commands
  arrangeInGrid: z.object({
    shapeIds: z.array(z.string()).min(2),
    rows: z.number().min(1).max(10),
    cols: z.number().min(1).max(10),
    spacing: z.number().min(0).default(20)
  }),

  arrangeInRow: z.object({
    shapeIds: z.array(z.string()).min(2),
    spacing: z.number().min(0).default(20),
    alignment: z.enum(['left', 'center', 'right']).default('left')
  }),

  // Complex Commands
  createLoginForm: z.object({
    position: PositionSchema,
    styling: z
      .object({
        backgroundColor: ColorSchema.optional(),
        borderColor: ColorSchema.optional(),
        textColor: ColorSchema.optional()
      })
      .optional()
  }),

  createNavigationBar: z.object({
    items: z
      .array(
        z.object({
          label: z.string().min(1).max(50),
          href: z.string().optional()
        })
      )
      .min(1)
      .max(10),
    position: PositionSchema,
    styling: z
      .object({
        backgroundColor: ColorSchema.optional(),
        textColor: ColorSchema.optional(),
        borderColor: ColorSchema.optional()
      })
      .optional()
  }),

  // Context Commands
  getCanvasState: z.object({
    includeShapes: z.boolean().default(true),
    includeViewport: z.boolean().default(true)
  }),

  findShapes: z.object({
    criteria: z.object({
      type: z.enum(['rect', 'circle', 'text']).optional(),
      color: ColorSchema.optional(),
      text: z.string().optional(),
      position: z
        .object({
          minX: z.number().optional(),
          maxX: z.number().optional(),
          minY: z.number().optional(),
          maxY: z.number().optional()
        })
        .optional()
    })
  })
}

// AI Tool Function Types
export type AIToolFunction<T extends keyof typeof AIToolSchemas> = {
  name: T
  description: string
  parameters: z.infer<(typeof AIToolSchemas)[T]>
  execute: (
    params: z.infer<(typeof AIToolSchemas)[T]>,
    context: AIContext
  ) => Promise<any>
}

// Tool factory function to create tools with injected dependencies
export function createAITools(queryClient: any) {
  const objectSync = getObjectSyncService(queryClient)

  // Available AI Tools
  return {
    createShape: {
      name: 'createShape',
      description:
        'Create a new shape (rectangle, circle, or text) on the canvas',
      parameters: AIToolSchemas.createShape,
      execute: async (
        params: z.infer<typeof AIToolSchemas.createShape>,
        context: AIContext
      ) => {
        console.log('🤖 createShape tool executing with params:', params)
        console.log('🤖 createShape tool context:', context)

        // Build options object, only including defined values
        const options: any = {}
        if (params.size) options.size = params.size
        if (params.radius) options.radius = params.radius
        if (params.text) options.text = params.text
        if (params.fill) options.fill = params.fill
        if (params.stroke) options.stroke = params.stroke
        if (params.strokeWidth) options.strokeWidth = params.strokeWidth
        if (params.fontSize) options.fontSize = params.fontSize

        const shape = await objectSync.createShapeWithDefaults(
          context.canvasId,
          params.type,
          params.position,
          options,
          context.userId
        )

        console.log('🤖 createShape tool created shape:', shape)
        return { success: true, shapeId: shape.id, shape }
      }
    },
    createText: {
      name: 'createText',
      description: 'Create a text element on the canvas',
      parameters: AIToolSchemas.createText,
      execute: async (
        params: z.infer<typeof AIToolSchemas.createText>,
        context: AIContext
      ) => {
        const shape = await objectSync.createShapeWithDefaults(
          context.canvasId,
          'text',
          params.position,
          {
            text: params.text,
            fontSize: params.fontSize,
            fill: params.fill,
            fontFamily: params.fontFamily,
            fontWeight: params.fontWeight
          },
          context.userId
        )
        return { success: true, shapeId: shape.id, shape }
      }
    },
    moveShape: {
      name: 'moveShape',
      description: 'Move a shape to a new position',
      parameters: AIToolSchemas.moveShape,
      execute: async (
        params: z.infer<typeof AIToolSchemas.moveShape>,
        context: AIContext
      ) => {
        await objectSync.updateObject(
          context.canvasId,
          params.shapeId,
          { x: params.position.x, y: params.position.y },
          context.userId
        )
        return { success: true }
      }
    },
    resizeShape: {
      name: 'resizeShape',
      description: 'Resize a shape',
      parameters: AIToolSchemas.resizeShape,
      execute: async (
        params: z.infer<typeof AIToolSchemas.resizeShape>,
        context: AIContext
      ) => {
        const updates: any = {}
        if (params.size) {
          updates.width = params.size.width
          updates.height = params.size.height
        }
        if (params.radius !== undefined) {
          updates.radius = params.radius
        }
        await objectSync.updateObject(
          context.canvasId,
          params.shapeId,
          updates,
          context.userId
        )
        return { success: true }
      }
    },
    rotateShape: {
      name: 'rotateShape',
      description: 'Rotate a shape by specified degrees',
      parameters: AIToolSchemas.rotateShape,
      execute: async (
        params: z.infer<typeof AIToolSchemas.rotateShape>,
        context: AIContext
      ) => {
        await objectSync.updateObject(
          context.canvasId,
          params.shapeId,
          { rotation: params.degrees },
          context.userId
        )
        return { success: true }
      }
    },
    arrangeInGrid: {
      name: 'arrangeInGrid',
      description: 'Arrange shapes in a grid layout',
      parameters: AIToolSchemas.arrangeInGrid,
      execute: async (
        params: z.infer<typeof AIToolSchemas.arrangeInGrid>,
        context: AIContext
      ) => {
        await objectSync.arrangeShapesInGrid(
          context.canvasId,
          params.shapeIds,
          { rows: params.rows, cols: params.cols, spacing: params.spacing },
          context.userId
        )
        return { success: true }
      }
    },
    arrangeInRow: {
      name: 'arrangeInRow',
      description: 'Arrange shapes in a horizontal row',
      parameters: AIToolSchemas.arrangeInRow,
      execute: async (
        params: z.infer<typeof AIToolSchemas.arrangeInRow>,
        context: AIContext
      ) => {
        await objectSync.arrangeShapesInRow(
          context.canvasId,
          params.shapeIds,
          params.spacing,
          context.userId
        )
        return { success: true }
      }
    },
    createLoginForm: {
      name: 'createLoginForm',
      description: 'Create a login form with username and password fields',
      parameters: AIToolSchemas.createLoginForm,
      execute: async (
        params: z.infer<typeof AIToolSchemas.createLoginForm>,
        context: AIContext
      ) => {
        const shapes = await objectSync.createFormLayout(
          context.canvasId,
          {
            fields: [
              {
                type: 'text',
                label: 'Username',
                placeholder: 'Enter username'
              },
              {
                type: 'password',
                label: 'Password',
                placeholder: 'Enter password'
              },
              { type: 'button', label: 'Login' }
            ],
            position: params.position,
            styling: params.styling
          },
          context.userId
        )
        return { success: true, shapeIds: shapes.map(s => s.id), shapes }
      }
    },
    createNavigationBar: {
      name: 'createNavigationBar',
      description: 'Create a navigation bar with menu items',
      parameters: AIToolSchemas.createNavigationBar,
      execute: async (
        params: z.infer<typeof AIToolSchemas.createNavigationBar>,
        context: AIContext
      ) => {
        const shapes = await objectSync.createNavigationBar(
          context.canvasId,
          {
            items: params.items,
            position: params.position,
            styling: params.styling
          },
          context.userId
        )
        return { success: true, shapeIds: shapes.map(s => s.id), shapes }
      }
    },
    getCanvasState: {
      name: 'getCanvasState',
      description: 'Get the current state of the canvas',
      parameters: AIToolSchemas.getCanvasState,
      execute: async (
        params: z.infer<typeof AIToolSchemas.getCanvasState>,
        context: AIContext
      ) => {
        const shapes = await objectSync.getAllObjects(context.canvasId)
        return {
          success: true,
          state: {
            shapes: params.includeShapes ? shapes : [],
            viewport: params.includeViewport
              ? context.currentState.viewport
              : null
          }
        }
      }
    },
    findShapes: {
      name: 'findShapes',
      description: 'Find shapes matching specified criteria',
      parameters: AIToolSchemas.findShapes,
      execute: async (
        params: z.infer<typeof AIToolSchemas.findShapes>,
        context: AIContext
      ) => {
        const allShapes = await objectSync.getAllObjects(context.canvasId)

        let filteredShapes = allShapes

        if (params.criteria.type) {
          filteredShapes = filteredShapes.filter(
            shape => shape.type === params.criteria.type
          )
        }

        if (params.criteria.color) {
          filteredShapes = filteredShapes.filter(
            shape =>
              shape.fill === params.criteria.color ||
              shape.stroke === params.criteria.color
          )
        }

        if (params.criteria.text) {
          filteredShapes = filteredShapes.filter(
            shape =>
              shape.type === 'text' &&
              (shape as any).text?.includes(params.criteria.text)
          )
        }

        if (params.criteria.position) {
          const { minX, maxX, minY, maxY } = params.criteria.position
          filteredShapes = filteredShapes.filter(shape => {
            const inX =
              (minX === undefined || shape.x >= minX) &&
              (maxX === undefined || shape.x <= maxX)
            const inY =
              (minY === undefined || shape.y >= minY) &&
              (maxY === undefined || shape.y <= maxY)
            return inX && inY
          })
        }

        return { success: true, shapes: filteredShapes }
      }
    }
  }
}
