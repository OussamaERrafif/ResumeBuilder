"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, User, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { usePreferences } from "@/hooks/use-preferences"
import { useScrollHide } from "@/hooks/use-scroll-hide"
import { ProfileService, UserProfile, NotificationSettings, AICreditsUsage, UserPreferences, SecuritySettings } from "@/lib/profile-service"
import ProtectedRoute from "@/components/auth/protected-route"
import { DeleteAccountModal } from "@/components/ui/delete-account-modal"
import { ChangePasswordModal } from "@/components/ui/change-password-modal"

// Import new profile components
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { ProfileForm } from "@/components/profile/profile-form"
import { NotificationSettings as NotificationSettingsComponent } from "@/components/profile/notification-settings"
import { BillingSettings } from "@/components/profile/billing-settings"
import { SecuritySettings as SecuritySettingsComponent } from "@/components/profile/security-settings"
import { PreferenceSettings } from "@/components/profile/preference-settings"
import { PrivacySettings } from "@/components/profile/privacy-settings"

export default function ProfileSettingsPage() {
  const { user } = useAuth()
  const { preferences, updatePreference } = usePreferences()
  const { toast } = useToast()
  const { isVisible } = useScrollHide({ threshold: 50 })
  const [activeSection, setActiveSection] = useState('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null)
  const [security, setSecurity] = useState<SecuritySettings | null>(null)
  const [creditsUsage, setCreditsUsage] = useState<AICreditsUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    twitter: "",
    job_title: "",
    company: "",
  })
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      const [profileData, notificationData, securityData, usage] = await Promise.all([
        ProfileService.getUserProfile(user.id),
        ProfileService.getNotificationSettings(user.id),
        ProfileService.getSecuritySettings(user.id),
        ProfileService.getAICreditsUsage(user.id, 10),
      ])

      if (profileData) {
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          location: profileData.location || "",
          website: profileData.website || "",
          linkedin: profileData.linkedin || "",
          github: profileData.github || "",
          twitter: profileData.twitter || "",
          job_title: profileData.job_title || "",
          company: profileData.company || "",
        })
      }
      setNotifications(notificationData)
      setSecurity(securityData)
      setCreditsUsage(usage)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !profile) return

    setSaving(true)
    try {
      const success = await ProfileService.updateUserProfile(user.id, {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        job_title: formData.job_title,
        company: formData.company,
      })

      if (success) {
        await loadData()
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Auto-save function with debouncing
  const autoSaveProfile = async () => {
    if (!user || !profile || isAutoSaving) return

    setIsAutoSaving(true)
    try {
      await ProfileService.updateUserProfile(user.id, {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        job_title: formData.job_title,
        company: formData.company,
      })
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }

  // Debounced auto-save when form data changes
  useEffect(() => {
    if (!profile) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveProfile()
    }, 2000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [formData, profile])

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return

    const file = event.target.files[0]

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      })
      return
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or WebP image.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const imageUrl = URL.createObjectURL(file)
      setProfile(prev => prev ? { ...prev, avatar_url: imageUrl } : null)

      const avatarUrl = await ProfileService.uploadAvatar(user.id, file)

      if (avatarUrl) {
        const success = await ProfileService.updateUserProfile(user.id, {
          avatar_url: avatarUrl,
        })

        if (success) {
          setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null)
          toast({
            title: "Success",
            description: "Profile picture updated successfully!",
          })
        } else {
          throw new Error("Failed to update profile")
        }
      } else {
        throw new Error("Failed to upload image")
      }
    } catch (error) {
      await loadData()
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleNotificationUpdate = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user || !notifications) return

    const updatedNotifications = { ...notifications, [key]: value }
    setNotifications(updatedNotifications)

    try {
      const success = await ProfileService.updateNotificationSettings(user.id, { [key]: value })
      if (!success) {
        setNotifications(notifications)
        toast({
          title: "Error",
          description: "Failed to update notification settings.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setNotifications(notifications)
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      })
    }
  }

  const handlePreferenceUpdate = async (key: keyof UserPreferences, value: string) => {
    if (!user) return

    try {
      await updatePreference(key, value)
      toast({
        title: "Success",
        description: "Preference updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preference.",
        variant: "destructive",
      })
    }
  }

  const handlePasswordChangeModal = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (!user) return

    setSaving(true)
    try {
      const result = await ProfileService.changePassword(user.id, currentPassword, newPassword)

      if (result.success) {
        setPasswordModalOpen(false)
        toast({
          title: "Success",
          description: "Password changed successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to change password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while changing password.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handle2FAToggle = async (enabled: boolean) => {
    if (!user) return

    const success = await ProfileService.toggle2FA(user.id, enabled)
    if (success) {
      setSecurity(prev => prev ? { ...prev, two_factor_enabled: enabled } : null)
      toast({
        title: "Success",
        description: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update two-factor authentication.",
        variant: "destructive",
      })
    }
  }

  const handleDataExport = async () => {
    if (!user) return

    try {
      setSaving(true)
      toast({
        title: "Export Requested",
        description: "Your data export will be emailed to you within 24 hours.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request data export.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAccountDeletion = async (password: string) => {
    if (!user) return

    try {
      setSaving(true)

      const passwordVerification = await ProfileService.changePassword(user.id, password, password)

      if (!passwordVerification.success) {
        toast({
          title: "Error",
          description: passwordVerification.error || "Invalid password provided.",
          variant: "destructive",
        })
        return
      }

      const success = await ProfileService.deleteAccount(user.id)

      if (success) {
        toast({
          title: "Account Deleted",
          description: "Your account and all associated data have been permanently deleted.",
        })
        setTimeout(() => {
          window.location.href = '/landing'
        }, 2000)
      } else {
        toast({
          title: "Error",
          description: "Failed to delete account. Some data may remain. Please contact support.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Account deletion error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred during account deletion. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
      setDeleteModalOpen(false)
    }
  }

  const renderContent = () => {
    if (loading || !profile) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
          <div className="w-16 h-16 bg-muted rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded mb-2"></div>
          <div className="h-3 w-48 bg-muted rounded"></div>
        </div>
      )
    }

    switch (activeSection) {
      case 'profile':
        return profile && preferences ? (
          <ProfileForm
            profile={profile}
            formData={formData}
            updateFormData={updateFormData}
            onSave={handleSaveProfile}
            onAvatarUpload={handleAvatarUpload}
            loading={saving}
            uploading={uploading}
            isAutoSaving={isAutoSaving}
            preferences={preferences}
          />
        ) : null
      case 'notifications':
        return notifications ? (
          <NotificationSettingsComponent
            notifications={notifications}
            onUpdate={handleNotificationUpdate}
          />
        ) : null
      case 'billing':
        return profile && preferences ? (
          <BillingSettings
            profile={profile}
            creditsUsage={creditsUsage}
            preferences={preferences}
          />
        ) : null
      case 'security':
        return security && preferences ? (
          <SecuritySettingsComponent
            security={security}
            onPasswordChange={() => setPasswordModalOpen(true)}
            on2FAToggle={handle2FAToggle}
            preferences={preferences}
          />
        ) : null
      case 'preferences':
        return preferences ? (
          <PreferenceSettings
            preferences={preferences}
            onUpdate={handlePreferenceUpdate}
          />
        ) : null
      case 'privacy':
        return (
          <PrivacySettings
            onExport={handleDataExport}
            onDelete={() => setDeleteModalOpen(true)}
            loading={saving}
          />
        )
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background/50">
        {/* Header */}
        <motion.header
          className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300"
          initial={{ y: -100 }}
          animate={{ y: isVisible ? 0 : -100 }}
        >
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted/50">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="hidden md:flex items-center gap-3 pl-4 border-l">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold leading-none">Account Settings</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-8">
                <ProfileSidebar
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                />

                {/* Status Card (Desktop only) */}
                <div className="hidden lg:block p-4 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Profile Status</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[85%] rounded-full" />
                    </div>
                    <p className="text-xs text-muted-foreground">85% completed</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleAccountDeletion}
        userEmail={user?.email}
        isLoading={saving}
      />

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
        onConfirm={handlePasswordChangeModal}
        isLoading={saving}
      />
    </ProtectedRoute>
  )
}
