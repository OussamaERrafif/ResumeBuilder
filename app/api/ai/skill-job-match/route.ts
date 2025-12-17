import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ResumeData } from '@/types/resume'
import { CreditsService } from '@/lib/credits-service'

// Define response types
interface SkillAnalysis {
    name: string
    proficiency: number // 0-100
    category: string
}

interface JobMatch {
    title: string
    matchPercentage: number
    reasoning: string
    salaryRange?: string
}

interface AnalysisResponse {
    skillsAnalysis: SkillAnalysis[]
    jobMatches: JobMatch[]
    summary: string
    creditsUsed?: number
    creditsRemaining?: number
}

export async function POST(request: NextRequest) {
    try {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY
        if (!OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key is not configured' },
                { status: 500 }
            )
        }

        const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
        const body = await request.json()
        const { resumeData, userId } = body as { resumeData: ResumeData; userId: string }

        if (!resumeData) {
            return NextResponse.json(
                { error: 'Resume data is required' },
                { status: 400 }
            )
        }

        // Cost for this feature - using job_match_analysis (3 credits)
        const feature: 'job_match_analysis' = 'job_match_analysis'

        // Credit Deduction Logic
        let creditResult: { success: boolean; newBalance: number; error?: string } | null = null

        if (userId) {
            const creditCheck = await CreditsService.checkCredits(userId, feature)

            if (!creditCheck.allowed) {
                return NextResponse.json(
                    {
                        error: 'Insufficient credits',
                        creditsRequired: creditCheck.required,
                        creditsAvailable: creditCheck.currentBalance,
                        message: `You need ${creditCheck.required} credits for this analysis. You have ${creditCheck.currentBalance}.`
                    },
                    { status: 402 }
                )
            }

            creditResult = await CreditsService.consumeCredits(
                userId,
                feature,
                `Skill & Job Match Analysis`
            )

            if (!creditResult.success) {
                return NextResponse.json({ error: 'Credit transaction failed' }, { status: 500 })
            }
        }

        // AI Processing
        const prompt = createAnalysisPrompt(resumeData)

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a career expert AI. Analyze the resume and provide a structured JSON response with skill proficiency (0-100) and suitable job matches.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        })

        const content = completion.choices[0]?.message?.content
        if (!content) throw new Error('No content from OpenAI')

        const analysis = JSON.parse(content) as AnalysisResponse

        return NextResponse.json({
            ...analysis,
            ...(creditResult && {
                creditsUsed: 3,
                creditsRemaining: creditResult.newBalance
            })
        })

    } catch (error) {
        console.error('Analysis error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze resume' },
            { status: 500 }
        )
    }
}

function createAnalysisPrompt(data: ResumeData): string {
    // Simplify resume data for prompt
    const skills = JSON.stringify(data.skills)
    const experience = data.experience.map(e => `${e.jobTitle} at ${e.company}: ${e.responsibilities}`).join('\n')
    const education = data.education.map(e => `${e.degree} at ${e.school}`).join('\n')

    return `
    Analyze this resume data:
    
    Skills: ${skills}
    Experience: ${experience}
    Education: ${education}

    Return a JSON object with this exact structure:
    {
      "skillsAnalysis": [
        { "name": "Skill Name", "proficiency": 85, "category": "Technical/Soft/Tool" }
      ] (Extract top 10-15 skills, name them cleanly),
      "jobMatches": [
        { 
          "title": "Job Title", 
          "matchPercentage": 90, 
          "reasoning": "Why this fits...",
          "salaryRange": "$80k - $120k" (Estimated)
        }
      ] (Top 3-4 matches),
      "summary": "Brief 2-3 sentence overview of their profile strength."
    }
  `
}
