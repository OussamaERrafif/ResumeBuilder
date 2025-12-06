# Performance Optimization Guide

This document outlines the performance optimizations implemented in the ResumeBuilder application to handle heavy loads efficiently.

## Table of Contents

1. [Caching Layer](#caching-layer)
2. [Rate Limiting](#rate-limiting)
3. [Request Queue & Circuit Breaker](#request-queue--circuit-breaker)
4. [Database Optimization](#database-optimization)
5. [Monitoring & Observability](#monitoring--observability)
6. [Next.js Optimizations](#nextjs-optimizations)
7. [Best Practices](#best-practices)

---

## Caching Layer

**Location:** `lib/cache.ts`

### Features
- **LRU Cache** with TTL (Time-To-Live) support
- **Memory-efficient** with configurable max size and entry limits
- **Automatic cleanup** of expired entries
- **Cache statistics** for monitoring hit rates

### Available Caches

| Cache | TTL | Max Entries | Purpose |
|-------|-----|-------------|---------|
| `resumeCache` | 10 min | 500 | Resume data |
| `userCache` | 5 min | 1000 | User profiles |
| `aiCache` | 30 min | 200 | AI responses |
| `templateCache` | 1 hour | 50 | Template configs |

### Usage Example

```typescript
import { resumeCache, getResumeCacheKey } from '@/lib/cache'

// Get from cache
const cached = resumeCache.get(getResumeCacheKey(userId))
if (cached) return cached

// Set in cache
resumeCache.set(cacheKey, data, 5 * 60 * 1000) // 5 min TTL

// Get or set pattern
const data = await resumeCache.getOrSet(
  cacheKey,
  async () => fetchFromDatabase(),
  5 * 60 * 1000
)
```

---

## Rate Limiting

**Location:** `lib/rate-limiter.ts`

### Features
- **Sliding Window Algorithm** for accurate rate limiting
- **Path-specific limits** for different API endpoints
- **Burst protection** to prevent request floods
- **Token Bucket** for smooth rate limiting
- **Automatic memory cleanup**

### Rate Limits

| Endpoint | Requests/Minute | Burst Limit |
|----------|-----------------|-------------|
| General | 120 | 20/5sec |
| `/api/*` | 60 | 20/5sec |
| `/api/ai/*` | 15 | 20/5sec |
| `/api/auth/*` | 20 | 20/5sec |

### Usage in API Routes

```typescript
import { aiLimiter, getClientIP, createRateLimitResponse } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const rateLimit = aiLimiter.check(`ai:${clientIP}`)
  
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.retryAfter || 60)
  }
  
  // Process request...
}
```

---

## Request Queue & Circuit Breaker

**Location:** `lib/request-queue.ts`

### Request Queue
Prevents overloading AI services by queuing requests with:
- **Concurrency control** (max 3 concurrent AI requests)
- **Priority-based processing**
- **Timeout handling**
- **Retry with exponential backoff**

### Circuit Breaker
Prevents cascading failures:
- **Opens** after 5 consecutive failures
- **Half-opens** after 60 seconds
- **Closes** after 3 consecutive successes

### Request Deduplication
Prevents duplicate concurrent requests for the same data.

### Usage Example

```typescript
import { 
  aiRequestQueue, 
  aiCircuitBreaker, 
  requestDeduplicator 
} from '@/lib/request-queue'

const content = await requestDeduplicator.execute(cacheKey, async () => {
  return await aiRequestQueue.enqueue(async () => {
    return await aiCircuitBreaker.execute(async () => {
      // AI request here
      return await callOpenAI(prompt)
    })
  }, { priority: 5, timeout: 25000 })
})
```

---

## Database Optimization

**Location:** `lib/db-optimized.ts`

### Features
- **Connection pooling** (5 pooled Supabase clients)
- **Retry logic** with exponential backoff
- **Query batching** for bulk operations
- **Cached database operations**

### Retry Configuration

```typescript
const DEFAULT_RETRY = {
  maxAttempts: 3,
  delayMs: 100,
  backoffMultiplier: 2
}
```

### Usage Example

```typescript
import { 
  getCachedUserResumes, 
  getCachedResume,
  invalidateResumeCache 
} from '@/lib/db-optimized'

// Get with caching
const resumes = await getCachedUserResumes(userId)

// Invalidate on update
invalidateResumeCache(userId, resumeId)
```

---

## Monitoring & Observability

**Location:** `lib/monitoring.ts`

### Components

1. **Metrics Collector**
   - Tracks operation timing
   - Calculates percentiles (p50, p95, p99)
   - Aggregates statistics

2. **Performance Logger**
   - Structured logging
   - Log levels (debug, info, warn, error)
   - Automatic slow request detection

3. **Request Tracker**
   - Tracks active requests
   - Monitors database query count
   - Detects cache hits

### Health Check Endpoint

**GET `/api/health`**

Returns system health status:
- Status: healthy/degraded/unhealthy
- Uptime
- Memory usage
- Request metrics
- Cache statistics
- Rate limiting stats
- AI queue status

```bash
# Basic health check
curl http://localhost:3000/api/health

# Verbose health check (requires auth)
curl -H "Authorization: Bearer health-check-secret" \
  "http://localhost:3000/api/health?verbose=true"
```

### Usage Example

```typescript
import { metrics, logger, measureAsync } from '@/lib/monitoring'

// Measure async operation
const result = await measureAsync(
  'database_query',
  async () => fetchData(),
  { table: 'resumes' }
)

// Manual timing
const timingId = metrics.startTiming('operation')
// ... do work ...
metrics.endTiming(timingId, { status: 'success' })

// Logging
logger.info('Operation completed', { userId, duration })
logger.warn('Slow request detected', { path, duration })
```

---

## Next.js Optimizations

**Location:** `next.config.mjs`

### Configured Optimizations

1. **Package Import Optimization**
   - Tree-shaking for large packages
   - Optimized imports for Radix UI, Lucide, etc.

2. **Image Optimization**
   - WebP and AVIF formats
   - 30-day cache TTL
   - Responsive sizes

3. **Chunk Splitting**
   - Vendor chunk for node_modules
   - UI components chunk
   - Common code chunk

4. **Caching Headers**
   - 1 year cache for static assets
   - No-cache for API routes
   - Stale-while-revalidate for sitemaps

5. **Output Optimization**
   - Standalone build for containerization
   - No source maps in production

### Scripts

```bash
# Development
pnpm dev

# Production build
pnpm build

# Production start
pnpm start:prod

# Build with bundle analysis
pnpm build:analyze
```

---

## Best Practices

### 1. Always Use Caching for Read Operations

```typescript
// Good
const data = await resumeCache.getOrSet(key, fetchFn)

// Bad
const data = await fetchData() // Every time hits DB
```

### 2. Invalidate Cache on Writes

```typescript
await updateResume(id, data)
invalidateResumeCache(userId, id)
invalidateResumeCache(userId) // List cache too
```

### 3. Use Request Deduplication for Expensive Operations

```typescript
// Prevents duplicate concurrent requests
const result = await requestDeduplicator.execute(key, expensiveOperation)
```

### 4. Implement Graceful Degradation

```typescript
try {
  return await aiCircuitBreaker.execute(primaryOperation)
} catch {
  return getFallbackContent()
}
```

### 5. Monitor Performance

```typescript
// Always track important operations
const result = await measureAsync('critical_operation', operation)
```

### 6. Use Lazy Loading for Heavy Components

```typescript
import { LazyVisible, createLazyComponent } from '@/components/loading'

const HeavyComponent = createLazyComponent(
  () => import('./HeavyComponent')
)
```

---

## Environment Variables

Add these for production:

```env
# Performance
LOG_LEVEL=info
HEALTH_CHECK_TOKEN=your-secure-token

# Rate Limiting (optional overrides)
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=120
```

---

## Monitoring Checklist

1. ✅ Monitor `/api/health` endpoint
2. ✅ Set up alerts for `status: degraded/unhealthy`
3. ✅ Track cache hit rates (target: >80%)
4. ✅ Monitor average request duration (target: <500ms)
5. ✅ Watch for rate limiting blocks
6. ✅ Track circuit breaker state changes
7. ✅ Monitor memory usage (target: <90%)

---

## Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Avg Response Time | <500ms | >2000ms |
| Cache Hit Rate | >80% | <50% |
| Error Rate | <1% | >5% |
| Memory Usage | <70% | >90% |
| Active Requests | <100 | >500 |
