import {
  Bold,
  Italic,
  Layers,
  Paintbrush,
  Palette,
  PanelLeft,
  RotateCcw,
  Type,
  Underline
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Shape, User, UserPresence } from '../lib/types'
import { formatLastEdited, getUserDisplayName } from '../lib/utils'
import { useDesignPaletteStore } from '../store/designPalette'
import { useSelectionStore } from '../store/selection'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Slider } from './ui/slider'

interface DesignPaletteProps {
  isOpen: boolean
  onToggle: () => void
  shapes: Shape[]
  onShapeUpdate: (id: string, updates: Partial<Shape>) => void
  onShapeUpdateDebounced: (id: string, updates: Partial<Shape>) => void
  currentUser: User | null
  presence: UserPresence[]
}

const DesignPalette: React.FC<DesignPaletteProps> = ({
  isOpen,
  onToggle,
  shapes,
  onShapeUpdate,
  onShapeUpdateDebounced,
  currentUser,
  presence
}) => {
  const { selectedIds } = useSelectionStore()

  // Get selected shapes
  const selectedShapes = shapes.filter(shape => selectedIds.includes(shape.id))
  const hasSelection = selectedShapes.length > 0

  // Get properties from first selected shape (for single selection)
  const firstSelectedShape = selectedShapes[0]

  // Design palette store
  const {
    selectedFillColor,
    selectedStrokeColor,
    strokeWidth,
    rotation,
    cornerRadius,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textDecoration,
    textAlign,
    lineHeight,
    setSelectedFillColor,
    setSelectedStrokeColor,
    setStrokeWidth,
    setRotation,
    setCornerRadius,
    setFontSize,
    setFontFamily,
    setFontWeight,
    setFontStyle,
    setTextDecoration,
    setTextAlign,
    setLineHeight
  } = useDesignPaletteStore()
  // Local state for UI toggles
  const [isBold, setIsBold] = useState(fontWeight === 'bold')
  const [isItalic, setIsItalic] = useState(fontStyle === 'italic')
  const [isUnderline, setIsUnderline] = useState(textDecoration === 'underline')

  // Update store state when selection changes
  React.useEffect(() => {
    if (firstSelectedShape) {
      setSelectedFillColor(firstSelectedShape.fill || '#3B82F6')
      setSelectedStrokeColor(firstSelectedShape.stroke || '#1F2937')
      setStrokeWidth(firstSelectedShape.strokeWidth ?? 2)
      setRotation(firstSelectedShape.rotation ?? 0)
      setCornerRadius(firstSelectedShape.cornerRadius ?? 0)
      setFontSize(firstSelectedShape.fontSize ?? 16)
      setFontFamily(firstSelectedShape.fontFamily || 'Arial')
      setFontWeight(
        (firstSelectedShape.fontWeight as 'normal' | 'bold') || 'normal'
      )
      setFontStyle(
        (firstSelectedShape.fontStyle as 'normal' | 'italic') || 'normal'
      )
      setTextDecoration(
        (firstSelectedShape.textDecoration as 'none' | 'underline') || 'none'
      )
      setTextAlign(
        (firstSelectedShape.textAlign as 'left' | 'center' | 'right') || 'left'
      )
      setLineHeight(firstSelectedShape.lineHeight ?? 1.2)
      setIsBold(firstSelectedShape.fontWeight === 'bold')
      setIsItalic(firstSelectedShape.fontStyle === 'italic')
      setIsUnderline(firstSelectedShape.textDecoration === 'underline')
    }
  }, [
    firstSelectedShape,
    setSelectedFillColor,
    setSelectedStrokeColor,
    setStrokeWidth,
    setRotation,
    setCornerRadius,
    setFontSize,
    setFontFamily,
    setFontWeight,
    setFontStyle,
    setTextDecoration,
    setTextAlign,
    setLineHeight
  ])

  // Helper function to update selected shapes with immediate preview
  const updateSelectedShapes = useCallback(
    (updates: Partial<Shape>) => {
      selectedShapes.forEach(shape => {
        onShapeUpdateDebounced(shape.id, updates)
      })
    },
    [selectedShapes, onShapeUpdateDebounced]
  )

  // Handle fill color change
  const handleFillColorChange = (color: string) => {
    setSelectedFillColor(color)
    updateSelectedShapes({ fill: color })
  }

  // Handle stroke color change
  const handleStrokeColorChange = (color: string) => {
    setSelectedStrokeColor(color)
    updateSelectedShapes({ stroke: color })
  }

  // Handle stroke width change with immediate preview
  const handleStrokeWidthChange = useCallback(
    (newStrokeWidth: number) => {
      setStrokeWidth(newStrokeWidth)
      updateSelectedShapes({ strokeWidth: newStrokeWidth })
    },
    [setStrokeWidth, updateSelectedShapes]
  )

  // Handle rotation change
  const handleRotationChange = (newRotation: number) => {
    setRotation(newRotation)
    updateSelectedShapes({ rotation: newRotation })
  }

  // Debounced font size change
  const fontSizeTimeoutRef = useRef<number | undefined>(undefined)
  const handleFontSizeChange = useCallback(
    (newFontSize: number) => {
      setFontSize(newFontSize)

      // Clear existing timeout
      if (fontSizeTimeoutRef.current) {
        clearTimeout(fontSizeTimeoutRef.current)
      }

      // Debounce the shape update
      fontSizeTimeoutRef.current = window.setTimeout(() => {
        updateSelectedShapes({ fontSize: newFontSize })
      }, 100)
    },
    [setFontSize, updateSelectedShapes]
  )

  // Handle corner radius change with immediate preview
  const handleCornerRadiusChange = useCallback(
    (newCornerRadius: number) => {
      setCornerRadius(newCornerRadius)
      updateSelectedShapes({ cornerRadius: newCornerRadius })
    },
    [setCornerRadius, updateSelectedShapes]
  )

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (fontSizeTimeoutRef.current) {
        clearTimeout(fontSizeTimeoutRef.current)
      }
    }
  }, [])

  // Handle font family change
  const handleFontFamilyChange = (newFontFamily: string) => {
    setFontFamily(newFontFamily)
    updateSelectedShapes({ fontFamily: newFontFamily })
  }

  // Handle text style changes
  const handleBoldToggle = () => {
    const newBold = !isBold
    const newWeight = newBold ? 'bold' : 'normal'
    setIsBold(newBold)
    setFontWeight(newWeight)
    updateSelectedShapes({ fontWeight: newWeight })
  }

  const handleItalicToggle = () => {
    const newItalic = !isItalic
    const newStyle = newItalic ? 'italic' : 'normal'
    setIsItalic(newItalic)
    setFontStyle(newStyle)
    updateSelectedShapes({ fontStyle: newStyle })
  }

  const handleUnderlineToggle = () => {
    const newUnderline = !isUnderline
    const newDecoration = newUnderline ? 'underline' : 'none'
    setIsUnderline(newUnderline)
    setTextDecoration(newDecoration)
    updateSelectedShapes({ textDecoration: newDecoration })
  }

  // Handle text alignment change
  const handleTextAlignChange = (newAlign: 'left' | 'center' | 'right') => {
    setTextAlign(newAlign)
    updateSelectedShapes({ textAlign: newAlign })
  }

  // Handle line height change
  const handleLineHeightChange = (newLineHeight: number) => {
    setLineHeight(newLineHeight)
    updateSelectedShapes({ lineHeight: newLineHeight })
  }

  // Calculate layer information for selected shapes
  const getLayerInfo = () => {
    if (!hasSelection) return null

    // Get all shapes sorted by zIndex (ascending)
    const sortedShapes = [...shapes].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    )

    const layerInfo = selectedShapes.map(selectedShape => {
      const currentIndex = sortedShapes.findIndex(
        s => s.id === selectedShape.id
      )
      return {
        shape: selectedShape,
        position: currentIndex + 1,
        totalLayers: sortedShapes.length,
        canBringForward: currentIndex < sortedShapes.length - 1,
        canSendBackward: currentIndex > 0
      }
    })

    return layerInfo
  }

  const layerInfo = getLayerInfo()

  // Handle layer ordering
  const handleBringForward = () => {
    if (!hasSelection) return

    // Get all shapes sorted by zIndex (ascending)
    const sortedShapes = [...shapes].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    )

    selectedShapes.forEach(selectedShape => {
      const currentIndex = sortedShapes.findIndex(
        s => s.id === selectedShape.id
      )
      if (currentIndex < sortedShapes.length - 1) {
        // Find the next shape's zIndex
        const nextShape = sortedShapes[currentIndex + 1]
        const newZIndex = (nextShape.zIndex || 0) + 1
        onShapeUpdate(selectedShape.id, { zIndex: newZIndex })
      }
    })
  }

  const handleSendBackward = () => {
    if (!hasSelection) return

    // Get all shapes sorted by zIndex (ascending)
    const sortedShapes = [...shapes].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    )

    selectedShapes.forEach(selectedShape => {
      const currentIndex = sortedShapes.findIndex(
        s => s.id === selectedShape.id
      )
      if (currentIndex > 0) {
        // Find the previous shape's zIndex
        const prevShape = sortedShapes[currentIndex - 1]
        const newZIndex = Math.max(0, (prevShape.zIndex || 0) - 1)
        onShapeUpdate(selectedShape.id, { zIndex: newZIndex })
      }
    })
  }

  const colorPresets = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#EC4899',
    '#6B7280',
    '#000000',
    '#FFFFFF'
  ]

  const fontFamilyOptions = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Arial Black',
    'Impact',
    'Comic Sans MS',
    'Courier New',
    'Monaco'
  ]

  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Toggle button - always visible */}
      <div className="fixed top-20 right-4" style={{ zIndex: 999999 }}>
        <Button
          variant={isOpen ? 'default' : 'outline'}
          size="sm"
          onClick={onToggle}
          className="h-10 w-10 p-0 shadow-lg"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Panel */}
      <div
        className="fixed top-20 right-16 w-80 h-[calc(100vh-6rem)] max-w-[calc(100vw-2rem)]"
        style={{
          zIndex: 999999,
          border: '5px solid black',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 0, 0.3)',
          position: 'fixed',
          top: '80px',
          right: '64px',
          width: '320px',
          height: '500px'
        }}
      >
        <Card className="h-full shadow-xl border-border/50 backdrop-blur-sm bg-card/95 flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  Design Palette
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 overflow-y-auto flex-1 min-h-0">
            {/* Last Edited Information - only show for single selection */}
            {selectedShapes.length === 1 && firstSelectedShape && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                  <div className="font-medium text-foreground mb-1">
                    Object Info
                  </div>
                  <div>
                    Last edited {formatLastEdited(firstSelectedShape.updatedAt)}{' '}
                    by{' '}
                    <span className="font-medium">
                      {getUserDisplayName(
                        firstSelectedShape.updatedBy,
                        currentUser,
                        presence
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Fill & Stroke Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Fill & Stroke</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Fill Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-full cursor-pointer"
                      style={{
                        backgroundColor: selectedFillColor,
                        width: '24px',
                        height: '24px'
                      }}
                      onClick={() =>
                        handleFillColorChange(
                          selectedFillColor === '#3B82F6'
                            ? '#10B981'
                            : '#3B82F6'
                        )
                      }
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {selectedFillColor}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-1 mt-2">
                    {colorPresets.map(color => (
                      <button
                        key={color}
                        className={`rounded-full ${
                          selectedFillColor === color
                            ? 'ring-2 ring-primary'
                            : ''
                        }`}
                        style={{
                          backgroundColor: color,
                          width: '20px',
                          height: '20px'
                        }}
                        onClick={() => handleFillColorChange(color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Stroke Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-full cursor-pointer"
                      style={{
                        backgroundColor: selectedStrokeColor,
                        width: '24px',
                        height: '24px'
                      }}
                      onClick={() =>
                        handleStrokeColorChange(
                          selectedStrokeColor === '#1F2937'
                            ? '#6B7280'
                            : '#1F2937'
                        )
                      }
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {selectedStrokeColor}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-1 mt-2">
                    {colorPresets.map(color => (
                      <button
                        key={color}
                        className={`rounded-full ${
                          selectedStrokeColor === color
                            ? 'ring-2 ring-primary'
                            : ''
                        }`}
                        style={{
                          backgroundColor: color,
                          width: '20px',
                          height: '20px'
                        }}
                        onClick={() => handleStrokeColorChange(color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Stroke Width: {strokeWidth}px
                  </label>
                  <Slider
                    value={[strokeWidth]}
                    onValueChange={value => handleStrokeWidthChange(value[0])}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                    style={{ height: '24px' }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Effects Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Effects</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Rotation: {rotation}°
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full">
                      <div
                        className="h-2 bg-primary rounded-full transition-all"
                        style={{
                          width: `${((rotation + 180) / 360) * 100}%`
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRotationChange(0)}
                      className="h-6 w-6 p-0"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Rotation Presets */}
                  <div className="flex gap-1 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRotationChange(0)}
                      className="h-6 px-2 text-xs"
                    >
                      0°
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRotationChange(90)}
                      className="h-6 px-2 text-xs"
                    >
                      90°
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRotationChange(180)}
                      className="h-6 px-2 text-xs"
                    >
                      180°
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRotationChange(270)}
                      className="h-6 px-2 text-xs"
                    >
                      270°
                    </Button>
                  </div>
                </div>

                {/* Corner radius control - always visible */}
                {hasSelection && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Corner Radius: {cornerRadius}px
                      {!selectedShapes.some(shape => shape.type === 'rect') && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (rectangles only)
                        </span>
                      )}
                    </label>
                    <Slider
                      value={[cornerRadius]}
                      onValueChange={value =>
                        handleCornerRadiusChange(value[0])
                      }
                      max={100}
                      min={0}
                      step={2}
                      className="w-full"
                      style={{ height: '24px' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Layer Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Layer</h3>
              </div>

              <div className="space-y-2">
                {/* Layer Position Information */}
                {layerInfo && layerInfo.length > 0 && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                    <div className="font-medium text-foreground mb-1">
                      Layer Position
                    </div>
                    {layerInfo.map((info, index) => (
                      <div
                        key={info.shape.id}
                        className="flex items-center justify-between"
                      >
                        <span>
                          {info.shape.type === 'rect'
                            ? 'Rectangle'
                            : info.shape.type === 'circle'
                              ? 'Circle'
                              : info.shape.type === 'text'
                                ? 'Text'
                                : 'Shape'}{' '}
                          {index + 1}
                        </span>
                        <span className="font-medium">
                          Layer {info.position} of {info.totalLayers}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleBringForward}
                    disabled={
                      !hasSelection ||
                      (layerInfo
                        ? !layerInfo.some(info => info.canBringForward)
                        : true)
                    }
                  >
                    Bring Forward
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleSendBackward}
                    disabled={
                      !hasSelection ||
                      (layerInfo
                        ? !layerInfo.some(info => info.canSendBackward)
                        : true)
                    }
                  >
                    Send Backward
                  </Button>
                </div>

                <div className="space-y-1">
                  {hasSelection ? (
                    selectedShapes.map((shape, index) => (
                      <div
                        key={shape.id}
                        className="flex items-center gap-2 p-2 rounded bg-muted/50"
                      >
                        <div
                          className={`w-4 h-4 rounded-sm ${
                            shape.type === 'circle' ? 'rounded-full' : ''
                          }`}
                          style={{ backgroundColor: shape.fill || '#3B82F6' }}
                        ></div>
                        <span className="text-xs">
                          {shape.type === 'rect'
                            ? 'Rectangle'
                            : shape.type === 'circle'
                              ? 'Circle'
                              : shape.type === 'text'
                                ? 'Text'
                                : 'Shape'}{' '}
                          {index + 1}
                        </span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Selected
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground p-2 text-center">
                      No shapes selected
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Text Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Text</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={e => handleFontFamilyChange(e.target.value)}
                    className="w-full p-2 border border-border rounded bg-background text-xs"
                  >
                    {fontFamilyOptions.map(font => (
                      <option
                        key={font}
                        value={font}
                        style={{ fontFamily: font }}
                      >
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Font Size: {fontSize}px
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full">
                      <div
                        className="h-2 bg-primary rounded-full transition-all"
                        style={{ width: `${((fontSize - 8) / 64) * 100}%` }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleFontSizeChange(Math.max(8, fontSize - 2))
                      }
                      className="h-6 w-6 p-0"
                    >
                      -
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleFontSizeChange(Math.min(72, fontSize + 2))
                      }
                      className="h-6 w-6 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Style
                  </label>
                  <div className="flex gap-1">
                    <Button
                      variant={isBold ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleBoldToggle}
                      className="h-8 w-8 p-0"
                    >
                      <Bold className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={isItalic ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleItalicToggle}
                      className="h-8 w-8 p-0"
                    >
                      <Italic className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={isUnderline ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleUnderlineToggle}
                      className="h-8 w-8 p-0"
                    >
                      <Underline className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Text Alignment
                  </label>
                  <div className="flex gap-1">
                    <Button
                      variant={textAlign === 'left' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTextAlignChange('left')}
                      className="h-8 px-2 text-xs"
                    >
                      Left
                    </Button>
                    <Button
                      variant={textAlign === 'center' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTextAlignChange('center')}
                      className="h-8 px-2 text-xs"
                    >
                      Center
                    </Button>
                    <Button
                      variant={textAlign === 'right' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTextAlignChange('right')}
                      className="h-8 px-2 text-xs"
                    >
                      Right
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Line Height: {lineHeight.toFixed(1)}
                  </label>
                  <Slider
                    value={[lineHeight]}
                    onValueChange={value => handleLineHeightChange(value[0])}
                    max={3}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                    style={{ height: '24px' }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default DesignPalette
