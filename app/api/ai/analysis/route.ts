import { NextRequest, NextResponse } from "next/server"
import { AnalysisService } from "@/lib/analysis-service"

/**
 * GET /api/ai/analysis?resumeId=xxx&userId=xxx&type=full_analysis
 * Fetches a saved analysis for a resume.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const resumeId = searchParams.get("resumeId")
        const userId = searchParams.get("userId")
        const analysisType = (searchParams.get("type") || "full_analysis") as
            | "full_analysis"
            | "skill_job_match"

        if (!resumeId || !userId) {
            return NextResponse.json(
                { error: "Missing resumeId or userId" },
                { status: 400 }
            )
        }

        const { data, error } = await AnalysisService.getAnalysis(
            resumeId,
            userId,
            analysisType
        )

        if (error) {
            return NextResponse.json(
                { error: "Failed to fetch analysis" },
                { status: 500 }
            )
        }

        if (!data) {
            return NextResponse.json({
                success: true,
                hasAnalysis: false,
                analysis: null,
            })
        }

        return NextResponse.json({
            success: true,
            hasAnalysis: true,
            analysis: data.analysis_data,
            overallScore: data.overall_score,
            isFallback: data.is_fallback,
            analyzedAt: data.updated_at,
        })
    } catch (error) {
        console.error("Error fetching analysis:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/ai/analysis
 * Saves an analysis result to the database.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { resumeId, userId, analysisType, analysisData, overallScore, isFallback } = body

        if (!resumeId || !userId || !analysisData) {
            return NextResponse.json(
                { error: "Missing required fields: resumeId, userId, analysisData" },
                { status: 400 }
            )
        }

        const { data, error } = await AnalysisService.saveAnalysis({
            resume_id: resumeId,
            user_id: userId,
            analysis_type: analysisType || "full_analysis",
            analysis_data: analysisData,
            overall_score: overallScore || null,
            is_fallback: isFallback || false,
        })

        if (error) {
            return NextResponse.json(
                { error: "Failed to save analysis" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            savedAt: data?.updated_at,
        })
    } catch (error) {
        console.error("Error saving analysis:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/ai/analysis
 * Deletes a saved analysis.
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const resumeId = searchParams.get("resumeId")
        const userId = searchParams.get("userId")
        const analysisType = searchParams.get("type") as
            | "full_analysis"
            | "skill_job_match"
            | undefined

        if (!resumeId || !userId) {
            return NextResponse.json(
                { error: "Missing resumeId or userId" },
                { status: 400 }
            )
        }

        const { error } = await AnalysisService.deleteAnalysis(
            resumeId,
            userId,
            analysisType || undefined
        )

        if (error) {
            return NextResponse.json(
                { error: "Failed to delete analysis" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting analysis:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
