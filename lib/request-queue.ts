/**
 * @fileoverview AI Request Queue with Concurrency Control
 * Handles heavy load by queuing AI requests and processing them with controlled concurrency
 */

export interface QueuedRequest<T> {
  id: string
  priority: number
  execute: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
  addedAt: number
  timeout: number
}

export interface QueueOptions {
  maxConcurrent: number
  maxQueueSize: number
  defaultTimeout: number
  retryAttempts: number
  retryDelay: number
}

const DEFAULT_OPTIONS: QueueOptions = {
  maxConcurrent: 3, // Max concurrent AI requests
  maxQueueSize: 100,
  defaultTimeout: 30000, // 30 seconds
  retryAttempts: 2,
  retryDelay: 1000
}

/**
 * Priority Queue for managing AI requests
 * Prevents overloading AI services during traffic spikes
 */
export class RequestQueue<T = unknown> {
  private queue: QueuedRequest<T>[] = []
  private activeCount = 0
  private options: QueueOptions
  private processing = false
  private requestIdCounter = 0
  private stats = {
    processed: 0,
    failed: 0,
    timedOut: 0,
    rejected: 0
  }

  constructor(options: Partial<QueueOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * Add request to queue
   */
  async enqueue(
    execute: () => Promise<T>,
    options: { priority?: number; timeout?: number } = {}
  ): Promise<T> {
    // Check queue size
    if (this.queue.length >= this.options.maxQueueSize) {
      this.stats.rejected++
      throw new Error('Queue is full. Please try again later.')
    }

    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: `req-${++this.requestIdCounter}`,
        priority: options.priority ?? 5,
        execute,
        resolve,
        reject,
        addedAt: Date.now(),
        timeout: options.timeout ?? this.options.defaultTimeout
      }

      // Insert by priority (higher priority first)
      const insertIndex = this.queue.findIndex(r => r.priority < request.priority)
      if (insertIndex === -1) {
        this.queue.push(request)
      } else {
        this.queue.splice(insertIndex, 0, request)
      }

      // Start processing if not already
      this.processQueue()

      // Set up timeout
      setTimeout(() => {
        const index = this.queue.findIndex(r => r.id === request.id)
        if (index !== -1) {
          this.queue.splice(index, 1)
          this.stats.timedOut++
          reject(new Error('Request timed out in queue'))
        }
      }, request.timeout)
    })
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0 && this.activeCount < this.options.maxConcurrent) {
      const request = this.queue.shift()
      if (!request) continue

      // Check if request has already timed out
      if (Date.now() - request.addedAt > request.timeout) {
        this.stats.timedOut++
        request.reject(new Error('Request timed out'))
        continue
      }

      this.activeCount++
      this.executeWithRetry(request)
        .then(result => {
          this.stats.processed++
          request.resolve(result)
        })
        .catch(error => {
          this.stats.failed++
          request.reject(error)
        })
        .finally(() => {
          this.activeCount--
          // Continue processing
          if (this.queue.length > 0) {
            this.processQueue()
          }
        })
    }

    this.processing = false
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetry(request: QueuedRequest<T>): Promise<T> {
    let lastError: Error = new Error('Unknown error')
    
    for (let attempt = 0; attempt <= this.options.retryAttempts; attempt++) {
      try {
        return await request.execute()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(lastError)) {
          throw lastError
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.options.retryAttempts) {
          await this.delay(this.options.retryDelay * Math.pow(2, attempt))
        }
      }
    }

    throw lastError
  }

  /**
   * Check if error should not be retried
   */
  private shouldNotRetry(error: Error): boolean {
    const noRetryPatterns = [
      /invalid/i,
      /unauthorized/i,
      /forbidden/i,
      /not found/i,
      /bad request/i
    ]
    return noRetryPatterns.some(pattern => pattern.test(error.message))
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    queueLength: number
    activeRequests: number
    processed: number
    failed: number
    timedOut: number
    rejected: number
  } {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeCount,
      ...this.stats
    }
  }

  /**
   * Clear queue
   */
  clear(): void {
    for (const request of this.queue) {
      request.reject(new Error('Queue cleared'))
    }
    this.queue = []
  }

  /**
   * Get queue position for a request ID
   */
  getPosition(requestId: string): number {
    return this.queue.findIndex(r => r.id === requestId)
  }
}

// ============================================================================
// Global AI Request Queue
// ============================================================================

// Singleton queue for AI requests
export const aiRequestQueue = new RequestQueue<string>({
  maxConcurrent: 3,
  maxQueueSize: 50,
  defaultTimeout: 30000,
  retryAttempts: 2,
  retryDelay: 1000
})

// ============================================================================
// Request Deduplication
// ============================================================================

interface PendingRequest<T> {
  promise: Promise<T>
  timestamp: number
}

/**
 * Request deduplicator to prevent duplicate concurrent requests
 */
export class RequestDeduplicator<T = unknown> {
  private pending = new Map<string, PendingRequest<T>>()
  private ttl: number

  constructor(ttl: number = 5000) {
    this.ttl = ttl
    
    // Cleanup expired entries periodically
    setInterval(() => this.cleanup(), 10000)
  }

  /**
   * Execute request with deduplication
   */
  async execute(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key)
    
    if (existing && Date.now() - existing.timestamp < this.ttl) {
      return existing.promise
    }

    const promise = factory()
    this.pending.set(key, { promise, timestamp: Date.now() })

    try {
      const result = await promise
      return result
    } finally {
      // Remove after completion
      setTimeout(() => {
        const entry = this.pending.get(key)
        if (entry && entry.promise === promise) {
          this.pending.delete(key)
        }
      }, 100)
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.pending) {
      if (now - entry.timestamp > this.ttl * 2) {
        this.pending.delete(key)
      }
    }
  }
}

// Global deduplicator instance
export const requestDeduplicator = new RequestDeduplicator<unknown>(5000)

// ============================================================================
// Circuit Breaker Pattern
// ============================================================================

export interface CircuitBreakerOptions {
  failureThreshold: number
  successThreshold: number
  timeout: number
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

/**
 * Circuit breaker to prevent cascading failures
 */
export class CircuitBreaker {
  private state = CircuitState.CLOSED
  private failures = 0
  private successes = 0
  private lastFailureTime = 0
  private options: CircuitBreakerOptions

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 3,
      timeout: options.timeout ?? 30000
    }
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      // Check if timeout has passed
      if (Date.now() - this.lastFailureTime >= this.options.timeout) {
        this.state = CircuitState.HALF_OPEN
        this.successes = 0
      } else {
        throw new Error('Circuit breaker is OPEN. Service unavailable.')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++
      if (this.successes >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED
      }
    }
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN
    }
  }

  getState(): CircuitState {
    return this.state
  }

  reset(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
  }
}

// Global circuit breaker for AI service
export const aiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 60000 // 1 minute
})
