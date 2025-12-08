import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if we have valid Supabase credentials
const hasValidCredentials: boolean = Boolean(supabaseUrl && supabaseAnonKey && 
  supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20)

// Create a mock client for when credentials are missing (prevents crashes)
function createMockClient(): SupabaseClient {
  const mockResponse = {
    data: null,
    error: { message: 'Supabase not configured. Please check your environment variables.', status: 500 }
  }
  
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signUp: async () => mockResponse,
      signInWithPassword: async () => mockResponse,
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => mockResponse,
      updateUser: async () => mockResponse,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ data: null, error: mockResponse.error, single: () => mockResponse, eq: () => ({ data: null, error: mockResponse.error, single: () => mockResponse, order: () => ({ data: null, error: mockResponse.error }) }) }),
      insert: () => mockResponse,
      update: () => ({ eq: () => mockResponse }),
      delete: () => ({ eq: () => mockResponse }),
      upsert: () => mockResponse,
    }),
    storage: {
      from: () => ({
        upload: async () => mockResponse,
        download: async () => mockResponse,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: async () => mockResponse,
      }),
    },
  } as unknown as SupabaseClient
}

export const supabase: SupabaseClient = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createMockClient()

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured: boolean = hasValidCredentials

// Log warning in development if not configured
if (typeof window !== 'undefined' && !hasValidCredentials) {
  console.warn('[Supabase] Environment variables not configured. The app will run in demo mode without database connectivity.')
}

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
