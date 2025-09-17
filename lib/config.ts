/**
 * @fileoverview Project configuration and constants
 * Centralized configuration for the ResumeBuilder application
 */

export const APP_CONFIG = {
  name: 'ResumeBuilder Pro',
  version: '2.0.0',
  description: 'Professional resume builder with AI-powered content suggestions',
  author: 'ResumeBuilder Team',
  
  // Performance thresholds
  performance: {
    slowRenderThreshold: 16, // ms (60fps threshold)
    slowCalculationThreshold: 10, // ms
    maxRenderTime: 100, // ms
  },

  // Security settings
  security: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt'],
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    csrfTokenExpiry: 60 * 60 * 1000, // 1 hour
    maxRequestSize: 5 * 1024 * 1024, // 5MB
    allowedOrigins: [
      'http://localhost:3000',
      'https://localhost:3000',
      // Add production domains here
    ],
    enableCSRF: true,
    enableRateLimit: true,
    enableIPBlocking: true,
    enableSessionValidation: true,
  },

  // Validation settings
  validation: {
    minNameLength: 2,
    maxNameLength: 100,
    minSummaryLength: 50,
    maxSummaryLength: 500,
    minPasswordLength: 8,
  },

  // API configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Feature flags
  features: {
    aiSuggestions: true,
    realTimeValidation: true,
    autoSave: true,
    darkMode: true,
    exportToPdf: true,
    socialSharing: false, // Coming soon
  },

  // Environment-specific settings
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isBrowser: typeof window !== 'undefined',
  
} as const

// Animation configuration
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },
  easing: {
    smooth: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    sharp: [0.4, 0, 1, 1],
  },
} as const

// Theme configuration
export const THEME_CONFIG = {
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
} as const

// Error messages
export const ERROR_MESSAGES = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number',
  invalidUrl: 'Please enter a valid URL',
  fileTooLarge: 'File size exceeds the maximum limit',
  invalidFileType: 'Invalid file type',
  networkError: 'Network error. Please check your connection and try again.',
  serverError: 'Server error. Please try again later.',
  validationError: 'Please check your input and try again.',
  unauthorized: 'You are not authorized to perform this action.',
  rateLimitExceeded: 'Too many requests. Please try again later.',
  invalidCredentials: 'Invalid email or password.',
  accountLocked: 'Account temporarily locked due to multiple failed login attempts.',
  sessionExpired: 'Your session has expired. Please log in again.',
  csrfTokenInvalid: 'Security token is invalid. Please refresh the page.',
  suspiciousActivity: 'Suspicious activity detected. Access temporarily restricted.',
  fileUploadError: 'File upload failed. Please check file format and size.',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  saved: 'Changes saved successfully',
  uploaded: 'File uploaded successfully',
  exported: 'Resume exported successfully',
  shared: 'Resume shared successfully',
  profileUpdated: 'Profile updated successfully',
  passwordChanged: 'Password changed successfully',
  emailSent: 'Email sent successfully',
} as const

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'resume-builder-theme',
  language: 'resume-builder-language',
  autoSave: 'resume-builder-auto-save',
  draftData: 'resume-builder-draft',
  userPreferences: 'resume-builder-preferences',
  lastLogin: 'resume-builder-last-login',
} as const

// API endpoints (relative to base URL)
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    resetPassword: '/api/auth/reset-password',
  },
  resume: {
    list: '/api/resumes',
    create: '/api/resumes',
    update: '/api/resumes/:id',
    delete: '/api/resumes/:id',
    export: '/api/resumes/:id/export',
  },
  ai: {
    generateContent: '/api/ai/generate-content',
    optimizeResume: '/api/ai/optimize-resume',
    generateCoverLetter: '/api/ai/generate-cover-letter',
  },
  profile: {
    get: '/api/profile',
    update: '/api/profile',
    avatar: '/api/profile/avatar',
    preferences: '/api/profile/preferences',
  },
} as const

// Regular expressions
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  lettersOnly: /^[a-zA-Z\s]+$/,
  numbersOnly: /^[0-9]+$/,
} as const

// Default values
export const DEFAULTS = {
  resume: {
    personalInfo: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      linkedin: '',
      website: '',
    },
    experience: [],
    education: [],
    skills: {
      languages: '',
      frameworks: '',
      tools: '',
      other: '',
    },
    projects: [],
    references: [],
  },
  preferences: {
    theme: 'system' as const,
    language: 'en',
    autoSave: true,
    emailNotifications: true,
    marketingNotifications: false,
  },
} as const

export default APP_CONFIG
