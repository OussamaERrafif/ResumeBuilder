"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/hooks/use-profile"
import { Loader2 } from "lucide-react"
import AuthForm from "./auth-form"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const router = useRouter()
  const pathname = usePathname()

  // Only consider profile loading if user is authenticated
  const loading = authLoading || (!!user && profileLoading)

  useEffect(() => {
    if (!loading && user && profile) {
      if (!profile.is_onboarded && pathname !== "/onboarding") {
        router.replace("/onboarding")
      } else if (profile.is_onboarded && pathname === "/onboarding") {
        router.replace("/dashboard")
      }
    }
  }, [loading, user, profile, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  // Prevent flash of content before redirect
  if (user && profile && !profile.is_onboarded && pathname !== "/onboarding") {
    return null
  }

  if (user && profile && profile.is_onboarded && pathname === "/onboarding") {
    return null
  }

  return <>{children}</>
}
