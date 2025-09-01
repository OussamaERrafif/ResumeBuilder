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
import { ProfileService, UserProfile, NotificationSettings, AICreditsUsage } from "@/lib/profile-service"
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
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null)
  const [creditsUsage, setCreditsUsage] = useState<AICreditsUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  })
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
      const [profileData, notificationData, usage] = await Promise.all([
        ProfileService.getUserProfile(user.id),
        ProfileService.getNotificationSettings(user.id),
        ProfileService.getAICreditsUsage(user.id, 10),
      ])

      if (profileData) {
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name,
          email: profileData.email,
        })
      }
      setNotifications(notificationData)
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return

    const file = event.target.files[0]
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 2MB.",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const avatarUrl = await ProfileService.uploadAvatar(user.id, file)
      if (avatarUrl) {
        const success = await ProfileService.updateUserProfile(user.id, {
          avatar_url: avatarUrl,
        })

        if (success) {
          await loadData()
          toast({
            title: "Success",
            description: "Avatar updated successfully.",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
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
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="text-2xl">
                      {profile.full_name?.split(" ").map(n => n[0]).join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <label htmlFor="avatar-upload">
                      <Button
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                        disabled={uploading}
                      >
                        {uploading ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </Button>
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
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getTierColor(profile.subscription_tier)} text-white`}>
                      {getTierIcon(profile.subscription_tier)}
                      <span className="ml-1 capitalize">{profile.subscription_tier}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={saving} className="mt-4">
                  {saving ? "Saving..." : "Save Changes"}
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
                        {new Date(profile.subscription_expires).toLocaleDateString()}
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
                          {new Date(usage.created_at).toLocaleDateString()}
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
                <h4 className="font-medium">Change Password</h4>
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
                  <Button disabled={saving}>
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm">Secure your account with 2FA</p>
                    <p className="text-xs text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Setup 2FA</Button>
                </div>
              </div>
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

            <div className="bg-card rounded-lg border border-border p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Language</Label>
                  <p className="text-sm text-muted-foreground">Select your preferred language</p>
                </div>
                <select className="border border-border rounded-md px-3 py-1 bg-background text-foreground">
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Timezone</Label>
                  <p className="text-sm text-muted-foreground">Set your local timezone</p>
                </div>
                <select className="border border-border rounded-md px-3 py-1 bg-background text-foreground">
                  <option value="utc">UTC</option>
                  <option value="est">EST</option>
                  <option value="pst">PST</option>
                </select>
              </div>
            </div>
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
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export My Data</span>
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
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
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
