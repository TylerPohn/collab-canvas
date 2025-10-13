import { createContext } from 'react'
import type { ToastContextType } from '../lib/toastTypes'

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
)
