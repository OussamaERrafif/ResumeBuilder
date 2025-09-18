/**
 * @fileoverview Basic security feature tests
 * Simple tests to validate security utilities work correctly
 */

import { 
  sanitizeText, 
  sanitizeEmail, 
  sanitizePhone, 
  sanitizeUrl,
  generateSecureToken,
  validateFile,
  ClientRateLimit
} from '../lib/security'

// Test data
const testCases = {
  maliciousText: '<script>alert("xss")</script>Normal text',
  validEmail: 'user@example.com',
  invalidEmail: 'not-an-email',
  validPhone: '+1234567890',
  invalidPhone: 'abc123',
  validUrl: 'https://example.com',
  invalidUrl: 'javascript:alert(1)',
  maliciousFilename: '../../../etc/passwd.txt'
}

/**
 * Run security tests
 */
function runSecurityTests() {
  console.log('🔒 Running Security Feature Tests...\n')
  
  // Test 1: Text Sanitization
  console.log('Test 1: Text Sanitization')
  const sanitizedText = sanitizeText(testCases.maliciousText)
  console.log(`Input: ${testCases.maliciousText}`)
  console.log(`Output: ${sanitizedText}`)
  console.log(`✅ Passed: ${!sanitizedText.includes('<script>')}\n`)
  
  // Test 2: Email Validation
  console.log('Test 2: Email Validation')
  const validEmailResult = sanitizeEmail(testCases.validEmail)
  const invalidEmailResult = sanitizeEmail(testCases.invalidEmail)
  console.log(`Valid email "${testCases.validEmail}": ${validEmailResult}`)
  console.log(`Invalid email "${testCases.invalidEmail}": ${invalidEmailResult}`)
  console.log(`✅ Passed: ${validEmailResult === testCases.validEmail && invalidEmailResult === null}\n`)
  
  // Test 3: Phone Sanitization
  console.log('Test 3: Phone Sanitization')
  const validPhoneResult = sanitizePhone(testCases.validPhone)
  const invalidPhoneResult = sanitizePhone(testCases.invalidPhone)
  console.log(`Valid phone "${testCases.validPhone}": ${validPhoneResult}`)
  console.log(`Invalid phone "${testCases.invalidPhone}": ${invalidPhoneResult}`)
  console.log(`✅ Passed: ${validPhoneResult.length > 0 && invalidPhoneResult === ''}\n`)
  
  // Test 4: URL Sanitization
  console.log('Test 4: URL Sanitization')
  const validUrlResult = sanitizeUrl(testCases.validUrl)
  const invalidUrlResult = sanitizeUrl(testCases.invalidUrl)
  console.log(`Valid URL "${testCases.validUrl}": ${validUrlResult}`)
  console.log(`Invalid URL "${testCases.invalidUrl}": ${invalidUrlResult}`)
  console.log(`✅ Passed: ${validUrlResult === testCases.validUrl && invalidUrlResult === null}\n`)
  
  // Test 5: Token Generation
  console.log('Test 5: Secure Token Generation')
  const token1 = generateSecureToken(32)
  const token2 = generateSecureToken(32)
  console.log(`Token 1: ${token1}`)
  console.log(`Token 2: ${token2}`)
  console.log(`✅ Passed: ${token1 !== token2 && token1.length === 64 && token2.length === 64}\n`)
  
  // Test 6: File Validation
  console.log('Test 6: File Validation')
  // Create a mock file object
  const mockFile = {
    name: 'test.pdf',
    size: 1024 * 1024, // 1MB
    type: 'application/pdf'
  } as File
  
  const fileValidation = validateFile(mockFile)
  console.log(`File validation result:`, fileValidation)
  console.log(`✅ Passed: ${fileValidation.isValid}\n`)
  
  // Test 7: Rate Limiting
  console.log('Test 7: Rate Limiting')
  const rateLimit = new ClientRateLimit(3, 5000) // 3 attempts per 5 seconds
  
  const attempt1 = rateLimit.checkLimit('test-ip')
  const attempt2 = rateLimit.checkLimit('test-ip')
  const attempt3 = rateLimit.checkLimit('test-ip')
  const attempt4 = rateLimit.checkLimit('test-ip') // Should be blocked
  
  console.log(`Attempt 1: ${attempt1.allowed} (remaining: ${attempt1.remaining})`)
  console.log(`Attempt 2: ${attempt2.allowed} (remaining: ${attempt2.remaining})`)
  console.log(`Attempt 3: ${attempt3.allowed} (remaining: ${attempt3.remaining})`)
  console.log(`Attempt 4: ${attempt4.allowed} (remaining: ${attempt4.remaining})`)
  console.log(`✅ Passed: ${attempt1.allowed && attempt2.allowed && attempt3.allowed && !attempt4.allowed}\n`)
  
  console.log('🔒 Security Tests Completed!')
}

// Run tests if executed directly
if (typeof window === 'undefined') {
  runSecurityTests()
}

export { runSecurityTests }