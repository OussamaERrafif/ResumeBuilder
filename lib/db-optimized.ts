/**
 * @fileoverview Optimized database utilities for high-load scenarios
 * Provides connection pooling, query batching, and retry logic
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { resumeCache, userCache, getResumeCacheKey, getUserCacheKey } from "./cache"

// ============================================================================
// Supabase Client Pool
// ============================================================================

interface PooledClient {
  client: SupabaseClient
  inUse: boolean
  lastUsed: number
  requestCount: number
}

const POOL_SIZE = 5
const MAX_REQUESTS_PER_CLIENT = 100
const CLIENT_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

/**
 * Connection pool for Supabase clients
 */
class SupabasePool {
  private pool: PooledClient[] = []
  private initialized = false

  constructor() {
    this.initPool()
  }

  private initPool(): void {
    if (this.initialized) return

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      console.warn('Supabase credentials not available')
      return
    }

    for (let i = 0; i < POOL_SIZE; i++) {
      this.pool.push({
        client: createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
          },
          db: {
            schema: 'public'
          },
          global: {
            headers: {
              'X-Client-Info': `pool-client-${i}`
            }
          }
        }),
        inUse: false,
        lastUsed: Date.now(),
        requestCount: 0
      })
    }

    this.initialized = true

    // Periodic cleanup
    setInterval(() => this.cleanupPool(), CLIENT_REFRESH_INTERVAL)
  }

  /**
   * Get an available client from the pool
   */
  acquire(): SupabaseClient {
    // Find an available client
    const available = this.pool.find(c => !c.inUse)
    
    if (available) {
      available.inUse = true
      available.lastUsed = Date.now()
      available.requestCount++
      return available.client
    }

    // All clients busy, return the least used one
    const leastUsed = this.pool.reduce((a, b) => 
      a.requestCount < b.requestCount ? a : b
    )
    
    leastUsed.lastUsed = Date.now()
    leastUsed.requestCount++
    return leastUsed.client
  }

  /**
   * Release client back to pool
   */
  release(client: SupabaseClient): void {
    const pooled = this.pool.find(c => c.client === client)
    if (pooled) {
      pooled.inUse = false
    }
  }

  /**
   * Cleanup and refresh stale clients
   */
  private cleanupPool(): void {
    const now = Date.now()
    
    for (let i = 0; i < this.pool.length; i++) {
      const pooled = this.pool[i]
      
      // Refresh client if it's been used too many times
      if (pooled.requestCount >= MAX_REQUESTS_PER_CLIENT && !pooled.inUse) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (url && key) {
          pooled.client = createClient(url, key, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: false
            }
          })
          pooled.requestCount = 0
          pooled.lastUsed = now
        }
      }
    }
  }
}

// Global pool instance
const supabasePool = new SupabasePool()

// ============================================================================
// Query Utilities with Retry Logic
// ============================================================================

interface RetryOptions {
  maxAttempts: number
  delayMs: number
  backoffMultiplier: number
}

const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 3,
  delayMs: 100,
  backoffMultiplier: 2
}

/**
 * Execute query with retry logic
 */
export async function executeWithRetry<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  options: Partial<RetryOptions> = {}
): Promise<{ data: T | null; error: any }> {
  const opts = { ...DEFAULT_RETRY, ...options }
  let lastError: any = null
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    const client = supabasePool.acquire()
    
    try {
      const result = await queryFn(client)
      supabasePool.release(client)
      
      if (!result.error) {
        return result
      }

      // Don't retry on certain errors
      if (isNonRetryableError(result.error)) {
        return result
      }

      lastError = result.error
    } catch (error) {
      supabasePool.release(client)
      lastError = error
    }

    // Wait before retry with exponential backoff
    if (attempt < opts.maxAttempts) {
      await delay(opts.delayMs * Math.pow(opts.backoffMultiplier, attempt - 1))
    }
  }

  return { data: null, error: lastError }
}

function isNonRetryableError(error: any): boolean {
  if (!error) return false
  
  const code = error.code || ''
  const message = error.message || ''
  
  // Don't retry on auth errors, not found, or validation errors
  return (
    code === '401' ||
    code === '403' ||
    code === '404' ||
    code === '422' ||
    message.includes('invalid') ||
    message.includes('not found') ||
    message.includes('unauthorized')
  )
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// Query Batching
// ============================================================================

interface BatchedQuery<T> {
  key: string
  resolve: (value: T) => void
  reject: (error: Error) => void
}

/**
 * Query batcher for combining multiple queries
 */
class QueryBatcher<T> {
  private pending = new Map<string, BatchedQuery<T>[]>()
  private timeout: NodeJS.Timeout | null = null
  private batchDelay: number

  constructor(batchDelay: number = 50) {
    this.batchDelay = batchDelay
  }

  /**
   * Add query to batch
   */
  async add(
    key: string,
    executeBatch: (keys: string[]) => Promise<Map<string, T>>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const query: BatchedQuery<T> = { key, resolve, reject }
      
      const queries = this.pending.get(key) || []
      queries.push(query)
      this.pending.set(key, queries)

      // Schedule batch execution
      if (!this.timeout) {
        this.timeout = setTimeout(() => {
          this.executeBatch(executeBatch)
        }, this.batchDelay)
      }
    })
  }

  private async executeBatch(
    executeBatch: (keys: string[]) => Promise<Map<string, T>>
  ): Promise<void> {
    this.timeout = null
    const queries = new Map(this.pending)
    this.pending.clear()

    try {
      const keys = Array.from(queries.keys())
      const results = await executeBatch(keys)

      for (const [key, queryList] of queries) {
        const result = results.get(key)
        for (const query of queryList) {
          if (result !== undefined) {
            query.resolve(result)
          } else {
            query.reject(new Error(`No result for key: ${key}`))
          }
        }
      }
    } catch (error) {
      for (const queryList of queries.values()) {
        for (const query of queryList) {
          query.reject(error instanceof Error ? error : new Error(String(error)))
        }
      }
    }
  }
}

// ============================================================================
// Cached Database Operations
// ============================================================================

/**
 * Get user resumes with caching
 */
export async function getCachedUserResumes(userId: string): Promise<any[]> {
  const cacheKey = getResumeCacheKey(userId)
  
  // Check cache first
  const cached = resumeCache.get(cacheKey)
  if (cached) {
    return cached as any[]
  }

  // Fetch from database
  const result = await executeWithRetry(async (client) => {
    return await client
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
  })

  if (result.data) {
    resumeCache.set(cacheKey, result.data)
  }

  return result.data || []
}

/**
 * Get single resume with caching
 */
export async function getCachedResume(
  userId: string,
  resumeId: string
): Promise<any | null> {
  const cacheKey = getResumeCacheKey(userId, resumeId)
  
  const cached = resumeCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const result = await executeWithRetry(async (client) => {
    return await client
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single()
  })

  if (result.data) {
    resumeCache.set(cacheKey, result.data)
  }

  return result.data
}

/**
 * Get user profile with caching
 */
export async function getCachedUserProfile(userId: string): Promise<any | null> {
  const cacheKey = getUserCacheKey(userId)
  
  const cached = userCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const result = await executeWithRetry(async (client) => {
    return await client
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()
  })

  if (result.data) {
    userCache.set(cacheKey, result.data)
  }

  return result.data
}

/**
 * Invalidate resume cache for user
 */
export function invalidateResumeCache(userId: string, resumeId?: string): void {
  if (resumeId) {
    resumeCache.delete(getResumeCacheKey(userId, resumeId))
  }
  // Always invalidate the user's resume list
  resumeCache.delete(getResumeCacheKey(userId))
}

/**
 * Invalidate user profile cache
 */
export function invalidateUserCache(userId: string): void {
  userCache.delete(getUserCacheKey(userId))
}

// ============================================================================
// Optimized Bulk Operations
// ============================================================================

/**
 * Bulk create resumes with transaction
 */
export async function bulkCreateResumes(
  resumes: Array<{
    user_id: string
    name: string
    template_id: string
    data: any
  }>
): Promise<{ data: any[] | null; error: any }> {
  return await executeWithRetry(async (client) => {
    return await client
      .from("resumes")
      .insert(resumes)
      .select()
  })
}

/**
 * Bulk update resumes
 */
export async function bulkUpdateResumes(
  updates: Array<{
    id: string
    user_id: string
    updates: Record<string, any>
  }>
): Promise<{ success: boolean; errors: any[] }> {
  const errors: any[] = []
  
  // Use Promise.allSettled for concurrent updates
  const results = await Promise.allSettled(
    updates.map(({ id, user_id, updates: data }) =>
      executeWithRetry(async (client) => {
        return await client
          .from("resumes")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user_id)
      })
    )
  )

  for (const result of results) {
    if (result.status === 'rejected') {
      errors.push(result.reason)
    } else if (result.value.error) {
      errors.push(result.value.error)
    }
  }

  return { success: errors.length === 0, errors }
}

// Export pool for direct access if needed
export { supabasePool }
