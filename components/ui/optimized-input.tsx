"use client"

import React, { memo, forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Sparkles, Target } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ANIMATION_CONFIG } from "@/lib/constants"

interface OptimizedInputProps {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
  showAI?: boolean
  onAIClick?: () => void
  className?: string
  disabled?: boolean
}

export const OptimizedInput = memo(
  forwardRef<HTMLInputElement | HTMLTextAreaElement, OptimizedInputProps>(
    (
      {
        label,
        value,
        onChange,
        error,
        type = "text",
        placeholder,
        required = false,
        showAI = false,
        onAIClick,
        className,
        disabled = false,
      },
      ref,
    ) => {
      const inputId = React.useMemo(() => label.toLowerCase().replace(/\s+/g, "-"), [label])

      return (
        <motion.div
          className={cn("space-y-3", className)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: ANIMATION_CONFIG.duration.normal,
            ease: ANIMATION_CONFIG.easing.smooth,
          }}
        >
          <Label htmlFor={inputId} className="text-sm font-medium text-white flex items-center gap-2">
            {label}
            {required && <span className="text-red-400">*</span>}
            {showAI && <Sparkles className="h-3 w-3 text-yellow-400" />}
          </Label>

          <div className="relative group">
            {type === "textarea" ? (
              <Textarea
                ref={ref as React.RefObject<HTMLTextAreaElement>}
                id={inputId}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl backdrop-blur-sm transition-all group-hover:border-white/30 resize-none"
              />
            ) : (
              <Input
                ref={ref as React.RefObject<HTMLInputElement>}
                type={type}
                id={inputId}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl backdrop-blur-sm transition-all group-hover:border-white/30 h-12"
              />
            )}

            {showAI && onAIClick && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute right-3 top-3">
                <Button
                  type="button"
                  onClick={onAIClick}
                  size="sm"
                  variant="ghost"
                  disabled={disabled}
                  className="h-8 w-8 p-0 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 rounded-full disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>

          {error && (
            <motion.p
              className="text-red-400 text-sm flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: ANIMATION_CONFIG.duration.fast }}
            >
              <Target className="h-3 w-3" />
              {error}
            </motion.p>
          )}
        </motion.div>
      )
    },
  ),
)

OptimizedInput.displayName = "OptimizedInput"
