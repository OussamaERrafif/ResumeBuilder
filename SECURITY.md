# Security Features Documentation

This document outlines the comprehensive security features implemented in the ResumeBuilder application.

## Overview

The security system provides multiple layers of protection including:
- Request-level middleware security
- Input validation and sanitization
- Rate limiting and IP blocking
- Session security management
- File upload protection
- CSRF protection
- Security auditing and monitoring

## Core Components

### 1. Security Middleware (`middleware.ts`)

**Location:** `/middleware.ts`

The Next.js middleware provides the first line of defense for all incoming requests.

**Features:**
- IP-based access control and blocking
- Rate limiting (100 requests/15min for web, 50 for API)
- Security header injection
- Content Security Policy (CSP) enforcement
- Request validation and attack pattern detection

**Configuration:**
```typescript
const SECURITY_CONFIG = {
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  maxRequestsPerWindow: 100,
  maxRequestsPerWindowAPI: 50,
  blockedIPs: new Set<string>(),
  trustedIPs: new Set<string>([...])
}
```

### 2. Security Utilities (`lib/security.ts`)

**Location:** `/lib/security.ts`

Core security functions for input sanitization and validation.

**Key Functions:**
- `sanitizeHtml(html)` - Removes XSS patterns from HTML
- `sanitizeText(text)` - Cleans text input
- `sanitizeEmail(email)` - Validates and cleans email addresses
- `sanitizePhone(phone)` - Formats phone numbers securely
- `sanitizeUrl(url)` - Validates URLs and blocks malicious protocols
- `generateSecureToken(length)` - Creates cryptographically secure tokens
- `validateFile(file)` - Validates file uploads

**Security Classes:**
- `CSRFProtection` - Token-based CSRF protection
- `SessionSecurity` - Session validation and hijacking prevention
- `IPSecurity` - IP blocking and suspicious activity tracking
- `SecureValidator` - Advanced input validation
- `SecurityAudit` - Event logging and monitoring

### 3. API Security (`lib/api-security.ts`)

**Location:** `/lib/api-security.ts`

Specialized security middleware for API routes.

**Components:**
- `APISecurityMiddleware` - Request validation for APIs
- `APIRateLimit` - API-specific rate limiting
- `AuthSecurity` - Authentication failure tracking
- `FileUploadSecurity` - Secure file upload handling

**Usage Example:**
```typescript
export async function POST(request: NextRequest) {
  // Validate request security
  const validation = await APISecurityMiddleware.validateRequest(request)
  if (!validation.isValid) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  
  // Check rate limits
  const rateLimit = APIRateLimit.check(validation.context.ip)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  
  // Process request...
}
```

### 4. Security Dashboard (`components/security-dashboard.tsx`)

**Location:** `/components/security-dashboard.tsx`

Real-time security monitoring interface.

**Features:**
- Security event visualization
- Real-time statistics
- Event filtering by severity
- IP tracking and management
- Security alerts and notifications

### 5. Configuration (`lib/config.ts`)

**Enhanced Security Settings:**
```typescript
security: {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt'],
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSymbols: true,
  csrfTokenExpiry: 60 * 60 * 1000, // 1 hour
  maxRequestSize: 5 * 1024 * 1024, // 5MB
  enableCSRF: true,
  enableRateLimit: true,
  enableIPBlocking: true,
  enableSessionValidation: true,
}
```

## Security Headers

The following security headers are automatically applied:

```typescript
{
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
```

## Content Security Policy (CSP)

Default CSP configuration:

```typescript
{
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
```

## Implementation Guide

### 1. Adding Security to New API Routes

```typescript
import { APISecurityMiddleware, APIRateLimit } from '@/lib/api-security'

export async function POST(request: NextRequest) {
  // Step 1: Validate request
  const validation = await APISecurityMiddleware.validateRequest(request)
  if (!validation.isValid) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Step 2: Check rate limits
  const rateLimit = APIRateLimit.check(validation.context.ip)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // Step 3: Validate payload
  const payload = await APISecurityMiddleware.validateJSONPayload(request)
  if (!payload.isValid) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Your API logic here...
}
```

### 2. Using Security Utilities

```typescript
import { sanitizeText, sanitizeEmail, validateFile } from '@/lib/security'

// Sanitize user input
const cleanName = sanitizeText(userInput.name)
const cleanEmail = sanitizeEmail(userInput.email)

// Validate file uploads
const fileValidation = validateFile(uploadedFile)
if (!fileValidation.isValid) {
  throw new Error(fileValidation.errors.join(', '))
}
```

### 3. CSRF Protection

```typescript
import { CSRFProtection } from '@/lib/security'

// Generate token for session
const token = CSRFProtection.generateToken(sessionId)

// Validate token on form submission
const isValid = CSRFProtection.validateToken(sessionId, submittedToken)
```

### 4. Security Monitoring

```typescript
import { SecurityAudit } from '@/lib/security'

// Log security events
SecurityAudit.log(
  'LOGIN_FAILURE',
  clientIP,
  'medium',
  'Failed login attempt',
  userId
)

// Get security logs
const recentLogs = SecurityAudit.getLogs(50)
const ipLogs = SecurityAudit.getLogsByIP(clientIP)
```

## Best Practices

1. **Always validate input** - Use sanitization functions for all user input
2. **Implement rate limiting** - Protect against brute force attacks
3. **Monitor security events** - Use SecurityAudit for logging
4. **File upload security** - Always validate files before processing
5. **Session security** - Validate sessions and check for hijacking
6. **CSRF protection** - Use tokens for state-changing operations
7. **IP blocking** - Block malicious IPs automatically
8. **Security headers** - Ensure all responses include security headers

## Testing

Run the security validation script:

```bash
node tests/security-validation.js
```

This tests:
- Text sanitization
- Email validation
- Phone number cleaning
- URL security
- Token generation
- Rate limiting
- File validation

## Monitoring

Access the security dashboard at `/admin` (Security tab) to monitor:
- Real-time security events
- Failed login attempts
- Rate limit violations
- Blocked IPs
- Security statistics

## Emergency Response

In case of security incidents:

1. **Check security logs** - Use SecurityAudit.getLogs()
2. **Block malicious IPs** - Use IPSecurity.blockIP()
3. **Reset rate limits** - Use APIRateLimit.reset()
4. **Invalidate sessions** - Use SessionSecurity.invalidateSession()
5. **Review attack patterns** - Check middleware logs

## Updates and Maintenance

- Regularly review security logs
- Update blocked IP lists
- Monitor rate limit effectiveness
- Review and update CSP policies
- Test security functions after updates
- Keep dependencies updated for security patches

## Security Checklist

- [ ] All API routes use security middleware
- [ ] Input validation is implemented
- [ ] File uploads are secured
- [ ] Rate limiting is active
- [ ] CSRF protection is enabled
- [ ] Security headers are set
- [ ] Monitoring is configured
- [ ] IP blocking is functional
- [ ] Session security is validated
- [ ] Audit logging is working