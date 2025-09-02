import { UserPreferences } from '@/lib/profile-service'

export function formatDate(date: Date | string, preferences?: UserPreferences | null): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Validate the date object
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDate:', date)
    return 'Invalid Date'
  }
  
  if (!preferences) {
    return dateObj.toLocaleDateString()
  }

  const { date_format, language, timezone } = preferences

  try {
    const locale = getLocaleFromLanguage(language)
    
    // Validate and normalize timezone
    const validTimezone = normalizeTimezone(timezone)
    
    // Create options based on date format preference
    let options: Intl.DateTimeFormatOptions = {
      timeZone: validTimezone,
    }

    switch (date_format) {
      case 'MM/DD/YYYY':
        options = { ...options, month: '2-digit', day: '2-digit', year: 'numeric' }
        break
      case 'DD/MM/YYYY':
        options = { ...options, day: '2-digit', month: '2-digit', year: 'numeric' }
        break
      case 'YYYY-MM-DD':
        // Format as YYYY-MM-DD in the user's timezone
        const ymdOptions: Intl.DateTimeFormatOptions = {
          timeZone: validTimezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }
        const parts = new Intl.DateTimeFormat(locale, ymdOptions).formatToParts(dateObj)
        const year = parts.find(p => p.type === 'year')?.value || '0000'
        const month = parts.find(p => p.type === 'month')?.value || '00'
        const day = parts.find(p => p.type === 'day')?.value || '00'
        return `${year}-${month}-${day}`
      default:
        options = { ...options, dateStyle: 'medium' }
    }

    return new Intl.DateTimeFormat(locale, options).format(dateObj)
  } catch (error) {
    console.warn('Error formatting date with preferences:', error)
    return dateObj.toLocaleDateString()
  }
}

export function formatCurrency(amount: number, preferences?: UserPreferences | null): string {
  if (!preferences) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const { currency, language } = preferences
  const locale = getLocaleFromLanguage(language)

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  } catch (error) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
}

export function formatTime(date: Date | string, preferences?: UserPreferences | null): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!preferences) {
    return dateObj.toLocaleTimeString()
  }

  const { language, timezone } = preferences
  const locale = getLocaleFromLanguage(language)

  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  } catch (error) {
    return dateObj.toLocaleTimeString()
  }
}

export function formatDateTime(date: Date | string, preferences?: UserPreferences | null): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!preferences) {
    return dateObj.toLocaleString()
  }

  const { date_format, language, timezone } = preferences
  const locale = getLocaleFromLanguage(language)

  try {
    let options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit'
    }

    switch (date_format) {
      case 'MM/DD/YYYY':
        options = { ...options, month: '2-digit', day: '2-digit', year: 'numeric' }
        break
      case 'DD/MM/YYYY':
        options = { ...options, day: '2-digit', month: '2-digit', year: 'numeric' }
        break
      case 'YYYY-MM-DD':
        options = { ...options, year: 'numeric', month: '2-digit', day: '2-digit' }
        break
      default:
        options = { ...options, dateStyle: 'medium', timeStyle: 'short' }
    }

    return new Intl.DateTimeFormat(locale, options).format(dateObj)
  } catch (error) {
    return dateObj.toLocaleString()
  }
}

export function formatRelativeTime(date: Date | string, preferences?: UserPreferences | null): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  const locale = preferences ? getLocaleFromLanguage(preferences.language) : 'en-US'

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second')
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
    }
  } catch (error) {
    // Fallback to simple date formatting
    return formatDate(dateObj, preferences)
  }
}

export function getLocaleFromLanguage(language: string): string {
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-PT'
  }
  
  return localeMap[language] || 'en-US'
}

export function getLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'fr': 'Français',
    'es': 'Español',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português'
  }
  
  return languageNames[code] || 'English'
}

export function getTimezoneName(timezone: string): string {
  const timezoneNames: Record<string, string> = {
    'UTC': 'UTC',
    'America/New_York': 'Eastern Time (ET)',
    'America/Chicago': 'Central Time (CT)',
    'America/Denver': 'Mountain Time (MT)',
    'America/Los_Angeles': 'Pacific Time (PT)',
    'Europe/London': 'London (GMT)',
    'Europe/Paris': 'Paris (CET)',
    'Asia/Tokyo': 'Tokyo (JST)',
    'Asia/Shanghai': 'Shanghai (CST)',
    'Australia/Sydney': 'Sydney (AEST)'
  }
  
  return timezoneNames[timezone] || timezone
}

export function isValidTimezone(timezone: string): boolean {
  try {
    // Try to create a DateTimeFormat with the timezone to validate it
    new Intl.DateTimeFormat('en-US', { timeZone: timezone })
    return true
  } catch (error) {
    return false
  }
}

export function normalizeTimezone(timezone?: string): string {
  if (!timezone) return 'UTC'
  
  if (isValidTimezone(timezone)) {
    return timezone
  }
  
  // Common timezone aliases and corrections
  const timezoneAliases: Record<string, string> = {
    'EST': 'America/New_York',
    'CST': 'America/Chicago', 
    'MST': 'America/Denver',
    'PST': 'America/Los_Angeles',
    'GMT': 'Europe/London',
    'CET': 'Europe/Paris',
    'JST': 'Asia/Tokyo'
  }
  
  const normalized = timezoneAliases[timezone.toUpperCase()]
  if (normalized && isValidTimezone(normalized)) {
    return normalized
  }
  
  console.warn(`Invalid timezone "${timezone}", falling back to UTC`)
  return 'UTC'
}
