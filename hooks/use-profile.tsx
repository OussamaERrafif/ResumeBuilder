"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { UserProfile, ProfileService } from "@/lib/profile-service"
import { useAuth } from "./use-auth"

interface ProfileContextType {
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const profileData = await ProfileService.getUserProfile(user.id)
      setProfile(profileData)
    } catch (error) {
      console.error("Failed to load profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false

    try {
      const success = await ProfileService.updateUserProfile(user.id, updates)
      if (success) {
        await refreshProfile()
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to update profile:", error)
      return false
    }
  }

  useEffect(() => {
    refreshProfile()
  }, [user])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
