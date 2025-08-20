import { VALIDATION_RULES } from "../constants"

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const validators = {
  required: (value: string): ValidationResult => ({
    isValid: value.trim().length > 0,
    error: value.trim().length === 0 ? "This field is required" : undefined,
  }),

  email: (value: string): ValidationResult => ({
    isValid: VALIDATION_RULES.email.test(value),
    error: !VALIDATION_RULES.email.test(value) ? "Please enter a valid email address" : undefined,
  }),

  phone: (value: string): ValidationResult => ({
    isValid: VALIDATION_RULES.phone.test(value.replace(/\s/g, "")),
    error: !VALIDATION_RULES.phone.test(value.replace(/\s/g, "")) ? "Please enter a valid phone number" : undefined,
  }),

  url: (value: string): ValidationResult => ({
    isValid: !value || VALIDATION_RULES.url.test(value),
    error: value && !VALIDATION_RULES.url.test(value) ? "Please enter a valid URL" : undefined,
  }),

  minLength:
    (min: number) =>
    (value: string): ValidationResult => ({
      isValid: value.length >= min,
      error: value.length < min ? `Must be at least ${min} characters` : undefined,
    }),

  maxLength:
    (max: number) =>
    (value: string): ValidationResult => ({
      isValid: value.length <= max,
      error: value.length > max ? `Must be no more than ${max} characters` : undefined,
    }),
}

export function validateField(value: string, rules: ((value: string) => ValidationResult)[]): ValidationResult {
  for (const rule of rules) {
    const result = rule(value)
    if (!result.isValid) {
      return result
    }
  }
  return { isValid: true }
}
