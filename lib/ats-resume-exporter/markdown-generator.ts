/**
 * ATS Resume Exporter - Markdown Generator
 * 
 * Generates clean, professional Markdown resumes.
 * The output is well-structured and can be easily converted to other formats.
 */

import type { ResumeData } from './types'

/**
 * Parse responsibilities/descriptions into bullet points
 */
function parseResponsibilities(text: string): string[] {
  if (!text) return []
  
  const lines = text.split(/[\n\r]+|(?:^|\s)[•\-\*]\s|(?:^|\s)\d+\.\s/)
    .map(line => line.trim())
    .filter(line => line.length > 0)

  return lines.length > 0 ? lines : [text.trim()]
}

/**
 * Generate Markdown document for resume
 */
export function generateResumeMarkdown(data: ResumeData): string {
  const { personalInfo, links, education, experience, skills, projects, certifications, references } = data
  
  const sections: string[] = []

  // Header
  sections.push(`# ${personalInfo.name || 'Your Name'}`)
  
  if (personalInfo.title) {
    sections.push(`**${personalInfo.title}**`)
  }
  
  // Contact info
  const contactParts: string[] = []
  if (personalInfo.email) contactParts.push(`📧 [${personalInfo.email}](mailto:${personalInfo.email})`)
  if (personalInfo.phone) contactParts.push(`📱 ${personalInfo.phone}`)
  if (personalInfo.location) contactParts.push(`📍 ${personalInfo.location}`)
  
  if (contactParts.length > 0) {
    sections.push('')
    sections.push(contactParts.join(' | '))
  }
  
  // Links
  const validLinks = links.filter(link => link.name && link.url)
  if (validLinks.length > 0) {
    const linkParts = validLinks.map(link => `[${link.name}](${link.url})`)
    sections.push(linkParts.join(' | '))
  }
  
  sections.push('')
  sections.push('---')

  // Summary
  if (personalInfo.summary?.trim()) {
    sections.push('')
    sections.push('## Summary')
    sections.push('')
    sections.push(personalInfo.summary)
  }

  // Technical Skills
  const hasSkills = skills.languages?.trim() || skills.frameworks?.trim() || skills.tools?.trim()
  if (hasSkills) {
    sections.push('')
    sections.push('## Technical Skills')
    sections.push('')
    
    if (skills.languages?.trim()) {
      sections.push(`- **Programming Languages:** ${skills.languages}`)
    }
    if (skills.frameworks?.trim()) {
      sections.push(`- **Frameworks & Libraries:** ${skills.frameworks}`)
    }
    if (skills.tools?.trim()) {
      sections.push(`- **Tools & Platforms:** ${skills.tools}`)
    }
  }

  // Experience
  const validExperience = experience.filter(exp => exp.jobTitle && exp.company)
  if (validExperience.length > 0) {
    sections.push('')
    sections.push('## Professional Experience')
    
    validExperience.forEach(exp => {
      sections.push('')
      sections.push(`### ${exp.jobTitle}`)
      
      const metaLine = [exp.company]
      if (exp.location) metaLine.push(exp.location)
      if (exp.date) metaLine.push(exp.date)
      sections.push(`**${metaLine.join(' | ')}**`)
      sections.push('')
      
      if (exp.responsibilities) {
        const responsibilities = parseResponsibilities(exp.responsibilities)
        responsibilities.forEach(resp => {
          sections.push(`- ${resp}`)
        })
      }
    })
  }

  // Projects
  const validProjects = projects.filter(proj => proj.name)
  if (validProjects.length > 0) {
    sections.push('')
    sections.push('## Projects')
    
    validProjects.forEach(proj => {
      sections.push('')
      
      if (proj.link) {
        sections.push(`### [${proj.name}](${proj.link})`)
      } else {
        sections.push(`### ${proj.name}`)
      }
      
      if (proj.technologies) {
        sections.push(`*${proj.technologies}*`)
        sections.push('')
      }
      
      if (proj.description) {
        const descLines = parseResponsibilities(proj.description)
        descLines.forEach(line => {
          sections.push(`- ${line}`)
        })
      }
    })
  }

  // Education
  const validEducation = education.filter(edu => edu.school && edu.degree)
  if (validEducation.length > 0) {
    sections.push('')
    sections.push('## Education')
    
    validEducation.forEach(edu => {
      sections.push('')
      sections.push(`### ${edu.school}`)
      
      const degreeLine = [edu.degree]
      if (edu.date) degreeLine.push(edu.date)
      sections.push(`**${degreeLine.join(' | ')}**`)
      
      if (edu.gpa) {
        sections.push(`- GPA: ${edu.gpa}`)
      }
      if (edu.honors) {
        sections.push(`- ${edu.honors}`)
      }
    })
  }

  // Certifications
  const validCertifications = certifications.filter(cert => cert.name)
  if (validCertifications.length > 0) {
    sections.push('')
    sections.push('## Certifications')
    sections.push('')
    
    validCertifications.forEach(cert => {
      let certLine = `- **${cert.name}**`
      if (cert.issuer) certLine += ` - ${cert.issuer}`
      if (cert.date) certLine += ` (${cert.date})`
      sections.push(certLine)
    })
  }

  // References
  const validReferences = references.filter(ref => ref.name)
  if (validReferences.length > 0) {
    sections.push('')
    sections.push('## References')
    
    validReferences.forEach(ref => {
      sections.push('')
      sections.push(`### ${ref.name}`)
      
      if (ref.title || ref.company) {
        const titleLine = ref.company 
          ? `${ref.title} at ${ref.company}`
          : ref.title
        sections.push(`*${titleLine}*`)
      }
      
      const contactInfo: string[] = []
      if (ref.email) contactInfo.push(`📧 ${ref.email}`)
      if (ref.phone) contactInfo.push(`📱 ${ref.phone}`)
      
      if (contactInfo.length > 0) {
        sections.push(contactInfo.join(' | '))
      }
    })
  }

  // Footer
  sections.push('')
  sections.push('---')
  sections.push(`*Generated on ${new Date().toLocaleDateString()}*`)

  return sections.join('\n')
}

/**
 * Download Markdown file
 */
export function downloadResumeMarkdown(data: ResumeData, filename?: string): void {
  const markdown = generateResumeMarkdown(data)
  const name = filename || generateMarkdownFilename(data)
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename for Markdown export
 */
function generateMarkdownFilename(data: ResumeData): string {
  const name = data.personalInfo.name || 'Resume'
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_')
  const date = new Date().toISOString().split('T')[0]
  return `${cleanName}_Resume_${date}.md`
}
