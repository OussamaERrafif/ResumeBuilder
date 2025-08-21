import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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
  console.log('🚀 === AI Resume Analysis API Called ===')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🔍 Request method:', request.method)
  console.log('🔍 Request URL:', request.url)
  console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    console.log('📝 Attempting to parse request body...')
    const bodyText = await request.text()
    console.log('📝 Raw body text length:', bodyText.length)
    console.log('📝 Raw body preview (first 200 chars):', bodyText.substring(0, 200))
    
    let body
    try {
      body = JSON.parse(bodyText)
      console.log('✅ Request body parsed successfully')
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body', debug: `Parse error: ${parseError}` },
        { status: 400 }
      )
    }
    
    console.log('📋 Body keys:', Object.keys(body))
    
    const { resumeData } = body as { resumeData: ResumeData }
    console.log('🔍 Resume data extracted')
    console.log('🔍 Resume data exists:', !!resumeData)
    
    if (!resumeData) {
      console.log('❌ No resumeData in request body')
      return NextResponse.json(
        { error: 'No resumeData provided in request body', debug: 'resumeData field is missing' },
        { status: 400 }
      )
    }
    
    console.log('📊 Resume data structure analysis:')
    console.log('  - Resume data keys:', Object.keys(resumeData || {}))
    console.log('  - Personal info exists:', !!resumeData?.personalInfo)
    
    if (resumeData?.personalInfo) {
      console.log('📋 Personal info details:')
      console.log('    - Name:', resumeData.personalInfo.name)
      console.log('    - Title:', resumeData.personalInfo.title) 
      console.log('    - Email:', resumeData.personalInfo.email)
      console.log('    - Phone:', resumeData.personalInfo.phone)
      console.log('    - Location:', resumeData.personalInfo.location)
      console.log('    - Summary length:', resumeData.personalInfo.summary?.length || 0)
    }
    
    console.log('📊 Section analysis:')
    console.log('    - Experience count:', Array.isArray(resumeData.experience) ? resumeData.experience.length : 'Not array')
    console.log('    - Education count:', Array.isArray(resumeData.education) ? resumeData.education.length : 'Not array')
    console.log('    - Skills object:', !!resumeData.skills)
    if (resumeData.skills) {
      console.log('      - Languages:', resumeData.skills.languages?.length || 0)
      console.log('      - Frameworks:', resumeData.skills.frameworks?.length || 0)
      console.log('      - Tools:', resumeData.skills.tools?.length || 0)
    }
    console.log('    - Projects count:', Array.isArray(resumeData.projects) ? resumeData.projects.length : 'Not array')
    console.log('    - Certifications count:', Array.isArray(resumeData.certifications) ? resumeData.certifications.length : 'Not array')
    console.log('    - Links count:', Array.isArray(resumeData.links) ? resumeData.links.length : 'Not array')
    console.log('    - References count:', Array.isArray(resumeData.references) ? resumeData.references.length : 'Not array')
    
    console.log('🔍 Analysis request for:', resumeData?.personalInfo?.name || 'Unknown person')
    
    // Validate resume data
    if (!resumeData || !resumeData.personalInfo) {
      console.log('❌ Validation failed: Invalid resume data structure')
      console.log('  - Resume data provided:', !!resumeData)
      console.log('  - Personal info provided:', !!resumeData?.personalInfo)
      return NextResponse.json(
        { error: 'Invalid resume data provided - missing personalInfo', debug: 'personalInfo field is required' },
        { status: 400 }
      )
    }

    console.log('✅ Resume data validation passed')
    console.log('📊 Resume sections summary:', {
      personalInfo: !!resumeData.personalInfo,
      summary: !!resumeData.personalInfo?.summary,
      experience: Array.isArray(resumeData.experience) ? resumeData.experience.length : 0,
      education: Array.isArray(resumeData.education) ? resumeData.education.length : 0,
      skills: resumeData.skills ? Object.keys(resumeData.skills).length : 0,
      projects: Array.isArray(resumeData.projects) ? resumeData.projects.length : 0
    })

    const apiKey = process.env.GEMINI_API_KEY
    console.log('🔑 API Key check:')
    console.log('  - API key exists:', !!apiKey)
    console.log('  - API key length:', apiKey ? apiKey.length : 0)
    console.log('  - Environment variables available:', Object.keys(process.env).filter(key => key.includes('GEMINI')))
    
    if (!apiKey) {
      console.log('⚠️  No API key found, using fallback analysis')
      console.log('🔄 Generating fallback analysis...')
      
      const fallbackAnalysis = getFallbackAnalysis(resumeData)
      console.log('✅ Fallback analysis generated successfully')
      console.log('📊 Fallback analysis score:', fallbackAnalysis.overallScore)
      
      return NextResponse.json({
        analysis: fallbackAnalysis,
        success: true,
        fallback: true,
        debug: 'No API key configured, using template analysis'
      })
    }

    console.log('🤖 API key found! Attempting AI analysis...')
    
    try {
      console.log('🔧 Initializing Google Generative AI...')
      const genAI = new GoogleGenerativeAI(apiKey)
      
      console.log('🔧 Getting model (gemini-2.0-flash-exp)...')
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
      
      console.log('📝 Generating analysis prompt...')
      const prompt = getAnalysisPrompt(resumeData)
      console.log('📝 Prompt length:', prompt.length)
      console.log('📝 Prompt preview (first 300 chars):', prompt.substring(0, 300))
      
      console.log('🚀 Sending analysis prompt to Gemini API...')
      console.log('📊 Resume sections to analyze:', Object.keys(resumeData))
      
      const result = await model.generateContent(prompt)
      console.log('📨 Received response from Gemini API')
      
      const response = await result.response
      console.log('📨 Response processed successfully')
      
      const text = response.text()
      console.log('📄 Response text length:', text.length)
      console.log('📄 Response text preview (first 200 chars):', text.substring(0, 200))
      console.log('📄 Response text preview (last 200 chars):', text.slice(-200))
      
      // Parse JSON response
      let analysisResult: AnalysisResult
      try {
        console.log('🔍 Attempting to parse JSON response...')
        // Clean the response text of any markdown formatting
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        console.log('🧹 Cleaned text length:', cleanText.length)
        console.log('🧹 Cleaned text preview (first 200 chars):', cleanText.substring(0, 200))
        
        analysisResult = JSON.parse(cleanText)
        console.log('✅ JSON parsing successful!')
        console.log('📊 Parsed result keys:', Object.keys(analysisResult))
      } catch (parseError) {
        console.error('❌ Error parsing AI response:', parseError)
        console.log('🔍 Raw AI response for debugging:', text)
        console.error('📄 Parse error details:', parseError instanceof Error ? parseError.message : 'Unknown parse error')
        throw new Error('Failed to parse AI analysis response - Invalid JSON format')
      }

      console.log('🎉 AI analysis successful!')
      console.log('📊 Analysis results overview:')
      console.log('  - Overall score:', analysisResult.overallScore)
      console.log('  - Analysis result keys:', Object.keys(analysisResult))
      console.log('  - Sections analyzed:', Object.keys(analysisResult.sections || {}))
      console.log('  - Strengths count:', analysisResult.strengths?.length || 0)
      console.log('  - Improvements count:', analysisResult.improvements?.length || 0)
      console.log('  - ATS compatibility score:', analysisResult.atsCompatibility?.score || 'N/A')
      console.log('  - Industry detected:', analysisResult.industryFit?.detectedIndustry || 'N/A')
      
      return NextResponse.json({ 
        analysis: analysisResult,
        success: true,
        fallback: false,
        debug: 'AI analysis successful with Gemini'
      })
      
    } catch (aiError) {
      console.error('❌ Gemini API Error:', aiError)
      console.error('🔍 AI Error details:')
      console.error('  - Error name:', aiError instanceof Error ? aiError.name : 'Unknown')
      console.error('  - Error message:', aiError instanceof Error ? aiError.message : 'Unknown')
      console.error('  - Error stack:', aiError instanceof Error ? aiError.stack : 'No stack trace')
      
      console.log('🔄 Falling back to template analysis due to AI error...')
      const fallbackAnalysis = getFallbackAnalysis(resumeData)
      console.log('✅ Fallback analysis generated after AI error')
      
      return NextResponse.json({
        analysis: fallbackAnalysis,
        success: true,
        fallback: true,
        debug: `AI error: ${aiError instanceof Error ? aiError.message : 'Unknown AI error'} - Used fallback analysis`
      })
    }

  } catch (error) {
    console.error('❌ General error in analysis API:', error)
    console.error('🔍 General error details:')
    console.error('  - Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('  - Error message:', error instanceof Error ? error.message : 'Unknown')
    console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      error: 'Failed to analyze resume',
      success: false,
      debug: `API error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
