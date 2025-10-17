import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { generateCSPHeader } from './src/lib/security'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    headers: {
      // Temporarily disable security headers for development to avoid RTDb issues
      // 'Content-Security-Policy': generateCSPHeader(),
      // 'X-Frame-Options': 'DENY',
      // 'X-Content-Type-Options': 'nosniff',
      // 'X-XSS-Protection': '1; mode=block',
      // 'Referrer-Policy': 'strict-origin-when-cross-origin',
      // 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      // 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  },
  preview: {
    headers: {
      'Content-Security-Policy': generateCSPHeader(),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  }
})
