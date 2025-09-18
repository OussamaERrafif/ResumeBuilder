/**
 * @fileoverview Example API route showing security middleware integration
 * Demonstrates how to use the security features in API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { APISecurityMiddleware, APIRateLimit, AuthSecurity } from '@/lib/api-security'
import { SecurityAudit } from '@/lib/security'

/**
 * Example API route with security integration
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Validate request security
    const validation = await APISecurityMiddleware.validateRequest(request)
    if (!validation.isValid) {
      APISecurityMiddleware.logSecurityEvent(
        'INVALID_REQUEST',
        validation.context,
        'medium',
        `Validation failed: ${validation.errors.join(', ')}`
      )
      
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400 }
      )
    }

    // Step 2: Check rate limiting
    const rateLimit = APIRateLimit.check(validation.context.ip, 10, 60000) // 10 requests per minute
    if (!rateLimit.allowed) {
      APISecurityMiddleware.logSecurityEvent(
        'RATE_LIMIT_EXCEEDED',
        validation.context,
        'medium',
        'API rate limit exceeded'
      )
      
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      )
    }

    // Step 3: Validate JSON payload
    const payload = await APISecurityMiddleware.validateJSONPayload(request)
    if (!payload.isValid) {
      APISecurityMiddleware.logSecurityEvent(
        'INVALID_PAYLOAD',
        validation.context,
        'medium',
        `Payload validation failed: ${payload.errors.join(', ')}`
      )
      
      return NextResponse.json(
        { error: 'Invalid payload', details: payload.errors },
        { status: 400 }
      )
    }

    // Step 4: Process the request (example: login attempt)
    const { email, password } = payload.data
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Check for account lockout
    if (AuthSecurity.isLocked(email)) {
      APISecurityMiddleware.logSecurityEvent(
        'LOCKED_ACCOUNT_ACCESS',
        validation.context,
        'high',
        `Access attempt to locked account: ${email}`
      )
      
      return NextResponse.json(
        { error: 'Account temporarily locked' },
        { status: 423 }
      )
    }

    // Simulate authentication logic
    const isValidAuth = await simulateAuth(email, password)
    
    if (!isValidAuth) {
      // Record failed attempt
      const lockStatus = AuthSecurity.recordFailedAttempt(email)
      
      APISecurityMiddleware.logSecurityEvent(
        'LOGIN_FAILURE',
        { ...validation.context, userId: email },
        'medium',
        `Failed login attempt (${lockStatus.attemptsRemaining} attempts remaining)`
      )
      
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          attemptsRemaining: lockStatus.attemptsRemaining,
          isLocked: lockStatus.isLocked
        },
        { status: 401 }
      )
    }

    // Success - clear failed attempts
    AuthSecurity.clearFailedAttempts(email)
    
    // Log successful authentication
    SecurityAudit.log(
      'LOGIN_SUCCESS',
      validation.context.ip,
      'low',
      `Successful login for user: ${email}`,
      email
    )

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      rateLimit: {
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      }
    })

  } catch (error) {
    console.error('API Security Example Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Simulate authentication (replace with real auth logic)
 */
async function simulateAuth(email: string, password: string): Promise<boolean> {
  // This is just a simulation - replace with real authentication
  return email === 'demo@example.com' && password === 'securepassword123'
}

/**
 * GET endpoint to retrieve security status
 */
export async function GET(request: NextRequest) {
  const validation = await APISecurityMiddleware.validateRequest(request)
  
  if (!validation.isValid) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  // Return security status for this IP
  const logs = SecurityAudit.getLogsByIP(validation.context.ip, 10)
  
  return NextResponse.json({
    ip: validation.context.ip,
    recentLogs: logs,
    timestamp: new Date().toISOString()
  })
}