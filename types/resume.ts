/**
 * @fileoverview Resume data type definitions
 * Comprehensive TypeScript interfaces for resume data structures
 */

export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone?: string
  location: string
  summary: string
  linkedin?: string
  website?: string
}

export interface Experience {
  id: string
  jobTitle: string
  company: string
  date: string
  startDate?: string
  endDate?: string
  location?: string
  responsibilities: string
  achievements?: string[]
}

export interface Education {
  id: string
  degree: string
  school: string
  date: string
  startDate?: string
  endDate?: string
  location?: string
  gpa?: string
  honors?: string[]
  relevantCourses?: string[]
}

export interface Skills {
  languages?: string
  frameworks?: string
  tools?: string
  other?: string
  technical?: string[]
  soft?: string[]
}

export interface Project {
  id: string
  name: string
  description: string
  technologies?: string
  date?: string
  url?: string
  github?: string
  highlights?: string[]
}

export interface Reference {
  id: string
  name: string
  title: string
  company: string
  email: string
  phone?: string
  relationship: string
}

export interface ResumeData {
  personalInfo: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: Skills
  projects: Project[]
  references?: Reference[]
  customSections?: CustomSection[]
}

export interface CustomSection {
  id: string
  title: string
  content: string
  type: 'text' | 'list' | 'table'
}

export interface CoverLetterRequest {
  resumeData: ResumeData
  jobDescription: string
  jobTitle?: string
  companyName?: string
  specialInstructions?: string
}

export interface CoverLetterResponse {
  coverLetter: string
  resumeOptimizationSuggestions: string[]
  fallback?: boolean
}

// API Response types
export interface APIError {
  error: string
  code?: string
}

export interface APISuccess<T> {
  success: true
  data: T
}

export type APIResponse<T> = APISuccess<T> | APIError
