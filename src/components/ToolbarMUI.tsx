import {
  AccountTree,
  AddPhotoAlternate,
  ArrowBack,
  ContentCopy,
  Delete,
  Hexagon,
  Info,
  Layers,
  MoreVert,
  OpenWith,
  Palette,
  RadioButtonUnchecked,
  Rectangle,
  Settings,
  Share,
  ShowChart,
  SmartToy,
  Star,
  TextFields,
  TouchApp,
  TrendingFlat
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar as MUIToolbar,
  Paper,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import React, { useState } from 'react'
import type { ToolType } from '../lib/types'
import MermaidImportDialog from './MermaidImportDialog'
import EllipseIcon from './icons/EllipseIcon'

interface ToolbarMUIProps {
  selectedTool: ToolType
  onToolSelect: (tool: ToolType) => void
  onDelete: () => void
  onDuplicate: () => void
  canDelete: boolean
  canDuplicate: boolean
  onToggleDesignPalette?: () => void
  isDesignPaletteOpen?: boolean
  onToggleAI?: () => void
  isAIOpen?: boolean
  onToggleLayers?: () => void
  isLayersOpen?: boolean
  onImportMermaid?: (mermaidCode: string, diagramType: string) => void
  onBackToDashboard?: () => void
  onCanvasSettings?: () => void
  onShareCanvas?: () => void
}

const ToolbarMUI: React.FC<ToolbarMUIProps> = ({
  selectedTool,
  onToolSelect,
  onDelete,
  onDuplicate,
  canDelete,
  canDuplicate,
  onToggleDesignPalette,
  isDesignPaletteOpen = false,
  onToggleAI,
  isAIOpen = false,
  onToggleLayers,
  isLayersOpen = false,
  onImportMermaid,
  onBackToDashboard,
  onCanvasSettings,
  onShareCanvas
}) => {
  const theme = useTheme()
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)

  const tools: {
    type: ToolType
    label: string
    icon: React.ComponentType<{ sx?: any }>
    description: string
  }[] = [
    {
      type: 'select',
      label: 'Select',
      icon: TouchApp,
      description: 'Click to select objects'
    },
    {
      type: 'pan',
      label: 'Pan',
      icon: OpenWith,
      description: 'Click and drag to pan the canvas'
    },
    {
      type: 'rectangle',
      label: 'Rectangle',
      icon: Rectangle,
      description: 'Click and drag to create rectangle'
    },
    {
      type: 'circle',
      label: 'Circle',
      icon: RadioButtonUnchecked,
      description: 'Click and drag to create circle'
    },
    {
      type: 'text',
      label: 'Text',
      icon: TextFields,
      description: 'Click to add text'
    },
    {
      type: 'line',
      label: 'Line',
      icon: ShowChart,
      description: 'Click and drag to create line'
    },
    {
      type: 'arrow',
      label: 'Arrow',
      icon: TrendingFlat,
      description: 'Click and drag to create arrow'
    },
    {
      type: 'ellipse',
      label: 'Ellipse',
      icon: EllipseIcon,
      description: 'Click and drag to create ellipse (Shift for circle)'
    },
    {
      type: 'hexagon',
      label: 'Hexagon',
      icon: Hexagon,
      description: 'Click and drag to create hexagon'
    },
    {
      type: 'star',
      label: 'Star',
      icon: Star,
      description: 'Click and drag to create star'
    },
    {
      type: 'image',
      label: 'Image',
      icon: AddPhotoAlternate,
      description: 'Click to place image'
    }
  ]

  const getToolInfo = () => {
    const tool = tools.find(t => t.type === selectedTool)
    return tool ? tool.description : ''
  }

  const handleImportMermaid = (mermaidCode: string, diagramType: string) => {
    if (onImportMermaid) {
      onImportMermaid(mermaidCode, diagramType)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleBackToDashboard = () => {
    handleMenuClose()
    if (onBackToDashboard) {
      onBackToDashboard()
    }
  }

  const handleCanvasSettings = () => {
    handleMenuClose()
    if (onCanvasSettings) {
      onCanvasSettings()
    }
  }

  const handleShareCanvas = () => {
    handleMenuClose()
    if (onShareCanvas) {
      onShareCanvas()
    }
  }

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary
      }}
    >
      <MUIToolbar
        variant="dense"
        sx={{
          minHeight: 48,
          px: 3,
          py: 1,
          gap: 3,
          flexWrap: 'wrap'
        }}
      >
        {/* Drawing Tools Group */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              color: 'text.secondary',
              mr: 2,
              display: { xs: 'none', lg: 'block' }
            }}
          >
            Tools
          </Typography>
          {tools.map(tool => {
            const IconComponent = tool.icon
            const isSelected = selectedTool === tool.type
            return (
              <Tooltip key={tool.type} title={tool.label} arrow>
                <IconButton
                  onClick={() => onToolSelect(tool.type)}
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: isSelected
                      ? theme.palette.primary.main
                      : 'transparent',
                    color: isSelected
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.secondary,
                    border: isSelected
                      ? `1px solid ${theme.palette.primary.main}`
                      : `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: isSelected
                        ? theme.palette.primary.dark
                        : theme.palette.action.hover,
                      borderColor: isSelected
                        ? theme.palette.primary.dark
                        : theme.palette.primary.main
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <IconComponent sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )
          })}
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Action Tools Group */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              color: 'text.secondary',
              mr: 2,
              display: { xs: 'none', lg: 'block' }
            }}
          >
            Actions
          </Typography>
          <Tooltip title="Duplicate" arrow>
            <IconButton
              onClick={onDuplicate}
              disabled={!canDuplicate}
              sx={{
                width: 36,
                height: 36,
                color: 'text.secondary',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  borderColor: theme.palette.primary.main
                },
                '&:disabled': {
                  color: theme.palette.action.disabled,
                  borderColor: theme.palette.action.disabled
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ContentCopy sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete" arrow>
            <IconButton
              onClick={onDelete}
              disabled={!canDelete}
              sx={{
                width: 36,
                height: 36,
                color: 'error.main',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: theme.palette.error.light + '20',
                  borderColor: theme.palette.error.main
                },
                '&:disabled': {
                  color: theme.palette.action.disabled,
                  borderColor: theme.palette.action.disabled
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Delete sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Import Mermaid Button */}
        {onImportMermaid && (
          <>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="Import Mermaid Diagram" arrow>
              <IconButton
                onClick={() => setIsImportDialogOpen(true)}
                sx={{
                  width: 36,
                  height: 36,
                  color: theme.palette.text.secondary,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    borderColor: theme.palette.primary.main
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <AccountTree sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </>
        )}

        {/* Design Palette Toggle */}
        {onToggleDesignPalette && (
          <>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="Design Palette" arrow>
              <IconButton
                onClick={onToggleDesignPalette}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: isDesignPaletteOpen
                    ? theme.palette.primary.main
                    : 'transparent',
                  color: isDesignPaletteOpen
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.secondary,
                  border: isDesignPaletteOpen
                    ? `1px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: isDesignPaletteOpen
                      ? theme.palette.primary.dark
                      : theme.palette.action.hover,
                    borderColor: isDesignPaletteOpen
                      ? theme.palette.primary.dark
                      : theme.palette.primary.main
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <Palette sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </>
        )}

        {/* AI Agent Toggle */}
        {onToggleAI && (
          <>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="AI Agent" arrow>
              <IconButton
                onClick={onToggleAI}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: isAIOpen
                    ? theme.palette.primary.main
                    : 'transparent',
                  color: isAIOpen
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.secondary,
                  border: isAIOpen
                    ? `1px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: isAIOpen
                      ? theme.palette.primary.dark
                      : theme.palette.action.hover,
                    borderColor: isAIOpen
                      ? theme.palette.primary.dark
                      : theme.palette.primary.main
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <SmartToy sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </>
        )}

        {/* Layers Panel Toggle */}
        {onToggleLayers && (
          <>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="Layers Panel" arrow>
              <IconButton
                onClick={onToggleLayers}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: isLayersOpen
                    ? theme.palette.primary.main
                    : 'transparent',
                  color: isLayersOpen
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.secondary,
                  border: isLayersOpen
                    ? `1px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: isLayersOpen
                      ? theme.palette.primary.dark
                      : theme.palette.action.hover,
                    borderColor: isLayersOpen
                      ? theme.palette.primary.dark
                      : theme.palette.primary.main
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <Layers sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </>
        )}

        {/* Canvas Menu */}
        <Divider orientation="vertical" flexItem />
        <Tooltip title="Canvas Menu" arrow>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              width: 36,
              height: 36,
              color: theme.palette.text.secondary,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                borderColor: theme.palette.primary.main
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <MoreVert sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Tool Info */}
        <Box sx={{ ml: 'auto', display: { xs: 'none', xl: 'block' } }}>
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              backgroundColor: theme.palette.grey[50],
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1
            }}
          >
            <Info sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              {getToolInfo()}
            </Typography>
          </Paper>
        </Box>
      </MUIToolbar>

      {/* Canvas Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5
            }
          }
        }}
      >
        {onBackToDashboard && (
          <MenuItem onClick={handleBackToDashboard}>
            <ArrowBack sx={{ mr: 2, fontSize: 20 }} />
            Back to Dashboard
          </MenuItem>
        )}
        {onCanvasSettings && (
          <MenuItem onClick={handleCanvasSettings}>
            <Settings sx={{ mr: 2, fontSize: 20 }} />
            Canvas Settings
          </MenuItem>
        )}
        {onShareCanvas && (
          <MenuItem onClick={handleShareCanvas}>
            <Share sx={{ mr: 2, fontSize: 20 }} />
            Share Canvas
          </MenuItem>
        )}
      </Menu>

      {/* Mermaid Import Dialog */}
      {onImportMermaid && (
        <MermaidImportDialog
          open={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onImport={handleImportMermaid}
        />
      )}
    </AppBar>
  )
}

export default ToolbarMUI
