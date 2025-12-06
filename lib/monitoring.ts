/**
 * @fileoverview Performance monitoring utilities for server-side operations
 * Provides metrics collection, logging, and performance analysis
 */

// ============================================================================
// Performance Metrics Collector
// ============================================================================

interface Metric {
  name: string
  value: number
  unit: string
  timestamp: number
  tags: Record<string, string>
}

interface TimingEntry {
  start: number
  end?: number
  duration?: number
  metadata?: Record<string, unknown>
}

class MetricsCollector {
  private metrics: Metric[] = []
  private timings = new Map<string, TimingEntry>()
  private maxMetrics = 10000
  private aggregations = new Map<string, number[]>()

  /**
   * Record a metric
   */
  record(
    name: string,
    value: number,
    unit: string = 'ms',
    tags: Record<string, string> = {}
  ): void {
    const metric: Metric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    }

    this.metrics.push(metric)

    // Add to aggregations
    const aggKey = `${name}:${JSON.stringify(tags)}`
    const values = this.aggregations.get(aggKey) || []
    values.push(value)
    this.aggregations.set(aggKey, values.slice(-100)) // Keep last 100

    // Cleanup if too many metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics / 2)
    }
  }

  /**
   * Start timing an operation
   */
  startTiming(name: string, metadata?: Record<string, unknown>): string {
    const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.timings.set(id, {
      start: performance.now(),
      metadata
    })
    return id
  }

  /**
   * End timing and record metric
   */
  endTiming(id: string, tags: Record<string, string> = {}): number | null {
    const timing = this.timings.get(id)
    if (!timing) return null

    const end = performance.now()
    const duration = end - timing.start
    timing.end = end
    timing.duration = duration

    // Extract name from id
    const name = id.split('-')[0]
    this.record(name, duration, 'ms', tags)

    this.timings.delete(id)
    return duration
  }

  /**
   * Get aggregated stats for a metric
   */
  getStats(name: string, tags: Record<string, string> = {}): {
    count: number
    min: number
    max: number
    avg: number
    p50: number
    p95: number
    p99: number
  } | null {
    const aggKey = `${name}:${JSON.stringify(tags)}`
    const values = this.aggregations.get(aggKey)

    if (!values || values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const count = sorted.length

    return {
      count,
      min: sorted[0],
      max: sorted[count - 1],
      avg: values.reduce((a, b) => a + b, 0) / count,
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)]
    }
  }

  /**
   * Get all recent metrics
   */
  getRecentMetrics(limit: number = 100): Metric[] {
    return this.metrics.slice(-limit)
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
    this.timings.clear()
    this.aggregations.clear()
  }
}

// Global metrics collector
export const metrics = new MetricsCollector()

// ============================================================================
// Performance Logger
// ============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  context?: Record<string, unknown>
  duration?: number
}

class PerformanceLogger {
  private logs: LogEntry[] = []
  private maxLogs = 5000
  private minLevel: LogLevel = 'info'

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  }

  constructor() {
    // Set min level from environment
    const envLevel = process.env.LOG_LEVEL as LogLevel
    if (envLevel && this.levelPriority[envLevel] !== undefined) {
      this.minLevel = envLevel
    }
  }

  /**
   * Log a message
   */
  log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    duration?: number
  ): void {
    if (this.levelPriority[level] < this.levelPriority[this.minLevel]) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      duration
    }

    this.logs.push(entry)

    // Console output
    const prefix = `[${level.toUpperCase()}] [${new Date().toISOString()}]`
    const durationStr = duration ? ` (${duration.toFixed(2)}ms)` : ''
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''

    switch (level) {
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(`${prefix} ${message}${durationStr}${contextStr}`)
        }
        break
      case 'info':
        console.info(`${prefix} ${message}${durationStr}${contextStr}`)
        break
      case 'warn':
        console.warn(`${prefix} ${message}${durationStr}${contextStr}`)
        break
      case 'error':
        console.error(`${prefix} ${message}${durationStr}${contextStr}`)
        break
    }

    // Cleanup old logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs / 2)
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context)
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 100, level?: LogLevel): LogEntry[] {
    let filtered = this.logs
    if (level) {
      filtered = this.logs.filter(l => l.level === level)
    }
    return filtered.slice(-limit)
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = []
  }
}

// Global logger
export const logger = new PerformanceLogger()

// ============================================================================
// Request Performance Tracker
// ============================================================================

export interface RequestMetrics {
  requestId: string
  path: string
  method: string
  startTime: number
  endTime?: number
  duration?: number
  statusCode?: number
  cacheHit?: boolean
  dbQueries?: number
  dbTime?: number
  error?: string
}

class RequestTracker {
  private requests = new Map<string, RequestMetrics>()
  private completed: RequestMetrics[] = []
  private maxCompleted = 1000

  /**
   * Start tracking a request
   */
  start(requestId: string, path: string, method: string): void {
    this.requests.set(requestId, {
      requestId,
      path,
      method,
      startTime: performance.now(),
      dbQueries: 0,
      dbTime: 0
    })
  }

  /**
   * Record a database query
   */
  recordDbQuery(requestId: string, duration: number): void {
    const req = this.requests.get(requestId)
    if (req) {
      req.dbQueries = (req.dbQueries || 0) + 1
      req.dbTime = (req.dbTime || 0) + duration
    }
  }

  /**
   * Record cache hit
   */
  recordCacheHit(requestId: string, hit: boolean): void {
    const req = this.requests.get(requestId)
    if (req) {
      req.cacheHit = hit
    }
  }

  /**
   * End tracking a request
   */
  end(
    requestId: string,
    statusCode: number,
    error?: string
  ): RequestMetrics | null {
    const req = this.requests.get(requestId)
    if (!req) return null

    req.endTime = performance.now()
    req.duration = req.endTime - req.startTime
    req.statusCode = statusCode
    req.error = error

    this.requests.delete(requestId)
    this.completed.push(req)

    // Log slow requests
    if (req.duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.path}`, {
        duration: req.duration,
        dbQueries: req.dbQueries,
        dbTime: req.dbTime
      })
    }

    // Record metrics
    metrics.record('request_duration', req.duration, 'ms', {
      path: req.path,
      method: req.method,
      status: statusCode.toString()
    })

    // Cleanup
    if (this.completed.length > this.maxCompleted) {
      this.completed = this.completed.slice(-this.maxCompleted / 2)
    }

    return req
  }

  /**
   * Get request stats
   */
  getStats(): {
    activeRequests: number
    completedRequests: number
    avgDuration: number
    slowRequests: number
    errorRate: number
  } {
    const completed = this.completed
    const durations = completed.filter(r => r.duration).map(r => r.duration!)
    const errors = completed.filter(r => r.statusCode && r.statusCode >= 400)
    const slow = completed.filter(r => r.duration && r.duration > 1000)

    return {
      activeRequests: this.requests.size,
      completedRequests: completed.length,
      avgDuration: durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0,
      slowRequests: slow.length,
      errorRate: completed.length > 0
        ? errors.length / completed.length
        : 0
    }
  }

  /**
   * Get slow requests
   */
  getSlowRequests(thresholdMs: number = 1000): RequestMetrics[] {
    return this.completed.filter(r => r.duration && r.duration > thresholdMs)
  }
}

// Global request tracker
export const requestTracker = new RequestTracker()

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  tags: Record<string, string> = {}
): Promise<T> {
  const timingId = metrics.startTiming(name)
  try {
    const result = await fn()
    metrics.endTiming(timingId, { ...tags, status: 'success' })
    return result
  } catch (error) {
    metrics.endTiming(timingId, { ...tags, status: 'error' })
    throw error
  }
}

/**
 * Create a performance wrapper for functions
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const timingId = metrics.startTiming(name)
    try {
      const result = fn(...args)
      
      if (result instanceof Promise) {
        return result
          .then(r => {
            metrics.endTiming(timingId, { status: 'success' })
            return r
          })
          .catch(e => {
            metrics.endTiming(timingId, { status: 'error' })
            throw e
          }) as ReturnType<T>
      }
      
      metrics.endTiming(timingId, { status: 'success' })
      return result
    } catch (error) {
      metrics.endTiming(timingId, { status: 'error' })
      throw error
    }
  }) as T
}

/**
 * Generate request ID
 */
export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// Health Check Utilities
// ============================================================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  metrics: {
    avgRequestDuration: number
    errorRate: number
    activeRequests: number
  }
  timestamp: number
}

const startTime = Date.now()

/**
 * Get system health status
 */
export function getHealthStatus(): HealthStatus {
  const stats = requestTracker.getStats()
  
  // Get memory info (works in Node.js)
  let memoryInfo = { used: 0, total: 0, percentage: 0 }
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const mem = process.memoryUsage()
    memoryInfo = {
      used: mem.heapUsed,
      total: mem.heapTotal,
      percentage: (mem.heapUsed / mem.heapTotal) * 100
    }
  }

  // Determine health status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  
  if (stats.errorRate > 0.1 || stats.avgDuration > 2000) {
    status = 'degraded'
  }
  if (stats.errorRate > 0.3 || memoryInfo.percentage > 90) {
    status = 'unhealthy'
  }

  return {
    status,
    uptime: Date.now() - startTime,
    memory: memoryInfo,
    metrics: {
      avgRequestDuration: stats.avgDuration,
      errorRate: stats.errorRate,
      activeRequests: stats.activeRequests
    },
    timestamp: Date.now()
  }
}
