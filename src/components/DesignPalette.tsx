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
import React, { useState } from 'react'
import type { Shape } from '../lib/types'
import { useSelectionStore } from '../store/selection'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'

interface DesignPaletteProps {
  isOpen: boolean
  onToggle: () => void
  shapes: Shape[]
  onShapeUpdate: (id: string, updates: Partial<Shape>) => void
}

const DesignPalette: React.FC<DesignPaletteProps> = ({
  isOpen,
  onToggle,
  shapes,
  onShapeUpdate
}) => {
  const { selectedIds } = useSelectionStore()

  // Get selected shapes
  const selectedShapes = shapes.filter(shape => selectedIds.includes(shape.id))
  const hasSelection = selectedShapes.length > 0

  // Get properties from first selected shape (for single selection)
  const firstSelectedShape = selectedShapes[0]

  const [selectedFillColor, setSelectedFillColor] = useState(
    firstSelectedShape?.fill || '#3B82F6'
  )
  const [selectedStrokeColor, setSelectedStrokeColor] = useState(
    firstSelectedShape?.stroke || '#1F2937'
  )
  const [strokeWidth, setStrokeWidth] = useState(
    firstSelectedShape?.strokeWidth || 2
  )
  const [rotation, setRotation] = useState(firstSelectedShape?.rotation || 0)
  const [cornerRadius, setCornerRadius] = useState(
    firstSelectedShape?.cornerRadius || 0
  )
  const [fontSize, setFontSize] = useState(firstSelectedShape?.fontSize || 16)
  const [fontFamily, setFontFamily] = useState(
    firstSelectedShape?.fontFamily || 'Arial'
  )
  const [isBold, setIsBold] = useState(
    firstSelectedShape?.fontWeight === 'bold'
  )
  const [isItalic, setIsItalic] = useState(
    firstSelectedShape?.fontStyle === 'italic'
  )
  const [isUnderline, setIsUnderline] = useState(
    firstSelectedShape?.textDecoration === 'underline'
  )

  // Update local state when selection changes
  React.useEffect(() => {
    if (firstSelectedShape) {
      setSelectedFillColor(firstSelectedShape.fill || '#3B82F6')
      setSelectedStrokeColor(firstSelectedShape.stroke || '#1F2937')
      setStrokeWidth(firstSelectedShape.strokeWidth || 2)
      setRotation(firstSelectedShape.rotation || 0)
      setCornerRadius(firstSelectedShape.cornerRadius || 0)
      setFontSize(firstSelectedShape.fontSize || 16)
      setFontFamily(firstSelectedShape.fontFamily || 'Arial')
      setIsBold(firstSelectedShape.fontWeight === 'bold')
      setIsItalic(firstSelectedShape.fontStyle === 'italic')
      setIsUnderline(firstSelectedShape.textDecoration === 'underline')
    }
  }, [firstSelectedShape])

  // Helper function to update selected shapes
  const updateSelectedShapes = (updates: Partial<Shape>) => {
    selectedShapes.forEach(shape => {
      onShapeUpdate(shape.id, updates)
    })
  }

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

  // Handle stroke width change
  const handleStrokeWidthChange = (newStrokeWidth: number) => {
    setStrokeWidth(newStrokeWidth)
    updateSelectedShapes({ strokeWidth: newStrokeWidth })
  }

  // Handle rotation change
  const handleRotationChange = (newRotation: number) => {
    setRotation(newRotation)
    updateSelectedShapes({ rotation: newRotation })
  }

  // Handle font size change
  const handleFontSizeChange = (newFontSize: number) => {
    setFontSize(newFontSize)
    updateSelectedShapes({ fontSize: newFontSize })
  }

  // Handle corner radius change
  const handleCornerRadiusChange = (newCornerRadius: number) => {
    setCornerRadius(newCornerRadius)
    updateSelectedShapes({ cornerRadius: newCornerRadius })
  }

  // Handle font family change
  const handleFontFamilyChange = (newFontFamily: string) => {
    setFontFamily(newFontFamily)
    updateSelectedShapes({ fontFamily: newFontFamily })
  }

  // Handle text style changes
  const handleBoldToggle = () => {
    const newBold = !isBold
    setIsBold(newBold)
    updateSelectedShapes({ fontWeight: newBold ? 'bold' : 'normal' })
  }

  const handleItalicToggle = () => {
    const newItalic = !isItalic
    setIsItalic(newItalic)
    updateSelectedShapes({ fontStyle: newItalic ? 'italic' : 'normal' })
  }

  const handleUnderlineToggle = () => {
    const newUnderline = !isUnderline
    setIsUnderline(newUnderline)
    updateSelectedShapes({
      textDecoration: newUnderline ? 'underline' : 'none'
    })
  }

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
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full">
                      <div
                        className="h-2 bg-primary rounded-full transition-all"
                        style={{ width: `${(strokeWidth / 10) * 100}%` }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleStrokeWidthChange(Math.max(0, strokeWidth - 1))
                      }
                      className="h-6 w-6 p-0"
                    >
                      -
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleStrokeWidthChange(Math.min(10, strokeWidth + 1))
                      }
                      className="h-6 w-6 p-0"
                    >
                      +
                    </Button>
                  </div>
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

                {/* Only show corner radius for rectangle shapes */}
                {hasSelection &&
                  selectedShapes.some(shape => shape.type === 'rect') && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Corner Radius: {cornerRadius}px
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full transition-all"
                            style={{ width: `${(cornerRadius / 50) * 100}%` }}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCornerRadiusChange(
                              Math.max(0, cornerRadius - 2)
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          -
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCornerRadiusChange(
                              Math.min(50, cornerRadius + 2)
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          +
                        </Button>
                      </div>
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
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleBringForward}
                    disabled={!hasSelection}
                  >
                    Bring Forward
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleSendBackward}
                    disabled={!hasSelection}
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default DesignPalette
