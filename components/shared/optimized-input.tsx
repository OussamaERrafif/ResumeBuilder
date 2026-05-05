/**
 * @fileoverview Highly optimized input components with memoization and performance enhancements
 * Includes proper TypeScript typing, accessibility, and performance optimizations
 */

"use client"

import React, { memo, forwardRef, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Sparkles, Target } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ANIMATION_CONFIG } from "@/lib/config"

interface BaseInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  showAI?: boolean
  onAIClick?: () => void
  className?: string
  disabled?: boolean
  'data-testid'?: string
}

interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'tel' | 'url' | 'password'
  maxLength?: number
  pattern?: string
  autoComplete?: string
}

interface TextareaInputProps extends BaseInputProps {
  type: 'textarea'
  rows?: number
  maxLength?: number
  resize?: boolean
}

export type OptimizedInputProps = TextInputProps | TextareaInputProps

/**
 * Optimized input component with proper memoization and accessibility
 */
export const OptimizedInput = memo(
  forwardRef<HTMLInputElement | HTMLTextAreaElement, OptimizedInputProps>(
    (props, ref) => {
      const {
        label,
        value,
        onChange,
        error,
        placeholder,
        required = false,
        showAI = false,
        onAIClick,
        className,
        disabled = false,
        'data-testid': testId,
        ...restProps
      } = props

      // Memoize the input ID to prevent recalculation
      const inputId = useMemo(
        () => label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        [label]
      )

      // Memoize the change handler
      const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          onChange(event.target.value)
        },
        [onChange]
      )

      // Memoize the AI button handler
      const handleAIClick = useCallback(
        (event: React.MouseEvent) => {
          event.preventDefault()
          onAIClick?.()
        },
        [onAIClick]
      )

      // Determine if this is a textarea
      const isTextarea = 'type' in props && props.type === 'textarea'

      // Memoize the input element
      const InputElement = useMemo(() => {
        if (isTextarea) {
          const { rows = 3, maxLength, resize = true } = props as TextareaInputProps
          
          return (
            <Textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
              data-testid={testId}
              className={cn(
                "min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl backdrop-blur-sm transition-all group-hover:border-white/30",
                !resize && "resize-none",
                error && "border-red-400 focus:border-red-400",
                disabled && "opacity-60 cursor-not-allowed",
                className
              )}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
          )
        }

        const { type = 'text', maxLength, pattern, autoComplete } = props as TextInputProps
        
        return (
          <Input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            id={inputId}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            pattern={pattern}
            autoComplete={autoComplete}
            data-testid={testId}
            className={cn(
              "bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl backdrop-blur-sm transition-all group-hover:border-white/30 h-12",
              error && "border-red-400 focus:border-red-400",
              disabled && "opacity-60 cursor-not-allowed",
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
        )
      }, [
        isTextarea,
        props,
        ref,
        inputId,
        value,
        handleChange,
        placeholder,
        required,
        disabled,
        testId,
        error,
        className,
      ])

      return (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: ANIMATION_CONFIG.duration.normal,
            ease: ANIMATION_CONFIG.easing.smooth,
          }}
        >
          <Label 
            htmlFor={inputId} 
            className={cn(
              "text-sm font-medium text-white flex items-center gap-2",
              required && "after:content-['*'] after:ml-1 after:text-red-400",
              disabled && "opacity-60"
            )}
          >
            {label}
            {showAI && <Sparkles className="h-3 w-3 text-yellow-400" />}
          </Label>
          
          <div className="relative group">
            {InputElement}
            
            {showAI && onAIClick && !disabled && (
              <motion.div 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                className="absolute right-3 top-3"
              >
                <Button
                  type="button"
                  onClick={handleAIClick}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 rounded-full"
                  data-testid={`${testId}-ai-button`}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
          
          {error && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: ANIMATION_CONFIG.duration.fast }}
              id={`${inputId}-error`}
              className="text-red-400 text-sm flex items-center gap-2"
              role="alert"
              aria-live="polite"
            >
              <Target className="h-3 w-3" />
              {error}
            </motion.p>
          )}
        </motion.div>
      )
    }
  )
)

OptimizedInput.displayName = "OptimizedInput"

/**
 * Hook for managing input state with validation
 */
export function useInputState(
  initialValue: string = "",
  validator?: (value: string) => string | undefined
) {
  const [value, setValue] = React.useState(initialValue)
  const [error, setError] = React.useState<string>()
  const [touched, setTouched] = React.useState(false)

  const onChange = useCallback(
    (newValue: string) => {
      setValue(newValue)
      
      if (touched && validator) {
        const validationError = validator(newValue)
        setError(validationError)
      }
    },
    [touched, validator]
  )

  const onBlur = useCallback(() => {
    setTouched(true)
    if (validator) {
      const validationError = validator(value)
      setError(validationError)
    }
  }, [validator, value])

  const reset = useCallback(() => {
    setValue(initialValue)
    setError(undefined)
    setTouched(false)
  }, [initialValue])

  return {
    value,
    error: touched ? error : undefined,
    onChange,
    onBlur,
    reset,
    touched,
  }
}
