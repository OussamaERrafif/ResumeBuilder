/**
 * @fileoverview Advanced rate limiting with sliding window algorithm
 * Provides better memory management and more accurate rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// Sliding Window Rate Limiter
// ============================================================================

interface WindowEntry {
  count: number
  timestamp: number
}

interface RateLimitEntry {
  windows: WindowEntry[]
  blocked: boolean
  blockedUntil: number
}

export interface RateLimitConfig {
  windowSizeMs: number
  maxRequests: number
  slidingWindowCount: number
  blockDurationMs: number
  maxMemoryEntries: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowSizeMs: 60 * 1000, // 1 minute windows
  maxRequests: 60,
  slidingWindowCount: 5, // 5 windows = 5 minutes of history
  blockDurationMs: 15 * 60 * 1000, // 15 minute block
  maxMemoryEntries: 10000
}

/**
 * High-performance sliding window rate limiter
 */
export class SlidingWindowRateLimiter {
  private entries = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.startCleanup()
  }

  /**
   * Check if request is allowed
   */
  check(identifier: string): {
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  } {
    const now = Date.now()
    const windowStart = now - (this.config.windowSizeMs * this.config.slidingWindowCount)
    
    let entry = this.entries.get(identifier)
    
    // Create new entry if doesn't exist
    if (!entry) {
      entry = {
        windows: [{ count: 1, timestamp: now }],
        blocked: false,
        blockedUntil: 0
      }
      this.entries.set(identifier, entry)
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowSizeMs
      }
    }

    // Check if blocked
    if (entry.blocked && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
      }
    }

    // Unblock if block duration passed
    if (entry.blocked && now >= entry.blockedUntil) {
      entry.blocked = false
      entry.blockedUntil = 0
      entry.windows = []
    }

    // Clean old windows
    entry.windows = entry.windows.filter(w => w.timestamp >= windowStart)

    // Calculate total requests in sliding window
    const totalRequests = entry.windows.reduce((sum, w) => sum + w.count, 0)

    // Check if limit exceeded
    if (totalRequests >= this.config.maxRequests) {
      entry.blocked = true
      entry.blockedUntil = now + this.config.blockDurationMs
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: Math.ceil(this.config.blockDurationMs / 1000)
      }
    }

    // Add to current window
    const currentWindow = entry.windows.find(
      w => now - w.timestamp < this.config.windowSizeMs
    )
    
    if (currentWindow) {
      currentWindow.count++
    } else {
      entry.windows.push({ count: 1, timestamp: now })
    }

    return {
      allowed: true,
      remaining: this.config.maxRequests - totalRequests - 1,
      resetTime: now + this.config.windowSizeMs
    }
  }

  /**
   * Manually block an identifier
   */
  block(identifier: string, durationMs?: number): void {
    const entry = this.entries.get(identifier) || {
      windows: [],
      blocked: true,
      blockedUntil: Date.now() + (durationMs || this.config.blockDurationMs)
    }
    
    entry.blocked = true
    entry.blockedUntil = Date.now() + (durationMs || this.config.blockDurationMs)
    
    this.entries.set(identifier, entry)
  }

  /**
   * Manually unblock an identifier
   */
  unblock(identifier: string): void {
    const entry = this.entries.get(identifier)
    if (entry) {
      entry.blocked = false
      entry.blockedUntil = 0
      entry.windows = []
    }
  }

  /**
   * Get current status for an identifier
   */
  getStatus(identifier: string): {
    isBlocked: boolean
    blockedUntil: number | null
    requestCount: number
  } {
    const entry = this.entries.get(identifier)
    
    if (!entry) {
      return { isBlocked: false, blockedUntil: null, requestCount: 0 }
    }

    const windowStart = Date.now() - (this.config.windowSizeMs * this.config.slidingWindowCount)
    const validWindows = entry.windows.filter(w => w.timestamp >= windowStart)
    const requestCount = validWindows.reduce((sum, w) => sum + w.count, 0)

    return {
      isBlocked: entry.blocked && Date.now() < entry.blockedUntil,
      blockedUntil: entry.blocked ? entry.blockedUntil : null,
      requestCount
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalEntries: number
    blockedCount: number
    memoryUsagePercent: number
  } {
    let blockedCount = 0
    const now = Date.now()

    for (const entry of this.entries.values()) {
      if (entry.blocked && now < entry.blockedUntil) {
        blockedCount++
      }
    }

    return {
      totalEntries: this.entries.size,
      blockedCount,
      memoryUsagePercent: (this.entries.size / this.config.maxMemoryEntries) * 100
    }
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries.clear()
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }

  private startCleanup(): void {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      const windowStart = now - (this.config.windowSizeMs * this.config.slidingWindowCount)
      
      for (const [key, entry] of this.entries) {
        // Remove entries with no recent activity and not blocked
        const hasRecentActivity = entry.windows.some(w => w.timestamp >= windowStart)
        const isCurrentlyBlocked = entry.blocked && now < entry.blockedUntil

        if (!hasRecentActivity && !isCurrentlyBlocked) {
          this.entries.delete(key)
        }
      }

      // If still over limit, remove oldest entries
      if (this.entries.size > this.config.maxMemoryEntries) {
        const entries = Array.from(this.entries.entries())
        entries.sort((a, b) => {
          const aMax = Math.max(...a[1].windows.map(w => w.timestamp), 0)
          const bMax = Math.max(...b[1].windows.map(w => w.timestamp), 0)
          return aMax - bMax
        })

        const toRemove = entries.slice(0, this.entries.size - this.config.maxMemoryEntries)
        for (const [key] of toRemove) {
          this.entries.delete(key)
        }
      }
    }, 5 * 60 * 1000)
  }
}

// ============================================================================
// Global Rate Limiters
// ============================================================================

// General request limiter
export const requestLimiter = new SlidingWindowRateLimiter({
  windowSizeMs: 60 * 1000,
  maxRequests: 100,
  slidingWindowCount: 5,
  blockDurationMs: 5 * 60 * 1000
})

// API rate limiter (stricter)
export const apiLimiter = new SlidingWindowRateLimiter({
  windowSizeMs: 60 * 1000,
  maxRequests: 30,
  slidingWindowCount: 5,
  blockDurationMs: 10 * 60 * 1000
})

// AI endpoint limiter (very strict)
export const aiLimiter = new SlidingWindowRateLimiter({
  windowSizeMs: 60 * 1000,
  maxRequests: 10,
  slidingWindowCount: 5,
  blockDurationMs: 15 * 60 * 1000
})

// Auth endpoint limiter (prevent brute force)
export const authLimiter = new SlidingWindowRateLimiter({
  windowSizeMs: 60 * 1000,
  maxRequests: 5,
  slidingWindowCount: 10,
  blockDurationMs: 30 * 60 * 1000
})

// ============================================================================
// Token Bucket Rate Limiter (for burst handling)
// ============================================================================

interface TokenBucket {
  tokens: number
  lastRefill: number
}

export class TokenBucketLimiter {
  private buckets = new Map<string, TokenBucket>()
  private maxTokens: number
  private refillRate: number // tokens per second
  private refillInterval: number // ms

  constructor(
    maxTokens: number = 10,
    refillRate: number = 1
  ) {
    this.maxTokens = maxTokens
    this.refillRate = refillRate
    this.refillInterval = 1000 / refillRate

    // Cleanup old buckets periodically
    setInterval(() => {
      const now = Date.now()
      for (const [key, bucket] of this.buckets) {
        if (now - bucket.lastRefill > 60000) {
          this.buckets.delete(key)
        }
      }
    }, 60000)
  }

  /**
   * Try to consume a token
   */
  consume(identifier: string, tokens: number = 1): {
    allowed: boolean
    remaining: number
    retryAfterMs: number
  } {
    const now = Date.now()
    let bucket = this.buckets.get(identifier)

    if (!bucket) {
      bucket = { tokens: this.maxTokens, lastRefill: now }
      this.buckets.set(identifier, bucket)
    }

    // Refill tokens
    const timePassed = now - bucket.lastRefill
    const tokensToAdd = Math.floor(timePassed / this.refillInterval)
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd)
      bucket.lastRefill = now
    }

    // Check if enough tokens
    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens
      return {
        allowed: true,
        remaining: bucket.tokens,
        retryAfterMs: 0
      }
    }

    // Calculate retry time
    const tokensNeeded = tokens - bucket.tokens
    const retryAfterMs = Math.ceil(tokensNeeded * this.refillInterval)

    return {
      allowed: false,
      remaining: bucket.tokens,
      retryAfterMs
    }
  }
}

// Global token bucket for burst protection
export const burstLimiter = new TokenBucketLimiter(20, 2) // 20 tokens, refill 2/sec

// ============================================================================
// Rate Limit Response Helpers
// ============================================================================

/**
 * Create rate limit exceeded response
 */
export function createRateLimitResponse(
  retryAfter: number,
  remaining: number = 0
): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': remaining.toString(),
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString()
      }
    }
  )
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetTime: number,
  limit: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
  return response
}

// ============================================================================
// IP Utilities
// ============================================================================

/**
 * Extract client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  const vercelIP = request.headers.get('x-vercel-forwarded-for')

  if (cfIP) return cfIP
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  if (vercelIP) return vercelIP

  return 'unknown'
}

/**
 * Create rate limit identifier
 */
export function getRateLimitKey(
  request: NextRequest,
  prefix: string = 'req'
): string {
  const ip = getClientIP(request)
  const path = new URL(request.url).pathname
  return `${prefix}:${ip}:${path}`
}
