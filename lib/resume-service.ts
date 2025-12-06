import { supabase } from "./supabase"
import type { Database } from "./supabase"
import { resumeCache, getResumeCacheKey, invalidateUserCaches } from "./cache"
import { measureAsync, logger } from "./monitoring"

type Resume = Database["public"]["Tables"]["resumes"]["Row"]
type ResumeInsert = Database["public"]["Tables"]["resumes"]["Insert"]
type ResumeUpdate = Database["public"]["Tables"]["resumes"]["Update"]

// Cache TTL constants
const RESUME_LIST_TTL = 5 * 60 * 1000 // 5 minutes
const SINGLE_RESUME_TTL = 10 * 60 * 1000 // 10 minutes

export class ResumeService {
  static async getUserResumes(userId: string): Promise<{ data: Resume[] | null; error: any }> {
    const cacheKey = getResumeCacheKey(userId)
    
    // Check cache first
    const cached = resumeCache.get(cacheKey)
    if (cached) {
      logger.debug('Resume list cache hit', { userId })
      return { data: cached as Resume[], error: null }
    }

    try {
      const result = await measureAsync(
        'db_get_user_resumes',
        async () => {
          return await supabase
            .from("resumes")
            .select("*")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false })
        },
        { userId }
      )

      if (result.error) throw result.error

      // Cache the result
      if (result.data) {
        resumeCache.set(cacheKey, result.data, RESUME_LIST_TTL)
      }

      return { data: result.data, error: null }
    } catch (error) {
      logger.error('Failed to get user resumes', { userId, error })
      return { data: null, error }
    }
  }

  static async createResume(resume: ResumeInsert): Promise<{ data: Resume | null; error: any }> {
    try {
      const result = await measureAsync(
        'db_create_resume',
        async () => {
          return await supabase.from("resumes").insert(resume).select().single()
        },
        { userId: resume.user_id }
      )

      if (result.error) throw result.error

      // Invalidate user's resume list cache
      if (result.data) {
        resumeCache.delete(getResumeCacheKey(resume.user_id))
        logger.info('Resume created', { resumeId: result.data.id, userId: resume.user_id })
      }

      return { data: result.data, error: null }
    } catch (error) {
      logger.error('Failed to create resume', { userId: resume.user_id, error })
      return { data: null, error }
    }
  }

  static async updateResume(id: string, updates: ResumeUpdate): Promise<{ data: Resume | null; error: any }> {
    try {
      const result = await measureAsync(
        'db_update_resume',
        async () => {
          return await supabase
            .from("resumes")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single()
        },
        { resumeId: id }
      )

      if (result.error) throw result.error

      // Invalidate caches
      if (result.data) {
        resumeCache.delete(getResumeCacheKey(result.data.user_id, id))
        resumeCache.delete(getResumeCacheKey(result.data.user_id))
        logger.info('Resume updated', { resumeId: id })
      }

      return { data: result.data, error: null }
    } catch (error) {
      logger.error('Failed to update resume', { resumeId: id, error })
      return { data: null, error }
    }
  }

  static async deleteResume(id: string, userId: string): Promise<{ error: any }> {
    try {
      const { error } = await measureAsync(
        'db_delete_resume',
        async () => {
          return await supabase.from("resumes").delete().eq("id", id).eq("user_id", userId)
        },
        { resumeId: id, userId }
      )

      if (error) throw error

      // Invalidate caches
      resumeCache.delete(getResumeCacheKey(userId, id))
      resumeCache.delete(getResumeCacheKey(userId))
      logger.info('Resume deleted', { resumeId: id, userId })

      return { error: null }
    } catch (error) {
      logger.error('Failed to delete resume', { resumeId: id, userId, error })
      return { error }
    }
  }

  static async getResume(id: string, userId: string): Promise<{ data: Resume | null; error: any }> {
    const cacheKey = getResumeCacheKey(userId, id)
    
    // Check cache first
    const cached = resumeCache.get(cacheKey)
    if (cached) {
      logger.debug('Single resume cache hit', { resumeId: id })
      return { data: cached as Resume, error: null }
    }

    try {
      const result = await measureAsync(
        'db_get_resume',
        async () => {
          return await supabase.from("resumes").select("*").eq("id", id).eq("user_id", userId).single()
        },
        { resumeId: id, userId }
      )

      if (result.error) throw result.error

      // Cache the result
      if (result.data) {
        resumeCache.set(cacheKey, result.data, SINGLE_RESUME_TTL)
      }

      return { data: result.data, error: null }
    } catch (error) {
      logger.error('Failed to get resume', { resumeId: id, userId, error })
      return { data: null, error }
    }
  }

  /**
   * Batch get multiple resumes (optimized for bulk operations)
   */
  static async getMultipleResumes(
    ids: string[],
    userId: string
  ): Promise<{ data: Resume[] | null; error: any }> {
    if (ids.length === 0) {
      return { data: [], error: null }
    }

    // Check cache for each resume
    const cached: Resume[] = []
    const uncachedIds: string[] = []

    for (const id of ids) {
      const cacheKey = getResumeCacheKey(userId, id)
      const cachedResume = resumeCache.get(cacheKey)
      if (cachedResume) {
        cached.push(cachedResume as Resume)
      } else {
        uncachedIds.push(id)
      }
    }

    // If all cached, return immediately
    if (uncachedIds.length === 0) {
      return { data: cached, error: null }
    }

    try {
      const result = await measureAsync(
        'db_get_multiple_resumes',
        async () => {
          return await supabase
            .from("resumes")
            .select("*")
            .eq("user_id", userId)
            .in("id", uncachedIds)
        },
        { count: uncachedIds.length.toString() }
      )

      if (result.error) throw result.error

      // Cache the fetched resumes
      if (result.data) {
        for (const resume of result.data) {
          resumeCache.set(getResumeCacheKey(userId, resume.id), resume, SINGLE_RESUME_TTL)
        }
      }

      return { data: [...cached, ...(result.data || [])], error: null }
    } catch (error) {
      logger.error('Failed to get multiple resumes', { ids, userId, error })
      return { data: null, error }
    }
  }

  /**
   * Invalidate all caches for a user
   */
  static invalidateUserCache(userId: string): void {
    invalidateUserCaches(userId)
    logger.debug('User caches invalidated', { userId })
  }
}
