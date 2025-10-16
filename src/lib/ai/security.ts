import { securityLogger } from '../security'

export class AIRateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly MAX_REQUESTS_PER_MINUTE = 30
  private readonly MAX_REQUESTS_PER_HOUR = 500

  isAllowed(userId: string): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(userId) || []

    // Clean old requests (keep only last hour)
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < 60 * 60 * 1000
    )

    // Check hourly limit
    if (recentRequests.length >= this.MAX_REQUESTS_PER_HOUR) {
      securityLogger.log({
        type: 'ai_rate_limit_exceeded',
        userId,
        details: `AI agent hourly rate limit exceeded for user ${userId}`,
        severity: 'high'
      })
      return false
    }

    // Check minute limit
    const minuteRequests = recentRequests.filter(
      timestamp => now - timestamp < 60 * 1000
    )

    if (minuteRequests.length >= this.MAX_REQUESTS_PER_MINUTE) {
      securityLogger.log({
        type: 'ai_rate_limit_exceeded',
        userId,
        details: `AI agent minute rate limit exceeded for user ${userId}`,
        severity: 'medium'
      })
      return false
    }

    // Update requests
    recentRequests.push(now)
    this.requests.set(userId, recentRequests)

    return true
  }

  recordRequest(userId: string): void {
    const now = Date.now()
    const userRequests = this.requests.get(userId) || []
    userRequests.push(now)
    this.requests.set(userId, userRequests)
  }

  // Get current request count for a user
  getRequestCount(userId: string, timeWindowMs: number = 60 * 1000): number {
    const now = Date.now()
    const userRequests = this.requests.get(userId) || []
    return userRequests.filter(timestamp => now - timestamp < timeWindowMs)
      .length
  }

  // Reset rate limit for a user (for testing or admin purposes)
  resetUserLimit(userId: string): void {
    this.requests.delete(userId)
  }
}

export const aiRateLimiter = new AIRateLimiter()

// AI-specific security validations
export function validateAIParameters(params: any): boolean {
  // Check for potentially dangerous operations
  if (params.text && containsMaliciousContent(params.text)) {
    return false
  }

  // Check for reasonable limits
  if (
    params.position &&
    (params.position.x > 10000 || params.position.y > 10000)
  ) {
    return false
  }

  // Check for excessive array sizes
  if (
    params.shapeIds &&
    Array.isArray(params.shapeIds) &&
    params.shapeIds.length > 100
  ) {
    return false
  }

  // Check for excessive text length
  if (
    params.text &&
    typeof params.text === 'string' &&
    params.text.length > 1000
  ) {
    return false
  }

  return true
}

function containsMaliciousContent(text: string): boolean {
  // Basic content filtering - in production, use a proper content filter
  const maliciousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i]

  return maliciousPatterns.some(pattern => pattern.test(text))
}

// Additional security utilities
export function sanitizeTextInput(text: string): string {
  // Remove potentially dangerous characters and patterns
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 1000) // Limit length
}

export function validatePosition(position: { x: number; y: number }): boolean {
  return (
    typeof position.x === 'number' &&
    typeof position.y === 'number' &&
    position.x >= 0 &&
    position.y >= 0 &&
    position.x <= 10000 &&
    position.y <= 10000 &&
    isFinite(position.x) &&
    isFinite(position.y)
  )
}

export function validateSize(size: { width: number; height: number }): boolean {
  return (
    typeof size.width === 'number' &&
    typeof size.height === 'number' &&
    size.width > 0 &&
    size.height > 0 &&
    size.width <= 5000 &&
    size.height <= 5000 &&
    isFinite(size.width) &&
    isFinite(size.height)
  )
}
