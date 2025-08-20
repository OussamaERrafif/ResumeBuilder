import { supabase } from "./supabase"
import type { Database } from "./supabase"

type Resume = Database["public"]["Tables"]["resumes"]["Row"]
type ResumeInsert = Database["public"]["Tables"]["resumes"]["Insert"]
type ResumeUpdate = Database["public"]["Tables"]["resumes"]["Update"]

export class ResumeService {
  static async getUserResumes(userId: string): Promise<{ data: Resume[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async createResume(resume: ResumeInsert): Promise<{ data: Resume | null; error: any }> {
    try {
      const { data, error } = await supabase.from("resumes").insert(resume).select().single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async updateResume(id: string, updates: ResumeUpdate): Promise<{ data: Resume | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("resumes")
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

  static async deleteResume(id: string, userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.from("resumes").delete().eq("id", id).eq("user_id", userId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  static async getResume(id: string, userId: string): Promise<{ data: Resume | null; error: any }> {
    try {
      const { data, error } = await supabase.from("resumes").select("*").eq("id", id).eq("user_id", userId).single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}
