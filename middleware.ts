/**
 * @fileoverview Next.js middleware for security features
 * Implements request-level security checks, rate limiting, and security headers
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateCSP, SECURITY_HEADERS } from './lib/security'

// Rate limiting map (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Security configuration
const SECURITY_CONFIG = {
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  maxRequestsPerWindow: 100,
  maxRequestsPerWindowAPI: 50,
  blockedIPs: new Set<string>(),
  trustedIPs: new Set<string>([
    '127.0.0.1',
    '::1',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16'
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
  const trustedIPs = Array.from(SECURITY_CONFIG.trustedIPs)
  for (const trusted of trustedIPs) {
    if (isIPInRange(ip, trusted)) {
      return true
    }
  }
  return false
}

/**
 * Rate limiting check
 */
function checkRateLimit(ip: string, isAPI: boolean): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const maxRequests = isAPI ? SECURITY_CONFIG.maxRequestsPerWindowAPI : SECURITY_CONFIG.maxRequestsPerWindow
  const key = `${ip}-${isAPI ? 'api' : 'web'}`
  
  const current = rateLimitMap.get(key)
  
  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(key, { count: 1, resetTime: now + SECURITY_CONFIG.rateLimitWindow })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }
  
  current.count++
  rateLimitMap.set(key, current)
  return { allowed: true, remaining: maxRequests - current.count }
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
  
  // Rate limiting
  const rateLimit = checkRateLimit(ip, isAPI)
  if (!rateLimit.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, `${isAPI ? 'API' : 'Web'} requests`)
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': isAPI ? SECURITY_CONFIG.maxRequestsPerWindowAPI.toString() : SECURITY_CONFIG.maxRequestsPerWindow.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil((Date.now() + SECURITY_CONFIG.rateLimitWindow) / 1000).toString()
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
  response.headers.set('X-RateLimit-Limit', isAPI ? SECURITY_CONFIG.maxRequestsPerWindowAPI.toString() : SECURITY_CONFIG.maxRequestsPerWindow.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil((Date.now() + SECURITY_CONFIG.rateLimitWindow) / 1000).toString())
  
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