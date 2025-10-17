import DOMPurify from 'dompurify'

/**
 * Security utilities for input sanitization and validation
 */

// Rate limiting configuration
export const RATE_LIMITS = {
  shapesPerMinute: 50,
  presenceUpdatesPerSecond: 10,
  textContentLength: 1000,
  canvasNameLength: 100
} as const

/**
 * Sanitize text content to prevent XSS attacks
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return ''
  }

  // Remove HTML tags and sanitize
  const sanitized = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })

  // Trim and limit length
  return sanitized.trim().slice(0, RATE_LIMITS.textContentLength)
}

/**
 * Sanitize canvas name
 */
export function sanitizeCanvasName(name: string): string {
  if (typeof name !== 'string') {
    return 'Untitled Canvas'
  }

  const sanitized = DOMPurify.sanitize(name, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })

  return (
    sanitized.trim().slice(0, RATE_LIMITS.canvasNameLength) || 'Untitled Canvas'
  )
}

/**
 * Validate numeric values to prevent injection
 */
export function validateNumeric(
  value: unknown,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): number {
  const num = Number(value)

  if (isNaN(num) || !isFinite(num)) {
    return min
  }

  return Math.max(min, Math.min(max, num))
}

/**
 * Validate color values (hex, rgb, rgba, named colors)
 */
export function validateColor(color: string): string {
  if (typeof color !== 'string') {
    return '#000000'
  }

  // Basic color validation - allow hex, rgb, rgba, and common named colors
  const colorRegex =
    /^(#[0-9A-Fa-f]{3,6}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|transparent|black|white|red|green|blue|yellow|orange|purple|pink|gray|grey)$/

  if (colorRegex.test(color.trim())) {
    return color.trim()
  }

  return '#000000'
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests = new Map<string, number[]>()

  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []

    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)

    if (validRequests.length >= this.maxRequests) {
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)

    return true
  }

  getRemainingRequests(key: string): number {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    const validRequests = requests.filter(time => now - time < this.windowMs)

    return Math.max(0, this.maxRequests - validRequests.length)
  }
}

// Global rate limiters
export const shapeRateLimiter = new RateLimiter(
  RATE_LIMITS.shapesPerMinute,
  60 * 1000
) // 50 shapes per minute
export const presenceRateLimiter = new RateLimiter(
  RATE_LIMITS.presenceUpdatesPerSecond,
  1000
) // 10 updates per second

/**
 * Security audit logging
 */
export interface SecurityEvent {
  type:
    | 'rate_limit_exceeded'
    | 'invalid_input'
    | 'suspicious_activity'
    | 'auth_failure'
  userId?: string
  details: string
  timestamp: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class SecurityLogger {
  private events: SecurityEvent[] = []
  private maxEvents = 1000

  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    }

    this.events.push(securityEvent)

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Log to console in development
    // console.warn('[Security]', securityEvent)

    // In production, you would send to a monitoring service
    // Example: sendToMonitoringService(securityEvent)
  }

  getEvents(severity?: SecurityEvent['severity']): SecurityEvent[] {
    if (severity) {
      return this.events.filter(event => event.severity === severity)
    }
    return [...this.events]
  }

  clearEvents(): void {
    this.events = []
  }
}

export const securityLogger = new SecurityLogger()

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'", // Note: unsafe-eval needed for Konva
    'https://accounts.google.com/gsi/client',
    'https://apis.google.com',
    'https://*.googleapis.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://accounts.google.com/gsi/style'
  ],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': [
    "'self'",
    'https://*.firebaseapp.com',
    'https://*.firebaseio.com', // Allow Firebase Realtime Database
    'wss://*.firebaseio.com', // Allow Firebase Realtime Database WebSocket connections
    'https://*.googleapis.com',
    'https://accounts.google.com/gsi/',
    'https://securetoken.googleapis.com',
    'https://api.openai.com' // Allow OpenAI API calls
  ],
  'frame-src': [
    "'self'",
    'https://accounts.google.com/gsi/',
    'https://*.firebaseapp.com'
  ],
  'font-src': ["'self'", 'data:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"]
}

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}
