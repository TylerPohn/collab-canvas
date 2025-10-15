import React from 'react'
import { useConnectionStatus } from '../hooks/useConnectionStatus'

interface ConnectionStatusProps {
  canvasId?: string
  className?: string
  showText?: boolean
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  canvasId,
  className = '',
  showText = true
}) => {
  const { isConnected, isReconnecting, isOnline } =
    useConnectionStatus(canvasId)

  const getStatusStyle = () => {
    if (isConnected && isOnline) {
      return {
        backgroundColor: '#10b981', // green-500
        border: '1px solid #059669' // green-600
      }
    }
    if (isReconnecting) {
      return {
        backgroundColor: '#f59e0b', // yellow-500
        border: '1px solid #d97706' // yellow-600
      }
    }
    return {
      backgroundColor: '#ef4444', // red-500
      border: '1px solid #dc2626' // red-600
    }
  }

  const getStatusText = () => {
    if (isConnected && isOnline) return 'Connected'
    if (isReconnecting) return 'Reconnecting...'
    return 'Offline'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className="rounded-full flex-shrink-0"
        style={{
          width: '12px',
          height: '12px',
          minWidth: '12px',
          minHeight: '12px',
          display: 'block',
          ...getStatusStyle()
        }}
        title={getStatusText()}
      />
      {showText && (
        <span className="text-sm text-muted-foreground">{getStatusText()}</span>
      )}
    </div>
  )
}

export default ConnectionStatus
