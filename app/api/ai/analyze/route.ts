import { NextRequest, NextResponse } from 'next/server'
// Gemini (commented out - using OpenAI instead)
// import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { CreditsService, AIFeature } from '@/lib/credits-service'

interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  summary: string
  profileImage?: string
}

interface Link {
  name: string
  url: string
}

interface Education {
  school: string
  degree: string
  date: string
  gpa?: string
}

interface Experience {
  jobTitle: string
  company: string
  date: string
  responsibilities: string
}

interface Project {
  name: string
  description: string
  technologies: string
  link?: string
}

interface Certification {
  name: string
  issuer: string
  date: string
}

interface Reference {
  name: string
  title: string
  company: string
  email: string
  phone: string
}

interface Skills {
  languages: string
  frameworks: string
  tools: string
}

interface ResumeData {
  personalInfo: PersonalInfo
  links: Link[]
  education: Education[]
  experience: Experience[]
  skills: Skills
  projects: Project[]
  certifications: Certification[]
  references: Reference[]
}

interface AnalysisResult {
  overallScore: number
  sections: {
    personalInfo: { score: number; feedback: string[] }
    summary: { score: number; feedback: string[] }
    experience: { score: number; feedback: string[] }
    education: { score: number; feedback: string[] }
    skills: { score: number; feedback: string[] }
    projects: { score: number; feedback: string[] }
  }
  strengths: string[]
  improvements: string[]
  atsCompatibility: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  industryFit: {
    detectedIndustry: string
    score: number
    recommendations: string[]
  }
}

// AI Prompt for comprehensive resume analysis
const getAnalysisPrompt = (resumeData: ResumeData) => {
  const resumeText = `
Personal Information:
Name: ${resumeData.personalInfo.name}
Title: ${resumeData.personalInfo.title}
Email: ${resumeData.personalInfo.email}
Phone: ${resumeData.personalInfo.phone || 'N/A'}
Location: ${resumeData.personalInfo.location || 'N/A'}

Professional Summary:
${resumeData.personalInfo.summary || 'No summary provided'}

Work Experience:
${resumeData.experience.map((exp, index) => `
${index + 1}. ${exp.jobTitle} at ${exp.company}
   Duration: ${exp.date}
   Responsibilities: ${exp.responsibilities}
`).join('')}

Education:
${resumeData.education.map((edu, index) => `
${index + 1}. ${edu.degree}
   School: ${edu.school}
   Graduation: ${edu.date}
   GPA: ${edu.gpa || 'N/A'}
`).join('')}

Skills: 
Languages: ${resumeData.skills.languages}
Frameworks: ${resumeData.skills.frameworks}
Tools: ${resumeData.skills.tools}

Projects:
${resumeData.projects.map((proj, index) => `
${index + 1}. ${proj.name}
   Description: ${proj.description}
   Technologies: ${proj.technologies || 'N/A'}
   Link: ${proj.link || 'N/A'}
`).join('')}

Certifications:
${resumeData.certifications.map((cert, index) => `
${index + 1}. ${cert.name} - ${cert.issuer} (${cert.date})
`).join('')}

Links:
${resumeData.links.map((link, index) => `
${index + 1}. ${link.name} - ${link.url}
`).join('')}

References:
${resumeData.references.map((ref, index) => `
${index + 1}. ${ref.name} - ${ref.title} at ${ref.company} (${ref.email})
`).join('')}
  `

  return `
Analyze this resume comprehensively and provide a detailed assessment. Return a JSON response with the following structure:

{
  "overallScore": <number 1-100>,
  "sections": {
    "personalInfo": {
      "score": <number 1-100>,
      "feedback": ["specific feedback point 1", "specific feedback point 2"]
    },
    "summary": {
      "score": <number 1-100>,
      "feedback": ["specific feedback about summary"]
    },
    "experience": {
      "score": <number 1-100>,
      "feedback": ["specific feedback about work experience"]
    },
    "education": {
      "score": <number 1-100>,
      "feedback": ["specific feedback about education"]
    },
    "skills": {
      "score": <number 1-100>,
      "feedback": ["specific feedback about skills section"]
    },
    "projects": {
      "score": <number 1-100>,
      "feedback": ["specific feedback about projects"]
    }
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement suggestion 1", "improvement suggestion 2", "improvement suggestion 3"],
  "atsCompatibility": {
    "score": <number 1-100>,
    "issues": ["ATS issue 1", "ATS issue 2"],
    "suggestions": ["ATS improvement 1", "ATS improvement 2"]
  },
  "industryFit": {
    "detectedIndustry": "detected industry based on resume",
    "score": <number 1-100>,
    "recommendations": ["industry-specific recommendation 1", "industry-specific recommendation 2"]
  }
}

Evaluation Criteria:
1. Content Quality: Professional language, quantified achievements, relevant keywords
2. Structure & Format: Clear sections, logical flow, appropriate length
3. ATS Compatibility: Standard section headers, keyword optimization, format compatibility
4. Industry Relevance: Skills and experience alignment with detected industry
5. Completeness: All important sections filled with meaningful content

Resume to analyze:
${resumeText}

Please provide constructive, actionable feedback that will help improve this resume's effectiveness.
  `.trim()
}

// Fallback analysis for when AI is not available
const getFallbackAnalysis = (resumeData: ResumeData): AnalysisResult => {
  const hasPersonalInfo = !!(resumeData.personalInfo.name && resumeData.personalInfo.email)
  const hasSummary = !!resumeData.personalInfo.summary?.trim()
  const hasExperience = resumeData.experience.some(exp => exp.jobTitle && exp.company)
  const hasEducation = resumeData.education.some(edu => edu.school && edu.degree)
  const hasSkills = !!(resumeData.skills.languages || resumeData.skills.frameworks || resumeData.skills.tools)
  const hasProjects = resumeData.projects.some(proj => proj.name && proj.description)

  const completionScore = [hasPersonalInfo, hasSummary, hasExperience, hasEducation, hasSkills, hasProjects]
    .filter(Boolean).length * 15

  return {
    overallScore: Math.min(completionScore + 10, 100),
    sections: {
      personalInfo: {
        score: hasPersonalInfo ? 85 : 45,
        feedback: hasPersonalInfo
          ? ["Contact information is complete", "Consider adding LinkedIn profile"]
          : ["Missing essential contact information", "Add professional title"]
      },
      summary: {
        score: hasSummary ? 80 : 30,
        feedback: hasSummary
          ? ["Professional summary present", "Consider quantifying achievements"]
          : ["Missing professional summary", "Add 2-3 sentence career overview"]
      },
      experience: {
        score: hasExperience ? 75 : 25,
        feedback: hasExperience
          ? ["Work experience documented", "Use action verbs and quantify results"]
          : ["Add work experience entries", "Include job titles and responsibilities"]
      },
      education: {
        score: hasEducation ? 85 : 40,
        feedback: hasEducation
          ? ["Educational background provided", "Good foundation"]
          : ["Add educational qualifications", "Include degree and institution"]
      },
      skills: {
        score: hasSkills ? 80 : 20,
        feedback: hasSkills
          ? ["Skills section populated", "Ensure relevance to target role"]
          : ["Add technical and soft skills", "Include industry-relevant competencies"]
      },
      projects: {
        score: hasProjects ? 85 : 60,
        feedback: hasProjects
          ? ["Projects showcase practical experience", "Great portfolio addition"]
          : ["Consider adding relevant projects", "Demonstrate practical skills"]
      }
    },
    strengths: [
      hasPersonalInfo && "Complete contact information",
      hasSummary && "Professional summary included",
      hasExperience && "Work experience documented",
      hasSkills && "Technical skills listed",
      hasProjects && "Portfolio projects included"
    ].filter(Boolean) as string[],
    improvements: [
      !hasSummary && "Add compelling professional summary",
      !hasExperience && "Include relevant work experience",
      !hasSkills && "List technical and professional skills",
      "Quantify achievements with numbers and metrics",
      "Use strong action verbs throughout"
    ].filter(Boolean) as string[],
    atsCompatibility: {
      score: hasPersonalInfo && hasSummary && hasExperience ? 75 : 50,
      issues: [
        "Use standard section headers",
        "Avoid complex formatting",
        "Include relevant keywords"
      ],
      suggestions: [
        "Use simple, clean format",
        "Include industry keywords",
        "Save as PDF for compatibility"
      ]
    },
    industryFit: {
      detectedIndustry: "Technology", // Default fallback
      score: 70,
      recommendations: [
        "Highlight technical skills",
        "Include relevant certifications",
        "Showcase problem-solving abilities"
      ]
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()

    let body
    try {
      body = JSON.parse(bodyText)
    } catch (_parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { resumeData, userId } = body as { resumeData: ResumeData; userId?: string }

    if (!resumeData) {
      return NextResponse.json(
        { error: 'No resumeData provided in request body' },
        { status: 400 }
      )
    }

    // Check and deduct credits if userId is provided
    let creditResult: { success: boolean; newBalance: number; error?: string } | null = null
    if (userId) {
      const feature: AIFeature = 'resume_analysis'

      // Check if user has enough credits
      const creditCheck = await CreditsService.checkCredits(userId, feature)

      if (!creditCheck.allowed) {
        return NextResponse.json(
          {
            error: 'Insufficient credits',
            creditsRequired: creditCheck.required,
            creditsAvailable: creditCheck.currentBalance,
            message: `Resume analysis requires ${creditCheck.required} credits but you only have ${creditCheck.currentBalance}. Please purchase more credits.`
          },
          { status: 402 } // Payment Required
        )
      }

      // Deduct credits before making the AI call
      creditResult = await CreditsService.consumeCredits(
        userId,
        feature,
        'Analyzed resume for improvements'
      )

      if (!creditResult.success) {
        return NextResponse.json(
          { error: 'Failed to process credits. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Validate resume data
    if (!resumeData || !resumeData.personalInfo) {
      return NextResponse.json(
        { error: 'Invalid resume data provided - missing personalInfo' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      const fallbackAnalysis = getFallbackAnalysis(resumeData)

      return NextResponse.json({
        analysis: fallbackAnalysis,
        success: true,
        fallback: true
      })
    }

    try {
      // Gemini (commented out - using OpenAI instead)
      // const genAI = new GoogleGenerativeAI(apiKey)
      // const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
      // const result = await model.generateContent(prompt)
      // const response = await result.response
      // const text = response.text()

      // OpenAI Implementation
      const openai = new OpenAI({ apiKey })
      const prompt = getAnalysisPrompt(resumeData)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume analyst. Analyze resumes and provide detailed, constructive feedback in valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      })

      const text = completion.choices[0]?.message?.content || ''

      // Parse JSON response
      let analysisResult: AnalysisResult
      try {
        // Clean the response text of any markdown formatting
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        analysisResult = JSON.parse(cleanText)
      } catch (_parseError) {
        throw new Error('Failed to parse AI analysis response - Invalid JSON format')
      }

      return NextResponse.json({
        analysis: analysisResult,
        success: true,
        fallback: false,
        ...(creditResult && { creditsRemaining: creditResult.newBalance }),
      })

    } catch (_aiError) {
      const fallbackAnalysis = getFallbackAnalysis(resumeData)

      return NextResponse.json({
        analysis: fallbackAnalysis,
        success: true,
        fallback: true,
        ...(creditResult && { creditsRemaining: creditResult.newBalance }),
      })
    }

  } catch (_error) {
    return NextResponse.json({
      error: 'Failed to analyze resume',
      success: false
    }, { status: 500 })
  }
}
