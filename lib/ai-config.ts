/**
 * AI Configuration utilities
 */

export const AI_CONFIG = {
  // Gemini (commented out - using OpenAI instead)
  // GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: 'gpt-4o-mini', // or 'gpt-4o' for better quality
  
  isConfigured: () => Boolean(process.env.OPENAI_API_KEY),
  getProvider: () => 'OpenAI',
  getStatus: () => {
    if (!process.env.OPENAI_API_KEY) {
      return {
        configured: false,
        message: 'No API key configured. Add OPENAI_API_KEY to .env.local for AI features.'
      }
    }
    
    return {
      configured: true,
      message: 'AI features enabled with OpenAI'
    }
  }
}

/**
 * Content generation prompts for different resume sections
 */
export const AI_PROMPTS = {
  summary: (query: string) => `
    Write a professional resume summary (2-3 sentences) based on this description: "${query}". 
    Make it compelling, concise, and highlight key strengths. Focus on achievements and value proposition.
    Do not include any formatting or bullet points, just a clear paragraph.
    Make it ATS-friendly and impactful for recruiters.
  `.trim(),
  
  experience: (query: string) => `
    Generate 3-4 professional bullet points for a resume job experience section based on: "${query}".
    Each bullet point should:
    - Start with a strong action verb (Led, Developed, Implemented, Managed, etc.)
    - Include specific achievements or responsibilities
    - Be quantifiable where possible (use numbers, percentages, etc.)
    - Be relevant to the role described
    - Be ATS-friendly and use industry keywords
    Format as bullet points with • symbol.
  `.trim(),
  
  project: (query: string) => `
    Write a professional project description (2-3 sentences) for a resume based on: "${query}".
    Include:
    - What the project accomplished (business impact)
    - Technologies or methods used
    - Measurable results or outcomes achieved
    Keep it concise, professional, and ATS-friendly. 
    Do not use bullet points - write as a paragraph.
    Focus on technical skills and business value.
  `.trim()
}

/**
 * Validation for AI generation requests
 */
export const validateAIRequest = (type: string, query: string) => {
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
