import { supabase } from './supabase'

export interface UserProfile {
  user_id: string
  email: string
  full_name: string
  avatar_url?: string
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
      const fileName = `${userId}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

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
}
