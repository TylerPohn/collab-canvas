import {
  AccountTree,
  ContentCopy,
  Delete,
  Info,
  OpenWith,
  Palette,
  RadioButtonUnchecked,
  Rectangle,
  SmartToy,
  TextFields,
  TouchApp
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  Toolbar as MUIToolbar,
  Paper,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import React, { useState } from 'react'
import MermaidImportDialog from './MermaidImportDialog'

export type ToolType =
  | 'select'
  | 'pan'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'mermaid'

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
  onImportMermaid?: (mermaidCode: string, diagramType: string) => void
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
  onImportMermaid
}) => {
  const theme = useTheme()
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const tools: {
    type: ToolType
    label: string
    icon: React.ComponentType<{ sx?: any }>
    shortcut: string
    description: string
  }[] = [
    {
      type: 'select',
      label: 'Select',
      icon: TouchApp,
      shortcut: 'V',
      description: 'Click to select objects'
    },
    {
      type: 'pan',
      label: 'Pan',
      icon: OpenWith,
      shortcut: 'H',
      description: 'Click and drag to pan the canvas'
    },
    {
      type: 'rectangle',
      label: 'Rectangle',
      icon: Rectangle,
      shortcut: 'R',
      description: 'Click and drag to create rectangle'
    },
    {
      type: 'circle',
      label: 'Circle',
      icon: RadioButtonUnchecked,
      shortcut: 'C',
      description: 'Click and drag to create circle'
    },
    {
      type: 'text',
      label: 'Text',
      icon: TextFields,
      shortcut: 'T',
      description: 'Click to add text'
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
              <Tooltip
                key={tool.type}
                title={`${tool.label} (${tool.shortcut})`}
                arrow
              >
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
          <Tooltip title="Duplicate (⌘D)" arrow>
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

          <Tooltip title="Delete (Del)" arrow>
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
