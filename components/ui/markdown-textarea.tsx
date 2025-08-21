"use client"

import React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Sparkles, Eye, EyeOff } from "lucide-react"
import { renderMarkdown } from "@/lib/markdown"

interface MarkdownTextareaProps {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  showAI?: boolean
  onAIClick?: () => void
  error?: string
}

export function MarkdownTextarea({
  label,
  value,
  onChange,
  placeholder,
  showAI = false,
  onAIClick,
  error
}: MarkdownTextareaProps) {
  const [showPreview, setShowPreview] = React.useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-6 text-xs text-muted-foreground hover:text-foreground"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </>
            )}
          </Button>
          {showAI && (
            <Button
              type="button"
              onClick={onAIClick}
              size="sm"
              variant="ghost"
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        {showPreview ? (
          <div 
            className="min-h-[100px] p-3 border border-border rounded-md bg-background text-sm prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(value) || '<span class="text-muted-foreground">No content to preview</span>'
            }}
          />
        ) : (
          <Textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="min-h-[100px] resize-none"
            rows={4}
          />
        )}
      </div>

      {!showPreview && (
        <div className="text-xs text-muted-foreground">
          💡 Use <code>*</code> for bullet points, <code>**bold**</code> for emphasis
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  )
}
