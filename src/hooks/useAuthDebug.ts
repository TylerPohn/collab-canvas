import { useEffect } from 'react'
import { useAuth } from './useAuth'

export function useAuthDebug() {
  const { user, loading } = useAuth()

  useEffect(() => {
    console.log('🔍 [useAuth] Auth state changed:', {
      user: user
        ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }
        : null,
      loading
    })
  }, [user, loading])

  return { user, loading }
}
