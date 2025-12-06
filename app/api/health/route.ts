/**
 * @fileoverview Health check API endpoint for monitoring
 * Returns system health status, metrics, and cache statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getHealthStatus, requestTracker, metrics, logger } from '@/lib/monitoring'
import { getCacheStats } from '@/lib/cache'
import { requestLimiter, apiLimiter, aiLimiter } from '@/lib/rate-limiter'
import { aiRequestQueue, aiCircuitBreaker } from '@/lib/request-queue'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const verbose = url.searchParams.get('verbose') === 'true'
    const authHeader = request.headers.get('authorization')
    
    // Basic auth check for verbose mode (use env var in production)
    const isAuthorized = authHeader === `Bearer ${process.env.HEALTH_CHECK_TOKEN || 'health-check-secret'}`

    // Basic health response
    const health = getHealthStatus()
    
    const response: Record<string, unknown> = {
      status: health.status,
      timestamp: new Date().toISOString(),
      uptime: health.uptime,
      uptimeFormatted: formatUptime(health.uptime)
    }

    // Add detailed metrics only if authorized or in development
    if (isAuthorized || process.env.NODE_ENV === 'development') {
      const requestStats = requestTracker.getStats()
      const cacheStats = getCacheStats()
      const queueStats = aiRequestQueue.getStats()
      const rateLimitStats = {
        general: requestLimiter.getStats(),
        api: apiLimiter.getStats(),
        ai: aiLimiter.getStats()
      }

      response.metrics = {
        requests: {
          active: requestStats.activeRequests,
          completed: requestStats.completedRequests,
          avgDuration: Math.round(requestStats.avgDuration * 100) / 100,
          slowRequests: requestStats.slowRequests,
          errorRate: Math.round(requestStats.errorRate * 10000) / 100 // percentage
        },
        memory: {
          used: formatBytes(health.memory.used),
          total: formatBytes(health.memory.total),
          percentage: Math.round(health.memory.percentage * 100) / 100
        },
        cache: {
          resume: {
            entries: cacheStats.resume.entries,
            hitRate: Math.round(cacheStats.resume.hitRate * 100) + '%',
            memoryUsage: Math.round(cacheStats.resume.memoryUsage * 100) + '%'
          },
          user: {
            entries: cacheStats.user.entries,
            hitRate: Math.round(cacheStats.user.hitRate * 100) + '%'
          },
          ai: {
            entries: cacheStats.ai.entries,
            hitRate: Math.round(cacheStats.ai.hitRate * 100) + '%'
          }
        },
        aiQueue: {
          queueLength: queueStats.queueLength,
          activeRequests: queueStats.activeRequests,
          processed: queueStats.processed,
          failed: queueStats.failed,
          timedOut: queueStats.timedOut,
          circuitState: aiCircuitBreaker.getState()
        },
        rateLimiting: {
          general: {
            totalEntries: rateLimitStats.general.totalEntries,
            blockedCount: rateLimitStats.general.blockedCount
          },
          api: {
            totalEntries: rateLimitStats.api.totalEntries,
            blockedCount: rateLimitStats.api.blockedCount
          },
          ai: {
            totalEntries: rateLimitStats.ai.totalEntries,
            blockedCount: rateLimitStats.ai.blockedCount
          }
        }
      }

      // Add verbose data
      if (verbose) {
        response.recentMetrics = metrics.getRecentMetrics(20)
        response.slowRequests = requestTracker.getSlowRequests(1000).slice(-10)
        response.recentLogs = logger.getRecentLogs(20)
      }
    }

    // Set appropriate status code based on health
    const statusCode = health.status === 'healthy' ? 200 : 
                       health.status === 'degraded' ? 200 : 503

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    logger.error('Health check failed', { 
      error: error instanceof Error ? error.message : String(error) 
    })
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
