import { useContext } from 'react'
import { ToastContext } from '../contexts/ToastContextDefinition'
import type { ToastContextType } from '../lib/toastTypes'

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
