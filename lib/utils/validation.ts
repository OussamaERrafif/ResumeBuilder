/**
 * @fileoverview Comprehensive validation utilities with TypeScript support
 * Production-ready validation functions with proper error handling
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface ValidationRule<T> {
  validator: (value: T) => boolean | string
  message?: string
  level?: 'error' | 'warning'
}

/**
 * Generic validator that takes multiple rules
 */
export function validate<T>(value: T, rules: ValidationRule<T>[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const rule of rules) {
    const result = rule.validator(value)
    
    if (result === false || (typeof result === 'string')) {
      const message = typeof result === 'string' ? result : rule.message || 'Validation failed'
      
      if (rule.level === 'warning') {
        warnings.push(message)
      } else {
        errors.push(message)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * String validation rules
 */
export const stringRules = {
  required: (message = 'This field is required'): ValidationRule<string> => ({
    validator: (value) => value.trim().length > 0,
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validator: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters long`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validator: (value) => value.length <= max,
    message: message || `Must be no more than ${max} characters long`
  }),

  email: (message = 'Must be a valid email address'): ValidationRule<string> => ({
    validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  phone: (message = 'Must be a valid phone number'): ValidationRule<string> => ({
    validator: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[-\s\(\)]/g, '')),
    message
  }),

  url: (message = 'Must be a valid URL'): ValidationRule<string> => ({
    validator: (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validator: (value) => regex.test(value),
    message
  }),

  noSpecialChars: (message = 'Special characters are not allowed'): ValidationRule<string> => ({
    validator: (value) => /^[a-zA-Z0-9\s]+$/.test(value),
    message
  }),

  strongPassword: (message = 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'): ValidationRule<string> => ({
    validator: (value) => {
      const hasLength = value.length >= 8
      const hasUpper = /[A-Z]/.test(value)
      const hasLower = /[a-z]/.test(value)
      const hasNumber = /\d/.test(value)
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
      return hasLength && hasUpper && hasLower && hasNumber && hasSpecial
    },
    message
  })
}

/**
 * Number validation rules
 */
export const numberRules = {
  required: (message = 'This field is required'): ValidationRule<number> => ({
    validator: (value) => !isNaN(value) && isFinite(value),
    message
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validator: (value) => value >= min,
    message: message || `Must be at least ${min}`
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validator: (value) => value <= max,
    message: message || `Must be no more than ${max}`
  }),

  integer: (message = 'Must be a whole number'): ValidationRule<number> => ({
    validator: (value) => Number.isInteger(value),
    message
  }),

  positive: (message = 'Must be a positive number'): ValidationRule<number> => ({
    validator: (value) => value > 0,
    message
  }),

  nonNegative: (message = 'Must be zero or positive'): ValidationRule<number> => ({
    validator: (value) => value >= 0,
    message
  })
}

/**
 * Array validation rules
 */
export const arrayRules = {
  required: (message = 'At least one item is required'): ValidationRule<any[]> => ({
    validator: (value) => Array.isArray(value) && value.length > 0,
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<any[]> => ({
    validator: (value) => Array.isArray(value) && value.length >= min,
    message: message || `Must have at least ${min} items`
  }),

  maxLength: (max: number, message?: string): ValidationRule<any[]> => ({
    validator: (value) => Array.isArray(value) && value.length <= max,
    message: message || `Must have no more than ${max} items`
  }),

  unique: (message = 'All items must be unique'): ValidationRule<any[]> => ({
    validator: (value) => {
      if (!Array.isArray(value)) return false
      const uniqueValues = new Set(value)
      return uniqueValues.size === value.length
    },
    message
  })
}

/**
 * Date validation rules
 */
export const dateRules = {
  required: (message = 'Date is required'): ValidationRule<Date | string> => ({
    validator: (value) => {
      if (value instanceof Date) return !isNaN(value.getTime())
      if (typeof value === 'string') return !isNaN(new Date(value).getTime())
      return false
    },
    message
  }),

  future: (message = 'Date must be in the future'): ValidationRule<Date | string> => ({
    validator: (value) => {
      const date = value instanceof Date ? value : new Date(value)
      return date > new Date()
    },
    message
  }),

  past: (message = 'Date must be in the past'): ValidationRule<Date | string> => ({
    validator: (value) => {
      const date = value instanceof Date ? value : new Date(value)
      return date < new Date()
    },
    message
  }),

  withinRange: (min: Date, max: Date, message?: string): ValidationRule<Date | string> => ({
    validator: (value) => {
      const date = value instanceof Date ? value : new Date(value)
      return date >= min && date <= max
    },
    message: message || `Date must be between ${min.toDateString()} and ${max.toDateString()}`
  })
}

/**
 * Resume-specific validation rules
 */
export const resumeRules = {
  personalInfo: {
    name: [
      stringRules.required('Name is required'),
      stringRules.minLength(2, 'Name must be at least 2 characters'),
      stringRules.maxLength(100, 'Name must be less than 100 characters')
    ],
    
    email: [
      stringRules.required('Email is required'),
      stringRules.email()
    ],
    
    phone: [
      stringRules.phone()
    ],
    
    location: [
      stringRules.required('Location is required'),
      stringRules.minLength(2, 'Location must be at least 2 characters')
    ],
    
    summary: [
      stringRules.required('Professional summary is required'),
      stringRules.minLength(50, 'Summary should be at least 50 characters'),
      stringRules.maxLength(500, 'Summary should be less than 500 characters')
    ]
  },

  experience: {
    jobTitle: [
      stringRules.required('Job title is required'),
      stringRules.minLength(2, 'Job title must be at least 2 characters')
    ],
    
    company: [
      stringRules.required('Company name is required'),
      stringRules.minLength(2, 'Company name must be at least 2 characters')
    ],
    
    responsibilities: [
      stringRules.required('Job responsibilities are required'),
      stringRules.minLength(50, 'Please provide more detailed responsibilities')
    ]
  },

  education: {
    degree: [
      stringRules.required('Degree is required')
    ],
    
    school: [
      stringRules.required('School name is required')
    ]
  }
}

/**
 * Validate entire resume data
 */
export function validateResumeData(data: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate personal info
  if (!data.personalInfo) {
    errors.push('Personal information is required')
  } else {
    const personalInfoValidation = validatePersonalInfo(data.personalInfo)
    errors.push(...personalInfoValidation.errors)
    if (personalInfoValidation.warnings) {
      warnings.push(...personalInfoValidation.warnings)
    }
  }

  // Validate experience (at least one required)
  if (!data.experience || !Array.isArray(data.experience) || data.experience.length === 0) {
    warnings.push('Consider adding work experience to strengthen your resume')
  } else {
    data.experience.forEach((exp: any, index: number) => {
      const expValidation = validateExperience(exp)
      errors.push(...expValidation.errors.map(err => `Experience ${index + 1}: ${err}`))
    })
  }

  // Validate education
  if (!data.education || !Array.isArray(data.education) || data.education.length === 0) {
    warnings.push('Consider adding education information')
  } else {
    data.education.forEach((edu: any, index: number) => {
      const eduValidation = validateEducation(edu)
      errors.push(...eduValidation.errors.map(err => `Education ${index + 1}: ${err}`))
    })
  }

  // Validate skills
  if (!data.skills || Object.keys(data.skills).length === 0) {
    warnings.push('Adding skills will make your resume more competitive')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

function validatePersonalInfo(info: any): ValidationResult {
  const errors: string[] = []
  
  if (info.name) {
    const nameValidation = validate(info.name, resumeRules.personalInfo.name)
    errors.push(...nameValidation.errors)
  }
  
  if (info.email) {
    const emailValidation = validate(info.email, resumeRules.personalInfo.email)
    errors.push(...emailValidation.errors)
  }
  
  if (info.phone) {
    const phoneValidation = validate(info.phone, resumeRules.personalInfo.phone)
    errors.push(...phoneValidation.errors)
  }
  
  if (info.location) {
    const locationValidation = validate(info.location, resumeRules.personalInfo.location)
    errors.push(...locationValidation.errors)
  }
  
  if (info.summary) {
    const summaryValidation = validate(info.summary, resumeRules.personalInfo.summary)
    errors.push(...summaryValidation.errors)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

function validateExperience(exp: any): ValidationResult {
  const errors: string[] = []
  
  if (exp.jobTitle) {
    const titleValidation = validate(exp.jobTitle, resumeRules.experience.jobTitle)
    errors.push(...titleValidation.errors)
  }
  
  if (exp.company) {
    const companyValidation = validate(exp.company, resumeRules.experience.company)
    errors.push(...companyValidation.errors)
  }
  
  if (exp.responsibilities) {
    const respValidation = validate(exp.responsibilities, resumeRules.experience.responsibilities)
    errors.push(...respValidation.errors)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

function validateEducation(edu: any): ValidationResult {
  const errors: string[] = []
  
  if (edu.degree) {
    const degreeValidation = validate(edu.degree, resumeRules.education.degree)
    errors.push(...degreeValidation.errors)
  }
  
  if (edu.school) {
    const schoolValidation = validate(edu.school, resumeRules.education.school)
    errors.push(...schoolValidation.errors)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
