import {
  Close,
  FormatAlignCenter,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Layers,
  Palette as PaletteIcon,
  RotateLeft
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme
} from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getDefaultBlendMode, SUPPORTED_BLEND_MODES } from '../lib/blendModes'
import type { Shape, User, UserPresence } from '../lib/types'
import { formatLastEdited, getUserDisplayName } from '../lib/utils'
import { useDesignPaletteStore } from '../store/designPalette'
import { useSelectionStore } from '../store/selection'

interface DesignPaletteMUIProps {
  isOpen: boolean
  onToggle: () => void
  shapes: Shape[]
  onShapeUpdate: (id: string, updates: Partial<Shape>) => void
  onShapeUpdateDebounced: (id: string, updates: Partial<Shape>) => void
  onShapeBatchUpdateDebounced: (
    updates: Array<{ objectId: string; updates: Partial<Shape> }>
  ) => void
  currentUser: User | null
  presence: UserPresence[]
}

const DesignPaletteMUI: React.FC<DesignPaletteMUIProps> = ({
  isOpen,
  onToggle,
  shapes,
  onShapeUpdate,
  onShapeUpdateDebounced,
  onShapeBatchUpdateDebounced,
  currentUser,
  presence
}) => {
  const theme = useTheme()
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
    opacity,
    blendMode,
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
    setLineHeight,
    setOpacity,
    setBlendMode
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
      setOpacity(firstSelectedShape.opacity ?? 1.0)
      setBlendMode(firstSelectedShape.blendMode ?? getDefaultBlendMode())
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
      if (selectedShapes.length === 1) {
        // Single shape - use individual update for immediate feedback
        onShapeUpdateDebounced(selectedShapes[0].id, updates)
      } else if (selectedShapes.length > 1) {
        // Multiple shapes - use batch update to prevent flashing
        const batchUpdates = selectedShapes.map(shape => ({
          objectId: shape.id,
          updates
        }))
        onShapeBatchUpdateDebounced(batchUpdates)
      }
    },
    [selectedShapes, onShapeUpdateDebounced, onShapeBatchUpdateDebounced]
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
    '#F3F4F6'
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
      <Box
        sx={{
          position: 'fixed',
          top: 120,
          right: 8,
          zIndex: 8
        }}
      >
        <Button
          variant={isOpen ? 'contained' : 'outlined'}
          size="small"
          onClick={onToggle}
          sx={{
            minWidth: 40,
            height: 40,
            borderRadius: 1,
            boxShadow: 3
          }}
        >
          <PaletteIcon />
        </Button>
      </Box>

      {/* Panel */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          top: 120,
          right: 0,
          width: 320,
          height: 500,
          zIndex: 9,
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)'
        }}
      >
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardHeader
            sx={{
              pb: 1,
              flexShrink: 0,
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon color="primary" />
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ fontWeight: 600 }}
                >
                  Design Palette
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={onToggle}
                sx={{ width: 32, height: 32 }}
              >
                <Close />
              </IconButton>
            </Box>
          </CardHeader>

          <CardContent
            sx={{
              flex: 1,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: 6
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: alpha(theme.palette.grey[300], 0.3)
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.grey[500], 0.5),
                borderRadius: 3
              }
            }}
          >
            <Stack spacing={3}>
              {/* Last Edited Information - only show for single selection */}
              {selectedShapes.length === 1 && firstSelectedShape && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    backgroundColor: alpha(theme.palette.grey[100], 0.5)
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Object Info
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last edited {formatLastEdited(firstSelectedShape.updatedAt)}{' '}
                    by{' '}
                    <Typography component="span" sx={{ fontWeight: 600 }}>
                      {getUserDisplayName(
                        firstSelectedShape.updatedBy,
                        currentUser,
                        presence
                      )}
                    </Typography>
                  </Typography>
                </Paper>
              )}

              {/* Fill & Stroke Section */}
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <PaletteIcon color="action" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Fill & Stroke
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {/* Fill Color */}
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Fill Color
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: selectedFillColor,
                          border: `2px solid ${theme.palette.divider}`,
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            transition: 'transform 0.2s'
                          }
                        }}
                        onClick={() =>
                          handleFillColorChange(
                            selectedFillColor === '#3B82F6'
                              ? '#10B981'
                              : '#3B82F6'
                          )
                        }
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {selectedFillColor}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {colorPresets.map(color => (
                        <Box
                          key={color}
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: color,
                            border:
                              selectedFillColor === color
                                ? `2px solid ${theme.palette.primary.main}`
                                : `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              transition: 'transform 0.2s'
                            }
                          }}
                          onClick={() => handleFillColorChange(color)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Stroke Color */}
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Stroke Color
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: selectedStrokeColor,
                          border: `2px solid ${theme.palette.divider}`,
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            transition: 'transform 0.2s'
                          }
                        }}
                        onClick={() =>
                          handleStrokeColorChange(
                            selectedStrokeColor === '#1F2937'
                              ? '#6B7280'
                              : '#1F2937'
                          )
                        }
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {selectedStrokeColor}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {colorPresets.map(color => (
                        <Box
                          key={color}
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: color,
                            border:
                              selectedStrokeColor === color
                                ? `2px solid ${theme.palette.primary.main}`
                                : `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              transition: 'transform 0.2s'
                            }
                          }}
                          onClick={() => handleStrokeColorChange(color)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Stroke Width */}
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Stroke Width: {strokeWidth}px
                    </Typography>
                    <Slider
                      value={strokeWidth}
                      onChange={(_, value) =>
                        handleStrokeWidthChange(value as number)
                      }
                      min={0}
                      max={10}
                      step={1}
                      size="small"
                      sx={{ height: 24 }}
                    />
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Effects Section */}
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <RotateLeft color="action" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Effects
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {/* Rotation */}
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Rotation: {rotation}°
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Slider
                        value={rotation}
                        onChange={(_, value) =>
                          handleRotationChange(value as number)
                        }
                        min={-180}
                        max={180}
                        step={1}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRotationChange(0)}
                        sx={{ width: 24, height: 24 }}
                      >
                        <RotateLeft sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    {/* Rotation Presets */}
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                      {[0, 90, 180, 270].map(angle => (
                        <Button
                          key={angle}
                          variant="outlined"
                          size="small"
                          onClick={() => handleRotationChange(angle)}
                          sx={{ minWidth: 40, height: 24, fontSize: '0.75rem' }}
                        >
                          {angle}°
                        </Button>
                      ))}
                    </Stack>
                  </Box>

                  {/* Corner radius control - always visible */}
                  {hasSelection && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Corner Radius: {cornerRadius}px
                        {!selectedShapes.some(
                          shape => shape.type === 'rect'
                        ) && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 0.5 }}
                          >
                            (rectangles only)
                          </Typography>
                        )}
                      </Typography>
                      <Slider
                        value={cornerRadius}
                        onChange={(_, value) =>
                          handleCornerRadiusChange(value as number)
                        }
                        min={0}
                        max={100}
                        step={2}
                        size="small"
                        sx={{ height: 24 }}
                      />
                    </Box>
                  )}

                  {/* Opacity Control */}
                  {hasSelection && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Opacity: {Math.round(opacity * 100)}%
                      </Typography>
                      <Slider
                        value={opacity}
                        onChange={(_, value) => {
                          const newOpacity = value as number
                          setOpacity(newOpacity)
                          // Update selected shapes using batch update
                          if (selectedShapes.length === 1) {
                            onShapeUpdate(selectedShapes[0].id, {
                              opacity: newOpacity
                            })
                          } else if (selectedShapes.length > 1) {
                            const batchUpdates = selectedShapes.map(shape => ({
                              objectId: shape.id,
                              updates: { opacity: newOpacity }
                            }))
                            onShapeBatchUpdateDebounced(batchUpdates)
                          }
                        }}
                        min={0}
                        max={1}
                        step={0.01}
                        size="small"
                        sx={{ height: 24 }}
                      />
                    </Box>
                  )}

                  {/* Blend Mode Control */}
                  {hasSelection && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Blend Mode
                      </Typography>
                      <Select
                        value={blendMode}
                        onChange={e => {
                          const newBlendMode = e.target.value
                          setBlendMode(newBlendMode)
                          // Update selected shapes using batch update
                          if (selectedShapes.length === 1) {
                            onShapeUpdate(selectedShapes[0].id, {
                              blendMode: newBlendMode
                            })
                          } else if (selectedShapes.length > 1) {
                            const batchUpdates = selectedShapes.map(shape => ({
                              objectId: shape.id,
                              updates: { blendMode: newBlendMode }
                            }))
                            onShapeBatchUpdateDebounced(batchUpdates)
                          }
                        }}
                        size="small"
                        fullWidth
                        sx={{ height: 32 }}
                      >
                        {SUPPORTED_BLEND_MODES.map(mode => (
                          <MenuItem key={mode} value={mode}>
                            {mode.charAt(0).toUpperCase() +
                              mode.slice(1).replace('-', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Shape-Specific Controls */}
              {selectedShapes.length === 1 && (
                <>
                  {/* Arrow Direction Controls */}
                  {selectedShapes[0].type === 'arrow' && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Arrow Direction
                      </Typography>
                      <ToggleButtonGroup
                        value={(selectedShapes[0] as any).arrowType || 'end'}
                        exclusive
                        onChange={(_, value) => {
                          if (value) {
                            updateSelectedShapes({ arrowType: value })
                          }
                        }}
                        size="small"
                        sx={{ width: '100%' }}
                      >
                        <ToggleButton value="start" sx={{ flex: 1 }}>
                          Start
                        </ToggleButton>
                        <ToggleButton value="end" sx={{ flex: 1 }}>
                          End
                        </ToggleButton>
                        <ToggleButton value="both" sx={{ flex: 1 }}>
                          Both
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  )}

                  {/* Hexagon Sides Control */}
                  {selectedShapes[0].type === 'hexagon' && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Sides: {(selectedShapes[0] as any).sides || 6}
                      </Typography>
                      <Slider
                        value={(selectedShapes[0] as any).sides || 6}
                        onChange={(_, value) => {
                          updateSelectedShapes({ sides: value as number })
                        }}
                        min={3}
                        max={12}
                        step={1}
                        size="small"
                        sx={{ height: 24 }}
                      />
                    </Box>
                  )}

                  {/* Star Preset Controls */}
                  {selectedShapes[0].type === 'star' && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Star Type
                      </Typography>
                      <ToggleButtonGroup
                        value={(selectedShapes[0] as any).starType || '5-point'}
                        exclusive
                        onChange={(_, value) => {
                          if (value) {
                            const starConfigs = {
                              '5-point': {
                                points: 5,
                                innerRadius:
                                  (selectedShapes[0] as any).outerRadius / 2
                              },
                              '6-point': {
                                points: 6,
                                innerRadius:
                                  (selectedShapes[0] as any).outerRadius / 2
                              },
                              '8-point': {
                                points: 8,
                                innerRadius:
                                  (selectedShapes[0] as any).outerRadius / 2
                              }
                            }
                            const config =
                              starConfigs[value as keyof typeof starConfigs]
                            updateSelectedShapes({
                              starType: value,
                              points: config.points,
                              innerRadius: config.innerRadius
                            })
                          }
                        }}
                        size="small"
                        sx={{ width: '100%' }}
                      >
                        <ToggleButton value="5-point" sx={{ flex: 1 }}>
                          5-Point
                        </ToggleButton>
                        <ToggleButton value="6-point" sx={{ flex: 1 }}>
                          6-Point
                        </ToggleButton>
                        <ToggleButton value="8-point" sx={{ flex: 1 }}>
                          8-Point
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  )}

                  {/* Image Controls */}
                  {selectedShapes[0].type === 'image' && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Image:{' '}
                        {(selectedShapes[0] as any).imageName || 'Unknown'}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => {
                          // TODO: Implement image replacement
                          console.log(
                            'Replace image functionality not yet implemented'
                          )
                        }}
                      >
                        Replace Image
                      </Button>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block' }}
                      >
                        {(selectedShapes[0] as any).width} ×{' '}
                        {(selectedShapes[0] as any).height}
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              <Divider />

              {/* Layer Section */}
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <Layers color="action" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Layer
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {/* Layer Position Information */}
                  {layerInfo && layerInfo.length > 0 && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        backgroundColor: alpha(theme.palette.grey[100], 0.5)
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Layer Position
                      </Typography>
                      {layerInfo.map((info, index) => (
                        <Box
                          key={info.shape.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Typography variant="body2">
                            {info.shape.type === 'rect'
                              ? 'Rectangle'
                              : info.shape.type === 'circle'
                                ? 'Circle'
                                : info.shape.type === 'text'
                                  ? 'Text'
                                  : 'Shape'}{' '}
                            {index + 1}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Layer {info.position} of {info.totalLayers}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  )}

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleBringForward}
                      disabled={
                        !hasSelection ||
                        (layerInfo
                          ? !layerInfo.some(info => info.canBringForward)
                          : true)
                      }
                      sx={{ flex: 1, fontSize: '0.75rem' }}
                    >
                      Bring Forward
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleSendBackward}
                      disabled={
                        !hasSelection ||
                        (layerInfo
                          ? !layerInfo.some(info => info.canSendBackward)
                          : true)
                      }
                      sx={{ flex: 1, fontSize: '0.75rem' }}
                    >
                      Send Backward
                    </Button>
                  </Stack>

                  <Stack spacing={1}>
                    {hasSelection ? (
                      selectedShapes.map((shape, index) => (
                        <Box
                          key={shape.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: alpha(theme.palette.grey[100], 0.5)
                          }}
                        >
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius:
                                shape.type === 'circle' ? '50%' : 0.5,
                              backgroundColor: shape.fill || '#3B82F6'
                            }}
                          />
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {shape.type === 'rect'
                              ? 'Rectangle'
                              : shape.type === 'circle'
                                ? 'Circle'
                                : shape.type === 'text'
                                  ? 'Text'
                                  : 'Shape'}{' '}
                            {index + 1}
                          </Typography>
                          <Chip
                            label="Selected"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'center', py: 2 }}
                      >
                        No shapes selected
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* Text Section */}
              <Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <Typography color="action" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Text
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {/* Font Family */}
                  <FormControl size="small" fullWidth>
                    <InputLabel>Font Family</InputLabel>
                    <Select
                      value={fontFamily}
                      onChange={e => handleFontFamilyChange(e.target.value)}
                      label="Font Family"
                    >
                      {fontFamilyOptions.map(font => (
                        <MenuItem
                          key={font}
                          value={font}
                          sx={{ fontFamily: font }}
                        >
                          {font}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Font Size */}
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Font Size: {fontSize}px
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Slider
                        value={fontSize}
                        onChange={(_, value) =>
                          handleFontSizeChange(value as number)
                        }
                        min={8}
                        max={72}
                        step={1}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleFontSizeChange(Math.max(8, fontSize - 2))
                        }
                        sx={{ width: 24, height: 24 }}
                      >
                        <Typography sx={{ fontSize: '0.875rem' }}>-</Typography>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleFontSizeChange(Math.min(72, fontSize + 2))
                        }
                        sx={{ width: 24, height: 24 }}
                      >
                        <Typography sx={{ fontSize: '0.875rem' }}>+</Typography>
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Text Style */}
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Style
                    </Typography>
                    <ToggleButtonGroup size="small" exclusive>
                      <ToggleButton
                        value="bold"
                        selected={isBold}
                        onChange={handleBoldToggle}
                        sx={{ width: 32, height: 32 }}
                      >
                        <FormatBold sx={{ fontSize: 16 }} />
                      </ToggleButton>
                      <ToggleButton
                        value="italic"
                        selected={isItalic}
                        onChange={handleItalicToggle}
                        sx={{ width: 32, height: 32 }}
                      >
                        <FormatItalic sx={{ fontSize: 16 }} />
                      </ToggleButton>
                      <ToggleButton
                        value="underline"
                        selected={isUnderline}
                        onChange={handleUnderlineToggle}
                        sx={{ width: 32, height: 32 }}
                      >
                        <FormatUnderlined sx={{ fontSize: 16 }} />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* Text Alignment */}
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Text Alignment
                    </Typography>
                    <ToggleButtonGroup
                      value={textAlign}
                      exclusive
                      onChange={(_, value) =>
                        value && handleTextAlignChange(value)
                      }
                      size="small"
                    >
                      <ToggleButton
                        value="left"
                        sx={{ px: 2, fontSize: '0.75rem' }}
                      >
                        <FormatAlignLeft sx={{ fontSize: 16, mr: 0.5 }} />
                        Left
                      </ToggleButton>
                      <ToggleButton
                        value="center"
                        sx={{ px: 2, fontSize: '0.75rem' }}
                      >
                        <FormatAlignCenter sx={{ fontSize: 16, mr: 0.5 }} />
                        Center
                      </ToggleButton>
                      <ToggleButton
                        value="right"
                        sx={{ px: 2, fontSize: '0.75rem' }}
                      >
                        <FormatAlignRight sx={{ fontSize: 16, mr: 0.5 }} />
                        Right
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* Line Height */}
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Line Height: {lineHeight.toFixed(1)}
                    </Typography>
                    <Slider
                      value={lineHeight}
                      onChange={(_, value) =>
                        handleLineHeightChange(value as number)
                      }
                      min={0.5}
                      max={3}
                      step={0.1}
                      size="small"
                      sx={{ height: 24 }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Paper>
    </>
  )
}

export default DesignPaletteMUI
