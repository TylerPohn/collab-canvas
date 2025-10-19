import type { SupportedBlendMode } from './blendModes'

// Core shape types
export type ShapeType =
  | 'rect'
  | 'circle'
  | 'text'
  | 'mermaid'
  | 'line'
  | 'arrow'
  | 'ellipse'
  | 'hexagon'
  | 'star'
  | 'image'

export interface ShapeBase {
  id: string
  type: ShapeType
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number
  cornerRadius?: number
  zIndex?: number
  opacity?: number
  blendMode?: SupportedBlendMode
  createdAt: number
  createdBy: string
  updatedAt: number
  updatedBy: string
}

// Specific shape types
export interface RectangleShape extends ShapeBase {
  type: 'rect'
  width: number
  height: number
}

export interface CircleShape extends ShapeBase {
  type: 'circle'
  radius: number
}

export interface TextShape extends ShapeBase {
  type: 'text'
  text: string
  fontSize: number
}

export interface MermaidShape extends ShapeBase {
  type: 'mermaid'
  mermaidCode: string
  renderedSvg?: string
  diagramType?: string
  width: number
  height: number
}

export interface LineShape extends ShapeBase {
  type: 'line'
  endX: number
  endY: number
}

export interface ArrowShape extends ShapeBase {
  type: 'arrow'
  endX: number
  endY: number
  arrowType: 'start' | 'end' | 'both'
}

export interface EllipseShape extends ShapeBase {
  type: 'ellipse'
  radiusX: number
  radiusY: number
}

export interface HexagonShape extends ShapeBase {
  type: 'hexagon'
  radius: number
  sides: number
}

export interface StarShape extends ShapeBase {
  type: 'star'
  outerRadius: number
  innerRadius: number
  points: number
  starType: '5-point' | '6-point' | '8-point'
}

export interface ImageShape extends ShapeBase {
  type: 'image'
  imageUrl: string
  imageName: string
  width: number
  height: number
}

export type Shape =
  | RectangleShape
  | CircleShape
  | TextShape
  | MermaidShape
  | LineShape
  | ArrowShape
  | EllipseShape
  | HexagonShape
  | StarShape
  | ImageShape

// Canvas access types
export type CanvasAccessType = 'private' | 'link' | 'public'

// Canvas permissions
export interface CanvasPermissions {
  ownerId: string
  accessType: CanvasAccessType
  password?: string // Hashed password for link-based access
  accessedBy: string[] // Array of user IDs who have accessed this canvas
}

// Canvas metadata
export interface CanvasMeta {
  id: string
  name?: string
  description?: string
  thumbnail?: string // Base64 data URL for canvas thumbnail
  viewport: {
    x: number
    y: number
    scale: number
  }
  permissions: CanvasPermissions
  lastAccessedAt?: number // Track when user last opened this canvas
  createdAt: number
  createdBy: string
  updatedAt: number
  updatedBy: string
}

// Canvas list item for dashboard/gallery views
export interface CanvasListItem {
  id: string
  name: string
  description?: string
  thumbnail?: string
  ownerId: string
  ownerName: string
  accessType: CanvasAccessType
  hasPassword: boolean
  lastModified: number
  lastAccessedAt?: number
  isOwner: boolean
  hasAccessed: boolean
}

// Presence and cursor tracking
export interface UserPresence {
  userId: string
  displayName: string
  avatar?: string
  cursor: {
    x: number
    y: number
  }
  lastSeen: number
  isActive: boolean
}

// Firestore document references
export interface CanvasDocument {
  meta: CanvasMeta
  objects: Record<string, Shape>
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Clipboard types
export interface CanvasClipboardData {
  shapes: ShapeWithOriginalPosition[]
  relativePositions: RelativePositions
  copiedAt: number
  version: string
}

export type ShapeWithOriginalPosition = Shape & {
  originalX: number
  originalY: number
}

export interface RelativePositions {
  centerX: number
  centerY: number
  offsets: Array<{ x: number; y: number }>
}

export interface PastePosition {
  x: number
  y: number
  offsetX?: number
  offsetY?: number
}

// Selection state (UI-only, not synced)
export interface SelectionState {
  selectedIds: string[]
  isMultiSelect: boolean
}

// Tool types for the toolbar
export type ToolType =
  | 'select'
  | 'pan'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'mermaid'
  | 'line'
  | 'arrow'
  | 'ellipse'
  | 'hexagon'
  | 'star'
  | 'image'

// Viewport state
export interface ViewportState {
  x: number
  y: number
  scale: number
}

// User authentication state
export interface User {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}
