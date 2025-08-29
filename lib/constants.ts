// Centralized constants for better maintainability
export const APP_CONFIG = {
  name: "ApexResume",
  description: "Professional Resume Builder",
  version: "2.0.0",
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  supportedDocTypes: [".pdf", ".doc", ".docx"],
} as const

export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.6,
  },
  easing: {
    smooth: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
} as const

export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/.+/,
} as const
