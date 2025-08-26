import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
let genAI: GoogleGenerativeAI
try {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }
  genAI = new GoogleGenerativeAI(apiKey)
} catch (error) {
  console.error('Failed to initialize GoogleGenerativeAI:', error)
  throw error
}

export async function POST(request: NextRequest) {
  let resumeData: any = null
  
  try {
    const requestData = await request.json()
    const { jobDescription, jobTitle, companyName, specialInstructions } = requestData
    resumeData = requestData.resumeData

    // Validate required fields
    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    if (!resumeData || !resumeData.personalInfo) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      )
    }

    // Prepare resume summary for AI
    const resumeSummary = formatResumeForAI(resumeData)

    // Create the AI prompt
    const prompt = createCoverLetterPrompt(jobDescription, resumeSummary, jobTitle, companyName, specialInstructions)

    // Generate cover letter using Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    const result = await model.generateContent(prompt)
    const coverLetterContent = result.response.text()

    // Also generate resume optimization suggestions
    const optimizationPrompt = createResumeOptimizationPrompt(jobDescription, resumeSummary)
    const optimizationResult = await model.generateContent(optimizationPrompt)
    let optimizationSuggestions = []
    
    try {
      optimizationSuggestions = JSON.parse(optimizationResult.response.text())
    } catch (parseError) {
      // If JSON parsing fails, provide default suggestions
      optimizationSuggestions = [
        "Consider adding more keywords from the job description to your resume",
        "Highlight relevant achievements and quantifiable results",
        "Ensure your skills section aligns with the job requirements"
      ]
    }

    return NextResponse.json({
      coverLetter: coverLetterContent.trim(),
      resumeOptimizationSuggestions: optimizationSuggestions
    })

  } catch (error) {
    console.error('Cover letter generation error:', error)
    
    // Return fallback content if AI fails
    const fallbackCoverLetter = createFallbackCoverLetter(resumeData)
    const fallbackSuggestions = [
      "Review the job description and align your skills accordingly",
      "Add specific achievements and measurable results",
      "Include relevant keywords from the job posting",
      "Consider reorganizing sections to highlight most relevant experience first"
    ]

    return NextResponse.json({
      coverLetter: fallbackCoverLetter,
      resumeOptimizationSuggestions: fallbackSuggestions,
      fallback: true
    })
  }
}

function formatResumeForAI(resumeData: any): string {
  const { personalInfo, experience, education, skills, projects } = resumeData

  return `
Personal Information:
Name: ${personalInfo.name}
Title: ${personalInfo.title}
Email: ${personalInfo.email}
Location: ${personalInfo.location}
Summary: ${personalInfo.summary}

Experience:
${experience?.map((exp: any, index: number) => `
${index + 1}. ${exp.jobTitle} at ${exp.company}
   Duration: ${exp.date}
   Responsibilities: ${exp.responsibilities}
`).join('') || 'No experience listed'}

Education:
${education?.map((edu: any, index: number) => `
${index + 1}. ${edu.degree} - ${edu.school} (${edu.date})
`).join('') || 'No education listed'}

Skills:
Technical: ${skills?.languages || ''} ${skills?.frameworks || ''} ${skills?.tools || ''}
Other: ${skills?.other || ''}

Projects:
${projects?.map((proj: any, index: number) => `
${index + 1}. ${proj.name}
   Description: ${proj.description}
   Technologies: ${proj.technologies || ''}
`).join('') || 'No projects listed'}
  `.trim()
}

function createCoverLetterPrompt(jobDescription: string, resumeSummary: string, jobTitle?: string, companyName?: string, specialInstructions?: string): string {
  // Extract candidate name from resume summary
  const nameMatch = resumeSummary.match(/Name:\s*([^\n]+)/)
  const candidateName = nameMatch ? nameMatch[1].trim() : 'the candidate'
  
  return `
Write a professional cover letter based on the following information:

Job Description:
${jobDescription}

${jobTitle ? `Job Title: ${jobTitle}` : ''}
${companyName ? `Company: ${companyName}` : ''}

${specialInstructions ? `Special Instructions from the candidate:
${specialInstructions}

Please incorporate these special instructions naturally into the cover letter.
` : ''}

Candidate's Resume:
${resumeSummary}

CRITICAL REQUIREMENTS for the cover letter:
1. Keep it professional and concise (3-4 paragraphs, around 300-400 words)
2. Start with a strong opening that mentions the specific role ${jobTitle ? `(${jobTitle})` : ''} ${companyName ? `at ${companyName}` : ''}
3. Highlight relevant experience and skills from the resume that match the job requirements
4. Show enthusiasm for the role and company
5. Include specific examples of achievements when possible
6. End with a professional closing and call to action
7. Use a professional tone throughout
8. Make it ATS-friendly
9. DO NOT use ANY placeholders like [Your Name], [Company Name], [Position], etc.
10. Use the candidate's actual name: "${candidateName}"
11. Write as if this is the final version - no brackets, no placeholder text
12. End with "Sincerely," followed by "${candidateName}" (the candidate's actual name)
13. Never include placeholder text in square brackets or parentheses
14. Make sure every part of the letter is complete and ready to send

Format the letter with proper paragraphs but without formal letter headers (no addresses or dates).
Start directly with "Dear Hiring Manager," or similar greeting.

IMPORTANT: Generate a complete, ready-to-send cover letter with NO placeholders whatsoever. Use the candidate's real name "${candidateName}" at the end.
  `.trim()
}

function createResumeOptimizationPrompt(jobDescription: string, resumeSummary: string): string {
  return `
Analyze the job description against the candidate's resume and provide specific optimization suggestions.

Job Description:
${jobDescription}

Current Resume:
${resumeSummary}

Please provide exactly 5 actionable suggestions to optimize this resume for the specific job. Format your response as a JSON array of strings, like this:
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"]

Focus on:
- Keywords that should be added
- Skills that should be emphasized
- Experience that should be highlighted
- Sections that could be reorganized
- Specific achievements that would be valuable

Make each suggestion specific and actionable.
  `.trim()
}

function createFallbackCoverLetter(resumeData?: any): string {
  // Extract the candidate's name from resume data
  const candidateName = resumeData?.personalInfo?.name || 'the applicant'
  
  return `Dear Hiring Manager,

I am writing to express my strong interest in this position. After reviewing the job description, I am excited about the opportunity to contribute to your team with my skills and experience.

Throughout my career, I have developed a strong foundation in the key areas mentioned in your job posting. My background has equipped me with the technical skills and professional experience necessary to excel in this role. I am particularly drawn to the challenges and opportunities this position offers, and I believe my proven track record of delivering results makes me an ideal candidate.

I am confident that my dedication, skills, and enthusiasm make me a strong candidate for this position. I would welcome the opportunity to discuss how my experience and passion can contribute to your team's success and help drive your organization's objectives forward.

Thank you for considering my application. I look forward to hearing from you soon and discussing how I can contribute to your team.

Sincerely,
${candidateName}`
}
