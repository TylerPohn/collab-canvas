import { SmartToy } from '@mui/icons-material'
import { Box, CircularProgress, Fade, keyframes, useTheme } from '@mui/material'
import React from 'react'

interface AIThinkingIndicatorProps {
  isExecuting: boolean
}

// Pulse animation keyframes
const pulseKeyframes = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`

const AIThinkingIndicator: React.FC<AIThinkingIndicatorProps> = ({
  isExecuting
}) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 10000
      }}
    >
      <Fade in={isExecuting} timeout={300}>
        <Box sx={{ position: 'relative' }}>
          {/* Pulsing bot icon */}
          <SmartToy
            sx={{
              fontSize: 48,
              color: theme.palette.primary.main,
              animation: `${pulseKeyframes} 2s infinite`
            }}
          />

          {/* Thought bubble overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 24,
              height: 24,
              backgroundColor: theme.palette.background.paper,
              borderRadius: '50%',
              border: `2px solid ${theme.palette.primary.main}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress
              size={16}
              sx={{
                color: theme.palette.primary.main
              }}
            />
          </Box>
        </Box>
      </Fade>
    </Box>
  )
}

export default AIThinkingIndicator
