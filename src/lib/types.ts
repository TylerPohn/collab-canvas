// Core shape types
export type ShapeType = 'rect' | 'circle' | 'text'

export interface ShapeBase {
  id: string
  type: ShapeType
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  rotation?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  cornerRadius?: number
  zIndex?: number
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

export type Shape = RectangleShape | CircleShape | TextShape

// Canvas metadata
export interface CanvasMeta {
  id: string
  name?: string
  viewport: {
    x: number
    y: number
    scale: number
  }
  createdAt: number
  createdBy: string
  updatedAt: number
  updatedBy: string
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

// Object lock for conflict resolution
export interface ObjectLock {
  objectId: string
  lockedBy: string
  lockedByDisplayName: string
  lockedAt: number
  expiresAt: number
}

// Selection state (UI-only, not synced)
export interface SelectionState {
  selectedIds: string[]
  isMultiSelect: boolean
  lockedObjects: Record<string, ObjectLock>
}

// Tool types for the toolbar
export type ToolType = 'select' | 'pan' | 'rectangle' | 'circle' | 'text'

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
