/**
 * ATS Resume Exporter - Template Configurations
 * 
 * These templates match the 5 LaTeX templates from tempalte.ltx.
 * Each template is designed for ATS (Applicant Tracking System) compatibility
 * while maintaining the visual style of the corresponding LaTeX template.
 */

import type { ATSTemplateConfig, ATSTemplateId } from './types'

// ============================================================================
// ATS Template Configurations - Matching LaTeX Templates
// ============================================================================

export const ATS_TEMPLATES: Record<ATSTemplateId, ATSTemplateConfig> = {
  // LaTeX Template 1: Classic (Lines 1-130)
  // Roboto font, centered header, pipe separators, titlerule sections
  'ats-classic': {
    id: 'ats-classic',
    name: 'Classic Professional',
    description: 'Clean single-column layout with centered header and section underlines (LaTeX Template 1)',
    category: 'classic',
    font: 'helvetica', // Closest to Roboto
    colors: {
      primary: '#1f2937',
      secondary: '#4b5563',
      text: '#111827',
      muted: '#6b7280',
      accent: '#374151'
    },
    spacing: {
      marginTop: 15,
      marginBottom: 15,
      marginLeft: 15,
      marginRight: 15,
      sectionGap: 6,
      itemGap: 4,
      lineHeight: 1.4
    },
    fonts: {
      name: { size: 20, weight: 'bold' },
      title: { size: 11, weight: 'normal' },
      sectionHeader: { size: 11, weight: 'bold' },
      itemHeader: { size: 10, weight: 'bold' },
      body: { size: 9, weight: 'normal' },
      small: { size: 8, weight: 'normal' }
    },
    features: {
      showLines: true,  // titlerule
      showBullets: true,
      centeredHeader: true,
      showIcons: false,
      compactMode: false
    },
    atsScore: 98
  },

  // LaTeX Template 2: MaltaCV/Creative (Lines 131-337)
  // Colorful flame orange, bio section, multicol skills
  'ats-creative': {
    id: 'ats-creative',
    name: 'Creative MaltaCV',
    description: 'Colorful design with bio section and multi-column skill grid (LaTeX Template 2)',
    category: 'creative',
    font: 'helvetica', // tgheros/sans-serif
    colors: {
      primary: '#e85d04',  // flame
      secondary: '#232323', // raisinblack
      text: '#1f2937',
      muted: '#6b7280',
      accent: '#f48c06'
    },
    spacing: {
      marginTop: 15,
      marginBottom: 15,
      marginLeft: 15,
      marginRight: 15,
      sectionGap: 8,
      itemGap: 5,
      lineHeight: 1.35
    },
    fonts: {
      name: { size: 22, weight: 'bold' },
      title: { size: 11, weight: 'normal' },
      sectionHeader: { size: 11, weight: 'bold' },
      itemHeader: { size: 10, weight: 'bold' },
      body: { size: 9, weight: 'normal' },
      small: { size: 8, weight: 'normal' }
    },
    features: {
      showLines: true,
      showBullets: true,
      centeredHeader: false,
      showIcons: false,
      compactMode: false
    },
    atsScore: 95
  },

  // LaTeX Template 3: Jitin Nair/Minimal (Lines 338-556)
  // Clean black/white, dash bullets, tabularx
  'ats-minimal': {
    id: 'ats-minimal',
    name: 'Minimal Clean',
    description: 'Ultra-clean design with dash bullets and icon-style contact info (LaTeX Template 3)',
    category: 'minimal',
    font: 'times',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      text: '#000000',
      muted: '#666666',
      accent: '#0066cc'  // linkcolour
    },
    spacing: {
      marginTop: 15,
      marginBottom: 15,
      marginLeft: 15,
      marginRight: 15,
      sectionGap: 5,
      itemGap: 3,
      lineHeight: 1.3
    },
    fonts: {
      name: { size: 22, weight: 'bold' },
      title: { size: 10, weight: 'normal' },
      sectionHeader: { size: 12, weight: 'bold' },
      itemHeader: { size: 10, weight: 'bold' },
      body: { size: 9, weight: 'normal' },
      small: { size: 8, weight: 'normal' }
    },
    features: {
      showLines: true,
      showBullets: false,  // Uses dash bullets instead
      centeredHeader: true,
      showIcons: false,
      compactMode: true
    },
    atsScore: 100
  },

  // LaTeX Template 4: Anubhav Singh/Modern (Lines 557-739)
  // Detailed subheadings, skills with alignment, tech focus
  'ats-modern': {
    id: 'ats-modern',
    name: 'Modern Developer',
    description: 'Detailed tech-focused layout with aligned skills and project highlights (LaTeX Template 4)',
    category: 'modern',
    font: 'times',
    colors: {
      primary: '#1f2937',
      secondary: '#374151',
      text: '#111827',
      muted: '#6b7280',
      accent: '#3b82f6'
    },
    spacing: {
      marginTop: 15,
      marginBottom: 15,
      marginLeft: 15,
      marginRight: 15,
      sectionGap: 5,
      itemGap: 4,
      lineHeight: 1.35
    },
    fonts: {
      name: { size: 20, weight: 'bold' },
      title: { size: 10, weight: 'normal' },
      sectionHeader: { size: 11, weight: 'bold' },
      itemHeader: { size: 10, weight: 'bold' },
      body: { size: 9, weight: 'normal' },
      small: { size: 8, weight: 'normal' }
    },
    features: {
      showLines: true,
      showBullets: true,
      centeredHeader: false,  // Left-aligned header
      showIcons: false,
      compactMode: true
    },
    atsScore: 97
  },

  // LaTeX Template 5: LuxSleek/Photo (Lines 740-933)
  // Two-column with dark navy sidebar, profile photo, FiraSans
  'ats-photo': {
    id: 'ats-photo',
    name: 'LuxSleek Sidebar',
    description: 'Two-column layout with dark navy sidebar featuring profile and contact (LaTeX Template 5)',
    category: 'executive',  // Premium category
    font: 'helvetica',  // FiraSans
    colors: {
      primary: '#304263',  // cvblue
      secondary: '#1e3a5f',
      text: '#1f2937',
      muted: '#6b7280',
      accent: '#4a6fa5'
    },
    spacing: {
      marginTop: 0,  // No traditional margins for sidebar layout
      marginBottom: 15,
      marginLeft: 0,
      marginRight: 15,
      sectionGap: 6,
      itemGap: 4,
      lineHeight: 1.4
    },
    fonts: {
      name: { size: 14, weight: 'bold' },
      title: { size: 10, weight: 'normal' },
      sectionHeader: { size: 11, weight: 'bold' },
      itemHeader: { size: 9, weight: 'bold' },
      body: { size: 8, weight: 'normal' },
      small: { size: 7, weight: 'normal' }
    },
    features: {
      showLines: true,
      showBullets: true,
      centeredHeader: false,
      showIcons: false,
      compactMode: false
    },
    atsScore: 92  // Lower due to two-column being less ATS-friendly
  }
}

// ============================================================================
// Template Utilities
// ============================================================================

/**
 * Get template configuration by ID
 */
export function getATSTemplate(id: ATSTemplateId): ATSTemplateConfig {
  return ATS_TEMPLATES[id] || ATS_TEMPLATES['ats-classic']
}

/**
 * Get all ATS templates as an array
 */
export function getAllATSTemplates(): ATSTemplateConfig[] {
  return Object.values(ATS_TEMPLATES)
}

/**
 * Get templates sorted by ATS score
 */
export function getTemplatesByATSScore(): ATSTemplateConfig[] {
  return getAllATSTemplates().sort((a, b) => b.atsScore - a.atsScore)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: ATSTemplateConfig['category']): ATSTemplateConfig[] {
  return getAllATSTemplates().filter(t => t.category === category)
}

/**
 * Map legacy template IDs to ATS template IDs
 * Maps the 5 LaTeX template names to ATS template IDs
 */
export function mapLegacyTemplateId(legacyId: string): ATSTemplateId {
  const mapping: Record<string, ATSTemplateId> = {
    'classic': 'ats-classic',
    'creative': 'ats-creative',
    'minimal': 'ats-minimal',
    'modern': 'ats-modern',
    'photo': 'ats-photo',
    // Legacy mappings for backward compatibility
    'executive': 'ats-classic',
    'tech': 'ats-modern',
    'professional': 'ats-classic'
  }
  return mapping[legacyId] || 'ats-classic'
}

// ============================================================================
// ATS Optimization Tips
// ============================================================================

export const ATS_TIPS = [
  'Use standard section headers like "Experience", "Education", "Skills"',
  'Avoid graphics, images, charts, and tables',
  'Use standard fonts: Arial, Calibri, Times New Roman',
  'Include keywords from the job description',
  'Use bullet points for achievements and responsibilities',
  'Avoid headers and footers',
  'Use standard date formats (Month Year - Month Year)',
  'Include full job titles and company names',
  'Spell out acronyms at first use',
  'Use .pdf or .docx format (not .pages or images)'
]

export const STANDARD_SECTION_NAMES = {
  summary: ['PROFESSIONAL SUMMARY', 'SUMMARY', 'PROFILE', 'ABOUT'],
  experience: ['PROFESSIONAL EXPERIENCE', 'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT HISTORY'],
  education: ['EDUCATION', 'ACADEMIC BACKGROUND', 'EDUCATIONAL BACKGROUND'],
  skills: ['SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'QUALIFICATIONS'],
  projects: ['PROJECTS', 'KEY PROJECTS', 'PORTFOLIO'],
  certifications: ['CERTIFICATIONS', 'LICENSES', 'PROFESSIONAL CERTIFICATIONS'],
  references: ['REFERENCES']
}
