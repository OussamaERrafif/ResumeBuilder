import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Function to safely import pdf-parse
const parsePDF = async (buffer: Buffer): Promise<string> => {
  try {
    // Dynamic import to avoid compilation issues
    const pdfParse = await import('pdf-parse').then(mod => mod.default)
    const data = await pdfParse(buffer)
    return data.text || ''
  } catch (error) {
    console.error('PDF parsing failed:', error)
    throw new Error('Unable to parse PDF file')
  }
}

interface ParsedResumeData {
  personalInfo: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    summary: string
  }
  links: Array<{
    name: string
    url: string
  }>
  education: Array<{
    school: string
    degree: string
    date: string
    gpa?: string
  }>
  experience: Array<{
    jobTitle: string
    company: string
    date: string
    responsibilities: string
  }>
  skills: {
    languages: string
    frameworks: string
    tools: string
  }
  projects: Array<{
    name: string
    description: string
    technologies: string
    link?: string
  }>
  certifications: Array<{
    name: string
    issuer: string
    date: string
  }>
  references: Array<{
    name: string
    title: string
    company: string
    email: string
    phone: string
  }>
}

const getParsingPrompt = (resumeText: string) => {
  return `
Extract structured information from this resume text and return it as valid JSON.

Resume Text:
${resumeText}

Return ONLY the JSON object in this exact format:

{
  "personalInfo": {
    "name": "Full Name",
    "title": "Professional Title",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State/Country", 
    "summary": "Professional summary"
  },
  "links": [
    {
      "name": "LinkedIn",
      "url": "https://linkedin.com/in/profile"
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree Name",
      "date": "Graduation Date",
      "gpa": "GPA if available"
    }
  ],
  "experience": [
    {
      "jobTitle": "Job Title",
      "company": "Company Name", 
      "date": "Employment Period",
      "responsibilities": "Key responsibilities and achievements"
    }
  ],
  "skills": {
    "languages": "Programming languages",
    "frameworks": "Frameworks and libraries",
    "tools": "Tools and technologies"
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": "Technologies used",
      "link": "Project URL if available"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Issue Date"
    }
  ],
  "references": [
    {
      "name": "Reference Name",
      "title": "Reference Title",
      "company": "Reference Company",
      "email": "reference@email.com",
      "phone": "reference phone"
    }
  ]
}

Rules:
- If field not found, use empty string "" for strings or empty array [] for arrays
- Extract information exactly as it appears
- Combine multiple bullet points with semicolons
- Return ONLY valid JSON, no markdown or additional text
`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', success: false },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOC, or DOCX files only.', success: false },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.', success: false },
        { status: 400 }
      )
    }

    let extractedText = ''

    // Extract text from PDF
    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        extractedText = await parsePDF(buffer)
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError)
        return NextResponse.json(
          { error: 'Failed to extract text from PDF. Please ensure the file is not corrupted.', success: false },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Currently only PDF files are supported. Please convert your document to PDF.', success: false },
        { status: 400 }
      )
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file.', success: false },
        { status: 400 }
      )
    }

    // Parse with AI
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI parsing service is not configured.', success: false },
        { status: 500 }
      )
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
      const prompt = getParsingPrompt(extractedText)
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse JSON response
      let parsedData: ParsedResumeData
      try {
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        parsedData = JSON.parse(cleanText)
        
        if (!parsedData.personalInfo) {
          throw new Error('Missing personalInfo in parsed data')
        }
        
      } catch (parseError) {
        throw new Error('Failed to parse AI response into structured data')
      }

      return NextResponse.json({
        success: true,
        data: parsedData,
        extractedText: extractedText.substring(0, 1000)
      })

    } catch (aiError) {
      return NextResponse.json(
        { 
          error: 'Failed to parse resume with AI. Please ensure the resume is clearly formatted.', 
          success: false
        },
        { status: 500 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while processing your resume.', 
        success: false
      },
      { status: 500 }
    )
  }
}
