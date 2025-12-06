/**
 * @fileoverview Next.js middleware for security features
 * Implements request-level security checks, rate limiting, and security headers
 * Optimized for high-load scenarios with efficient rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateCSP, SECURITY_HEADERS } from './lib/security'

// ============================================================================
// Optimized Sliding Window Rate Limiter (inline for edge runtime)
// ============================================================================

interface RateLimitEntry {
  count: number
  windowStart: number
}

// Use Map for O(1) lookups
const rateLimitMap = new Map<string, RateLimitEntry>()

// Cleanup tracking
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 60 * 1000 // 1 minute

// Security configuration with optimized limits
const SECURITY_CONFIG = {
  rateLimitWindow: 60 * 1000, // 1 minute window (more granular)
  maxRequestsPerWindow: 120, // General requests per minute
  maxRequestsPerWindowAPI: 60, // API requests per minute  
  maxRequestsPerWindowAI: 15, // AI requests per minute (stricter)
  burstLimit: 20, // Max requests in 5 seconds (burst protection)
  burstWindow: 5 * 1000,
  blockedIPs: new Set<string>(),
  trustedIPs: new Set<string>([
    '127.0.0.1',
    '::1',
  ]),
  // Rate limit by path patterns
  pathLimits: new Map<string, number>([
    ['/api/ai/', 15],
    ['/api/auth/', 20],
    ['/api/', 60],
  ])
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (remoteAddr) {
    return remoteAddr
  }
  
  return 'unknown'
}

/**
 * Check if IP is in CIDR range (simplified check for common ranges)
 */
function isIPInRange(ip: string, range: string): boolean {
  if (!range.includes('/')) {
    return ip === range
  }
  
  // Simple check for common private ranges
  if (range === '10.0.0.0/8') {
    return ip.startsWith('10.')
  }
  if (range === '172.16.0.0/12') {
    return ip.startsWith('172.16.') || ip.startsWith('172.17.') || 
           ip.startsWith('172.31.')
  }
  if (range === '192.168.0.0/16') {
    return ip.startsWith('192.168.')
  }
  
  return false
}

/**
 * Check if IP is trusted
 */
function isTrustedIP(ip: string): boolean {
  for (const trusted of SECURITY_CONFIG.trustedIPs) {
    if (ip === trusted) {
      return true
    }
  }
  // Check for localhost variations
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return true
  }
  return false
}

/**
 * Get rate limit for path
 */
function getRateLimitForPath(pathname: string): number {
  for (const [pattern, limit] of SECURITY_CONFIG.pathLimits) {
    if (pathname.startsWith(pattern)) {
      return limit
    }
  }
  return SECURITY_CONFIG.maxRequestsPerWindow
}

/**
 * Cleanup old entries periodically
 */
function cleanupRateLimitMap(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  
  lastCleanup = now
  const windowStart = now - SECURITY_CONFIG.rateLimitWindow
  
  for (const [key, entry] of rateLimitMap) {
    if (entry.windowStart < windowStart) {
      rateLimitMap.delete(key)
    }
  }
  
  // Prevent memory bloat - keep max 10000 entries
  if (rateLimitMap.size > 10000) {
    const entries = Array.from(rateLimitMap.entries())
    entries.sort((a, b) => a[1].windowStart - b[1].windowStart)
    const toRemove = entries.slice(0, rateLimitMap.size - 5000)
    for (const [key] of toRemove) {
      rateLimitMap.delete(key)
    }
  }
}

/**
 * Rate limiting check with sliding window
 */
function checkRateLimit(ip: string, pathname: string): { 
  allowed: boolean
  remaining: number
  resetTime: number
} {
  cleanupRateLimitMap()
  
  const now = Date.now()
  const maxRequests = getRateLimitForPath(pathname)
  const key = `${ip}:${pathname.split('/').slice(0, 3).join('/')}`
  
  const current = rateLimitMap.get(key)
  const windowStart = now - SECURITY_CONFIG.rateLimitWindow
  
  if (!current || current.windowStart < windowStart) {
    // Reset or create new entry
    rateLimitMap.set(key, { count: 1, windowStart: now })
    return { 
      allowed: true, 
      remaining: maxRequests - 1,
      resetTime: now + SECURITY_CONFIG.rateLimitWindow
    }
  }
  
  if (current.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: current.windowStart + SECURITY_CONFIG.rateLimitWindow
    }
  }
  
  current.count++
  return { 
    allowed: true, 
    remaining: maxRequests - current.count,
    resetTime: current.windowStart + SECURITY_CONFIG.rateLimitWindow
  }
}

/**
 * Check for burst (too many requests in short time)
 */
function checkBurst(ip: string): boolean {
  const burstKey = `burst:${ip}`
  const now = Date.now()
  const current = rateLimitMap.get(burstKey)
  
  if (!current || now - current.windowStart > SECURITY_CONFIG.burstWindow) {
    rateLimitMap.set(burstKey, { count: 1, windowStart: now })
    return true
  }
  
  if (current.count >= SECURITY_CONFIG.burstLimit) {
    return false
  }
  
  current.count++
  return true
}

/**
 * Validate request headers for security
 */
function validateHeaders(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')
  const contentType = request.headers.get('content-type')
  
  // Block requests without user agent (potential bots)
  if (!userAgent) {
    return false
  }
  
  // Block suspicious user agents
  const suspiciousPatterns = [
    /curl/i,
    /wget/i,
    /scanner/i,
    /bot.*attack/i,
    /sqlmap/i,
    /nikto/i
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) {
      return false
    }
  }
  
  // Validate content type for POST/PUT requests
  if (request.method === 'POST' || request.method === 'PUT') {
    if (contentType && !contentType.includes('application/json') && 
        !contentType.includes('multipart/form-data') &&
        !contentType.includes('application/x-www-form-urlencoded')) {
      return false
    }
  }
  
  return true
}

/**
 * Log security events
 */
function logSecurityEvent(event: string, ip: string, details?: string) {
  const timestamp = new Date().toISOString()
  console.warn(`[SECURITY] ${timestamp} - ${event} from IP ${ip}${details ? ` - ${details}` : ''}`)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIP(request)
  const isAPI = pathname.startsWith('/api/')
  
  // Skip security checks for trusted IPs in development
  if (process.env.NODE_ENV === 'development' && isTrustedIP(ip)) {
    const response = NextResponse.next()
    
    // Add security headers even in development
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
  
  // Check if IP is blocked
  if (SECURITY_CONFIG.blockedIPs.has(ip)) {
    logSecurityEvent('BLOCKED_IP_ACCESS', ip, pathname)
    return new NextResponse('Access Denied', { status: 403 })
  }
  
  // Validate headers
  if (!validateHeaders(request)) {
    logSecurityEvent('SUSPICIOUS_HEADERS', ip, `User-Agent: ${request.headers.get('user-agent')}`)
    return new NextResponse('Bad Request', { status: 400 })
  }
  
  // Burst protection (too many requests in short time)
  if (!checkBurst(ip)) {
    logSecurityEvent('BURST_LIMIT', ip, 'Too many requests in short time')
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '5',
        'X-RateLimit-Remaining': '0'
      }
    })
  }
  
  // Rate limiting with path-specific limits
  const rateLimit = checkRateLimit(ip, pathname)
  if (!rateLimit.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, `Path: ${pathname}`)
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': getRateLimitForPath(pathname).toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
        'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
      }
    })
  }
  
  // Create response
  const response = NextResponse.next()
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Add CSP header
  response.headers.set('Content-Security-Policy', generateCSP())
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', getRateLimitForPath(pathname).toString())
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}