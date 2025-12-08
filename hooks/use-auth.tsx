"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { AuthService, type AuthState } from "@/lib/auth"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Timeout for auth initialization to prevent endless loading
const AUTH_INIT_TIMEOUT = 5000 // 5 seconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const initializingRef = useRef(false)

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initializingRef.current) return
    initializingRef.current = true

    // Set a timeout to prevent endless loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('[Auth] Initialization timeout - setting loading to false')
        setLoading(false)
      }
    }, AUTH_INIT_TIMEOUT)

    // Get initial session
    const getInitialSession = async () => {
      try {
        // If Supabase is not configured, skip and show auth form
        if (!isSupabaseConfigured) {
          console.warn('[Auth] Supabase not configured, skipping session check')
          setLoading(false)
          return
        }

        const { session, error } = await AuthService.getCurrentSession()
        if (error) {
          console.error('[Auth] Error getting session:', error)
        }
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('[Auth] Failed to get initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes (only if Supabase is configured)
    let subscription: { unsubscribe: () => void } | null = null
    
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle different auth events
        if (event === "SIGNED_IN") {
          // User signed in
        } else if (event === "SIGNED_OUT") {
          // Clear any cached data
          if (typeof window !== 'undefined') {
            localStorage.removeItem("savedResumes")
          }
        } else if (event === "TOKEN_REFRESHED") {
          // Token refreshed
        }
      })
      subscription = data.subscription
    }

    return () => {
      clearTimeout(timeoutId)
      subscription?.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    const result = await AuthService.signUp(email, password, fullName)
    setLoading(false)
    return { error: result.error }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const result = await AuthService.signIn(email, password)
    setLoading(false)
    return { error: result.error }
  }

  const signOut = async () => {
    setLoading(true)
    const result = await AuthService.signOut()
    setLoading(false)
    return { error: result.error }
  }

  const resetPassword = async (email: string) => {
    const result = await AuthService.resetPassword(email)
    return { error: result.error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isConfigured: isSupabaseConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
