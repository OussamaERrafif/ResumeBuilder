"use client"

import React, { useState } from "react"
import { Camera, User, Mail, Phone, MapPin, Briefcase, Building2, ExternalLink, Github, Linkedin, Twitter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { UserProfile } from "@/lib/profile-service"
import { formatDate } from "@/lib/format-utils"
import { UserPreferences } from "@/lib/profile-service"

interface ProfileFormProps {
  profile: UserProfile
  formData: any
  updateFormData: (data: any) => void
  onSave: () => void
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  loading: boolean
  uploading: boolean
  isAutoSaving: boolean
  preferences?: UserPreferences
}

export function ProfileForm({
  profile,
  formData,
  updateFormData,
  onSave,
  onAvatarUpload,
  loading,
  uploading,
  isAutoSaving,
  preferences
}: ProfileFormProps) {
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "premium": return "bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white"
      case "pro": return "bg-gradient-to-r from-blue-600 to-cyan-600 border-none text-white"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar Section */}
        <Card className="w-full md:w-auto shrink-0 overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200"></div>
              <Avatar className="w-32 h-32 relative border-4 border-background shadow-xl">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} className="object-cover" />
                <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                  {profile.full_name?.split(" ").map(n => n[0]).join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full cursor-pointer backdrop-blur-[2px]"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Change</span>
                  </div>
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarUpload}
                disabled={uploading}
              />
            </div>
            
            <div className="text-center space-y-2">
              <Badge className={getTierColor(profile.subscription_tier)}>
                {profile.subscription_tier} Plan
              </Badge>
              <p className="text-xs text-muted-foreground">
                Member since {formatDate(profile.created_at, preferences)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Header Info */}
        <div className="flex-1 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{profile.full_name || 'Your Profile'}</h2>
          <p className="text-muted-foreground max-w-2xl">
            Manage your personal information and how it appears on your resumes and public profile.
          </p>
          <div className="flex items-center gap-2 pt-2">
            {isAutoSaving && (
              <span className="text-xs text-primary flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving changes...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card className="md:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>Your contact details and location.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateFormData({ full_name: e.target.value })}
                  className="pl-9"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => updateFormData({ email: e.target.value })}
                  className="pl-9"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData({ phone: e.target.value })}
                  className="pl-9"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData({ location: e.target.value })}
                  className="pl-9"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card className="md:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="w-5 h-5 text-primary" />
              Professional Details
            </CardTitle>
            <CardDescription>Your current role and professional summary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => updateFormData({ job_title: e.target.value })}
                    className="pl-9"
                    placeholder="Software Engineer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => updateFormData({ company: e.target.value })}
                    className="pl-9"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateFormData({ bio: e.target.value.slice(0, 500) })}
                className="min-h-[100px] resize-none"
                placeholder="Briefly describe your professional background and goals..."
              />
              <p className="text-xs text-right text-muted-foreground">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="md:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ExternalLink className="w-5 h-5 text-primary" />
              Social Presence
            </CardTitle>
            <CardDescription>Links to your professional profiles and website.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Personal Website</Label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => updateFormData({ website: e.target.value })}
                  className="pl-9"
                  placeholder="https://your-website.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => updateFormData({ linkedin: e.target.value })}
                  className="pl-9"
                  placeholder="linkedin.com/in/username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <div className="relative">
                <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="github"
                  value={formData.github}
                  onChange={(e) => updateFormData({ github: e.target.value })}
                  className="pl-9"
                  placeholder="github.com/username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => updateFormData({ twitter: e.target.value })}
                  className="pl-9"
                  placeholder="twitter.com/username"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onSave} disabled={loading || isAutoSaving} className="w-full sm:w-auto min-w-[120px]">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}
