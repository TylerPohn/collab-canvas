import { Box, CircularProgress, Typography, useTheme } from '@mui/material'
import React from 'react'

interface CanvasAccessLoaderProps {
  message?: string
}

const CanvasAccessLoader: React.FC<CanvasAccessLoaderProps> = ({
  message = 'Checking access...'
}) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 3
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress
          size={48}
          thickness={4}
          sx={{
            color: theme.palette.primary.main,
            animationDuration: '1.5s'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            opacity: 0.8
          }}
        />
      </Box>

      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: 300
        }}
      >
        {message}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center'
        }}
      >
        {[0, 1, 2].map(index => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              animation: `pulse 1.5s ease-in-out ${index * 0.2}s infinite`,
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 0.3,
                  transform: 'scale(1)'
                },
                '50%': {
                  opacity: 1,
                  transform: 'scale(1.2)'
                }
              }
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export default CanvasAccessLoader
