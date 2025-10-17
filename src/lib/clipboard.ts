import type { Shape } from './types'

/**
 * Clipboard service for managing canvas object copy/paste operations
 * Integrates with system clipboard for cross-application compatibility
 */
export class ClipboardService {
  private static instance: ClipboardService
  private canvasClipboardData: CanvasClipboardData | null = null

  static getInstance(): ClipboardService {
    if (!ClipboardService.instance) {
      ClipboardService.instance = new ClipboardService()
    }
    return ClipboardService.instance
  }

  /**
   * Copy shapes to clipboard (both internal and system clipboard)
   */
  async copyShapes(shapes: Shape[]): Promise<void> {
    if (shapes.length === 0) {
      throw new Error('No shapes to copy')
    }

    // Calculate relative positions for multi-object selections
    const relativePositions = this.calculateRelativePositions(shapes)

    // Create clipboard data
    const clipboardData: CanvasClipboardData = {
      shapes: shapes.map(shape => ({
        ...shape,
        // Store original positions for relative positioning
        originalX: shape.x,
        originalY: shape.y
      })),
      relativePositions,
      copiedAt: Date.now(),
      version: '1.0'
    }

    // Store in internal clipboard
    this.canvasClipboardData = clipboardData

    // Copy to system clipboard
    try {
      await this.copyToSystemClipboard(clipboardData)
    } catch (error) {
      console.warn('Failed to copy to system clipboard:', error)
      // Continue with internal clipboard only
    }
  }

  /**
   * Paste shapes from clipboard
   */
  async pasteShapes(): Promise<CanvasClipboardData | null> {
    // Try system clipboard first
    try {
      const systemData = await this.pasteFromSystemClipboard()
      if (systemData) {
        this.canvasClipboardData = systemData
        return systemData
      }
    } catch (error) {
      console.warn('Failed to paste from system clipboard:', error)
    }

    // Fallback to internal clipboard
    return this.canvasClipboardData
  }

  /**
   * Check if clipboard has canvas objects
   */
  hasCanvasObjects(): boolean {
    return this.canvasClipboardData !== null
  }

  /**
   * Clear clipboard
   */
  clear(): void {
    this.canvasClipboardData = null
  }

  /**
   * Calculate relative positions for multi-object selections
   */
  private calculateRelativePositions(shapes: Shape[]): RelativePositions {
    if (shapes.length === 0) {
      return { centerX: 0, centerY: 0, offsets: [] }
    }

    if (shapes.length === 1) {
      return {
        centerX: shapes[0].x,
        centerY: shapes[0].y,
        offsets: [{ x: 0, y: 0 }]
      }
    }

    // Calculate bounding box center
    const xs = shapes.map(s => s.x)
    const ys = shapes.map(s => s.y)
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2

    // Calculate offsets from center
    const offsets = shapes.map(shape => ({
      x: shape.x - centerX,
      y: shape.y - centerY
    }))

    return { centerX, centerY, offsets }
  }

  /**
   * Copy data to system clipboard
   */
  private async copyToSystemClipboard(
    data: CanvasClipboardData
  ): Promise<void> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported')
    }

    const clipboardText = JSON.stringify(data)
    await navigator.clipboard.writeText(clipboardText)
  }

  /**
   * Paste data from system clipboard
   */
  private async pasteFromSystemClipboard(): Promise<CanvasClipboardData | null> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported')
    }

    try {
      const clipboardText = await navigator.clipboard.readText()
      const data = JSON.parse(clipboardText) as CanvasClipboardData

      // Validate clipboard data
      if (this.isValidCanvasClipboardData(data)) {
        return data
      }
    } catch (error) {
      // Not canvas data or invalid JSON
      return null
    }

    return null
  }

  /**
   * Validate clipboard data structure
   */
  private isValidCanvasClipboardData(data: any): data is CanvasClipboardData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.shapes) &&
      typeof data.copiedAt === 'number' &&
      typeof data.version === 'string' &&
      data.relativePositions &&
      typeof data.relativePositions.centerX === 'number' &&
      typeof data.relativePositions.centerY === 'number' &&
      Array.isArray(data.relativePositions.offsets)
    )
  }
}

/**
 * Data structure for clipboard operations
 */
export interface CanvasClipboardData {
  shapes: ShapeWithOriginalPosition[]
  relativePositions: RelativePositions
  copiedAt: number
  version: string
}

/**
 * Shape with original position for relative positioning
 */
export type ShapeWithOriginalPosition = Shape & {
  originalX: number
  originalY: number
}

/**
 * Relative positioning data for multi-object selections
 */
export interface RelativePositions {
  centerX: number
  centerY: number
  offsets: Array<{ x: number; y: number }>
}

/**
 * Paste position options
 */
export interface PastePosition {
  x: number
  y: number
  offsetX?: number
  offsetY?: number
}

/**
 * Get clipboard service instance
 */
export const getClipboardService = (): ClipboardService => {
  return ClipboardService.getInstance()
}
