import { supabaseAdmin } from "@/lib/db/server"
import { logger } from "@/lib/utils/monitoring"

// Define types inline since we use admin client (bypasses typed client)
interface ResumeAnalysisRow {
    id: string
    user_id: string
    resume_id: string
    analysis_type: "full_analysis" | "skill_job_match"
    analysis_data: any
    overall_score: number | null
    is_fallback: boolean
    created_at: string
    updated_at: string
}

interface ResumeAnalysisInsert {
    user_id: string
    resume_id: string
    analysis_type?: "full_analysis" | "skill_job_match"
    analysis_data: any
    overall_score?: number | null
    is_fallback?: boolean
}

export type AnalysisType = "full_analysis" | "skill_job_match"

export class AnalysisService {
    /**
     * Get a saved analysis for a specific resume and type.
     * Returns null if no analysis exists.
     */
    static async getAnalysis(
        resumeId: string,
        userId: string,
        analysisType: AnalysisType = "full_analysis"
    ): Promise<{ data: ResumeAnalysisRow | null; error: any }> {
        if (!supabaseAdmin) {
            logger.error("Supabase admin client not available")
            return { data: null, error: "Supabase admin not configured" }
        }

        try {
            const { data, error } = await supabaseAdmin
                .from("resume_analyses")
                .select("*")
                .eq("resume_id", resumeId)
                .eq("user_id", userId)
                .eq("analysis_type", analysisType)
                .single()

            if (error && error.code === "PGRST116") {
                // No rows found — that's fine, not an error
                return { data: null, error: null }
            }

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            logger.error("Failed to get analysis", { resumeId, userId, error })
            return { data: null, error }
        }
    }

    /**
     * Get all saved analyses for a resume.
     */
    static async getAnalysesForResume(
        resumeId: string,
        userId: string
    ): Promise<{ data: ResumeAnalysisRow[] | null; error: any }> {
        if (!supabaseAdmin) {
            return { data: null, error: "Supabase admin not configured" }
        }

        try {
            const { data, error } = await supabaseAdmin
                .from("resume_analyses")
                .select("*")
                .eq("resume_id", resumeId)
                .eq("user_id", userId)
                .order("updated_at", { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            logger.error("Failed to get analyses for resume", { resumeId, userId, error })
            return { data: null, error }
        }
    }

    /**
     * Save (upsert) an analysis for a resume.
     * If an analysis already exists for this resume+type combo, it gets updated.
     */
    static async saveAnalysis(
        analysis: ResumeAnalysisInsert
    ): Promise<{ data: ResumeAnalysisRow | null; error: any }> {
        if (!supabaseAdmin) {
            logger.error("Supabase admin client not available for saving analysis")
            return { data: null, error: "Supabase admin not configured" }
        }

        try {
            const { data, error } = await supabaseAdmin
                .from("resume_analyses")
                .upsert(
                    {
                        ...analysis,
                        updated_at: new Date().toISOString(),
                    },
                    {
                        onConflict: "resume_id,analysis_type",
                    }
                )
                .select()
                .single()

            if (error) throw error
            logger.info("Analysis saved", {
                resumeId: analysis.resume_id,
                type: analysis.analysis_type,
            })
            return { data, error: null }
        } catch (error) {
            logger.error("Failed to save analysis", {
                resumeId: analysis.resume_id,
                error,
            })
            return { data: null, error }
        }
    }

    /**
     * Delete analysis for a resume.
     */
    static async deleteAnalysis(
        resumeId: string,
        userId: string,
        analysisType?: AnalysisType
    ): Promise<{ error: any }> {
        if (!supabaseAdmin) {
            return { error: "Supabase admin not configured" }
        }

        try {
            let query = supabaseAdmin
                .from("resume_analyses")
                .delete()
                .eq("resume_id", resumeId)
                .eq("user_id", userId)

            if (analysisType) {
                query = query.eq("analysis_type", analysisType)
            }

            const { error } = await query

            if (error) throw error
            logger.info("Analysis deleted", { resumeId, userId, analysisType })
            return { error: null }
        } catch (error) {
            logger.error("Failed to delete analysis", { resumeId, userId, error })
            return { error }
        }
    }
}
