"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ProfileService, UserPreferences } from '@/lib/profile-service'

// Timeout for preferences initialization
const PREFERENCES_INIT_TIMEOUT = 5000

interface PreferencesContextType {
  preferences: UserPreferences | null
  loading: boolean
  updatePreference: (key: keyof UserPreferences, value: string) => Promise<void>
  refreshPreferences: () => Promise<void>
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user, isConfigured } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const initializingRef = useRef(false)

  const loadPreferences = async () => {
    if (!user) {
      setPreferences(null)
      setLoading(false)
      return
    }

    // Skip if Supabase is not configured
    if (!isConfigured) {
      setPreferences(null)
      setLoading(false)
      return
    }

    try {
      const data = await ProfileService.getUserPreferences(user.id)
      setPreferences(data)
      
      // Apply theme immediately
      if (data?.theme) {
        applyTheme(data.theme)
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.setAttribute('data-theme', systemTheme)
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      root.setAttribute('data-theme', theme)
      root.classList.toggle('dark', theme === 'dark')
    }
  }

  const updatePreference = async (key: keyof UserPreferences, value: string) => {
    if (!user || !preferences) return

    // Optimistic update
    const updatedPreferences = { ...preferences, [key]: value } as UserPreferences
    setPreferences(updatedPreferences)

    // Apply theme immediately if theme is being changed
    if (key === 'theme') {
      applyTheme(value as 'light' | 'dark' | 'system')
    }

    // Save to database
    try {
      await ProfileService.updateUserPreferences(user.id, { [key]: value })
    } catch (error) {
      // Revert on error
      setPreferences(preferences)
      if (key === 'theme') {
        applyTheme(preferences.theme)
      }
      throw error
    }
  }

  const refreshPreferences = async () => {
    await loadPreferences()
  }

  // Initialize preferences with timeout protection
  useEffect(() => {
    // Prevent double initialization
    if (initializingRef.current) return
    initializingRef.current = true

    // Set a timeout to prevent endless loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('[Preferences] Initialization timeout - setting loading to false')
        setLoading(false)
      }
    }, PREFERENCES_INIT_TIMEOUT)

    loadPreferences()

    return () => {
      clearTimeout(timeoutId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when user changes (after initial load)
  useEffect(() => {
    if (initializingRef.current) {
      loadPreferences()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (preferences?.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        applyTheme('system')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [preferences?.theme])

  return (
    <PreferencesContext.Provider value={{
      preferences,
      loading,
      updatePreference,
      refreshPreferences
    }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}
