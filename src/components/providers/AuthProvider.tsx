import {
  GoogleAuthProvider,
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth'
import React, { useEffect, useRef, useState } from 'react'
import { AuthContext, type AuthContextType } from '../../contexts/AuthContext'
import { auth } from '../../lib/firebase/client'
import { securityLogger } from '../../lib/security'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const tokenRefreshInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  )

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user)
      setLoading(false)

      // Set up token refresh for authenticated users
      if (user) {
        startTokenRefresh()
        securityLogger.log({
          type: 'auth_failure',
          userId: user.uid,
          details: `User ${user.uid} authenticated successfully`,
          severity: 'low'
        })
      } else {
        stopTokenRefresh()
      }
    })

    return () => {
      unsubscribe()
      stopTokenRefresh()
    }
  }, [])

  const startTokenRefresh = () => {
    // Refresh token every 55 minutes (tokens expire after 1 hour)
    tokenRefreshInterval.current = setInterval(
      async () => {
        try {
          const currentUser = auth.currentUser
          if (currentUser) {
            await currentUser.getIdToken(true) // Force refresh
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
          securityLogger.log({
            type: 'auth_failure',
            details: `Token refresh failed: ${error}`,
            severity: 'medium'
          })
        }
      },
      55 * 60 * 1000
    ) // 55 minutes
  }

  const stopTokenRefresh = () => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current)
      tokenRefreshInterval.current = null
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Error signing in with Google:', error)
      securityLogger.log({
        type: 'auth_failure',
        details: `Sign in failed: ${error}`,
        severity: 'medium'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      stopTokenRefresh() // Stop token refresh before logout
      await signOut(auth)
      securityLogger.log({
        type: 'auth_failure',
        details: 'User logged out successfully',
        severity: 'low'
      })
    } catch (error) {
      console.error('Error signing out:', error)
      securityLogger.log({
        type: 'auth_failure',
        details: `Logout failed: ${error}`,
        severity: 'medium'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
