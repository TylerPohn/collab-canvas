import {
  Bot,
  Circle,
  Copy,
  Hand,
  Info,
  MousePointer2,
  PanelLeft,
  Square,
  Trash2,
  Type
} from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip'

export type ToolType = 'select' | 'pan' | 'rectangle' | 'circle' | 'text'

interface ToolbarProps {
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
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  onDelete,
  onDuplicate,
  canDelete,
  canDuplicate,
  onToggleDesignPalette,
  isDesignPaletteOpen = false,
  onToggleAI,
  isAIOpen = false
}) => {
  const tools: {
    type: ToolType
    label: string
    icon: React.ComponentType<{ className?: string }>
    shortcut: string
    description: string
  }[] = [
    {
      type: 'select',
      label: 'Select',
      icon: MousePointer2,
      shortcut: 'V',
      description: 'Click to select objects'
    },
    {
      type: 'pan',
      label: 'Pan',
      icon: Hand,
      shortcut: 'H',
      description: 'Click and drag to pan the canvas'
    },
    {
      type: 'rectangle',
      label: 'Rectangle',
      icon: Square,
      shortcut: 'R',
      description: 'Click and drag to create rectangle'
    },
    {
      type: 'circle',
      label: 'Circle',
      icon: Circle,
      shortcut: 'C',
      description: 'Click and drag to create circle'
    },
    {
      type: 'text',
      label: 'Text',
      icon: Type,
      shortcut: 'T',
      description: 'Click to add text'
    }
  ]

  const getToolInfo = () => {
    const tool = tools.find(t => t.type === selectedTool)
    return tool ? tool.description : ''
  }

  return (
    <TooltipProvider>
      <div className="bg-card border-b border-border px-6 py-3 shadow-sm">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Drawing Tools Group */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground mr-2 hidden lg:block">
              Tools
            </span>
            {tools.map(tool => {
              const IconComponent = tool.icon
              return (
                <Tooltip key={tool.type}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedTool === tool.type ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onToolSelect(tool.type)}
                      className="h-9 w-9 p-0"
                    >
                      <IconComponent className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {tool.label} ({tool.shortcut})
                    </p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Tools Group */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground mr-2 hidden lg:block">
              Actions
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDuplicate}
                  disabled={!canDuplicate}
                  className="h-9 w-9 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate (⌘D)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  disabled={!canDelete}
                  className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete (Del)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Design Palette Toggle */}
          {onToggleDesignPalette && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isDesignPaletteOpen ? 'default' : 'ghost'}
                    size="sm"
                    onClick={onToggleDesignPalette}
                    className="h-9 w-9 p-0"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Design Palette</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {/* AI Agent Toggle */}
          {onToggleAI && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isAIOpen ? 'default' : 'ghost'}
                    size="sm"
                    onClick={onToggleAI}
                    className="h-9 w-9 p-0"
                  >
                    <Bot className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI Agent</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Tool Info */}
          <div className="ml-auto hidden xl:block">
            <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">
                {getToolInfo()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default Toolbar
