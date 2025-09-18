/**
 * @fileoverview Security monitoring and utilities for API routes
 * Provides request validation, logging, and security checks
 */

import { NextRequest } from 'next/server'
import { SecurityAudit, IPSecurity, SecureValidator } from './security'
import { APP_CONFIG } from './config'

export interface SecurityContext {
  ip: string
  userAgent: string
  userId?: string
  sessionId?: string
}

/**
 * Security middleware for API routes
 */
export class APISecurityMiddleware {
  /**
   * Validate API request for security
   */
  static async validateRequest(request: NextRequest): Promise<{
    isValid: boolean
    context: SecurityContext
    errors: string[]
  }> {
    const errors: string[] = []
    const ip = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    const context: SecurityContext = {
      ip,
      userAgent
    }
    
    // Check if IP is blocked
    if (IPSecurity.isBlocked(ip)) {
      errors.push('IP address is blocked')
      SecurityAudit.log('BLOCKED_IP_ACCESS', ip, 'high', 'Attempted access from blocked IP')
    }
    
    // Validate request size
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > APP_CONFIG.security.maxRequestSize) {
      errors.push('Request payload too large')
      IPSecurity.reportSuspiciousActivity(ip, 'Large payload attempt')
    }
    
    // Validate content type for POST/PUT
    if (request.method === 'POST' || request.method === 'PUT') {
      const contentType = request.headers.get('content-type')
      if (!contentType || !this.isValidContentType(contentType)) {
        errors.push('Invalid content type')
        IPSecurity.reportSuspiciousActivity(ip, 'Invalid content type')
      }
    }
    
    // Check for common attack patterns in headers
    if (this.hasAttackPatterns(request)) {
      errors.push('Malicious request detected')
      IPSecurity.reportSuspiciousActivity(ip, 'Attack patterns in headers')
    }
    
    return {
      isValid: errors.length === 0,
      context,
      errors
    }
  }
  
  /**
   * Validate JSON payload
   */
  static async validateJSONPayload(request: NextRequest): Promise<{
    isValid: boolean
    data?: any
    errors: string[]
  }> {
    const errors: string[] = []
    
    try {
      const text = await request.text()
      
      if (text.length > APP_CONFIG.security.maxRequestSize) {
        errors.push('Payload too large')
        return { isValid: false, errors }
      }
      
      const data = SecureValidator.validateJSON(text)
      return { isValid: true, data, errors }
      
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Invalid JSON')
      return { isValid: false, errors }
    }
  }
  
  /**
   * Log security event
   */
  static logSecurityEvent(
    event: string,
    context: SecurityContext,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: string
  ): void {
    SecurityAudit.log(event, context.ip, severity, details, context.userId)
  }
  
  /**
   * Extract client IP from request
   */
  private static getClientIP(request: NextRequest): string {
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
   * Check if content type is valid
   */
  private static isValidContentType(contentType: string): boolean {
    const validTypes = [
      'application/json',
      'multipart/form-data',
      'application/x-www-form-urlencoded',
      'text/plain'
    ]
    
    return validTypes.some(type => contentType.includes(type))
  }
  
  /**
   * Check for attack patterns in request
   */
  private static hasAttackPatterns(request: NextRequest): boolean {
    const attackPatterns = [
      // SQL Injection patterns
      /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b)/i,
      // XSS patterns
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/i,
      /vbscript:/i,
      // Command injection
      /(\b(cat|ls|pwd|id|whoami|wget|curl)\b)/i,
      // Path traversal
      /\.\.\//g,
      /\.\.\\/g
    ]
    
    // Check URL
    for (const pattern of attackPatterns) {
      if (pattern.test(request.url)) {
        return true
      }
    }
    
    // Check headers
    let hasAttackPattern = false
    request.headers.forEach((value, name) => {
      for (const pattern of attackPatterns) {
        if (pattern.test(value)) {
          hasAttackPattern = true
          return
        }
      }
    })
    
    return hasAttackPattern
  }
}

/**
 * Rate limiting for API endpoints
 */
export class APIRateLimit {
  private static limits = new Map<string, {
    count: number
    resetTime: number
    lastRequest: number
  }>()
  
  static check(
    identifier: string,
    maxRequests: number = 50,
    windowMs: number = 15 * 60 * 1000
  ): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const current = this.limits.get(identifier)
    
    if (!current || now > current.resetTime) {
      // Reset or create new limit
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
        lastRequest: now
      })
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      }
    }
    
    // Check for burst protection (max 10 requests per second)
    if (now - current.lastRequest < 100) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      }
    }
    
    if (current.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      }
    }
    
    current.count++
    current.lastRequest = now
    this.limits.set(identifier, current)
    
    return {
      allowed: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime
    }
  }
  
  static reset(identifier: string): void {
    this.limits.delete(identifier)
  }
}

/**
 * Authentication security helpers
 */
export class AuthSecurity {
  private static failedAttempts = new Map<string, {
    count: number
    lastAttempt: number
    lockedUntil?: number
  }>()
  
  static recordFailedAttempt(identifier: string): {
    isLocked: boolean
    attemptsRemaining: number
    lockedUntil?: number
  } {
    const now = Date.now()
    const current = this.failedAttempts.get(identifier) || {
      count: 0,
      lastAttempt: 0
    }
    
    // Reset if more than 1 hour since last attempt
    if (now - current.lastAttempt > 60 * 60 * 1000) {
      current.count = 0
    }
    
    current.count++
    current.lastAttempt = now
    
    // Lock account after max attempts
    if (current.count >= APP_CONFIG.security.maxLoginAttempts) {
      current.lockedUntil = now + APP_CONFIG.security.lockoutDuration
    }
    
    this.failedAttempts.set(identifier, current)
    
    return {
      isLocked: !!current.lockedUntil && now < current.lockedUntil,
      attemptsRemaining: Math.max(0, APP_CONFIG.security.maxLoginAttempts - current.count),
      lockedUntil: current.lockedUntil
    }
  }
  
  static isLocked(identifier: string): boolean {
    const current = this.failedAttempts.get(identifier)
    if (!current || !current.lockedUntil) {
      return false
    }
    
    if (Date.now() >= current.lockedUntil) {
      // Unlock and reset
      this.failedAttempts.delete(identifier)
      return false
    }
    
    return true
  }
  
  static clearFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier)
  }
  
  static getFailedAttempts(identifier: string): number {
    const current = this.failedAttempts.get(identifier)
    return current?.count || 0
  }
}

/**
 * File upload security
 */
export class FileUploadSecurity {
  static async validateUpload(file: File): Promise<{
    isValid: boolean
    errors: string[]
    sanitizedName: string
  }> {
    const errors: string[] = []
    
    // Validate file size
    if (file.size > APP_CONFIG.security.maxFileSize) {
      errors.push(`File size exceeds ${Math.round(APP_CONFIG.security.maxFileSize / 1024 / 1024)}MB limit`)
    }
    
    // Validate file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    const allowedTypes = [...APP_CONFIG.security.allowedFileTypes] as string[]
    if (!allowedTypes.includes(extension)) {
      errors.push(`File type ${extension} is not allowed`)
    }
    
    // Sanitize filename
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-_]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .substring(0, 255)
    
    // Check for executable file patterns
    const dangerousPatterns = [
      /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.com$/i,
      /\.scr$/i, /\.pif$/i, /\.vbs$/i, /\.js$/i,
      /\.jar$/i, /\.php$/i, /\.asp$/i, /\.jsp$/i
    ]
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(file.name)) {
        errors.push('File type not allowed for security reasons')
        break
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedName
    }
  }
  
  static async scanFileContent(file: File): Promise<{
    isSafe: boolean
    threats: string[]
  }> {
    const threats: string[] = []
    
    try {
      // For text files, scan content
      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        const content = await file.text()
        
        // Check for script injection
        if (/<script/i.test(content)) {
          threats.push('Script tags detected')
        }
        
        // Check for suspicious URLs
        if (/javascript:/i.test(content)) {
          threats.push('JavaScript URLs detected')
        }
        
        // Check for potential malware signatures
        const malwarePatterns = [
          /eval\s*\(/i,
          /document\.write/i,
          /window\.location/i,
          /iframe.*src/i
        ]
        
        for (const pattern of malwarePatterns) {
          if (pattern.test(content)) {
            threats.push('Suspicious code patterns detected')
            break
          }
        }
      }
    } catch (error) {
      threats.push('Unable to scan file content')
    }
    
    return {
      isSafe: threats.length === 0,
      threats
    }
  }
}