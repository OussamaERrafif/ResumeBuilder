/**
 * ATS Resume Exporter - Main Entry Point
 * 
 * This module provides a clean, simple API for generating ATS-friendly resume exports.
 * Supports PDF, LaTeX, Markdown, and DOCX formats.
 * It handles the mapping from legacy templates to ATS templates and provides
 * utility functions for export.
 */

import { ATSPDFGenerator, downloadATSResumePDF } from './pdf-generator'
import { generateResumeLatex, downloadResumeLatex } from './latex-generator'
import { generateResumeMarkdown, downloadResumeMarkdown } from './markdown-generator'
import { downloadResumeDocx, isDocxExportAvailable } from './docx-generator'
import { 
  ATS_TEMPLATES, 
  getATSTemplate, 
  getAllATSTemplates,
  mapLegacyTemplateId,
  ATS_TIPS 
} from './templates'
import type {
  ResumeData,
  ATSTemplateConfig,
  ATSTemplateId,
  ExportOptions,
  ExportResult
} from './types'

// Re-export types
export type {
  ResumeData,
  ATSTemplateConfig,
  ATSTemplateId,
  ExportOptions,
  ExportResult,
  PersonalInfo,
  Link,
  Education,
  Experience,
  Skills,
  Project,
  Certification,
  Reference
} from './types'

// Re-export template utilities
export {
  ATS_TEMPLATES,
  getATSTemplate,
  getAllATSTemplates,
  mapLegacyTemplateId,
  ATS_TIPS
} from './templates'

// Re-export generators
export { ATSPDFGenerator, downloadATSResumePDF } from './pdf-generator'
export { generateResumeLatex, downloadResumeLatex } from './latex-generator'
export { generateResumeMarkdown, downloadResumeMarkdown } from './markdown-generator'
export { downloadResumeDocx, isDocxExportAvailable } from './docx-generator'

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Main export function - handles legacy template mapping and PDF generation
 * 
 * @param templateId - Template ID (can be legacy or ATS template ID)
 * @param data - Resume data
 * @param options - Export options
 * @returns Export result with success status
 */
export async function exportResumePDF(
  templateId: string,
  data: ResumeData,
  options: ExportOptions = {}
): Promise<ExportResult> {
  try {
    // Map legacy template ID to ATS template if needed
    const atsTemplateId = templateId.startsWith('ats-') 
      ? templateId as ATSTemplateId
      : mapLegacyTemplateId(templateId)
    
    // Get template configuration
    const template = getATSTemplate(atsTemplateId)
    
    // Create generator
    const generator = new ATSPDFGenerator(template, data)
    
    // Generate filename
    const filename = options.filename || generateFilename(data, template)
    
    // Download PDF
    generator.download(filename)
    
    return {
      success: true,
      filename,
      format: 'pdf',
      pages: generator.getPageCount(),
      atsScore: template.atsScore
    }
  } catch (error) {
    return {
      success: false,
      filename: '',
      format: 'pdf',
      pages: 0,
      atsScore: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Export resume PDF with specific ATS template
 */
export async function exportWithATSTemplate(
  templateId: ATSTemplateId,
  data: ResumeData,
  options: ExportOptions = {}
): Promise<ExportResult> {
  return exportResumePDF(templateId, data, options)
}

/**
 * Export resume PDF using legacy template ID (for backward compatibility)
 */
export async function exportWithLegacyTemplate(
  legacyTemplateId: string,
  data: ResumeData,
  options: ExportOptions = {}
): Promise<ExportResult> {
  const atsTemplateId = mapLegacyTemplateId(legacyTemplateId)
  return exportResumePDF(atsTemplateId, data, options)
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a clean filename for the PDF
 */
function generateFilename(data: ResumeData, template: ATSTemplateConfig): string {
  const name = data.personalInfo.name || 'Resume'
  const cleanName = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
  
  const date = new Date().toISOString().split('T')[0]
  return `${cleanName}_Resume_${date}.pdf`
}

/**
 * Get ATS score for a given resume
 * Higher scores indicate better ATS compatibility
 */
export function getATSScore(data: ResumeData): number {
  let score = 100
  const issues: string[] = []

  // Check for essential sections
  if (!data.personalInfo.name) {
    score -= 10
    issues.push('Missing name')
  }
  if (!data.personalInfo.email) {
    score -= 10
    issues.push('Missing email')
  }
  if (!data.personalInfo.phone) {
    score -= 5
    issues.push('Missing phone')
  }
  if (!data.personalInfo.summary || data.personalInfo.summary.length < 50) {
    score -= 5
    issues.push('Summary too short or missing')
  }

  // Check experience
  const validExperience = data.experience.filter(exp => exp.jobTitle && exp.company)
  if (validExperience.length === 0) {
    score -= 15
    issues.push('No work experience')
  }

  // Check education
  const validEducation = data.education.filter(edu => edu.school && edu.degree)
  if (validEducation.length === 0) {
    score -= 10
    issues.push('No education listed')
  }

  // Check skills
  if (!data.skills.languages && !data.skills.frameworks && !data.skills.tools) {
    score -= 10
    issues.push('No skills listed')
  }

  // Bonus points
  if (data.certifications.filter(cert => cert.name).length > 0) {
    score += 3
  }
  if (data.projects.filter(proj => proj.name).length > 0) {
    score += 2
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Get ATS optimization suggestions for a resume
 */
export function getATSSuggestions(data: ResumeData): string[] {
  const suggestions: string[] = []

  // Personal info suggestions
  if (!data.personalInfo.summary || data.personalInfo.summary.length < 100) {
    suggestions.push('Add a comprehensive professional summary (100+ words) with relevant keywords')
  }
  if (!data.personalInfo.location) {
    suggestions.push('Add your location to help with local job matching')
  }

  // Experience suggestions
  const experiences = data.experience.filter(exp => exp.jobTitle)
  if (experiences.length === 0) {
    suggestions.push('Add work experience with job titles, companies, and dates')
  } else {
    experiences.forEach(exp => {
      if (!exp.responsibilities || exp.responsibilities.length < 50) {
        suggestions.push(`Add more details to "${exp.jobTitle}" role - include achievements with metrics`)
      }
    })
  }

  // Skills suggestions
  if (!data.skills.languages) {
    suggestions.push('Add programming languages to your skills section')
  }
  if (!data.skills.tools) {
    suggestions.push('Add tools and platforms you\'re proficient with')
  }

  // Education suggestions
  if (data.education.filter(edu => edu.school).length === 0) {
    suggestions.push('Add your educational background')
  }

  // General ATS tips
  if (suggestions.length < 3) {
    suggestions.push('Use keywords from job descriptions you\'re applying to')
    suggestions.push('Quantify achievements with numbers and percentages where possible')
  }

  return suggestions
}

/**
 * Validate resume data for ATS compatibility
 */
export function validateForATS(data: ResumeData): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!data.personalInfo.name?.trim()) {
    errors.push('Name is required')
  }
  if (!data.personalInfo.email?.trim()) {
    errors.push('Email is required')
  }

  // Recommended fields
  if (!data.personalInfo.phone?.trim()) {
    warnings.push('Phone number is recommended')
  }
  if (!data.personalInfo.title?.trim()) {
    warnings.push('Professional title is recommended')
  }
  if (!data.personalInfo.summary?.trim()) {
    warnings.push('Professional summary is highly recommended for ATS')
  }

  // Content checks
  const hasExperience = data.experience.some(exp => exp.jobTitle && exp.company)
  const hasEducation = data.education.some(edu => edu.school && edu.degree)
  const hasSkills = data.skills.languages || data.skills.frameworks || data.skills.tools

  if (!hasExperience) {
    warnings.push('Work experience helps ATS matching significantly')
  }
  if (!hasEducation) {
    warnings.push('Education section is typically expected by ATS')
  }
  if (!hasSkills) {
    errors.push('Skills section is required for technical positions')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================================================
// Template Preview Utilities
// ============================================================================

/**
 * Get template preview data for UI display
 */
export function getTemplatePreviewInfo(templateId: ATSTemplateId): {
  id: ATSTemplateId
  name: string
  description: string
  atsScore: number
  category: string
  features: string[]
} {
  const template = getATSTemplate(templateId)
  
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    atsScore: template.atsScore,
    category: template.category,
    features: [
      `ATS Score: ${template.atsScore}%`,
      template.features.showLines ? 'Section dividers' : 'Clean layout',
      template.features.showBullets ? 'Bullet points' : 'Paragraph format',
      template.features.centeredHeader ? 'Centered header' : 'Left-aligned header',
      template.features.compactMode ? 'Compact spacing' : 'Comfortable spacing'
    ]
  }
}

/**
 * Get all template previews
 */
export function getAllTemplatePreviews(): ReturnType<typeof getTemplatePreviewInfo>[] {
  return getAllATSTemplates().map(t => getTemplatePreviewInfo(t.id))
}
