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

interface AIPanelProps {
  canvasId: string
  isOpen: boolean
  onClose: () => void
}

interface CommandParameters {
  [key: string]: string | number | boolean | object | undefined
}

const AIPanel: React.FC<AIPanelProps> = ({ canvasId, isOpen, onClose }) => {
  const { user } = useAuth()
  const { executeCommand, processNaturalLanguage, isExecuting, error } =
    useAIAgent(canvasId, user?.uid || '')
  const theme = useTheme()

  const [lastResult, setLastResult] = useState<string | null>(null)
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('')
  const [manualCommandInput, setManualCommandInput] = useState('')

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

  const sampleCommands = [
    {
      name: 'Create Rectangle',
      command: 'createShape',
      parameters: {
        type: 'rect',
        position: { x: 100, y: 100 },
        size: { width: 150, height: 80 },
        fill: '#3B82F6'
      }
    },
    {
      name: 'Create Circle',
      command: 'createShape',
      parameters: {
        type: 'circle',
        position: { x: 300, y: 200 },
        radius: 50,
        fill: '#10B981'
      }
    },
    {
      name: 'Create Text',
      command: 'createText',
      parameters: {
        text: 'Hello AI!',
        position: { x: 200, y: 300 },
        fontSize: 24,
        fill: '#F59E0B'
      }
    },
    {
      name: 'Create Login Form',
      command: 'createLoginForm',
      parameters: {
        position: { x: 400, y: 100 }
      }
    },
    {
      name: 'Create Navigation Bar',
      command: 'createNavigationBar',
      parameters: {
        items: [{ label: 'Home' }, { label: 'About' }, { label: 'Contact' }],
        position: { x: 50, y: 50 }
      }
    },
    {
      name: 'Get Canvas State',
      command: 'getCanvasState',
      parameters: {
        includeShapes: true,
        includeViewport: true
      }
    }
  ]

  if (!isOpen) return null

  return (
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sampleCommands.map((cmd, index) => (
                <Fade
                  key={index}
                  in
                  timeout={400 + index * 100}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <Button
                    variant="contained"
                    onClick={() =>
                      handleExecuteCommand(cmd.command, cmd.parameters)
                    }
                    disabled={isExecuting}
                    startIcon={<PlayIcon />}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      fontWeight: 500,
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                      },
                      '&:disabled': {
                        background: theme.palette.grey[300],
                        color: theme.palette.grey[500]
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {cmd.name}
                  </Button>
                </Fade>
              ))}
            </Box>
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
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}
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
  )
}

export default AIPanel
