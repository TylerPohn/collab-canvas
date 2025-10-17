import { z } from 'zod'
import { getObjectSyncService } from '../sync/objects'
import type { AIContext } from './types'

// Base schemas
const PositionSchema = z.object({
  x: z.number(),
  y: z.number()
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
    fontSize: z.number().min(8).max(72).optional(),
    opacity: z.number().min(0).max(1).optional(),
    blendMode: z
      .enum([
        'normal',
        'multiply',
        'overlay',
        'screen',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'hard-light',
        'soft-light',
        'difference',
        'exclusion'
      ])
      .optional()
  }),

  createText: z.object({
    text: z.string().min(1).max(500),
    position: PositionSchema,
    fontSize: z.number().min(8).max(72).default(16),
    fill: ColorSchema.default('#000000'),
    fontFamily: z.string().default('Arial'),
    fontWeight: z.enum(['normal', 'bold']).default('normal'),
    opacity: z.number().min(0).max(1).optional(),
    blendMode: z
      .enum([
        'normal',
        'multiply',
        'overlay',
        'screen',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'hard-light',
        'soft-light',
        'difference',
        'exclusion'
      ])
      .optional()
  }),

  // Manipulation Commands
  moveShape: z.object({
    shapeId: z.string().min(1),
    position: PositionSchema
  }),

  moveShapeByOthers: z.object({
    shapeId: z.string().min(1),
    direction: z.enum(['left', 'right', 'up', 'down', 'center']),
    distance: z.number().min(1).default(50)
  }),

  resizeShape: z.object({
    shapeId: z.string().min(1),
    size: SizeSchema.optional(),
    radius: z.number().min(1).optional()
  }),

  resizeLarger: z.object({
    shapeId: z.string().min(1)
  }),

  resizeSmaller: z.object({
    shapeId: z.string().min(1)
  }),

  rotateShape: z.object({
    shapeId: z.string().min(1),
    degrees: z.number().min(-360).max(360)
  }),

  rotateShapeClockwise: z.object({
    shapeId: z.string().min(1)
  }),

  rotateShapeCounterclockwise: z.object({
    shapeId: z.string().min(1)
  }),

  // Layout Commands
  arrangeInGrid: z.object({
    shapeIds: z.array(z.string()).min(2),
    rows: z.number().min(1).max(10),
    cols: z.number().min(1).max(10),
    spacing: z.number().min(0).default(20)
  }),

  // Delete Commands
  deleteAllShapes: z.object({
    confirm: z.boolean().default(false)
  }),

  arrangeInRow: z.object({
    shapeIds: z.array(z.string()).min(2),
    spacing: z.number().min(0).default(20),
    alignment: z.enum(['left', 'center', 'right']).default('left')
  }),

  // NEW: Column Layout (PR #25)
  arrangeInColumn: z.object({
    shapeIds: z.array(z.string()).min(2),
    spacing: z.number().min(0).default(20),
    alignment: z.enum(['left', 'center', 'right']).default('left')
  }),

  // NEW: Advanced Alignment (PR #25)
  alignShapes: z.object({
    shapeIds: z.array(z.string()).min(2),
    alignment: z.enum(['left', 'center', 'right', 'top', 'middle', 'bottom']),
    axis: z.enum(['horizontal', 'vertical']).default('horizontal')
  }),

  distributeShapes: z.object({
    shapeIds: z.array(z.string()).min(3),
    direction: z.enum(['horizontal', 'vertical']),
    spacing: z.number().min(0).default(20)
  }),

  // NEW: Style Manipulation (PR #25)
  changeColor: z.object({
    shapeId: z.string().min(1),
    fill: ColorSchema.optional(),
    stroke: ColorSchema.optional(),
    opacity: z.number().min(0).max(1).optional(),
    blendMode: z
      .enum([
        'normal',
        'multiply',
        'overlay',
        'screen',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'hard-light',
        'soft-light',
        'difference',
        'exclusion'
      ])
      .optional()
  }),

  copyStyle: z.object({
    sourceShapeId: z.string().min(1),
    targetShapeIds: z.array(z.string()).min(1)
  }),

  // NEW: Duplication (PR #25)
  duplicateShape: z.object({
    shapeId: z.string().min(1),
    offset: PositionSchema.optional()
  }),

  spaceEvenly: z.object({
    shapeIds: z.array(z.string()).min(2),
    direction: z.enum(['horizontal', 'vertical']).default('horizontal'),
    padding: z.number().min(0).default(20)
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

  createCardLayout: z.object({
    position: PositionSchema,
    cardConfig: z.object({
      title: z.string().min(1).max(100),
      description: z.string().min(1).max(500),
      imageUrl: z.string().url().optional(),
      imageAlt: z.string().optional()
    }),
    styling: z
      .object({
        backgroundColor: ColorSchema.optional(),
        borderColor: ColorSchema.optional(),
        textColor: ColorSchema.optional(),
        titleColor: ColorSchema.optional(),
        borderWidth: z.number().min(0).optional(),
        borderRadius: z.number().min(0).optional(),
        padding: z.number().min(0).optional(),
        cardWidth: z.number().min(200).max(600).optional(),
        cardHeight: z.number().min(200).max(800).optional()
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

        // Automatically select the newly created shape
        const { useSelectionStore } = await import('../../store/selection')
        useSelectionStore.getState().selectShape(shape.id)

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

        // Automatically select the newly created shape
        const { useSelectionStore } = await import('../../store/selection')
        useSelectionStore.getState().selectShape(shape.id)

        return { success: true, shapeId: shape.id, shape }
      }
    },
    moveShape: {
      name: 'moveShape',
      description:
        "Move a shape to a new absolute position. Use this tool for directional movements (e.g., 'move 300px to the right'): calculate the new position by adding/subtracting from the current position. You need the shapeId to use this tool. If you don't have the shapeId, first use getCanvasState or findShapes to locate the shape.",
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

    moveShapeByOthers: {
      name: 'moveShapeByOthers',
      description:
        "Move a shape relative to OTHER shapes on the canvas (e.g., 'move to the right of other shapes'). ONLY use this tool when positioning relative to OTHER shapes. For simple directional movements by pixel amounts, use moveShape instead. You need the shapeId to use this tool. If you don't have the shapeId, first use getCanvasState or findShapes to locate the shape.",
      parameters: AIToolSchemas.moveShapeByOthers,
      execute: async (
        params: z.infer<typeof AIToolSchemas.moveShapeByOthers>,
        context: AIContext
      ) => {
        // Get the target shape
        const targetShape = await objectSync.getObject(
          context.canvasId,
          params.shapeId
        )

        if (!targetShape) {
          throw new Error(`Shape with id ${params.shapeId} not found`)
        }

        // Get all other shapes on the canvas
        const allShapes = await objectSync.getAllObjects(context.canvasId)
        const otherShapes = allShapes.filter(
          (shape: any) => shape.id !== params.shapeId
        )

        if (otherShapes.length === 0) {
          // Fallback: if no other shapes, move by distance from current position
          console.log(
            '🤖 No other shapes found, using relative movement from current position'
          )
          let newX = targetShape.x
          let newY = targetShape.y

          switch (params.direction) {
            case 'left':
              newX = targetShape.x - params.distance
              break
            case 'right':
              newX = targetShape.x + params.distance
              break
            case 'up':
              newY = targetShape.y - params.distance
              break
            case 'down':
              newY = targetShape.y + params.distance
              break
            case 'center':
              // No-op for center when no other shapes
              console.log(
                '🤖 Cannot center relative to other shapes when none exist'
              )
              break
          }

          await objectSync.updateObject(
            context.canvasId,
            params.shapeId,
            { x: newX, y: newY },
            context.userId
          )
          return {
            success: true,
            message: 'Moved shape by distance from current position'
          }
        }

        let newX = targetShape.x
        let newY = targetShape.y

        if (params.direction === 'center') {
          // Move to center of all other shapes
          const centerX =
            otherShapes.reduce((sum: number, shape: any) => sum + shape.x, 0) /
            otherShapes.length
          const centerY =
            otherShapes.reduce((sum: number, shape: any) => sum + shape.y, 0) /
            otherShapes.length
          newX = centerX
          newY = centerY
        } else {
          // Calculate bounds of other shapes
          const minX = Math.min(...otherShapes.map((shape: any) => shape.x))
          const maxX = Math.max(
            ...otherShapes.map((shape: any) => shape.x + (shape.width || 0))
          )
          const minY = Math.min(...otherShapes.map((shape: any) => shape.y))
          const maxY = Math.max(
            ...otherShapes.map((shape: any) => shape.y + (shape.height || 0))
          )

          switch (params.direction) {
            case 'left':
              newX = minX - params.distance
              break
            case 'right':
              newX = maxX + params.distance
              break
            case 'up':
              newY = minY - params.distance
              break
            case 'down':
              newY = maxY + params.distance
              break
          }
        }

        await objectSync.updateObject(
          context.canvasId,
          params.shapeId,
          { x: newX, y: newY },
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
        // Get the current shape to determine its type
        const currentShape = await objectSync.getObject(
          context.canvasId,
          params.shapeId
        )

        if (!currentShape) {
          throw new Error(`Shape with ID ${params.shapeId} not found`)
        }

        const updates: any = {}

        // Apply size changes based on shape type
        if (currentShape.type === 'rect' && params.size) {
          updates.width = params.size.width
          updates.height = params.size.height
        } else if (
          currentShape.type === 'circle' &&
          params.radius !== undefined
        ) {
          updates.radius = params.radius
        } else if (currentShape.type === 'text' && params.size) {
          // For text, we might want to adjust fontSize instead
          updates.fontSize = Math.max(8, Math.min(72, params.size.width / 10))
        }

        console.log('🤖 Resizing shape:', {
          shapeId: params.shapeId,
          shapeType: currentShape.type,
          updates
        })

        await objectSync.updateObject(
          context.canvasId,
          params.shapeId,
          updates,
          context.userId
        )
        return { success: true }
      }
    },
    resizeLarger: {
      name: 'resizeLarger',
      description: 'Make a shape larger using Fibonacci ratio (1.618x)',
      parameters: AIToolSchemas.resizeLarger,
      execute: async (
        params: z.infer<typeof AIToolSchemas.resizeLarger>,
        context: AIContext
      ) => {
        const currentShape = await objectSync.getObject(
          context.canvasId,
          params.shapeId
        )

        if (!currentShape) {
          throw new Error(`Shape with ID ${params.shapeId} not found`)
        }

        const updates: any = {}
        const fibRatio = 1.618 // Golden ratio

        // Apply Fibonacci ratio based on shape type
        if (currentShape.type === 'rect') {
          const currentWidth = (currentShape as any).width || 100
          const currentHeight = (currentShape as any).height || 100
          updates.width = Math.round(currentWidth * fibRatio)
          updates.height = Math.round(currentHeight * fibRatio)
        } else if (currentShape.type === 'circle') {
          const currentRadius = (currentShape as any).radius || 50
          updates.radius = Math.round(currentRadius * fibRatio)
        } else if (currentShape.type === 'text') {
          const currentFontSize = (currentShape as any).fontSize || 16
          updates.fontSize = Math.max(
            8,
            Math.min(72, Math.round(currentFontSize * fibRatio))
          )
        }

        console.log('🤖 Making shape larger:', {
          shapeId: params.shapeId,
          shapeType: currentShape.type,
          fibRatio,
          updates
        })

        await objectSync.updateObject(
          context.canvasId,
          params.shapeId,
          updates,
          context.userId
        )
        return { success: true }
      }
    },
    resizeSmaller: {
      name: 'resizeSmaller',
      description: 'Make a shape smaller using Fibonacci ratio (0.618x)',
      parameters: AIToolSchemas.resizeSmaller,
      execute: async (
        params: z.infer<typeof AIToolSchemas.resizeSmaller>,
        context: AIContext
      ) => {
        const currentShape = await objectSync.getObject(
          context.canvasId,
          params.shapeId
        )

        if (!currentShape) {
          throw new Error(`Shape with ID ${params.shapeId} not found`)
        }

        const updates: any = {}
        const fibRatio = 0.618 // Inverse golden ratio

        // Apply Fibonacci ratio based on shape type
        if (currentShape.type === 'rect') {
          const currentWidth = (currentShape as any).width || 100
          const currentHeight = (currentShape as any).height || 100
          updates.width = Math.max(10, Math.round(currentWidth * fibRatio))
          updates.height = Math.max(10, Math.round(currentHeight * fibRatio))
        } else if (currentShape.type === 'circle') {
          const currentRadius = (currentShape as any).radius || 50
          updates.radius = Math.max(5, Math.round(currentRadius * fibRatio))
        } else if (currentShape.type === 'text') {
          const currentFontSize = (currentShape as any).fontSize || 16
          updates.fontSize = Math.max(
            8,
            Math.min(72, Math.round(currentFontSize * fibRatio))
          )
        }

        console.log('🤖 Making shape smaller:', {
          shapeId: params.shapeId,
          shapeType: currentShape.type,
          fibRatio,
          updates
        })

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
      description: 'Rotate a shape by specified degrees (cumulative)',
      parameters: AIToolSchemas.rotateShape,
      execute: async (
        params: z.infer<typeof AIToolSchemas.rotateShape>,
        context: AIContext
      ) => {
        // Get current shape to add to existing rotation
        const currentShape = await objectSync.getObject(
          context.canvasId,
          params.shapeId
        )

        if (!currentShape) {
          throw new Error(`Shape with id ${params.shapeId} not found`)
        }

        // Add to existing rotation (cumulative)
        const currentRotation = currentShape.rotation || 0
        const newRotation = currentRotation + params.degrees

        await objectSync.updateObject(
          context.canvasId,
          params.shapeId,
          { rotation: newRotation },
          context.userId
        )
        return { success: true }
      }
    },

    rotateShapeClockwise: {
      name: 'rotateShapeClockwise',
      description: 'Rotate a shape 45 degrees clockwise (cumulative)',
      parameters: AIToolSchemas.rotateShapeClockwise,
      execute: async (
        params: z.infer<typeof AIToolSchemas.rotateShapeClockwise>,
        context: AIContext
      ) => {
        // Get current shape to add to existing rotation
        const currentShape = await objectSync.getObject(
          context.canvasId,
          params.shapeId
        )

        if (!currentShape) {
          throw new Error(`Shape with id ${params.shapeId} not found`)
        }

        // Add 45 degrees clockwise to existing rotation (cumulative)
        const currentRotation = currentShape.rotation || 0
        const newRotation = currentRotation + 45

        await objectSync.updateObject(
          context.canvasId,
          params.shapeId,
          { rotation: newRotation },
          context.userId
        )
        return { success: true }
      }
    },

    rotateShapeCounterclockwise: {
      name: 'rotateShapeCounterclockwise',
      description: 'Rotate a shape 45 degrees counterclockwise (cumulative)',
      parameters: AIToolSchemas.rotateShapeCounterclockwise,
      execute: async (
        params: z.infer<typeof AIToolSchemas.rotateShapeCounterclockwise>,
        context: AIContext
      ) => {
        // Get current shape to add to existing rotation
        const currentShape = await objectSync.getObject(
          context.canvasId,
          params.shapeId
        )

        if (!currentShape) {
          throw new Error(`Shape with id ${params.shapeId} not found`)
        }

        // Add -45 degrees (counterclockwise) to existing rotation (cumulative)
        const currentRotation = currentShape.rotation || 0
        const newRotation = currentRotation - 45

        await objectSync.updateObject(
          context.canvasId,
          params.shapeId,
          { rotation: newRotation },
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
    spaceEvenly: {
      name: 'spaceEvenly',
      description: 'Space shapes evenly with equal gaps between them',
      parameters: AIToolSchemas.spaceEvenly,
      execute: async (
        params: z.infer<typeof AIToolSchemas.spaceEvenly>,
        context: AIContext
      ) => {
        await objectSync.spaceShapesEvenly(
          context.canvasId,
          params.shapeIds,
          params.direction,
          params.padding,
          context.userId
        )
        return { success: true }
      }
    },
    // NEW: Column Layout (PR #25)
    arrangeInColumn: {
      name: 'arrangeInColumn',
      description: 'Arrange shapes in a vertical column',
      parameters: AIToolSchemas.arrangeInColumn,
      execute: async (
        params: z.infer<typeof AIToolSchemas.arrangeInColumn>,
        context: AIContext
      ) => {
        await objectSync.arrangeShapesInColumn(
          context.canvasId,
          params.shapeIds,
          params.spacing,
          context.userId
        )
        return { success: true }
      }
    },
    // NEW: Advanced Alignment (PR #25)
    alignShapes: {
      name: 'alignShapes',
      description:
        'Align shapes to left, center, right, top, middle, or bottom',
      parameters: AIToolSchemas.alignShapes,
      execute: async (
        params: z.infer<typeof AIToolSchemas.alignShapes>,
        context: AIContext
      ) => {
        await objectSync.alignShapes(
          context.canvasId,
          params.shapeIds,
          params.alignment,
          params.axis,
          context.userId
        )
        return { success: true }
      }
    },
    distributeShapes: {
      name: 'distributeShapes',
      description: 'Distribute shapes evenly with specified spacing',
      parameters: AIToolSchemas.distributeShapes,
      execute: async (
        params: z.infer<typeof AIToolSchemas.distributeShapes>,
        context: AIContext
      ) => {
        await objectSync.distributeShapes(
          context.canvasId,
          params.shapeIds,
          params.direction,
          params.spacing,
          context.userId
        )
        return { success: true }
      }
    },
    // NEW: Style Manipulation (PR #25)
    changeColor: {
      name: 'changeColor',
      description: 'Change the color, opacity, or blend mode of a shape',
      parameters: AIToolSchemas.changeColor,
      execute: async (
        params: z.infer<typeof AIToolSchemas.changeColor>,
        context: AIContext
      ) => {
        await objectSync.changeShapeColor(
          context.canvasId,
          params.shapeId,
          params.fill,
          params.stroke,
          context.userId,
          params.opacity,
          params.blendMode
        )
        return { success: true }
      }
    },
    copyStyle: {
      name: 'copyStyle',
      description: 'Copy style from one shape to others',
      parameters: AIToolSchemas.copyStyle,
      execute: async (
        params: z.infer<typeof AIToolSchemas.copyStyle>,
        context: AIContext
      ) => {
        await objectSync.copyShapeStyle(
          context.canvasId,
          params.sourceShapeId,
          params.targetShapeIds,
          context.userId
        )
        return { success: true }
      }
    },
    // NEW: Duplication (PR #25)
    duplicateShape: {
      name: 'duplicateShape',
      description: 'Duplicate a shape with optional offset positioning',
      parameters: AIToolSchemas.duplicateShape,
      execute: async (
        params: z.infer<typeof AIToolSchemas.duplicateShape>,
        context: AIContext
      ) => {
        const newShapeId = await objectSync.duplicateShape(
          context.canvasId,
          params.shapeId,
          params.offset,
          context.userId
        )
        return { success: true, newShapeId }
      }
    },

    deleteAllShapes: {
      name: 'deleteAllShapes',
      description: 'Delete all shapes from the canvas',
      parameters: AIToolSchemas.deleteAllShapes,
      execute: async (
        params: z.infer<typeof AIToolSchemas.deleteAllShapes>,
        context: AIContext
      ) => {
        if (!params.confirm) {
          throw new Error('Delete all shapes requires confirmation')
        }

        // Get all shapes on the canvas
        const allShapes = await objectSync.getAllObjects(context.canvasId)

        if (allShapes.length === 0) {
          return { success: true, message: 'No shapes to delete' }
        }

        // Delete all shapes
        const shapeIds = allShapes.map((shape: any) => shape.id)
        await objectSync.batchDeleteObjects(context.canvasId, shapeIds)

        return { success: true, deletedCount: shapeIds.length }
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

        // Automatically select the newly created shapes
        const { useSelectionStore } = await import('../../store/selection')
        const shapeIds = shapes.map(s => s.id)
        useSelectionStore.getState().selectMultiple(shapeIds)

        return { success: true, shapeIds: shapeIds, shapes }
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

        // Automatically select the newly created shapes
        const { useSelectionStore } = await import('../../store/selection')
        const shapeIds = shapes.map(s => s.id)
        useSelectionStore.getState().selectMultiple(shapeIds)

        return { success: true, shapeIds: shapeIds, shapes }
      }
    },
    createCardLayout: {
      name: 'createCardLayout',
      description: 'Create a card layout with title, image, and description',
      parameters: AIToolSchemas.createCardLayout,
      execute: async (
        params: z.infer<typeof AIToolSchemas.createCardLayout>,
        context: AIContext
      ) => {
        const shapes = await objectSync.createCardLayout(
          context.canvasId,
          {
            cardConfig: params.cardConfig,
            position: params.position,
            styling: params.styling
          },
          context.userId
        )

        // Automatically select the newly created shapes
        const { useSelectionStore } = await import('../../store/selection')
        const shapeIds = shapes.map(s => s.id)
        useSelectionStore.getState().selectMultiple(shapeIds)

        return { success: true, shapeIds: shapeIds, shapes }
      }
    },
    getCanvasState: {
      name: 'getCanvasState',
      description:
        'Get the current state of the canvas including all shapes. Use this tool first when you need to locate shapes before manipulating them. Returns shape information including shapeId which you can use with other tools.',
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
          },
          message: `Canvas has ${shapes.length} shapes. Use the shapeId from these results with moveShape, resizeShape, or other manipulation tools.`
        }
      }
    },
    findShapes: {
      name: 'findShapes',
      description:
        'Find shapes matching specified criteria. Use this tool first when you need to locate a shape before moving, resizing, or manipulating it. Returns shape information including shapeId which you can use with other tools.',
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

        return {
          success: true,
          shapes: filteredShapes,
          message: `Found ${filteredShapes.length} shapes matching criteria. Use the shapeId from these results with moveShape, resizeShape, or other manipulation tools.`
        }
      }
    }
  }
}
