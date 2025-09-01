import { supabase } from './supabase'

export interface UserProfile {
  user_id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  linkedin?: string
  github?: string
  twitter?: string
  job_title?: string
  company?: string
  subscription_tier: 'free' | 'pro' | 'premium'
  subscription_expires?: string
  ai_credits: number
  created_at: string
  updated_at: string
}

export interface NotificationSettings {
  user_id: string
  email_notifications: boolean
  marketing_emails: boolean
  feature_updates: boolean
  security_alerts: boolean
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  user_id: string
  language: string
  timezone: string
  theme: 'light' | 'dark' | 'system'
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  currency: string
  created_at: string
  updated_at: string
}

export interface SecuritySettings {
  user_id: string
  two_factor_enabled: boolean
  last_password_change?: string
  login_sessions: LoginSession[]
  created_at: string
  updated_at: string
}

export interface LoginSession {
  id: string
  device: string
  browser: string
  location?: string
  last_active: string
  is_current: boolean
}

export interface AICreditsUsage {
  id: string
  user_id: string
  feature: string
  credits_used: number
  description?: string
  created_at: string
}

export class ProfileService {
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating user profile:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating user profile:', error)
      return false
    }
  }

  static async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No notification settings found, create default ones
          return await this.createDefaultNotificationSettings(userId)
        }
        console.error('Error fetching notification settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      return null
    }
  }

  static async createDefaultNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const defaultSettings = {
        user_id: userId,
        email_notifications: true,
        marketing_emails: false,
        feature_updates: true,
        security_alerts: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('notification_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (error) {
        console.error('Error creating notification settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating notification settings:', error)
      return null
    }
  }

  static async updateNotificationSettings(
    userId: string,
    updates: Partial<NotificationSettings>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating notification settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating notification settings:', error)
      return false
    }
  }

  static async getAICreditsUsage(userId: string, limit = 20): Promise<AICreditsUsage[]> {
    try {
      const { data, error } = await supabase
        .from('ai_credits_usage')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching AI credits usage:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching AI credits usage:', error)
      return []
    }
  }

  static async updateAICredits(userId: string, credits: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ai_credits: credits,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating AI credits:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating AI credits:', error)
      return false
    }
  }

  static async recordCreditUsage(
    userId: string,
    feature: string,
    creditsUsed: number,
    description?: string
  ): Promise<boolean> {
    try {
      // First, get current credits
      const profile = await this.getUserProfile(userId)
      if (!profile) return false

      // Record usage
      const { error: usageError } = await supabase
        .from('ai_credits_usage')
        .insert({
          user_id: userId,
          feature,
          credits_used: creditsUsed,
          description,
          created_at: new Date().toISOString(),
        })

      if (usageError) {
        console.error('Error recording credit usage:', usageError)
        return false
      }

      // Update user's credit balance
      const newBalance = Math.max(0, profile.ai_credits - creditsUsed)
      return await this.updateAICredits(userId, newBalance)
    } catch (error) {
      console.error('Error recording credit usage:', error)
      return false
    }
  }

  static async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar.${fileExt}`
      
      // First, try to delete existing avatar
      await supabase.storage
        .from('avatars')
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.gif`, `${userId}/avatar.webp`, `${userId}/avatar.jpeg`])
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        })

      if (error) {
        console.error('Error uploading avatar:', error)
        return null
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return null
    }
  }

  static async deleteAccount(userId: string): Promise<boolean> {
    try {
      // Delete user profile and related data
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting account:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting account:', error)
      return false
    }
  }

  // User Preferences Methods
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // If no preferences exist, create default ones
        if (error.code === 'PGRST116') {
          return await this.createDefaultPreferences(userId)
        }
        console.error('Error fetching user preferences:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return null
    }
  }

  static async createDefaultPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const defaultPreferences = {
        user_id: userId,
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        theme: 'system' as const,
        date_format: 'MM/DD/YYYY' as const,
        currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .insert(defaultPreferences)
        .select()
        .single()

      if (error) {
        console.error('Error creating default preferences:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating default preferences:', error)
      return null
    }
  }

  static async updateUserPreferences(
    userId: string,
    preferences: Partial<Omit<UserPreferences, 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating user preferences:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return false
    }
  }

  // Security Settings Methods
  static async getSecuritySettings(userId: string): Promise<SecuritySettings | null> {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // If no security settings exist, create default ones
        if (error.code === 'PGRST116') {
          return await this.createDefaultSecuritySettings(userId)
        }
        console.error('Error fetching security settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching security settings:', error)
      return null
    }
  }

  static async createDefaultSecuritySettings(userId: string): Promise<SecuritySettings | null> {
    try {
      const defaultSettings = {
        user_id: userId,
        two_factor_enabled: false,
        login_sessions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('security_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (error) {
        console.error('Error creating default security settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating default security settings:', error)
      return null
    }
  }

  static async updateSecuritySettings(
    userId: string,
    settings: Partial<Omit<SecuritySettings, 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating security settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating security settings:', error)
      return false
    }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Update password via Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Error changing password:', error)
        return false
      }

      // Update last password change timestamp
      await this.updateSecuritySettings(userId, {
        last_password_change: new Date().toISOString()
      })

      return true
    } catch (error) {
      console.error('Error changing password:', error)
      return false
    }
  }

  static async toggle2FA(userId: string, enabled: boolean): Promise<boolean> {
    try {
      return await this.updateSecuritySettings(userId, {
        two_factor_enabled: enabled
      })
    } catch (error) {
      console.error('Error toggling 2FA:', error)
      return false
    }
  }
}
