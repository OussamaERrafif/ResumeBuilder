import { NextRequest, NextResponse } from 'next/server'
// Gemini (commented out - using OpenAI instead)
// import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { aiCache, getAICacheKey } from '@/lib/cache'
import { aiRequestQueue, aiCircuitBreaker, requestDeduplicator } from '@/lib/request-queue'
import { aiLimiter, getClientIP, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limiter'
import { metrics, logger, requestTracker, generateRequestId } from '@/lib/monitoring'

// Validation function
const validateAIRequest = (type: string, query: string) => {
  const validTypes = ['summary', 'experience', 'project']
  
  if (!validTypes.includes(type)) {
    return {
      valid: false,
      error: 'Invalid generation type. Must be summary, experience, or project.'
    }
  }
  
  if (!query || query.trim().length < 5) {
    return {
      valid: false,
      error: 'Query too short. Please provide a more detailed description.'
    }
  }
  
  if (query.length > 500) {
    return {
      valid: false,
      error: 'Query too long. Please keep descriptions under 500 characters.'
    }
  }
  
  return { valid: true }
}

// AI Prompts
const AI_PROMPTS = {
  summary: (query: string) => `
    Write a professional resume summary (2 sentences, max 40 words) based on this description: "${query}". 
    Make it compelling, concise, and highlight key strengths. Focus on achievements and value proposition.
    Do not include any formatting or bullet points, just a clear, concise paragraph.
    Make it ATS-friendly and impactful for recruiters.
  `.trim(),
  
  experience: (query: string) => `
    Generate 2-3 concise professional bullet points for a resume job experience section based on: "${query}".
    Each bullet point should:
    - Start with a strong action verb (Led, Developed, Implemented, Managed, etc.)
    - Include specific achievements or responsibilities
    - Be quantifiable where possible (use numbers, percentages, etc.)
    - Be relevant to the role described
    - Be ATS-friendly and use industry keywords
    - Be concise (maximum 15-20 words per bullet point)
    
    IMPORTANT: Format as plain text bullet points using • symbol only. 
    Do NOT use markdown formatting, bold text (**), or any other special formatting.
    Just return clean, short bullet points like this:
    • Led team of developers to build scalable platform
    • Developed new features reducing load times by 40%
    • Implemented CI/CD pipelines improving deployment speed
  `.trim(),
  
  project: (query: string) => `
    Write a concise professional project description (1-2 sentences, max 30 words) for a resume based on: "${query}".
    Include:
    - What the project accomplished (business impact)
    - Key technologies or methods used
    - Measurable results where possible
    
    IMPORTANT: Return as plain text only, no markdown formatting, no bold text, no bullet points.
    Keep it very concise and professional. Focus on impact and technologies.
    Example: "Built e-commerce platform using React and Node.js, increasing sales by 25% and reducing page load time by 50%."
  `.trim()
}

// Clean markdown formatting function
function cleanMarkdownFormatting(text: string): string {
  return text
    // Remove bold markdown (**text**)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    // Remove italic markdown (*text*)
    .replace(/\*([^*]+)\*/g, '$1')
    // Clean up bullet points - remove extra spaces and markdown
    .replace(/^\s*\*\s*•\s*/gm, '• ')
    // Remove any remaining markdown asterisks at start of lines
    .replace(/^\s*\*\s*/gm, '• ')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Clean up line breaks
    .trim()
}

// Fallback content function
function getFallbackContent(type: string, query: string): string {
  const summaryTemplates = [
    `Experienced ${query} professional with proven track record of delivering results and driving innovation in fast-paced environments.`,
    `Results-driven ${query} specialist with expertise in modern technologies and strong problem-solving abilities.`,
    `Dynamic ${query} professional with extensive experience in technical leadership and strategic thinking.`,
  ]

  const experienceTemplates = [
    `• Led ${query} initiatives resulting in improved efficiency\n• Implemented modern methodologies to streamline processes\n• Collaborated with stakeholders to deliver solutions`,
    `• Developed ${query} systems with focus on scalability\n• Participated in architectural decisions and code reviews\n• Contributed to documentation and process improvements`,
    `• Managed ${query} projects from conception to deployment\n• Coordinated with teams to ensure project success\n• Implemented quality assurance and testing strategies`,
  ]

  const projectTemplates = [
    `Developed comprehensive ${query} solution improving user experience and system performance using modern technologies.`,
    `Created innovative ${query} application with focus on scalability, implementing automated testing and CI/CD pipelines.`,
    `Built robust ${query} platform streamlining business processes and enhancing productivity within budget and timeline.`,
  ]

  let templates: string[]
  switch (type) {
    case 'summary':
      templates = summaryTemplates
      break
    case 'experience':
      templates = experienceTemplates
      break
    case 'project':
      templates = projectTemplates
      break
    default:
      return "Professional content generated based on your input."
  }

  const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
  return randomTemplate
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  requestTracker.start(requestId, '/api/ai/generate', 'POST')
  
  try {
    // Rate limiting check
    const clientIP = getClientIP(request)
    const rateLimit = aiLimiter.check(`ai:${clientIP}`)
    
    if (!rateLimit.allowed) {
      requestTracker.end(requestId, 429)
      return createRateLimitResponse(rateLimit.retryAfter || 60, 0)
    }

    const body = await request.json()
    const { type, query } = body

    // Validate the request
    const validation = validateAIRequest(type, query)
    if (!validation.valid) {
      requestTracker.end(requestId, 400)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = getAICacheKey(type, query)
    const cached = aiCache.get(cacheKey)
    if (cached) {
      logger.debug('AI cache hit', { type, cacheKey })
      requestTracker.recordCacheHit(requestId, true)
      const response = NextResponse.json({
        content: cached as string,
        success: true,
        cached: true
      })
      requestTracker.end(requestId, 200)
      return addRateLimitHeaders(response, rateLimit.remaining, rateLimit.resetTime, 10)
    }
    requestTracker.recordCacheHit(requestId, false)

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      const fallbackContent = getFallbackContent(type, query)
      aiCache.set(cacheKey, fallbackContent, 60 * 60 * 1000) // Cache fallback for 1 hour
      requestTracker.end(requestId, 200)
      return NextResponse.json({
        content: fallbackContent,
        success: true,
        fallback: true
      })
    }

    try {
      // Use request deduplication and queue for AI requests
      const content = await requestDeduplicator.execute(cacheKey, async () => {
        return await aiRequestQueue.enqueue(async () => {
          return await aiCircuitBreaker.execute(async () => {
            const timingId = metrics.startTiming('openai_request')
            
            try {
              const openai = new OpenAI({ apiKey })
              const prompt = AI_PROMPTS[type as keyof typeof AI_PROMPTS](query)
              
              const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content: 'You are a professional resume writer. Generate clear, concise, and ATS-friendly content. Do not use markdown formatting.'
                  },
                  {
                    role: 'user',
                    content: prompt
                  }
                ],
                max_tokens: 500,
                temperature: 0.7,
              })
              
              metrics.endTiming(timingId, { status: 'success', type })
              return completion.choices[0]?.message?.content || ''
            } catch (error) {
              metrics.endTiming(timingId, { status: 'error', type })
              throw error
            }
          })
        }, { priority: 5, timeout: 25000 })
      }) as string
      
      // Clean any markdown formatting
      const cleanedText = cleanMarkdownFormatting(content)
      
      // Cache the successful response
      aiCache.set(cacheKey, cleanedText, 30 * 60 * 1000) // Cache for 30 minutes

      const response = NextResponse.json({ 
        content: cleanedText,
        success: true
      })
      requestTracker.end(requestId, 200)
      return addRateLimitHeaders(response, rateLimit.remaining, rateLimit.resetTime, 10)
      
    } catch (aiError) {
      logger.warn('AI request failed, using fallback', { 
        error: aiError instanceof Error ? aiError.message : String(aiError),
        type 
      })
      
      const fallbackContent = getFallbackContent(type, query)
      const cleanedFallback = cleanMarkdownFormatting(fallbackContent)
      aiCache.set(cacheKey, cleanedFallback, 60 * 60 * 1000) // Cache fallback for 1 hour
      
      const response = NextResponse.json({
        content: cleanedFallback,
        success: true,
        fallback: true
      })
      requestTracker.end(requestId, 200)
      return addRateLimitHeaders(response, rateLimit.remaining, rateLimit.resetTime, 10)
    }

  } catch (error) {
    logger.error('AI generate endpoint error', { 
      error: error instanceof Error ? error.message : String(error) 
    })
    requestTracker.end(requestId, 500, error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json({
      content: "Professional content will be generated based on your input.",
      success: true,
      fallback: true
    })
  }
}
