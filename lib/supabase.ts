import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Types for our database
export interface Database {
  public: {
    Tables: {
      resumes: {
        Row: {
          id: string
          user_id: string
          name: string
          template_id: string
          data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          template_id?: string
          data: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          template_id?: string
          data?: any
          created_at?: string
          updated_at?: string
        }
      }
      cover_letters: {
        Row: {
          id: string
          user_id: string
          name: string
          resume_id: string | null
          job_title: string | null
          company_name: string | null
          job_description: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          resume_id?: string | null
          job_title?: string | null
          company_name?: string | null
          job_description?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          resume_id?: string | null
          job_title?: string | null
          company_name?: string | null
          job_description?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'premium'
          subscription_expires: string | null
          ai_credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'premium'
          subscription_expires?: string | null
          ai_credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'premium'
          subscription_expires?: string | null
          ai_credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          marketing_emails: boolean
          feature_updates: boolean
          security_alerts: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          marketing_emails?: boolean
          feature_updates?: boolean
          security_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          marketing_emails?: boolean
          feature_updates?: boolean
          security_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ai_credits_usage: {
        Row: {
          id: string
          user_id: string
          feature: string
          credits_used: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feature: string
          credits_used: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feature?: string
          credits_used?: number
          description?: string | null
          created_at?: string
        }
      }
    }
  }
}
