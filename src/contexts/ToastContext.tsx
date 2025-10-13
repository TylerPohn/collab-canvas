import React, { type ReactNode, useCallback, useState } from 'react'
import ToastComponent from '../components/Toast'
import type { Toast, ToastContextType } from '../lib/toastTypes'
import { ToastContext } from './ToastContextDefinition'

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000 // Default 5 seconds
    }

    setToasts(prev => [...prev, newToast])
  }, [])

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'success', title, message })
    },
    [showToast]
  )

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'error', title, message, duration: 7000 }) // Errors stay longer
    },
    [showToast]
  )

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'warning', title, message })
    },
    [showToast]
  )

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'info', title, message })
    },
    [showToast]
  )

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {toasts.map(toast => (
            <ToastComponent
              key={toast.id}
              toast={toast}
              onRemove={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}
