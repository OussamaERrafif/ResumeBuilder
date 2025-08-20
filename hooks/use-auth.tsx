"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AuthService, type AuthState } from "@/lib/auth"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await AuthService.getCurrentSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle different auth events
      if (event === "SIGNED_IN") {
        console.log("User signed in:", session?.user?.email)
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out")
        // Clear any cached data
        localStorage.removeItem("savedResumes")
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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
