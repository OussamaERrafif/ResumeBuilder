import { supabase } from "./supabase"

export interface CoverLetter {
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

export interface CoverLetterInsert {
  user_id: string
  name: string
  resume_id?: string | null
  job_title?: string | null
  company_name?: string | null
  job_description?: string | null
  content: string
}

export interface CoverLetterUpdate {
  name?: string
  resume_id?: string | null
  job_title?: string | null
  company_name?: string | null
  job_description?: string | null
  content?: string
  updated_at?: string
}

export class CoverLetterService {
  static async getUserCoverLetters(userId: string): Promise<{ data: CoverLetter[] | null; error: any }> {
    try {
      // First check if the table exists by making a simple query
      const { data, error } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })

      if (error) {
        // If table doesn't exist, return empty array instead of error
        if (error.code === 'PGRST106' || error.message?.includes('does not exist')) {
          console.warn('Cover letters table does not exist yet. Please run the database setup script.')
          return { data: [], error: null }
        }
        throw error
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async createCoverLetter(coverLetter: CoverLetterInsert): Promise<{ data: CoverLetter | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("cover_letters")
        .insert(coverLetter)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async updateCoverLetter(
    id: string, 
    updates: CoverLetterUpdate
  ): Promise<{ data: CoverLetter | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("cover_letters")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async deleteCoverLetter(id: string, userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from("cover_letters")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  static async getCoverLetter(id: string, userId: string): Promise<{ data: CoverLetter | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single()

      if (error) {
        // If table doesn't exist, return null instead of error
        if (error.code === 'PGRST106' || error.message?.includes('does not exist')) {
          console.warn('Cover letters table does not exist yet. Please run the database setup script.')
          return { data: null, error: null }
        }
        throw error
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}
