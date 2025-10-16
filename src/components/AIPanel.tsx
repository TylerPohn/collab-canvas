import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassIcon,
  Lightbulb as LightbulbIcon,
  PlayArrow as PlayIcon,
  SmartToy as RobotIcon,
  Send as SendIcon
} from '@mui/icons-material'
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Slide,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import React, { useState } from 'react'
import { useAIAgent } from '../hooks/useAIAgent'
import { useAuth } from '../hooks/useAuth'
import { useSelectionStore } from '../store/selection'

interface AIPanelProps {
  canvasId: string
  isOpen: boolean
  onClose: () => void
}

interface CommandParameters {
  [key: string]: string | number | boolean | object | undefined
}

interface SampleCommand {
  name: string
  command: string
  parameters: CommandParameters
  category: 'Create' | 'Manipulate' | 'Layout' | 'Context' | 'Delete'
  requiresSelection?: boolean
  requiresMultipleSelection?: boolean
  description?: string
}

const AIPanel: React.FC<AIPanelProps> = ({ canvasId, isOpen, onClose }) => {
  const { user } = useAuth()
  const { executeCommand, processNaturalLanguage, isExecuting, error } =
    useAIAgent(canvasId, user?.uid || '')
  const { selectedIds } = useSelectionStore()
  const theme = useTheme()

  const [lastResult, setLastResult] = useState<string | null>(null)
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('')
  const [manualCommandInput, setManualCommandInput] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Helper function to get command status and validation
  const getCommandStatus = (cmd: SampleCommand) => {
    if (cmd.requiresSelection && selectedIds.length === 0) {
      return {
        disabled: true,
        tooltip: 'Select a shape first',
        reason: 'no-selection'
      }
    }
    if (cmd.requiresMultipleSelection && selectedIds.length < 2) {
      return {
        disabled: true,
        tooltip: 'Select at least 2 shapes',
        reason: 'insufficient-selection'
      }
    }

    // Add grid size info for arrangeInGrid command
    let tooltip = cmd.description || cmd.name
    if (cmd.command === 'arrangeInGrid' && selectedIds.length > 0) {
      const { rows, cols } = calculateOptimalGrid(selectedIds.length)
      tooltip = `Arrange ${selectedIds.length} shapes in a ${rows}×${cols} grid`
    }

    // Add resize info for resize commands
    if (cmd.command === 'resizeLarger' && selectedIds.length > 0) {
      tooltip = 'Make selected shape 1.618x larger (Fibonacci ratio)'
    }
    if (cmd.command === 'resizeSmaller' && selectedIds.length > 0) {
      tooltip = 'Make selected shape 0.618x smaller (Fibonacci ratio)'
    }
    if (cmd.command === 'rotateShapeClockwise' && selectedIds.length > 0) {
      tooltip = 'Rotate selected shape 45 degrees clockwise (cumulative)'
    }
    if (
      cmd.command === 'rotateShapeCounterclockwise' &&
      selectedIds.length > 0
    ) {
      tooltip = 'Rotate selected shape 45 degrees counterclockwise (cumulative)'
    }
    if (cmd.command === 'moveShapeByOthers' && selectedIds.length > 0) {
      tooltip = 'Move selected shape to center of other shapes on canvas'
    }

    return {
      disabled: false,
      tooltip,
      reason: 'ready'
    }
  }

  // Helper function to calculate optimal grid dimensions
  const calculateOptimalGrid = (
    shapeCount: number
  ): { rows: number; cols: number } => {
    if (shapeCount <= 0) return { rows: 1, cols: 1 }

    // Find the closest square root for a more balanced grid
    const sqrt = Math.sqrt(shapeCount)
    const rows = Math.ceil(sqrt)
    const cols = Math.ceil(shapeCount / rows)

    return { rows, cols }
  }

  // Helper function to substitute dynamic parameters
  const substituteParameters = (cmd: SampleCommand): CommandParameters => {
    let parameters = { ...cmd.parameters }

    // Replace placeholder shape IDs with actual selected shapes
    if (parameters.shapeId === 'selected-shape-id' && selectedIds.length > 0) {
      parameters.shapeId = selectedIds[0]
    }

    // Check if shapeIds is the placeholder array
    if (
      Array.isArray(parameters.shapeIds) &&
      parameters.shapeIds.length === 1 &&
      parameters.shapeIds[0] === 'selected-shapes' &&
      selectedIds.length > 0
    ) {
      parameters.shapeIds = selectedIds

      // For grid arrangement, calculate optimal dimensions based on shape count
      if (cmd.command === 'arrangeInGrid') {
        const { rows, cols } = calculateOptimalGrid(selectedIds.length)
        parameters.rows = rows
        parameters.cols = cols
      }
    }

    return parameters
  }

  const handleExecuteCommand = async (
    command: string,
    parameters: CommandParameters
  ) => {
    setLastResult(null)

    try {
      console.log('🤖 AI Command:', {
        command,
        parameters,
        canvasId,
        userId: user?.uid
      })

      // Use the real AI agent to execute the command
      const result = await executeCommand(command, parameters)

      console.log('🤖 AI Agent returned:', result)

      if (result && result.id) {
        const successMessage = `✅ Successfully executed ${command} with parameters: ${JSON.stringify(parameters)}`
        setLastResult(successMessage)
      } else {
        setLastResult(
          `⚠️ Command executed but unexpected result: ${JSON.stringify(result)}`
        )
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Command failed:', errorMessage)
      setLastResult(`❌ Error: ${errorMessage}`)
    }
  }

  // Enhanced command execution with validation
  const handleExecuteSampleCommand = async (cmd: SampleCommand) => {
    const status = getCommandStatus(cmd)

    if (status.disabled) {
      setLastResult(`❌ ${status.tooltip}`)
      return
    }

    // Special handling for deleteAllShapes - show confirmation modal
    if (cmd.command === 'deleteAllShapes') {
      setDeleteConfirmOpen(true)
      return
    }

    const parameters = substituteParameters(cmd)
    await handleExecuteCommand(cmd.command, parameters)
  }

  const handleDeleteConfirm = async () => {
    setDeleteConfirmOpen(false)
    await handleExecuteCommand('deleteAllShapes', { confirm: true })
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false)
  }

  const handleNaturalLanguage = async (userInput: string) => {
    setLastResult(null)

    try {
      console.log('🤖 Natural Language Input:', {
        userInput,
        canvasId,
        userId: user?.uid
      })

      // Use OpenAI to process natural language
      const result = await processNaturalLanguage(userInput)

      const successMessage = `✅ AI understood: "${userInput}" and executed: ${result.description}`
      setLastResult(successMessage)
      console.log('🤖 Natural language result:', result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Natural language processing failed:', errorMessage)
      setLastResult(`❌ Error: ${errorMessage}`)
    }
  }

  const sampleCommands: SampleCommand[] = [
    // Create Commands
    {
      name: 'Create Rectangle',
      command: 'createShape',
      parameters: {
        type: 'rect',
        position: { x: 100, y: 100 },
        size: { width: 150, height: 80 },
        fill: '#3B82F6'
      },
      category: 'Create',
      description: 'Create a blue rectangle'
    },
    {
      name: 'Create Circle',
      command: 'createShape',
      parameters: {
        type: 'circle',
        position: { x: 300, y: 200 },
        radius: 50,
        fill: '#10B981'
      },
      category: 'Create',
      description: 'Create a green circle'
    },
    {
      name: 'Create Text',
      command: 'createText',
      parameters: {
        text: 'Hello AI!',
        position: { x: 200, y: 300 },
        fontSize: 24,
        fill: '#F59E0B'
      },
      category: 'Create',
      description: 'Create orange text'
    },
    {
      name: 'Create Login Form',
      command: 'createLoginForm',
      parameters: {
        position: { x: 400, y: 100 }
      },
      category: 'Create',
      description: 'Create a login form with fields'
    },
    {
      name: 'Create Navigation Bar',
      command: 'createNavigationBar',
      parameters: {
        items: [{ label: 'Home' }, { label: 'About' }, { label: 'Contact' }],
        position: { x: 50, y: 50 }
      },
      category: 'Create',
      description: 'Create a navigation bar'
    },
    {
      name: 'Create Card Layout',
      command: 'createCardLayout',
      parameters: {
        position: { x: 100, y: 100 },
        cardConfig: {
          title: 'Sample Card',
          description:
            'This is a sample card with title, image placeholder, and description text.',
          imageUrl: 'https://example.com/image.jpg',
          imageAlt: 'Sample Image'
        },
        styling: {
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB',
          textColor: '#374151',
          titleColor: '#111827'
        }
      },
      category: 'Create',
      description: 'Create a card layout with title, image, and description'
    },
    // Manipulate Commands
    {
      name: 'Move Shape By Others',
      command: 'moveShapeByOthers',
      parameters: {
        shapeId: 'selected-shape-id',
        direction: 'center',
        distance: 50
      },
      category: 'Manipulate',
      requiresSelection: true,
      description: 'Move selected shape relative to other shapes on canvas'
    },
    {
      name: 'Make Larger',
      command: 'resizeLarger',
      parameters: {
        shapeId: 'selected-shape-id'
      },
      category: 'Manipulate',
      requiresSelection: true,
      description: 'Make selected shape larger using Fibonacci ratio (1.618x)'
    },
    {
      name: 'Make Smaller',
      command: 'resizeSmaller',
      parameters: {
        shapeId: 'selected-shape-id'
      },
      category: 'Manipulate',
      requiresSelection: true,
      description: 'Make selected shape smaller using Fibonacci ratio (0.618x)'
    },
    {
      name: 'Rotate 45° Clockwise',
      command: 'rotateShapeClockwise',
      parameters: {
        shapeId: 'selected-shape-id'
      },
      category: 'Manipulate',
      requiresSelection: true,
      description: 'Rotate selected shape 45 degrees clockwise (cumulative)'
    },
    {
      name: 'Rotate 45° Counterclockwise',
      command: 'rotateShapeCounterclockwise',
      parameters: {
        shapeId: 'selected-shape-id'
      },
      category: 'Manipulate',
      requiresSelection: true,
      description:
        'Rotate selected shape 45 degrees counterclockwise (cumulative)'
    },
    // Layout Commands
    {
      name: 'Arrange in Grid',
      command: 'arrangeInGrid',
      parameters: {
        shapeIds: ['selected-shapes'],
        rows: 2, // Will be calculated dynamically
        cols: 2, // Will be calculated dynamically
        spacing: 20
      },
      category: 'Layout',
      requiresMultipleSelection: true,
      description: 'Arrange selected shapes in an optimal grid'
    },
    {
      name: 'Arrange in Row',
      command: 'arrangeInRow',
      parameters: {
        shapeIds: ['selected-shapes'],
        spacing: 30,
        alignment: 'center'
      },
      category: 'Layout',
      requiresMultipleSelection: true,
      description: 'Arrange selected shapes in a row'
    },
    {
      name: 'Space Evenly',
      command: 'spaceEvenly',
      parameters: {
        shapeIds: ['selected-shapes'],
        direction: 'horizontal',
        padding: 20
      },
      category: 'Layout',
      requiresMultipleSelection: true,
      description: 'Space selected shapes evenly with equal gaps'
    },
    // Context Commands
    {
      name: 'Get Canvas State',
      command: 'getCanvasState',
      parameters: {
        includeShapes: true,
        includeViewport: true
      },
      category: 'Context',
      description: 'Get current canvas state'
    },
    {
      name: 'Find Shapes',
      command: 'findShapes',
      parameters: {
        criteria: {
          type: 'rect',
          color: '#3B82F6'
        }
      },
      category: 'Context',
      description: 'Find all blue rectangles'
    },
    // Delete Commands
    {
      name: 'Delete All Shapes',
      command: 'deleteAllShapes',
      parameters: {
        confirm: false
      },
      category: 'Delete',
      description: 'Delete all shapes from the canvas (requires confirmation)'
    }
  ]

  if (!isOpen) return null

  return (
    <>
      <Slide direction="right" in={isOpen} timeout={300}>
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            top: 80,
            left: 20,
            width: 420,
            maxHeight: 'calc(100vh - 100px)',
            borderRadius: 3,
            background: `rgba(255, 255, 255, 0.95)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            zIndex: 9999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RobotIcon
                sx={{
                  fontSize: 24,
                  color: theme.palette.primary.main
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: '1.125rem'
                }}
              >
                AI Agent
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {/* Status Messages */}
            {isExecuting && (
              <Fade in timeout={300}>
                <Alert
                  severity="info"
                  icon={<HourglassIcon />}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  Executing AI command...
                </Alert>
              </Fade>
            )}

            {(error || lastResult?.includes('❌')) && (
              <Fade in timeout={300}>
                <Alert
                  severity="error"
                  icon={<ErrorIcon />}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  {error || lastResult}
                </Alert>
              </Fade>
            )}

            {lastResult && !lastResult.includes('❌') && (
              <Fade in timeout={300}>
                <Alert
                  severity="success"
                  icon={<CheckCircleIcon />}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  {lastResult}
                </Alert>
              </Fade>
            )}

            {/* Sample Commands */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                Sample Commands
              </Typography>

              {/* Selection Status */}
              {selectedIds.length > 0 && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    borderRadius: 1
                  }}
                >
                  <Typography variant="caption" color="success.main">
                    {selectedIds.length} shape
                    {selectedIds.length > 1 ? 's' : ''} selected
                  </Typography>
                </Box>
              )}

              {/* Command Categories */}
              {['Create', 'Manipulate', 'Layout', 'Context', 'Delete'].map(
                category => {
                  const categoryCommands = sampleCommands.filter(
                    cmd => cmd.category === category
                  )
                  if (categoryCommands.length === 0) return null

                  return (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: 'text.secondary',
                          mb: 1,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}
                      >
                        {category}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1
                        }}
                      >
                        {categoryCommands.map((cmd, index) => {
                          const status = getCommandStatus(cmd)
                          const isDisabled = isExecuting || status.disabled

                          return (
                            <Fade
                              key={`${category}-${index}`}
                              in
                              timeout={400 + index * 100}
                              style={{ transitionDelay: `${index * 50}ms` }}
                            >
                              <Button
                                variant="contained"
                                onClick={() => handleExecuteSampleCommand(cmd)}
                                disabled={isDisabled}
                                startIcon={<PlayIcon />}
                                title={status.tooltip}
                                sx={{
                                  justifyContent: 'flex-start',
                                  textTransform: 'none',
                                  fontWeight: 500,
                                  py: 1.5,
                                  px: 2,
                                  borderRadius: 2,
                                  background: status.disabled
                                    ? theme.palette.grey[300]
                                    : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                  color: status.disabled
                                    ? theme.palette.grey[500]
                                    : 'white',
                                  '&:hover': {
                                    background: status.disabled
                                      ? theme.palette.grey[300]
                                      : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                    transform: status.disabled
                                      ? 'none'
                                      : 'translateY(-1px)',
                                    boxShadow: status.disabled
                                      ? 'none'
                                      : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                                  },
                                  '&:disabled': {
                                    background: theme.palette.grey[300],
                                    color: theme.palette.grey[500]
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                  opacity: status.disabled ? 0.6 : 1
                                }}
                              >
                                {cmd.name}
                                {status.reason === 'no-selection' &&
                                  ' (Select shape)'}
                                {status.reason === 'insufficient-selection' &&
                                  ' (Select 2+ shapes)'}
                              </Button>
                            </Fade>
                          )
                        })}
                      </Box>
                    </Box>
                  )
                }
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Natural Language Input */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                Natural Language
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  fullWidth
                  placeholder="Tell the AI what you want (e.g., 'create a blue rectangle')"
                  value={naturalLanguageInput}
                  onChange={e => setNaturalLanguageInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && naturalLanguageInput.trim()) {
                      handleNaturalLanguage(naturalLanguageInput)
                      setNaturalLanguageInput('')
                    }
                  }}
                  disabled={isExecuting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            if (naturalLanguageInput.trim()) {
                              handleNaturalLanguage(naturalLanguageInput)
                              setNaturalLanguageInput('')
                            }
                          }}
                          disabled={isExecuting || !naturalLanguageInput.trim()}
                          size="small"
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (naturalLanguageInput.trim()) {
                      handleNaturalLanguage(naturalLanguageInput)
                      setNaturalLanguageInput('')
                    }
                  }}
                  disabled={isExecuting || !naturalLanguageInput.trim()}
                  startIcon={<SendIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    py: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`
                    },
                    '&:disabled': {
                      background: theme.palette.grey[300],
                      color: theme.palette.grey[500]
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Ask AI
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Manual Command Input */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                Manual Command
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  fullWidth
                  placeholder="Command (e.g., createShape)"
                  value={manualCommandInput}
                  onChange={e => setManualCommandInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && manualCommandInput.trim()) {
                      handleExecuteCommand(manualCommandInput, {})
                      setManualCommandInput('')
                    }
                  }}
                  disabled={isExecuting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.success.main
                      }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (manualCommandInput.trim()) {
                      handleExecuteCommand(manualCommandInput, {})
                      setManualCommandInput('')
                    }
                  }}
                  disabled={isExecuting || !manualCommandInput.trim()}
                  startIcon={<PlayIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    py: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`
                    },
                    '&:disabled': {
                      background: theme.palette.grey[300],
                      color: theme.palette.grey[500]
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Execute Command
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Tips */}
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)}, ${alpha(theme.palette.warning.main, 0.02)})`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                borderRadius: 2
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5
                  }}
                >
                  <LightbulbIcon
                    sx={{
                      fontSize: 20,
                      color: theme.palette.warning.main
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '0.875rem'
                    }}
                  >
                    Tips
                  </Typography>
                </Box>
                <List dense sx={{ py: 0 }}>
                  {[
                    'Use natural language: "create a blue rectangle"',
                    'Click sample buttons for quick commands',
                    'Check browser console for detailed logs',
                    'Commands will create shapes on the canvas',
                    'All operations sync in real-time'
                  ].map((tip, index) => (
                    <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.75rem',
                              color: 'text.secondary',
                              lineHeight: 1.4
                            }}
                          >
                            • {tip}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Paper>
      </Slide>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-confirm-title"
        aria-describedby="delete-confirm-description"
      >
        <DialogTitle id="delete-confirm-title">Delete All Shapes</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirm-description">
            Are you sure you want to delete all shapes from the canvas? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AIPanel
