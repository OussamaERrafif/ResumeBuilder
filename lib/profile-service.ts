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
  is_onboarded?: boolean
  referral_source?: string
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
  /**
   * Retrieves a user's profile information from the database.
   * 
   * @param userId - The unique identifier for the user
   * @returns Promise<UserProfile | null> - The user's profile data or null if not found
   */
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

  /**
   * Updates a user's profile with the provided information.
   * 
   * @param userId - The unique identifier for the user
   * @param updates - Partial user profile object containing fields to update
   * @returns Promise<boolean> - True if update was successful, false otherwise
   */
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

  /**
   * Retrieves notification settings for a user, creating defaults if none exist.
   * 
   * @param userId - The unique identifier for the user
   * @returns Promise<NotificationSettings | null> - The user's notification preferences or null if error
   */
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

  /**
   * Creates default notification settings for a new user.
   * 
   * @param userId - The unique identifier for the user
   * @returns Promise<NotificationSettings | null> - The created notification settings or null if error
   */
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

  /**
   * Updates a user's notification preferences.
   * 
   * @param userId - The unique identifier for the user
   * @param updates - Partial notification settings object containing fields to update
   * @returns Promise<boolean> - True if update was successful, false otherwise
   */
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

  /**
   * Retrieves the AI credits usage history for a user.
   * 
   * @param userId - The unique identifier for the user
   * @param limit - Maximum number of records to return (default: 20)
   * @returns Promise<AICreditsUsage[]> - Array of AI credits usage records
   */
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

  /**
   * Updates a user's AI credits balance.
   * 
   * @param userId - The unique identifier for the user
   * @param credits - The new credits balance to set
   * @returns Promise<boolean> - True if update was successful, false otherwise
   */
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

  /**
   * Records AI feature usage and deducts credits from user's balance.
   * 
   * @param userId - The unique identifier for the user
   * @param feature - Name of the AI feature used (e.g., "resume_analysis", "cover_letter_generation")
   * @param creditsUsed - Number of credits consumed by this usage
   * @param description - Optional detailed description of the usage
   * @returns Promise<boolean> - True if recording was successful, false otherwise
   */
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

  /**
   * Uploads and sets a new avatar image for a user.
   * Validates file type and size, cleans up old files, and returns the public URL.
   * 
   * @param userId - The unique identifier for the user
   * @param file - The image file to upload (JPEG, PNG, GIF, WebP supported, max 5MB)
   * @returns Promise<string | null> - The public URL of the uploaded avatar or null if failed
   */
  static async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        console.error('Invalid file type for avatar:', file.type)
        return null
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        console.error('Avatar file size too large:', file.size)
        return null
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!fileExt) {
        console.error('Could not determine file extension')
        return null
      }

      const fileName = `${userId}/avatar.${fileExt}`
      
      // Clean up existing avatar files efficiently
      await this.cleanupUserStorageFiles(userId, 'avatars', 'avatar.')
      
      // Upload the new avatar
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

      // Get the public URL
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
      console.log('Starting account deletion process for user:', userId)

      // Step 1: Delete user's uploaded files from storage
      try {
        // Clean up all files in the user's storage folder
        await this.cleanupUserStorageFiles(userId, 'avatars')
        
        // Add cleanup for other storage buckets if they exist
        // await this.cleanupUserStorageFiles(userId, 'resumes')
        // await this.cleanupUserStorageFiles(userId, 'documents')
      } catch (storageError) {
        console.warn('Error deleting storage files:', storageError)
        // Continue with deletion even if storage cleanup fails
      }

      // Step 2: Delete related data in the correct order (respecting foreign keys)
      
      // Delete AI credits usage history
      const { error: creditsError } = await supabase
        .from('ai_credits_usage')
        .delete()
        .eq('user_id', userId)

      if (creditsError) {
        console.warn('Error deleting AI credits usage:', creditsError)
      }

      // Delete cover letters
      const { error: coverLettersError } = await supabase
        .from('cover_letters')
        .delete()
        .eq('user_id', userId)

      if (coverLettersError) {
        console.warn('Error deleting cover letters:', coverLettersError)
      }

      // Delete resumes
      const { error: resumesError } = await supabase
        .from('resumes')
        .delete()
        .eq('user_id', userId)

      if (resumesError) {
        console.warn('Error deleting resumes:', resumesError)
      }

      // Delete notification settings
      const { error: notificationsError } = await supabase
        .from('notification_settings')
        .delete()
        .eq('user_id', userId)

      if (notificationsError) {
        console.warn('Error deleting notification settings:', notificationsError)
      }

      // Delete user preferences
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId)

      if (preferencesError) {
        console.warn('Error deleting user preferences:', preferencesError)
      }

      // Delete security settings
      const { error: securityError } = await supabase
        .from('security_settings')
        .delete()
        .eq('user_id', userId)

      if (securityError) {
        console.warn('Error deleting security settings:', securityError)
      }

      // Step 3: Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId)

      if (profileError) {
        console.error('Error deleting user profile:', profileError)
        return false
      }

      // Step 4: Attempt to delete the user from Supabase Auth
      // Note: This calls our secure API endpoint with proper authentication
      try {
        // Get the current session to pass authentication token
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.access_token) {
          const response = await fetch('/api/auth/delete-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ userId })
          })

          if (response.ok) {
            console.log('Successfully deleted auth user via API')
          } else {
            const errorData = await response.json()
            console.warn('Auth user deletion via API failed:', errorData.error)
          }
        } else {
          console.warn('No session token available for auth user deletion')
        }

        // Always sign out the user regardless of auth deletion success
        await supabase.auth.signOut()
      } catch (authError) {
        console.warn('Auth user deletion failed:', authError)
        // Still try to sign out
        try {
          await supabase.auth.signOut()
        } catch (signOutError) {
          console.warn('Sign out also failed:', signOutError)
        }
      }

      console.log('Account deletion completed successfully')
      return true
    } catch (error) {
      console.error('Error during account deletion:', error)
      return false
    }
  }

  // User Preferences Methods
  /**
   * Retrieves user preferences, creating defaults if none exist.
   * 
   * @param userId - The unique identifier for the user
   * @returns Promise<UserPreferences | null> - The user's preferences or null if error
   */
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

  /**
   * Creates default user preferences with system-detected settings.
   * 
   * @param userId - The unique identifier for the user
   * @returns Promise<UserPreferences | null> - The created preferences or null if error
   */
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

  /**
   * Updates a user's preferences with the provided values.
   * 
   * @param userId - The unique identifier for the user
   * @param preferences - Partial preferences object containing fields to update
   * @returns Promise<boolean> - True if update was successful, false otherwise
   */
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
  /**
   * Retrieves security settings for a user, creating defaults if none exist.
   * 
   * @param userId - The unique identifier for the user
   * @returns Promise<SecuritySettings | null> - The user's security settings or null if error
   */
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

  /**
   * Creates default security settings for a new user.
   * 
   * @param userId - The unique identifier for the user
   * @returns Promise<SecuritySettings | null> - The created security settings or null if error
   */
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

  /**
   * Updates a user's security settings.
   * 
   * @param userId - The unique identifier for the user
   * @param settings - Partial security settings object containing fields to update
   * @returns Promise<boolean> - True if update was successful, false otherwise
   */
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

  /**
   * Verifies a user's current password without making any changes.
   * 
   * Security Features:
   * - Uses temporary client to avoid affecting current session
   * - Validates user identity through session verification
   * - No side effects - purely verification
   * - Proper cleanup of temporary authentication
   * 
   * @param userId - The user's unique identifier
   * @param password - The password to verify
   * @returns Promise<{ valid: boolean; error?: string }> - Verification result
   */
  static async verifyCurrentPassword(userId: string, password: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // Validate input parameters
      if (!userId || !password) {
        return { valid: false, error: 'Missing required parameters' }
      }

      // First, get the user's current session to verify identity
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Error getting current user:', userError)
        return { valid: false, error: 'Authentication required' }
      }

      // Verify the user ID matches
      if (user.id !== userId) {
        console.error('User ID mismatch during password verification')
        return { valid: false, error: 'User verification failed' }
      }

      // Verify password using a temporary client to avoid affecting current session
      const { createClient } = await import('@supabase/supabase-js')
      const tempSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Attempt to sign in with the provided password
      const { error: signInError } = await tempSupabase.auth.signInWithPassword({
        email: user.email!,
        password: password
      })

      if (signInError) {
        console.log('Password verification failed for user:', userId)
        return { valid: false, error: 'Password is incorrect' }
      }

      // Clean up the temporary session
      await tempSupabase.auth.signOut()

      return { valid: true }
    } catch (error) {
      console.error('Error during password verification:', error)
      return { valid: false, error: 'Verification failed due to system error' }
    }
  }

  /**
   * Securely changes a user's password with proper authentication verification.
   * 
   * Security Features:
   * - Verifies current password before allowing changes
   * - Validates user identity through session
   * - Enforces minimum password strength requirements
   * - Updates password change timestamp for audit trail
   * 
   * @param userId - The user's unique identifier
   * @param currentPassword - The user's current password for verification
   * @param newPassword - The new password to set
   * @returns Object with success status and optional error message
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input parameters
      if (!userId || !currentPassword || !newPassword) {
        return { success: false, error: 'Missing required parameters' }
      }

      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword)
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error }
      }

      // Verify current password using dedicated verification method
      const passwordVerification = await this.verifyCurrentPassword(userId, currentPassword)
      if (!passwordVerification.valid) {
        return { success: false, error: passwordVerification.error || 'Current password is incorrect' }
      }

      // Current password verified, now update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Error changing password:', error)
        return { success: false, error: 'Failed to update password' }
      }

      // Update last password change timestamp
      const timestampUpdated = await this.updateSecuritySettings(userId, {
        last_password_change: new Date().toISOString()
      })

      if (!timestampUpdated) {
        console.warn('Password changed but failed to update timestamp')
      }

      return { success: true }
    } catch (error) {
      console.error('Error changing password:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Alternative method using session-based reauthentication for password changes.
   * This method requires the user to have been recently authenticated (within 5 minutes).
   * 
   * Use this method when:
   * - The user has just logged in or been reauthenticated
   * - You want to avoid prompting for the current password again
   * - The session is fresh and secure
   * 
   * Security Features:
   * - Checks session age to ensure recent authentication
   * - Validates user identity through active session
   * - Enforces minimum password strength requirements
   * - Updates password change timestamp for audit trail
   * 
   * @param userId - The user's unique identifier
   * @param newPassword - The new password to set
   * @returns Object with success status and optional error message
   */
  static async changePasswordWithReauth(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input parameters
      if (!userId || !newPassword) {
        return { success: false, error: 'Missing required parameters' }
      }

      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword)
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error }
      }

      // Get current user session
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Error getting current user:', userError)
        return { success: false, error: 'Authentication required' }
      }

      // Verify the user ID matches
      if (user.id !== userId) {
        console.error('User ID mismatch during password change')
        return { success: false, error: 'User verification failed' }
      }

      // Check if session is recent enough (less than 5 minutes old)
      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        console.error('No active session found')
        return { success: false, error: 'No active session found' }
      }

      // Use the refresh token's issued_at time or current time minus expires_in
      const expiresAt = new Date(session.data.session.expires_at!).getTime()
      const expiresIn = session.data.session.expires_in || 3600 // Default 1 hour
      const sessionCreated = expiresAt - (expiresIn * 1000)
      const sessionAge = Date.now() - sessionCreated
      const fiveMinutesInMs = 5 * 60 * 1000

      if (sessionAge > fiveMinutesInMs) {
        console.error('Session too old, reauthentication required')
        return { success: false, error: 'Recent authentication required' }
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Error changing password:', error)
        return { success: false, error: 'Failed to update password' }
      }

      // Update last password change timestamp
      const timestampUpdated = await this.updateSecuritySettings(userId, {
        last_password_change: new Date().toISOString()
      })

      if (!timestampUpdated) {
        console.warn('Password changed but failed to update timestamp')
      }

      return { success: true }
    } catch (error) {
      console.error('Error changing password:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Toggles two-factor authentication on or off for a user.
   * 
   * @param userId - The unique identifier for the user
   * @param enabled - True to enable 2FA, false to disable
   * @returns Promise<boolean> - True if toggle was successful, false otherwise
   */
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

  /**
   * Validates password strength according to security requirements.
   * 
   * @param password - The password to validate
   * @returns Object with validation result and error message if invalid
   */
  private static validatePasswordStrength(password: string): { valid: boolean; error?: string } {
    if (!password || password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters long' }
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      return { valid: false, error: 'Password must contain at least one number' }
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one lowercase letter' }
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one uppercase letter' }
    }

    return { valid: true }
  }

  /**
   * Helper method to efficiently clean up user's storage files
   * 
   * @param userId - The user's unique identifier
   * @param bucketName - The storage bucket name
   * @param filePrefix - Optional prefix to filter files (e.g., 'avatar.')
   * @returns Promise<void>
   */
  private static async cleanupUserStorageFiles(
    userId: string, 
    bucketName: string, 
    filePrefix?: string
  ): Promise<void> {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list(userId, { limit: 100 })

      if (listError) {
        console.error(`Error listing files in ${bucketName}:`, listError)
        return
      }

      if (files && files.length > 0) {
        // Filter files by prefix if provided
        const filesToDelete = files
          .filter(file => !filePrefix || file.name.startsWith(filePrefix))
          .map(file => `${userId}/${file.name}`)

        if (filesToDelete.length > 0) {
          const { error: removeError } = await supabase.storage
            .from(bucketName)
            .remove(filesToDelete)

          if (removeError) {
            console.error(`Error removing files from ${bucketName}:`, removeError)
          } else {
            console.log(`Successfully removed ${filesToDelete.length} files from ${bucketName}`)
          }
        }
      }
    } catch (error) {
      console.error(`Error cleaning up storage files in ${bucketName}:`, error)
    }
  }
}
