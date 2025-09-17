/**
 * @fileoverview Security utilities and sanitization functions
 * Production-ready security helpers for user input and data handling
 */

/**
 * Simple HTML sanitizer for basic XSS prevention
 * @param html - Raw HTML content
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return ''
  }

  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove dangerous attributes
  html = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
  html = html.replace(/\sjavascript\s*:/gi, '') // Remove javascript: protocols
  html = html.replace(/\svbscript\s*:/gi, '') // Remove vbscript: protocols
  html = html.replace(/\sdata\s*:/gi, '') // Remove data: protocols
  
  // Allow only basic formatting tags
  const allowedTags = /<\/?(?:p|br|strong|em|u|ul|ol|li|h[1-6]|span)(?:\s[^>]*)?>/i
  const cleanHtml = html.replace(/<[^>]+>/g, (match) => {
    return allowedTags.test(match) ? match : ''
  })

  return cleanHtml.trim()
}

/**
 * Sanitize text content by removing potentially dangerous characters
 * @param text - Raw text input
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return ''
  }

  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate and sanitize email addresses
 * @param email - Email address to validate
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') {
    return null
  }

  const sanitized = email.toLowerCase().trim()
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  if (!emailRegex.test(sanitized)) {
    return null
  }

  // Additional checks for common attack patterns
  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
    return null
  }

  return sanitized
}

/**
 * Sanitize phone numbers
 * @param phone - Phone number to sanitize
 * @returns Sanitized phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') {
    return ''
  }

  // Remove all non-digit characters except + at the beginning
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Ensure + is only at the beginning
  const hasCountryCode = cleaned.startsWith('+')
  const digits = cleaned.replace(/\+/g, '')
  
  // Validate length (international phone numbers are typically 7-15 digits)
  if (digits.length < 7 || digits.length > 15) {
    return ''
  }

  return hasCountryCode ? `+${digits}` : digits
}

/**
 * Sanitize URLs to prevent malicious redirects
 * @param url - URL to sanitize
 * @param allowedProtocols - Allowed URL protocols
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(
  url: string, 
  allowedProtocols: string[] = ['http:', 'https:', 'mailto:']
): string | null {
  if (typeof url !== 'string') {
    return null
  }

  const trimmed = url.trim()
  
  if (!trimmed) {
    return null
  }

  try {
    const parsed = new URL(trimmed)
    
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null
    }

    // Prevent javascript: and data: URLs
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
      return null
    }

    return parsed.toString()
  } catch {
    // If URL parsing fails, check if it's a relative URL
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed
    }
    return null
  }
}

/**
 * Escape SQL-like characters to prevent injection
 * @param input - Input string to escape
 * @returns Escaped string
 */
export function escapeSqlChars(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/\x00/g, '\\0') // Escape null bytes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\x1a/g, '\\Z') // Escape ctrl+Z
}

/**
 * Generate a secure random token
 * @param length - Token length
 * @returns Random token string
 */
export function generateSecureToken(length: number = 32): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length)
    window.crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback for server-side
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Validate file uploads for security
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export interface FileValidationOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
  checkMagicBytes?: boolean
}

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedName: string
}

export function validateFile(file: File, options: FileValidationOptions = {}): FileValidationResult {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/*', 'application/pdf', 'text/plain'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.docx'],
    checkMagicBytes = false
  } = options

  const errors: string[] = []
  
  // Sanitize filename
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-_]/g, '_') // Replace unsafe characters
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .substring(0, 255) // Limit length

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`)
  }

  // Check MIME type
  const isTypeAllowed = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -2))
    }
    return file.type === type
  })

  if (!isTypeAllowed) {
    errors.push(`File type ${file.type} is not allowed`)
  }

  // Check extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`)
  }

  // TODO: Add magic byte checking if needed
  if (checkMagicBytes) {
    // This would require reading the file buffer to check magic bytes
    // Implementation would depend on specific file type requirements
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedName
  }
}

/**
 * Rate limiting helper for client-side
 */
export class ClientRateLimit {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  checkLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const attempt = this.attempts.get(key)

    if (!attempt || now > attempt.resetTime) {
      // Reset or create new attempt record
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs })
      return { allowed: true, remaining: this.maxAttempts - 1, resetTime: now + this.windowMs }
    }

    if (attempt.count >= this.maxAttempts) {
      return { allowed: false, remaining: 0, resetTime: attempt.resetTime }
    }

    attempt.count++
    this.attempts.set(key, attempt)
    return { allowed: true, remaining: this.maxAttempts - attempt.count, resetTime: attempt.resetTime }
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }
}

/**
 * Content Security Policy helpers
 */
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  fontSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'"],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  formAction: ["'self'"],
  baseUri: ["'self'"],
  upgradeInsecureRequests: true
}

/**
 * Generate CSP header value
 * @param directives - CSP directives object
 * @returns CSP header string
 */
export function generateCSP(directives: Record<string, string[] | boolean> = CSP_DIRECTIVES): string {
  const csp: string[] = []

  Object.entries(directives).forEach(([directive, value]) => {
    if (typeof value === 'boolean' && value) {
      // Convert camelCase to kebab-case
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase()
      csp.push(kebabDirective)
    } else if (Array.isArray(value) && value.length > 0) {
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase()
      csp.push(`${kebabDirective} ${value.join(' ')}`)
    }
  })

  return csp.join('; ')
}

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Permitted-Cross-Domain-Policies': 'none'
}

/**
 * CSRF Token management
 */
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>()
  
  static generateToken(sessionId: string): string {
    const token = generateSecureToken(32)
    const expires = Date.now() + (60 * 60 * 1000) // 1 hour
    
    this.tokens.set(sessionId, { token, expires })
    return token
  }
  
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId)
    if (!stored || stored.expires < Date.now()) {
      this.tokens.delete(sessionId)
      return false
    }
    
    return stored.token === token
  }
  
  static cleanupExpired(): void {
    const now = Date.now()
    const entries = Array.from(this.tokens.entries())
    for (const [sessionId, data] of entries) {
      if (data.expires < now) {
        this.tokens.delete(sessionId)
      }
    }
  }
}

/**
 * Session security utilities
 */
export class SessionSecurity {
  private static activeSessions = new Map<string, {
    ip: string
    userAgent: string
    lastActivity: number
    isActive: boolean
  }>()
  
  static createSession(sessionId: string, ip: string, userAgent: string): void {
    this.activeSessions.set(sessionId, {
      ip,
      userAgent,
      lastActivity: Date.now(),
      isActive: true
    })
  }
  
  static validateSession(sessionId: string, ip: string, userAgent: string): boolean {
    const session = this.activeSessions.get(sessionId)
    if (!session || !session.isActive) {
      return false
    }
    
    // Check for session hijacking
    if (session.ip !== ip || session.userAgent !== userAgent) {
      this.invalidateSession(sessionId)
      return false
    }
    
    // Update last activity
    session.lastActivity = Date.now()
    return true
  }
  
  static invalidateSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId)
    if (session) {
      session.isActive = false
    }
  }
  
  static cleanupInactiveSessions(maxInactiveMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    const entries = Array.from(this.activeSessions.entries())
    for (const [sessionId, session] of entries) {
      if (now - session.lastActivity > maxInactiveMs) {
        this.activeSessions.delete(sessionId)
      }
    }
  }
}

/**
 * IP-based security checks
 */
export class IPSecurity {
  private static blockedIPs = new Set<string>()
  private static suspiciousActivity = new Map<string, {
    count: number
    lastAttempt: number
    violations: string[]
  }>()
  
  static blockIP(ip: string, reason: string): void {
    this.blockedIPs.add(ip)
    console.warn(`[SECURITY] IP ${ip} blocked: ${reason}`)
  }
  
  static unblockIP(ip: string): void {
    this.blockedIPs.delete(ip)
  }
  
  static isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip)
  }
  
  static reportSuspiciousActivity(ip: string, violation: string): void {
    const activity = this.suspiciousActivity.get(ip) || {
      count: 0,
      lastAttempt: 0,
      violations: []
    }
    
    activity.count++
    activity.lastAttempt = Date.now()
    activity.violations.push(`${new Date().toISOString()}: ${violation}`)
    
    // Keep only last 10 violations
    if (activity.violations.length > 10) {
      activity.violations = activity.violations.slice(-10)
    }
    
    this.suspiciousActivity.set(ip, activity)
    
    // Auto-block after 5 violations within 1 hour
    if (activity.count >= 5 && Date.now() - activity.lastAttempt < 60 * 60 * 1000) {
      this.blockIP(ip, `Multiple violations: ${violation}`)
    }
  }
  
  static getSuspiciousActivity(ip: string) {
    return this.suspiciousActivity.get(ip)
  }
}

/**
 * Input validation with security focus
 */
export class SecureValidator {
  static validateJSON(jsonString: string, maxSize: number = 1024 * 1024): any {
    if (jsonString.length > maxSize) {
      throw new Error('JSON payload too large')
    }
    
    try {
      const parsed = JSON.parse(jsonString)
      return this.sanitizeObject(parsed)
    } catch (error) {
      throw new Error('Invalid JSON format')
    }
  }
  
  static sanitizeObject(obj: any, depth: number = 0): any {
    if (depth > 10) {
      throw new Error('Object depth too deep')
    }
    
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, depth + 1))
    }
    
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const cleanKey = sanitizeText(key)
      if (cleanKey && cleanKey.length > 0) {
        sanitized[cleanKey] = this.sanitizeObject(value, depth + 1)
      }
    }
    
    return sanitized
  }
  
  static validateFileUpload(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit')
    }
    
    // Check file name for dangerous patterns
    const dangerousPatterns = [
      /\.\./,           // Directory traversal
      /[<>:"|?*]/,      // Invalid filename characters
      /\.php$/i,        // Executable files
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.sh$/i
    ]
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(file.name)) {
        errors.push(`Filename contains dangerous patterns: ${file.name}`)
        break
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Audit logging for security events
 */
export class SecurityAudit {
  private static logs: Array<{
    timestamp: string
    event: string
    ip: string
    userId?: string
    details: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  }> = []
  
  static log(
    event: string,
    ip: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: string,
    userId?: string
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ip,
      userId,
      details,
      severity
    }
    
    this.logs.push(logEntry)
    
    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000)
    }
    
    // Log to console based on severity
    const message = `[${severity.toUpperCase()}] ${event} from ${ip}${userId ? ` (user: ${userId})` : ''} - ${details}`
    
    switch (severity) {
      case 'critical':
        console.error(message)
        break
      case 'high':
        console.warn(message)
        break
      case 'medium':
        console.info(message)
        break
      case 'low':
        console.debug(message)
        break
    }
  }
  
  static getLogs(limit: number = 100) {
    return this.logs.slice(-limit)
  }
  
  static getLogsByIP(ip: string, limit: number = 50) {
    return this.logs.filter(log => log.ip === ip).slice(-limit)
  }
  
  static getLogsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical', limit: number = 100) {
    return this.logs.filter(log => log.severity === severity).slice(-limit)
  }
}
