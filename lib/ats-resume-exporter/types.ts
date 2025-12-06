/**
 * ATS Resume Exporter - Type Definitions
 * 
 * These types define the structure for ATS-friendly resume generation.
 * All templates and generators use these unified types.
 */

// ============================================================================
// Resume Data Types
// ============================================================================

export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  summary: string
  linkedin?: string
  website?: string
  profileImage?: string
}

export interface Link {
  name: string
  url: string
}

export interface Education {
  school: string
  degree: string
  date: string
  gpa?: string
  location?: string
  honors?: string
}

export interface Experience {
  jobTitle: string
  company: string
  date: string
  location?: string
  responsibilities: string
}

export interface Skills {
  languages: string
  frameworks: string
  tools: string
}

export interface Project {
  name: string
  description: string
  technologies: string
  link?: string
}

export interface Certification {
  name: string
  issuer: string
  date: string
}

export interface Reference {
  name: string
  title: string
  company: string
  email: string
  phone: string
}

export interface ResumeData {
  personalInfo: PersonalInfo
  links: Link[]
  education: Education[]
  experience: Experience[]
  skills: Skills
  projects: Project[]
  certifications: Certification[]
  references: Reference[]
}

// ============================================================================
// ATS Template Configuration
// ============================================================================

export type ATSTemplateId = 
  | 'ats-professional'
  | 'ats-modern'
  | 'ats-executive'
  | 'ats-minimal'
  | 'ats-technical'
  | 'ats-classic'

export type FontFamily = 'helvetica' | 'times' | 'courier'

export interface ATSTemplateColors {
  primary: string      // Main headings and name
  secondary: string    // Subheadings and titles
  text: string         // Body text
  muted: string        // Dates, subtle text
  accent: string       // Lines and separators
}

export interface ATSTemplateSpacing {
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  sectionGap: number
  itemGap: number
  lineHeight: number
}

export interface ATSTemplateFonts {
  name: { size: number; weight: 'normal' | 'bold' }
  title: { size: number; weight: 'normal' | 'bold' }
  sectionHeader: { size: number; weight: 'normal' | 'bold' }
  itemHeader: { size: number; weight: 'normal' | 'bold' }
  body: { size: number; weight: 'normal' | 'bold' }
  small: { size: number; weight: 'normal' | 'bold' }
}

export interface ATSTemplateConfig {
  id: ATSTemplateId
  name: string
  description: string
  category: 'professional' | 'modern' | 'executive' | 'minimal' | 'technical' | 'classic'
  font: FontFamily
  colors: ATSTemplateColors
  spacing: ATSTemplateSpacing
  fonts: ATSTemplateFonts
  features: {
    showLines: boolean
    showBullets: boolean
    centeredHeader: boolean
    showIcons: boolean
    compactMode: boolean
  }
  atsScore: number  // 0-100 score for ATS friendliness
}

// ============================================================================
// PDF Generation Types
// ============================================================================

export interface PDFPageDimensions {
  width: number
  height: number
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export interface TextStyle {
  fontSize: number
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  color: string
  align: 'left' | 'center' | 'right'
  lineHeight?: number
}

export interface PDFTextOptions {
  x: number
  y: number
  maxWidth?: number
  style: TextStyle
}

export interface PDFGeneratorState {
  currentY: number
  pageNumber: number
  contentWidth: number
  contentHeight: number
}

// ============================================================================
// Export Options
// ============================================================================

export interface ExportOptions {
  filename?: string
  includeLinks?: boolean
  includeReferences?: boolean
  maxPages?: number
}

export type ExportFormat = 'pdf' | 'docx' | 'txt'

export interface ExportResult {
  success: boolean
  filename: string
  format: ExportFormat
  pages: number
  atsScore: number
  error?: string
}
