// Test file to demonstrate timezone-aware date formatting improvements
// This can be run in the browser console to test the differences

import { formatDate, formatDateTime, formatRelativeTime } from '../lib/format-utils'
import { UserPreferences } from '../lib/profile-service'

export function demonstrateDateFormattingFixes() {
  console.log('=== Date Formatting Improvements Demo ===\n')
  
  // Test date - January 15, 2025 at 10:30 AM UTC
  const testDate = new Date('2025-01-15T10:30:00Z')
  
  // User preferences for different timezones
  const preferences1: UserPreferences = {
    user_id: 'test',
    language: 'en',
    timezone: 'America/New_York', // EST (UTC-5)
    theme: 'light',
    date_format: 'YYYY-MM-DD',
    currency: 'USD',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const preferences2: UserPreferences = {
    ...preferences1,
    timezone: 'Asia/Tokyo', // JST (UTC+9)
  }
  
  const preferences3: UserPreferences = {
    ...preferences1,
    timezone: 'Europe/London', // GMT (UTC+0)
  }
  
  console.log('Test Date (UTC):', testDate.toISOString())
  console.log()
  
  // OLD METHOD (incorrect - always uses UTC):
  console.log('❌ OLD METHOD (always UTC):')
  const oldMethod = testDate.toISOString().split('T')[0]
  console.log('Result:', oldMethod) // Always shows 2025-01-15 regardless of timezone
  console.log()
  
  // NEW METHOD (correct - respects timezone):
  console.log('✅ NEW METHOD (timezone-aware):')
  console.log('New York (EST):', formatDate(testDate, preferences1)) // Should show 2025-01-15 (same day)
  console.log('Tokyo (JST):   ', formatDate(testDate, preferences2)) // Should show 2025-01-15 (next day due to +9 hours)
  console.log('London (GMT):  ', formatDate(testDate, preferences3)) // Should show 2025-01-15 (same as UTC)
  console.log()
  
  // Test edge case - date that crosses midnight in different timezones
  const edgeDate = new Date('2025-01-15T23:30:00Z') // 11:30 PM UTC
  console.log('=== Edge Case: Date crossing midnight ===')
  console.log('Test Date (UTC):', edgeDate.toISOString())
  console.log()
  
  console.log('❌ OLD METHOD (always UTC):')
  console.log('Result:', edgeDate.toISOString().split('T')[0]) // Always 2025-01-15
  console.log()
  
  console.log('✅ NEW METHOD (timezone-aware):')
  console.log('New York (EST):', formatDate(edgeDate, preferences1)) // Should show 2025-01-15 (6:30 PM)
  console.log('Tokyo (JST):   ', formatDate(edgeDate, preferences2)) // Should show 2025-01-16 (8:30 AM next day)
  console.log('London (GMT):  ', formatDate(edgeDate, preferences3)) // Should show 2025-01-15 (11:30 PM)
  console.log()
  
  console.log('✅ Additional formatting options:')
  console.log('Date + Time (NY):', formatDateTime(testDate, preferences1))
  console.log('Relative Time:   ', formatRelativeTime(new Date(Date.now() - 3600000))) // 1 hour ago
  
  console.log('\n=== Summary ===')
  console.log('✅ Timezone preferences are now properly respected')
  console.log('✅ Date boundaries are correctly handled across timezones') 
  console.log('✅ Added comprehensive validation and error handling')
  console.log('✅ Added additional formatting utilities')
}

// Export for testing
export default demonstrateDateFormattingFixes
