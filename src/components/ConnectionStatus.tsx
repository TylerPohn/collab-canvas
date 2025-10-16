import { Box, Chip, useTheme } from '@mui/material'
import React from 'react'
import { useConnectionStatus } from '../hooks/useConnectionStatus'

interface ConnectionStatusProps {
  canvasId?: string
  showText?: boolean
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  canvasId,
  showText = true
}) => {
  const { isConnected, isReconnecting, isOnline } =
    useConnectionStatus(canvasId)
  const theme = useTheme()

  const getStatusColor = () => {
    if (isConnected && isOnline) {
      return theme.palette.success.main
    }
    if (isReconnecting) {
      return theme.palette.warning.main
    }
    return theme.palette.error.main
  }

  const getStatusText = () => {
    if (isConnected && isOnline) return 'Connected'
    if (isReconnecting) return 'Reconnecting...'
    return 'Offline'
  }

  const getStatusVariant = () => {
    if (isConnected && isOnline) return 'filled'
    return 'outlined'
  }

  if (showText) {
    return (
      <Chip
        label={getStatusText()}
        size="small"
        variant={getStatusVariant() as any}
        sx={{
          height: 24,
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor:
            isConnected && isOnline ? getStatusColor() : 'transparent',
          color:
            isConnected && isOnline
              ? theme.palette.success.contrastText
              : getStatusColor(),
          borderColor: getStatusColor(),
          '& .MuiChip-label': {
            px: 1
          }
        }}
        icon={
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor:
                isConnected && isOnline
                  ? theme.palette.success.contrastText
                  : getStatusColor(),
              animation: isReconnecting
                ? 'pulse 1.5s ease-in-out infinite'
                : 'none',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 }
              }
            }}
          />
        }
      />
    )
  }

  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: getStatusColor(),
        animation: isReconnecting ? 'pulse 1.5s ease-in-out infinite' : 'none',
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.5 },
          '100%': { opacity: 1 }
        }
      }}
      title={getStatusText()}
    />
  )
}

export default ConnectionStatus
