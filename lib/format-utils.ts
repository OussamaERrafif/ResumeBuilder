import { UserPreferences } from '@/lib/profile-service'

export function formatDate(date: Date | string, preferences?: UserPreferences | null): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!preferences) {
    return dateObj.toLocaleDateString()
  }

  const { date_format, language, timezone } = preferences

  try {
    const locale = getLocaleFromLanguage(language)
    
    // Create options based on date format preference
    let options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
    }

    switch (date_format) {
      case 'MM/DD/YYYY':
        options = { ...options, month: '2-digit', day: '2-digit', year: 'numeric' }
        break
      case 'DD/MM/YYYY':
        options = { ...options, day: '2-digit', month: '2-digit', year: 'numeric' }
        break
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0] // Simple ISO format
      default:
        options = { ...options, dateStyle: 'medium' }
    }

    return new Intl.DateTimeFormat(locale, options).format(dateObj)
  } catch (error) {
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
