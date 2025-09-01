"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Camera,
  User,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Sparkles,
  Crown,
  ArrowLeft,
  Settings,
  LogOut,
  Download,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Mail,
  Smartphone,
  Home,
  MapPin,
  Briefcase,
  Building2,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Phone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { usePreferences } from "@/hooks/use-preferences"
import { ProfileService, UserProfile, NotificationSettings, AICreditsUsage, UserPreferences, SecuritySettings } from "@/lib/profile-service"
import { formatDate, formatCurrency, formatTime } from "@/lib/format-utils"
import ProtectedRoute from "@/components/auth/protected-route"

const sidebarItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing & Credits', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'privacy', label: 'Privacy', icon: Lock },
]

export default function ProfileSettingsPage() {
  const { user, signOut } = useAuth()
  const { preferences, updatePreference } = usePreferences()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null)
  const [security, setSecurity] = useState<SecuritySettings | null>(null)
  const [creditsUsage, setCreditsUsage] = useState<AICreditsUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

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
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [formData, profile])

  // Update form data handler with auto-save
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return

    const file = event.target.files[0]
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      })
      return
    }

    // Validate file type
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
      // Show optimistic update
      const imageUrl = URL.createObjectURL(file)
      setProfile(prev => prev ? { ...prev, avatar_url: imageUrl } : null)

      // Upload to server
      const avatarUrl = await ProfileService.uploadAvatar(user.id, file)
      
      if (avatarUrl) {
        const success = await ProfileService.updateUserProfile(user.id, {
          avatar_url: avatarUrl,
        })

        if (success) {
          // Update with actual server URL
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
      // Revert optimistic update
      await loadData()
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Clear the file input
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

  const handlePasswordChange = async () => {
    if (!user || !passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      })
      return
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      })
      return
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    const success = await ProfileService.changePassword(user.id, passwords.current, passwords.new)
    
    if (success) {
      setPasswords({ current: "", new: "", confirm: "" })
      toast({
        title: "Success",
        description: "Password changed successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive",
      })
    }
    setSaving(false)
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
      // This would typically call an API endpoint to generate and download user data
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

  const handleAccountDeletion = async () => {
    if (!user) return

    // This would typically show a confirmation dialog first
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
    )

    if (!confirmed) return

    try {
      setSaving(true)
      const success = await ProfileService.deleteAccount(user.id)
      
      if (success) {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted.",
        })
        await signOut()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete account. Please contact support.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "premium":
        return "bg-gradient-to-r from-purple-600 to-pink-600"
      case "pro":
        return "bg-gradient-to-r from-blue-600 to-cyan-600"
      default:
        return "bg-gray-500"
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "premium":
        return <Crown className="w-4 h-4" />
      case "pro":
        return <Sparkles className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const renderContent = () => {
    if (loading || !profile) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    }

    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Personal Information</h2>
              <p className="text-muted-foreground">Manage your personal details and account information</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 space-y-6">
              {/* Profile Picture Section */}
              <div className="flex items-start space-x-6">
                <div className="relative group">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="text-3xl">
                      {profile.full_name?.split(" ").map(n => n[0]).join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="text-white text-center">
                        {uploading ? (
                          <div className="w-8 h-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto" />
                        ) : (
                          <>
                            <Camera className="w-8 h-8 mx-auto mb-2" />
                            <span className="text-sm">Change Photo</span>
                          </>
                        )}
                      </div>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getTierColor(profile.subscription_tier)} text-white`}>
                      {getTierIcon(profile.subscription_tier)}
                      <span className="ml-1 capitalize">{profile.subscription_tier}</span>
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      {profile.ai_credits} AI Credits
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(profile.created_at, preferences)}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <p>• Upload images up to 2MB</p>
                    <p>• Supported formats: JPG, PNG, GIF, WebP</p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Basic Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => updateFormData({ full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateFormData({ location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Professional Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="job_title" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Job Title
                    </Label>
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => updateFormData({ job_title: e.target.value })}
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => updateFormData({ company: e.target.value })}
                      placeholder="e.g., Google Inc."
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateFormData({ bio: e.target.value.slice(0, 500) })}
                    placeholder="Tell us about yourself..."
                    className="w-full h-24 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Social Links</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateFormData({ website: e.target.value })}
                      placeholder="https://your-website.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => updateFormData({ linkedin: e.target.value })}
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github" className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      value={formData.github}
                      onChange={(e) => updateFormData({ github: e.target.value })}
                      placeholder="github.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      value={formData.twitter}
                      onChange={(e) => updateFormData({ twitter: e.target.value })}
                      placeholder="twitter.com/username"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="border-t border-border pt-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">
                    Changes are saved automatically as you type
                  </div>
                  {isAutoSaving && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <div className="w-3 h-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span>Saving...</span>
                    </div>
                  )}
                </div>
                <Button onClick={handleSaveProfile} disabled={saving || isAutoSaving} variant="outline">
                  {saving ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Now"
                  )}
                </Button>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Account Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">-</div>
                  <div className="text-sm text-muted-foreground">Total Resumes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">-</div>
                  <div className="text-sm text-muted-foreground">Cover Letters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{profile.ai_credits}</div>
                  <div className="text-sm text-muted-foreground">AI Credits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {creditsUsage.reduce((sum, usage) => sum + usage.credits_used, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Credits Used</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Notification Settings</h2>
              <p className="text-muted-foreground">Manage how and when you receive notifications</p>
            </div>

            {notifications && (
              <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications about your account</p>
                  </div>
                  <Switch
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => handleNotificationUpdate("email_notifications", checked)}
                  />
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and updates</p>
                  </div>
                  <Switch
                    checked={notifications.marketing_emails}
                    onCheckedChange={(checked) => handleNotificationUpdate("marketing_emails", checked)}
                  />
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Feature Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new features and improvements</p>
                  </div>
                  <Switch
                    checked={notifications.feature_updates}
                    onCheckedChange={(checked) => handleNotificationUpdate("feature_updates", checked)}
                  />
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Important security notifications (recommended)</p>
                  </div>
                  <Switch
                    checked={notifications.security_alerts}
                    onCheckedChange={(checked) => handleNotificationUpdate("security_alerts", checked)}
                  />
                </div>
              </div>
            )}
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Billing & Credits</h2>
              <p className="text-muted-foreground">Manage your subscription and AI credits</p>
            </div>

            {/* Subscription Status */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Current Plan</h3>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getTierIcon(profile.subscription_tier)}
                  <div>
                    <p className="font-medium capitalize text-foreground">{profile.subscription_tier} Plan</p>
                    {profile.subscription_expires && (
                      <p className="text-sm text-muted-foreground">
                        {profile.subscription_tier !== "free" ? "Expires" : "Upgraded"} on{" "}
                        {formatDate(profile.subscription_expires, preferences)}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className={`${getTierColor(profile.subscription_tier)} text-white`}>
                  Active
                </Badge>
              </div>
              <div className="flex gap-4 mt-4">
                <Button>Upgrade Plan</Button>
                <Button variant="outline">Billing History</Button>
              </div>
            </div>

            {/* AI Credits */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5" />
                AI Credits
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-foreground">{profile.ai_credits}</span>
                  <span className="text-muted-foreground">credits remaining</span>
                </div>
                <Progress value={(profile.ai_credits / 100) * 100} className="h-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Resume Analysis:</span>
                    <span>2 credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content Generation:</span>
                    <span>3 credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cover Letter:</span>
                    <span>5 credits</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">Buy More Credits</Button>
              </div>
            </div>

            {/* Usage History */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Usage</h3>
              {creditsUsage.length > 0 ? (
                <div className="space-y-3">
                  {creditsUsage.map((usage) => (
                    <div key={usage.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{usage.feature}</p>
                        {usage.description && (
                          <p className="text-sm text-muted-foreground">{usage.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(usage.created_at, preferences)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">-{usage.credits_used} credits</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No AI usage recorded yet.</p>
              )}
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Security Settings</h2>
              <p className="text-muted-foreground">Keep your account secure</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Change Password</h4>
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button disabled={saving} onClick={handlePasswordChange}>
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>

              {security && (
                <>
                  <div className="border-t border-border pt-6 space-y-4">
                    <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-foreground">Secure your account with 2FA</p>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={security.two_factor_enabled}
                          onCheckedChange={handle2FAToggle}
                        />
                        <span className="text-sm text-muted-foreground">
                          {security.two_factor_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 space-y-4">
                    <h4 className="font-medium text-foreground">Password Security</h4>
                    <div className="text-sm text-muted-foreground">
                      {security.last_password_change ? (
                        <p>
                          Last changed: {formatDate(security.last_password_change, preferences)}
                        </p>
                      ) : (
                        <p>Password has not been changed recently</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 space-y-4">
                    <h4 className="font-medium text-foreground">Active Sessions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">Current Session</p>
                          <p className="text-sm text-muted-foreground">
                            {navigator.platform} • {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                             navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser'} • 
                            {formatDate(new Date(), preferences)}
                          </p>
                        </div>
                        <Badge variant="secondary">Current</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Sign Out All Other Sessions
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Preferences</h2>
              <p className="text-muted-foreground">Customize your experience</p>
            </div>

            {preferences && (
              <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground">Select your preferred language</p>
                  </div>
                  <select 
                    className="border border-border rounded-md px-3 py-1 bg-background text-foreground"
                    value={preferences.language}
                    onChange={(e) => handlePreferenceUpdate('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="pt">Português</option>
                  </select>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Date Format</Label>
                    <p className="text-sm text-muted-foreground">Choose how dates are displayed</p>
                    <p className="text-xs text-muted-foreground">
                      Preview: {formatDate(new Date(), preferences)}
                    </p>
                  </div>
                  <select 
                    className="border border-border rounded-md px-3 py-1 bg-background text-foreground"
                    value={preferences.date_format}
                    onChange={(e) => handlePreferenceUpdate('date_format', e.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (UK)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Currency</Label>
                    <p className="text-sm text-muted-foreground">Default currency for billing</p>
                    <p className="text-xs text-muted-foreground">
                      Preview: {formatCurrency(99.99, preferences)}
                    </p>
                  </div>
                  <select 
                    className="border border-border rounded-md px-3 py-1 bg-background text-foreground"
                    value={preferences.currency}
                    onChange={(e) => handlePreferenceUpdate('currency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Timezone</Label>
                    <p className="text-sm text-muted-foreground">Set your local timezone</p>
                    <p className="text-xs text-muted-foreground">
                      Current time: {formatTime(new Date(), preferences)}
                    </p>
                  </div>
                  <select 
                    className="border border-border rounded-md px-3 py-1 bg-background text-foreground"
                    value={preferences.timezone}
                    onChange={(e) => handlePreferenceUpdate('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Australia/Sydney">Sydney (AEST)</option>
                  </select>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <select 
                    className="border border-border rounded-md px-3 py-1 bg-background text-foreground"
                    value={preferences.theme}
                    onChange={(e) => handlePreferenceUpdate('theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Privacy & Data</h2>
              <p className="text-muted-foreground">Control your data and privacy</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Data Export</h4>
                <p className="text-sm text-muted-foreground">
                  Download a copy of your data including resumes, cover letters, and account information.
                </p>
                <Button variant="outline" className="flex items-center space-x-2" onClick={handleDataExport} disabled={saving}>
                  <Download className="w-4 h-4" />
                  <span>{saving ? "Requesting..." : "Export My Data"}</span>
                </Button>
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-medium text-red-600">Danger Zone</h4>
                <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-800">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-medium text-red-600">Delete Account</h5>
                      <p className="text-sm text-red-600/80 mb-3">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button variant="destructive" size="sm" onClick={handleAccountDeletion} disabled={saving}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        {saving ? "Deleting..." : "Delete Account"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
                    <p className="text-muted-foreground text-sm">Manage your profile and preferences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 w-full">
              <div className="bg-card rounded-lg border border-border p-4">
                <nav className="space-y-1">
                  {/* Mobile: Show as horizontal scroll */}
                  <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible space-x-2 lg:space-x-0 lg:space-y-1 pb-2 lg:pb-0">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors whitespace-nowrap ${
                            activeSection === item.id
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
