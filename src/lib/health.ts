/**
 * Health check utility for monitoring application status
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: number
  services: {
    firebase?: ServiceHealth
    firestore?: ServiceHealth
    auth?: ServiceHealth
  }
  version: string
  uptime: number
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime?: number
  lastChecked: number
  error?: string
}

class HealthChecker {
  private startTime = Date.now()
  private services: HealthStatus['services'] = {}

  /**
   * Get overall application health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const timestamp = Date.now()
    const uptime = timestamp - this.startTime

    // Check all services
    await Promise.allSettled([
      this.checkFirebase(),
      this.checkFirestore(),
      this.checkAuth()
    ])

    // Determine overall status
    const serviceStatuses = Object.values(this.services)
    const hasUnhealthy = serviceStatuses.some(s => s?.status === 'unhealthy')
    const hasDegraded = serviceStatuses.some(s => s?.status === 'degraded')

    let overallStatus: HealthStatus['status'] = 'healthy'
    if (hasUnhealthy) {
      overallStatus = 'unhealthy'
    } else if (hasDegraded) {
      overallStatus = 'degraded'
    }

    return {
      status: overallStatus,
      timestamp,
      services: this.services,
      version: import.meta.env.VITE_APP_VERSION || '0.0.0',
      uptime
    }
  }

  /**
   * Check Firebase connection health
   */
  private async checkFirebase(): Promise<void> {
    const startTime = Date.now()

    try {
      // This will be implemented when Firebase is set up
      // For now, just mark as healthy
      this.services.firebase = {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: Date.now()
      }
    } catch (error) {
      this.services.firebase = {
        status: 'unhealthy',
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check Firestore connection health
   */
  private async checkFirestore(): Promise<void> {
    const startTime = Date.now()

    try {
      // This will be implemented when Firestore is set up
      // For now, just mark as healthy
      this.services.firestore = {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: Date.now()
      }
    } catch (error) {
      this.services.firestore = {
        status: 'unhealthy',
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check Firebase Auth health
   */
  private async checkAuth(): Promise<void> {
    const startTime = Date.now()

    try {
      // This will be implemented when Firebase Auth is set up
      // For now, just mark as healthy
      this.services.auth = {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: Date.now()
      }
    } catch (error) {
      this.services.auth = {
        status: 'unhealthy',
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Update service health status
   */
  updateServiceHealth(
    service: keyof HealthStatus['services'],
    health: ServiceHealth
  ): void {
    this.services[service] = health
  }
}

// Export singleton instance
export const healthChecker = new HealthChecker()

/**
 * Simple health check endpoint for monitoring
 */
export async function getHealthCheck(): Promise<HealthStatus> {
  return healthChecker.getHealthStatus()
}
