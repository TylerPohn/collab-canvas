import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { usePresence } from './usePresence'

export interface ConnectionStatus {
  isConnected: boolean
  isReconnecting: boolean
  lastConnectedAt: number | null
  connectionAttempts: number
}

export function useConnectionStatus(canvasId?: string) {
  const { user } = useAuth()
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isReconnecting: false,
    lastConnectedAt: null,
    connectionAttempts: 0
  })

  // Track network connectivity
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Use presence system as an additional connection indicator
  const presenceStatus = usePresence({
    canvasId: canvasId || 'default',
    enabled: !!user && !!canvasId
  })

  // Connection test function
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    try {
      // Test Firebase connection by attempting a simple Firestore read
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('../lib/firebase/client')

      // Try to read a document with a timeout
      const testDoc = doc(db, 'canvases', 'connection-test')
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      })

      await Promise.race([getDoc(testDoc), timeoutPromise])
      return true
    } catch (error) {
      console.warn('[useConnectionStatus] Connection test failed:', error)
      return false
    }
  }, [user])

  // Update connection status
  const updateConnectionStatus = useCallback(async () => {
    if (!user || !isOnline) {
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isReconnecting: false
      }))
      return
    }

    setStatus(prev => ({
      ...prev,
      isReconnecting: true,
      connectionAttempts: prev.connectionAttempts + 1
    }))

    const connected = await testConnection()

    setStatus(prev => ({
      isConnected: connected,
      isReconnecting: false,
      lastConnectedAt: connected ? Date.now() : prev.lastConnectedAt,
      connectionAttempts: prev.connectionAttempts
    }))
  }, [user, isOnline, testConnection])

  // Integrate with presence system for more accurate connection status
  useEffect(() => {
    if (canvasId && presenceStatus.isConnected !== undefined) {
      setStatus(prev => ({
        ...prev,
        isConnected: prev.isConnected && presenceStatus.isConnected,
        isReconnecting: prev.isReconnecting || presenceStatus.error !== null
      }))
    }
  }, [canvasId, presenceStatus.isConnected, presenceStatus.error])

  // Initial connection test
  useEffect(() => {
    if (user) {
      updateConnectionStatus()
    }
  }, [user, updateConnectionStatus])

  // Periodic connection monitoring
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      updateConnectionStatus()
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [user, updateConnectionStatus])

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (user) {
        updateConnectionStatus()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isReconnecting: false
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user, updateConnectionStatus])

  // Visibility change monitoring (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && isOnline) {
        updateConnectionStatus()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, isOnline, updateConnectionStatus])

  return {
    ...status,
    isOnline,
    testConnection: updateConnectionStatus
  }
}
