/**
 * ATS Resume Exporter - Template Configurations
 * 
 * These templates are designed specifically for ATS (Applicant Tracking System) compatibility.
 * Key ATS-friendly features:
 * - Simple, single-column layouts
 * - Standard fonts (Helvetica, Times New Roman)
 * - Clear section headers with standard naming
 * - No graphics, tables, or complex formatting
 * - Proper text hierarchy and structure
 */

import type { ATSTemplateConfig, ATSTemplateId } from './types'

// ============================================================================
// ATS Template Configurations
// ============================================================================

export const ATS_TEMPLATES: Record<ATSTemplateId, ATSTemplateConfig> = {
  'ats-professional': {
    id: 'ats-professional',
    name: 'ATS Professional',
    description: 'Clean, professional layout optimized for maximum ATS compatibility',
    category: 'professional',
    font: 'helvetica',
    colors: {
      primary: '#1a1a1a',
      secondary: '#333333',
      text: '#000000',
      muted: '#555555',
      accent: '#2563eb'
    },
    spacing: {
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 20,
      marginRight: 20,
      sectionGap: 12,
      itemGap: 8,
      lineHeight: 1.4
    },
    fonts: {
      name: { size: 22, weight: 'bold' },
      title: { size: 12, weight: 'normal' },
      sectionHeader: { size: 12, weight: 'bold' },
      itemHeader: { size: 11, weight: 'bold' },
      body: { size: 10, weight: 'normal' },
      small: { size: 9, weight: 'normal' }
    },
    features: {
      showLines: true,
      showBullets: true,
      centeredHeader: true,
      showIcons: false,
      compactMode: false
    },
    atsScore: 98
  },

  'ats-modern': {
    id: 'ats-modern',
    name: 'ATS Modern',
    description: 'Contemporary design with clean lines, fully ATS compliant',
    category: 'modern',
    font: 'helvetica',
    colors: {
      primary: '#0f172a',
      secondary: '#334155',
      text: '#1e293b',
      muted: '#64748b',
      accent: '#3b82f6'
    },
    spacing: {
      marginTop: 18,
      marginBottom: 18,
      marginLeft: 22,
      marginRight: 22,
      sectionGap: 10,
      itemGap: 6,
      lineHeight: 1.35
    },
    fonts: {
      name: { size: 24, weight: 'bold' },
      title: { size: 11, weight: 'normal' },
      sectionHeader: { size: 11, weight: 'bold' },
      itemHeader: { size: 10, weight: 'bold' },
      body: { size: 9.5, weight: 'normal' },
      small: { size: 8.5, weight: 'normal' }
    },
    features: {
      showLines: true,
      showBullets: true,
      centeredHeader: false,
      showIcons: false,
      compactMode: true
    },
    atsScore: 96
  },

  'ats-executive': {
    id: 'ats-executive',
    name: 'ATS Executive',
    description: 'Premium executive layout for senior professionals, ATS optimized',
    category: 'executive',
    font: 'times',
    colors: {
      primary: '#1a1a1a',
      secondary: '#2d2d2d',
      text: '#000000',
      muted: '#4a4a4a',
      accent: '#1e3a5f'
    },
    spacing: {
      marginTop: 25,
      marginBottom: 25,
      marginLeft: 25,
      marginRight: 25,
      sectionGap: 14,
      itemGap: 10,
      lineHeight: 1.5
    },
    fonts: {
      name: { size: 26, weight: 'bold' },
      title: { size: 13, weight: 'normal' },
      sectionHeader: { size: 13, weight: 'bold' },
      itemHeader: { size: 11, weight: 'bold' },
      body: { size: 10.5, weight: 'normal' },
      small: { size: 9.5, weight: 'normal' }
    },
    features: {
      showLines: true,
      showBullets: true,
      centeredHeader: true,
      showIcons: false,
      compactMode: false
    },
    atsScore: 97
  },

  'ats-minimal': {
    id: 'ats-minimal',
    name: 'ATS Minimal',
    description: 'Ultra-clean minimalist design, highest ATS compatibility',
    category: 'minimal',
    font: 'helvetica',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      text: '#000000',
      muted: '#666666',
      accent: '#000000'
    },
    spacing: {
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 20,
      marginRight: 20,
      sectionGap: 10,
      itemGap: 6,
      lineHeight: 1.3
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
      showLines: false,
      showBullets: true,
      centeredHeader: true,
      showIcons: false,
      compactMode: true
    },
    atsScore: 100
  },

  'ats-technical': {
    id: 'ats-technical',
    name: 'ATS Technical',
    description: 'Optimized for technical roles with skills emphasis',
    category: 'technical',
    font: 'helvetica',
    colors: {
      primary: '#111827',
      secondary: '#374151',
      text: '#1f2937',
      muted: '#6b7280',
      accent: '#2563eb'
    },
    spacing: {
      marginTop: 18,
      marginBottom: 18,
      marginLeft: 20,
      marginRight: 20,
      sectionGap: 10,
      itemGap: 6,
      lineHeight: 1.35
    },
    fonts: {
      name: { size: 22, weight: 'bold' },
      title: { size: 11, weight: 'normal' },
      sectionHeader: { size: 11, weight: 'bold' },
      itemHeader: { size: 10, weight: 'bold' },
      body: { size: 9, weight: 'normal' },
      small: { size: 8.5, weight: 'normal' }
    },
    features: {
      showLines: true,
      showBullets: true,
      centeredHeader: false,
      showIcons: false,
      compactMode: true
    },
    atsScore: 97
  },

  'ats-classic': {
    id: 'ats-classic',
    name: 'ATS Classic',
    description: 'Traditional resume format, universally compatible',
    category: 'classic',
    font: 'times',
    colors: {
      primary: '#1a1a1a',
      secondary: '#333333',
      text: '#000000',
      muted: '#555555',
      accent: '#1a1a1a'
    },
    spacing: {
      marginTop: 22,
      marginBottom: 22,
      marginLeft: 22,
      marginRight: 22,
      sectionGap: 12,
      itemGap: 8,
      lineHeight: 1.45
    },
    fonts: {
      name: { size: 24, weight: 'bold' },
      title: { size: 12, weight: 'normal' },
      sectionHeader: { size: 12, weight: 'bold' },
      itemHeader: { size: 11, weight: 'bold' },
      body: { size: 10, weight: 'normal' },
      small: { size: 9, weight: 'normal' }
    },
    features: {
      showLines: true,
      showBullets: true,
      centeredHeader: true,
      showIcons: false,
      compactMode: false
    },
    atsScore: 99
  }
}

// ============================================================================
// Template Utilities
// ============================================================================

/**
 * Get template configuration by ID
 */
export function getATSTemplate(id: ATSTemplateId): ATSTemplateConfig {
  return ATS_TEMPLATES[id] || ATS_TEMPLATES['ats-professional']
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
 */
export function mapLegacyTemplateId(legacyId: string): ATSTemplateId {
  const mapping: Record<string, ATSTemplateId> = {
    'classic': 'ats-classic',
    'modern': 'ats-modern',
    'creative': 'ats-modern',
    'minimal': 'ats-minimal',
    'executive': 'ats-executive',
    'tech': 'ats-technical',
    'photo': 'ats-professional'
  }
  return mapping[legacyId] || 'ats-professional'
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
