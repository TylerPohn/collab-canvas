import {
  Close as CloseIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
  Send as SendIcon
} from '@mui/icons-material'
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  IconButton,
  InputAdornment,
  LinearProgress,
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
import { useAuth } from '../hooks/useAuth'
import { useLangChainAgent } from '../hooks/useLangChainAgent'

interface LangChainAIPanelProps {
  canvasId: string
  isOpen: boolean
  onClose: () => void
}

const LangChainAIPanel: React.FC<LangChainAIPanelProps> = ({
  canvasId,
  isOpen,
  onClose
}) => {
  const { user } = useAuth()
  const { processNaturalLanguage, isProcessing, error } = useLangChainAgent(
    canvasId,
    user?.uid || ''
  )
  const theme = useTheme()

  const [naturalLanguageInput, setNaturalLanguageInput] = useState('')
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
      type: 'user' | 'assistant'
      content: string
      timestamp: Date
    }>
  >([])

  const handleNaturalLanguage = async (userInput: string) => {
    if (!userInput.trim()) return

    // Add user message to conversation history
    const userMessage = {
      type: 'user' as const,
      content: userInput,
      timestamp: new Date()
    }
    setConversationHistory(prev => [...prev, userMessage])

    try {
      console.log('🤖 LangChain Natural Language Input:', {
        userInput,
        canvasId,
        userId: user?.uid
      })

      const result = await processNaturalLanguage(userInput)

      // Add assistant response to conversation history
      const assistantMessage = {
        type: 'assistant' as const,
        content:
          result?.output || result?.text || 'Command executed successfully',
        timestamp: new Date()
      }
      setConversationHistory(prev => [...prev, assistantMessage])

      console.log('🤖 LangChain result:', result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ LangChain processing failed:', errorMessage)

      // Add error to conversation history
      const errorMessageObj = {
        type: 'assistant' as const,
        content: `Error: ${errorMessage}`,
        timestamp: new Date()
      }
      setConversationHistory(prev => [...prev, errorMessageObj])
    }
  }

  const examplePrompts = [
    'Create a blue rectangle in the center of the canvas',
    'Add a green circle next to the rectangle',
    "Create some text that says 'Hello World'",
    'Arrange all shapes in a grid layout',
    'Make the rectangle larger',
    'Create a simple login form',
    'Add a navigation bar with Home, About, and Contact links'
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
          width: 450,
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
            <PsychologyIcon
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
              LangChain AI
            </Typography>
            <Chip
              label="v2.0"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
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
          {isProcessing && (
            <Fade in timeout={300}>
              <Box sx={{ mb: 2 }}>
                <Alert
                  severity="info"
                  icon={<HourglassIcon />}
                  sx={{
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  LangChain agent is thinking...
                </Alert>
                <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
              </Box>
            </Fade>
          )}

          {error && (
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
                {error}
              </Alert>
            </Fade>
          )}

          {/* Conversation History */}
          {conversationHistory.length > 0 && (
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
                Conversation History
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflow: 'auto',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                  p: 1
                }}
              >
                {conversationHistory.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor:
                        message.type === 'user'
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.grey[500], 0.1),
                      borderLeft: `3px solid ${
                        message.type === 'user'
                          ? theme.palette.primary.main
                          : theme.palette.grey[500]
                      }`
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color:
                          message.type === 'user'
                            ? 'primary.main'
                            : 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}
                    >
                      {message.type === 'user' ? 'You' : 'AI'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        fontSize: '0.875rem',
                        color: 'text.primary'
                      }}
                    >
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        color: 'text.secondary',
                        fontSize: '0.75rem'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

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
              Natural Language Commands
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Tell the AI what you want to create or do on the canvas..."
                value={naturalLanguageInput}
                onChange={e => setNaturalLanguageInput(e.target.value)}
                onKeyPress={e => {
                  if (
                    e.key === 'Enter' &&
                    e.ctrlKey &&
                    naturalLanguageInput.trim()
                  ) {
                    handleNaturalLanguage(naturalLanguageInput)
                    setNaturalLanguageInput('')
                  }
                }}
                disabled={isProcessing}
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
                        disabled={isProcessing || !naturalLanguageInput.trim()}
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
                disabled={isProcessing || !naturalLanguageInput.trim()}
                startIcon={<SendIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  py: 1.5,
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
                Send to AI Agent
              </Button>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  textAlign: 'center'
                }}
              >
                Press Ctrl+Enter to send
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Example Prompts */}
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
              Example Prompts
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {examplePrompts.map((prompt, index) => (
                <Fade
                  key={index}
                  in
                  timeout={400 + index * 100}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setNaturalLanguageInput(prompt)
                    }}
                    disabled={isProcessing}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      fontWeight: 400,
                      py: 1,
                      px: 2,
                      borderRadius: 2,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.05
                        ),
                        transform: 'translateY(-1px)'
                      },
                      '&:disabled': {
                        borderColor: theme.palette.grey[300],
                        color: theme.palette.grey[500]
                      },
                      transition: 'all 0.2s ease-in-out',
                      fontSize: '0.875rem'
                    }}
                  >
                    {prompt}
                  </Button>
                </Fade>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Tips */}
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)}, ${alpha(theme.palette.info.main, 0.02)})`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
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
                    color: theme.palette.info.main
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
                  LangChain AI Tips
                </Typography>
              </Box>
              <List dense sx={{ py: 0 }}>
                {[
                  'This AI uses LangChain for better natural language understanding',
                  'The agent can reason about complex multi-step tasks',
                  'Conversation history is maintained for context',
                  'All operations are executed using proper tool schemas',
                  'The system includes memory and error handling'
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

export default LangChainAIPanel
