import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  getCanvas,
  grantCanvasAccess,
  verifyCanvasAccess
} from '../lib/firebase/firestore'
import { useAuth } from './useAuth'

export function useCanvasAccess(canvasId: string) {
  const { user } = useAuth()
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Special handling for default-canvas
  if (canvasId === 'default-canvas') {
    return {
      hasAccess: true,
      isOwner: false,
      needsPassword: false,
      isLoading: false,
      error: null,
      password,
      setPassword,
      passwordError,
      setPasswordError,
      verifyPassword: async () => true,
      handlePasswordSubmit: async () => true,
      grantAccess: async () => {},
      isGrantingAccess: false
    }
  }

  // Query to check access
  const {
    data: accessData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['canvas-access', canvasId, user?.uid],
    queryFn: async () => {
      if (!user?.uid) {
        return { hasAccess: false, isOwner: false, needsPassword: false }
      }
      return await verifyCanvasAccess(canvasId, user.uid)
    },
    enabled: !!user?.uid && !!canvasId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Mutation to grant access (for link-based canvases)
  const grantAccessMutation = useMutation({
    mutationFn: async () => {
      if (!user?.uid) {
        throw new Error('User not authenticated')
      }
      await grantCanvasAccess(canvasId, user.uid)
    },
    onSuccess: () => {
      refetch()
    },
    onError: error => {
      console.error('Failed to grant access:', error)
    }
  })

  // Verify password for link-based access
  const verifyPassword = useCallback(
    async (inputPassword: string): Promise<boolean> => {
      if (!user?.uid) {
        setPasswordError('User not authenticated')
        return false
      }

      try {
        // Get canvas to check password
        const canvas = await getCanvas(canvasId)
        if (!canvas) {
          setPasswordError('Canvas not found')
          return false
        }

        const { permissions } = canvas.meta

        // Check if password matches (in real implementation, you'd hash the input)
        if (permissions.password && permissions.password !== inputPassword) {
          setPasswordError('Incorrect password')
          return false
        }

        // Password is correct, grant access
        await grantCanvasAccess(canvasId, user.uid)
        setPasswordError('')
        return true
      } catch (error) {
        console.error('Password verification failed:', error)
        setPasswordError('Failed to verify password')
        return false
      }
    },
    [canvasId, user?.uid]
  )

  // Handle password submission
  const handlePasswordSubmit = useCallback(async (): Promise<boolean> => {
    if (!password.trim()) {
      setPasswordError('Password is required')
      return false
    }

    const success = await verifyPassword(password)
    if (success) {
      setPassword('')
    }
    return success
  }, [password, verifyPassword])

  return {
    hasAccess: accessData?.hasAccess || false,
    isOwner: accessData?.isOwner || false,
    needsPassword: accessData?.needsPassword || false,
    isLoading,
    error,
    password,
    setPassword,
    passwordError,
    setPasswordError,
    verifyPassword,
    handlePasswordSubmit,
    grantAccess: grantAccessMutation.mutateAsync,
    isGrantingAccess: grantAccessMutation.isPending
  }
}
