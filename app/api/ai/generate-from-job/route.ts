import { NextRequest, NextResponse } from 'next/server'
import { callAIChatCompletion, isAIConfigured } from '@/lib/ai/client'
import { aiLimiter, getClientIP, createRateLimitResponse, addRateLimitHeaders } from '@/lib/security/rate-limiter'
import { logger, requestTracker, generateRequestId } from '@/lib/utils/monitoring'
import { CreditsService } from '@/lib/services/credits'
import type { ResumeData } from '@/types/resume'

function generateId(prefix: string, index: number): string {
  return `${prefix}-${Date.now()}-${index}`
}

function normalizeResumeData(raw: any): ResumeData {
  return {
    personalInfo: {
      name: raw.personalInfo?.name || '',
      title: raw.personalInfo?.title || '',
      email: raw.personalInfo?.email || '',
      phone: raw.personalInfo?.phone || '',
      location: raw.personalInfo?.location || '',
      summary: raw.personalInfo?.summary || '',
      linkedin: raw.personalInfo?.linkedin || '',
      website: raw.personalInfo?.website || '',
    },
    experience: (raw.experience || []).map((exp: any, i: number) => ({
      id: generateId('exp', i),
      jobTitle: exp.jobTitle || '',
      company: exp.company || '',
      date: exp.date || '',
      location: exp.location || '',
      responsibilities: exp.responsibilities || '',
      achievements: exp.achievements || [],
    })),
    education: (raw.education || []).map((edu: any, i: number) => ({
      id: generateId('edu', i),
      degree: edu.degree || '',
      school: edu.school || '',
      date: edu.date || '',
      location: edu.location || '',
      gpa: edu.gpa || '',
    })),
    skills: {
      languages: raw.skills?.languages || '',
      frameworks: raw.skills?.frameworks || '',
      tools: raw.skills?.tools || '',
      other: raw.skills?.other || '',
    },
    projects: (raw.projects || []).map((proj: any, i: number) => ({
      id: generateId('proj', i),
      name: proj.name || '',
      description: proj.description || '',
      technologies: proj.technologies || '',
      date: proj.date || '',
    })),
  }
}

function buildPrompt(jobPost: string, baseResume?: ResumeData): string {
  const hasBase = !!(baseResume && baseResume.personalInfo?.name)

  const baseContext = hasBase
    ? `EXISTING RESUME TO TAILOR:
Name: ${baseResume!.personalInfo.name}
Current Title: ${baseResume!.personalInfo.title}
Email: ${baseResume!.personalInfo.email}
Phone: ${baseResume!.personalInfo.phone || ''}
Location: ${baseResume!.personalInfo.location}
LinkedIn: ${baseResume!.personalInfo.linkedin || ''}
Website: ${baseResume!.personalInfo.website || ''}

Experience:
${(baseResume!.experience || []).map(exp =>
  `- ${exp.jobTitle} at ${exp.company} (${exp.date})\n  ${exp.responsibilities}`
).join('\n')}

Education:
${(baseResume!.education || []).map(edu =>
  `- ${edu.degree} from ${edu.school} (${edu.date})`
).join('\n')}

Skills:
Languages: ${baseResume!.skills?.languages || ''}
Frameworks: ${baseResume!.skills?.frameworks || ''}
Tools: ${baseResume!.skills?.tools || ''}
Other: ${baseResume!.skills?.other || ''}

Projects:
${(baseResume!.projects || []).map(proj =>
  `- ${proj.name}: ${proj.description} (${proj.technologies || ''})`
).join('\n')}`
    : ''

  return `You are an expert resume writer and ATS optimization specialist. ${hasBase
    ? 'Tailor the provided existing resume to perfectly match the job posting below.'
    : 'Create a professional resume tailored to the job posting below.'
  }

${hasBase ? baseContext : ''}

JOB POSTING:
${jobPost}

INSTRUCTIONS:
${hasBase
    ? `- Keep the candidate's real personal info (name, email, phone, location, linkedin, website)
- Rewrite the professional summary to directly address this role's needs
- Rewrite experience bullet points using keywords and requirements from the job posting
- Highlight the most relevant skills for this role
- Reorder or reframe projects to show the most relevant ones first
- Add any missing skills mentioned in the job posting that are plausible given the background`
    : `- Create a realistic professional resume for someone applying to this role
- The candidate should appear as a strong match for the position
- Use industry-standard ATS-friendly language
- Include 2-3 relevant past positions, 1-2 education entries, and 1-2 projects`
  }
- Write experience responsibilities as bullet points using the • symbol, one per line
- Make the summary 2-3 sentences, compelling and ATS-friendly
- Use action verbs and quantifiable achievements where possible

Return ONLY valid JSON with this exact structure, no markdown, no code blocks:
{
  "personalInfo": {
    "name": "string",
    "title": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "summary": "string",
    "linkedin": "string",
    "website": "string"
  },
  "experience": [
    {
      "jobTitle": "string",
      "company": "string",
      "date": "string",
      "location": "string",
      "responsibilities": "string",
      "achievements": []
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "date": "string",
      "location": "string",
      "gpa": "string"
    }
  ],
  "skills": {
    "languages": "string",
    "frameworks": "string",
    "tools": "string",
    "other": "string"
  },
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": "string",
      "date": "string"
    }
  ]
}`
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  requestTracker.start(requestId, '/api/ai/generate-from-job', 'POST')

  try {
    const clientIP = getClientIP(request)
    const rateLimit = aiLimiter.check(`ai:${clientIP}`)

    if (!rateLimit.allowed) {
      requestTracker.end(requestId, 429)
      return createRateLimitResponse(rateLimit.retryAfter || 60, 0)
    }

    const body = await request.json()
    const { jobPost, userId, baseResume } = body

    if (!userId) {
      requestTracker.end(requestId, 401)
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    if (!jobPost || typeof jobPost !== 'string' || jobPost.trim().length < 50) {
      requestTracker.end(requestId, 400)
      return NextResponse.json(
        { error: 'Job posting is too short. Please paste the full job description (at least 50 characters).' },
        { status: 400 }
      )
    }

    if (jobPost.length > 10000) {
      requestTracker.end(requestId, 400)
      return NextResponse.json(
        { error: 'Job posting is too long. Please keep it under 10,000 characters.' },
        { status: 400 }
      )
    }

    const creditCheck = await CreditsService.checkCredits(userId, 'job_resume_generation')
    if (!creditCheck.allowed) {
      requestTracker.end(requestId, 402)
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          creditsRequired: creditCheck.required,
          creditsAvailable: creditCheck.currentBalance,
          message: `You need ${creditCheck.required} credits but only have ${creditCheck.currentBalance}.`,
        },
        { status: 402 }
      )
    }

    const creditResult = await CreditsService.consumeCredits(
      userId,
      'job_resume_generation',
      'Generated tailored resume from job posting'
    )
    if (!creditResult.success) {
      requestTracker.end(requestId, 500)
      return NextResponse.json(
        { error: 'Failed to process credits. Please try again.' },
        { status: 500 }
      )
    }

    if (!isAIConfigured()) {
      requestTracker.end(requestId, 503)
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 503 })
    }

    try {
      const prompt = buildPrompt(jobPost.trim(), baseResume)

      const rawJson = await callAIChatCompletion(
        [
          {
            role: 'system',
            content:
              'You are an expert resume writer and ATS optimization specialist. Always respond with valid JSON only. No markdown, no code blocks, no explanation — just the raw JSON object.',
          },
          { role: 'user', content: prompt },
        ],
        { max_tokens: 2500, temperature: 0.7, response_format: { type: 'json_object' } }
      )

      if (!rawJson) {
        requestTracker.end(requestId, 500)
        return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
      }

      let parsedData: any
      try {
        parsedData = JSON.parse(rawJson)
      } catch {
        logger.error('Failed to parse AI JSON response', { requestId })
        requestTracker.end(requestId, 500)
        return NextResponse.json(
          { error: 'Failed to parse AI response. Please try again.' },
          { status: 500 }
        )
      }

      const resumeData = normalizeResumeData(parsedData)
      const response = NextResponse.json({
        success: true,
        resumeData,
        creditsRemaining: creditResult.newBalance,
      })

      requestTracker.end(requestId, 200)
      return addRateLimitHeaders(response, rateLimit.remaining, rateLimit.resetTime, 10)
    } catch (aiError) {
      logger.error('AI call failed in generate-from-job', {
        error: aiError instanceof Error ? aiError.message : String(aiError),
      })
      requestTracker.end(requestId, 500)
      return NextResponse.json(
        { error: 'AI generation failed. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error('generate-from-job endpoint error', {
      error: error instanceof Error ? error.message : String(error),
    })
    requestTracker.end(requestId, 500, error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
