/**
 * @fileoverview High-performance in-memory caching layer
 * Implements LRU cache with TTL for handling heavy loads efficiently
 */

export interface CacheEntry<T> {
  value: T
  expires: number
  lastAccessed: number
  size: number
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum cache size in bytes (approximate)
  maxEntries?: number // Maximum number of entries
  onEvict?: (key: string, value: unknown) => void
}

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024 // 50MB
const DEFAULT_MAX_ENTRIES = 1000

/**
 * High-performance LRU Cache with TTL support
 * Thread-safe and optimized for concurrent access
 */
export class LRUCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>()
  private ttl: number
  private maxSize: number
  private maxEntries: number
  private currentSize = 0
  private onEvict?: (key: string, value: unknown) => void
  private cleanupInterval: NodeJS.Timeout | null = null
  private hits = 0
  private misses = 0

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl ?? DEFAULT_TTL
    this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE
    this.maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES
    this.onEvict = options.onEvict

    // Start cleanup interval
    this.startCleanup()
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.misses++
      return undefined
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.delete(key)
      this.misses++
      return undefined
    }

    // Update last accessed time (LRU)
    entry.lastAccessed = Date.now()
    this.hits++
    
    return entry.value
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, customTtl?: number): void {
    const ttl = customTtl ?? this.ttl
    const size = this.estimateSize(value)
    
    // Delete existing entry if present
    if (this.cache.has(key)) {
      this.delete(key)
    }

    // Evict entries if needed
    this.evictIfNeeded(size)

    const entry: CacheEntry<T> = {
      value,
      expires: Date.now() + ttl,
      lastAccessed: Date.now(),
      size
    }

    this.cache.set(key, entry)
    this.currentSize += size
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.currentSize -= entry.size
      this.onEvict?.(key, entry.value)
      return this.cache.delete(key)
    }
    return false
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() > entry.expires) {
      this.delete(key)
      return false
    }
    return true
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear()
    this.currentSize = 0
    this.hits = 0
    this.misses = 0
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    entries: number
    hits: number
    misses: number
    hitRate: number
    memoryUsage: number
  } {
    const total = this.hits + this.misses
    return {
      size: this.currentSize,
      entries: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      memoryUsage: this.currentSize / this.maxSize
    }
  }

  /**
   * Get or set with factory function
   */
  async getOrSet(
    key: string,
    factory: () => T | Promise<T>,
    customTtl?: number
  ): Promise<T> {
    const cached = this.get(key)
    if (cached !== undefined) {
      return cached
    }

    const value = await factory()
    this.set(key, value, customTtl)
    return value
  }

  /**
   * Invalidate entries matching a pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key)
        count++
      }
    }
    return count
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }

  private evictIfNeeded(requiredSize: number): void {
    // Evict by size
    while (this.currentSize + requiredSize > this.maxSize && this.cache.size > 0) {
      this.evictLRU()
    }

    // Evict by entry count
    while (this.cache.size >= this.maxEntries) {
      this.evictLRU()
    }
  }

  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  private estimateSize(value: unknown): number {
    if (value === null || value === undefined) return 8
    if (typeof value === 'string') return value.length * 2
    if (typeof value === 'number') return 8
    if (typeof value === 'boolean') return 4
    if (Array.isArray(value)) {
      return value.reduce((acc, item) => acc + this.estimateSize(item), 40)
    }
    if (typeof value === 'object') {
      return JSON.stringify(value).length * 2
    }
    return 100
  }

  private startCleanup(): void {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache) {
        if (now > entry.expires) {
          this.delete(key)
        }
      }
    }, 60 * 1000)
  }
}

// ============================================================================
// Global Cache Instances
// ============================================================================

// Resume data cache - longer TTL for read-heavy operations
export const resumeCache = new LRUCache<unknown>({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxEntries: 500,
  maxSize: 25 * 1024 * 1024 // 25MB
})

// User profile cache
export const userCache = new LRUCache<unknown>({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxEntries: 1000,
  maxSize: 10 * 1024 * 1024 // 10MB
})

// AI response cache - shorter TTL
export const aiCache = new LRUCache<unknown>({
  ttl: 30 * 60 * 1000, // 30 minutes for AI responses
  maxEntries: 200,
  maxSize: 5 * 1024 * 1024 // 5MB
})

// Template cache - long TTL as templates rarely change
export const templateCache = new LRUCache<unknown>({
  ttl: 60 * 60 * 1000, // 1 hour
  maxEntries: 50,
  maxSize: 5 * 1024 * 1024 // 5MB
})

// ============================================================================
// Cache Utilities
// ============================================================================

/**
 * Generate cache key for resume
 */
export function getResumeCacheKey(userId: string, resumeId?: string): string {
  return resumeId ? `resume:${userId}:${resumeId}` : `resumes:${userId}`
}

/**
 * Generate cache key for user profile
 */
export function getUserCacheKey(userId: string): string {
  return `user:${userId}`
}

/**
 * Generate cache key for AI request
 */
export function getAICacheKey(type: string, query: string): string {
  // Create a hash of the query for consistent key generation
  const hash = query.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return `ai:${type}:${Math.abs(hash)}`
}

/**
 * Invalidate all caches for a user
 */
export function invalidateUserCaches(userId: string): void {
  resumeCache.invalidatePattern(new RegExp(`^resume.*:${userId}`))
  userCache.delete(getUserCacheKey(userId))
}

/**
 * Get combined cache stats
 */
export function getCacheStats(): Record<string, ReturnType<LRUCache['getStats']>> {
  return {
    resume: resumeCache.getStats(),
    user: userCache.getStats(),
    ai: aiCache.getStats(),
    template: templateCache.getStats()
  }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  resumeCache.clear()
  userCache.clear()
  aiCache.clear()
  templateCache.clear()
}
