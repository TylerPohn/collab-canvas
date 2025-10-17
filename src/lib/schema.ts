import { z } from 'zod'

// Shape type schemas
export const ShapeTypeSchema = z.enum([
  'rect',
  'circle',
  'text',
  'mermaid',
  'line',
  'arrow',
  'ellipse',
  'hexagon',
  'star',
  'image'
])

export const ShapeBaseSchema = z.object({
  id: z.string(),
  type: ShapeTypeSchema,
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  rotation: z.number().optional(),
  scaleX: z.number().optional(),
  scaleY: z.number().optional(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  text: z.string().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.string().optional(),
  fontStyle: z.string().optional(),
  textDecoration: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  lineHeight: z.number().optional(),
  cornerRadius: z.number().optional(),
  zIndex: z.number().optional(),
  createdAt: z.number(),
  createdBy: z.string(),
  updatedAt: z.number(),
  updatedBy: z.string()
})

export const RectangleShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('rect'),
  width: z.number(),
  height: z.number()
})

export const CircleShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('circle'),
  radius: z.number()
})

export const TextShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('text'),
  text: z.string(),
  fontSize: z.number()
})

export const MermaidShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('mermaid'),
  mermaidCode: z.string(),
  renderedSvg: z.string().optional(),
  diagramType: z.string().optional(),
  width: z.number(),
  height: z.number()
})

export const LineShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('line'),
  endX: z.number(),
  endY: z.number()
})

export const ArrowShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('arrow'),
  endX: z.number(),
  endY: z.number(),
  arrowType: z.enum(['start', 'end', 'both'])
})

export const EllipseShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('ellipse'),
  radiusX: z.number(),
  radiusY: z.number()
})

export const HexagonShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('hexagon'),
  radius: z.number(),
  sides: z.number().min(3).max(12)
})

export const StarShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('star'),
  outerRadius: z.number(),
  innerRadius: z.number(),
  points: z.number(),
  starType: z.enum(['5-point', '6-point', '8-point'])
})

export const ImageShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('image'),
  imageUrl: z.string(),
  imageName: z.string(),
  width: z.number(),
  height: z.number()
})

export const ShapeSchema = z.discriminatedUnion('type', [
  RectangleShapeSchema,
  CircleShapeSchema,
  TextShapeSchema,
  MermaidShapeSchema,
  LineShapeSchema,
  ArrowShapeSchema,
  EllipseShapeSchema,
  HexagonShapeSchema,
  StarShapeSchema,
  ImageShapeSchema
])

// Canvas metadata schema
export const CanvasMetaSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    scale: z.number()
  }),
  createdAt: z.number(),
  createdBy: z.string(),
  updatedAt: z.number(),
  updatedBy: z.string()
})

// Presence schema
export const UserPresenceSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  avatar: z.string().optional(),
  cursor: z.object({
    x: z.number(),
    y: z.number()
  }),
  lastSeen: z.number(),
  isActive: z.boolean()
})

// Firestore document schemas
export const CanvasDocumentSchema = z.object({
  meta: CanvasMetaSchema,
  objects: z.record(z.string(), ShapeSchema)
})

// Validation helpers
export function validateShape(data: unknown) {
  return ShapeSchema.parse(data)
}

export function validateCanvasMeta(data: unknown) {
  return CanvasMetaSchema.parse(data)
}

export function validateUserPresence(data: unknown) {
  return UserPresenceSchema.parse(data)
}

export function validateCanvasDocument(data: unknown) {
  return CanvasDocumentSchema.parse(data)
}

// Type exports for use in other files
export type ShapeType = z.infer<typeof ShapeTypeSchema>
export type ShapeBase = z.infer<typeof ShapeBaseSchema>
export type RectangleShape = z.infer<typeof RectangleShapeSchema>
export type CircleShape = z.infer<typeof CircleShapeSchema>
export type TextShape = z.infer<typeof TextShapeSchema>
export type MermaidShape = z.infer<typeof MermaidShapeSchema>
export type LineShape = z.infer<typeof LineShapeSchema>
export type ArrowShape = z.infer<typeof ArrowShapeSchema>
export type EllipseShape = z.infer<typeof EllipseShapeSchema>
export type HexagonShape = z.infer<typeof HexagonShapeSchema>
export type StarShape = z.infer<typeof StarShapeSchema>
export type ImageShape = z.infer<typeof ImageShapeSchema>
export type Shape = z.infer<typeof ShapeSchema>
export type CanvasMeta = z.infer<typeof CanvasMetaSchema>
export type UserPresence = z.infer<typeof UserPresenceSchema>
export type CanvasDocument = z.infer<typeof CanvasDocumentSchema>
