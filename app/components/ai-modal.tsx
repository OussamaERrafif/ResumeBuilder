"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sparkles, Loader2 } from "lucide-react"

interface AIModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (type: "summary" | "experience" | "project", query: string, index?: number) => Promise<void>
  type: "summary" | "experience" | "project" | null
  index?: number | null
}

export default function AIModal({ isOpen, onClose, onGenerate, type, index }: AIModalProps) {
  const [query, setQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!query.trim() || !type) return

    setIsGenerating(true)

    try {
      // Call the parent's generate function (now async)
      await onGenerate(type, query, index !== null ? index : undefined)
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsGenerating(false)
      setQuery("")
    }
  }

  const handleClose = () => {
    setQuery("")
    setIsGenerating(false)
    onClose()
  }

  const getModalContent = () => {
    switch (type) {
      case "summary":
        return {
          title: "Generate Professional Summary",
          description:
            "Describe your professional background, key skills, or career goals to generate a compelling summary.",
          placeholder:
            "e.g., Software engineer with 5 years experience in React and Node.js, passionate about building scalable web applications",
          examples: [
            "Frontend developer with React expertise",
            "Data scientist with machine learning background",
            "Project manager with agile methodology experience",
          ],
        }
      case "experience":
        return {
          title: "Generate Job Responsibilities",
          description:
            "Describe your role, key achievements, or technologies used to generate professional job responsibilities.",
          placeholder: "e.g., Led a team of developers to build an e-commerce platform using React and AWS",
          examples: [
            "Developed microservices architecture",
            "Implemented CI/CD pipelines",
            "Managed cross-functional team projects",
          ],
        }
      case "project":
        return {
          title: "Generate Project Description",
          description:
            "Describe your project, its purpose, or the technologies used to generate a detailed project description.",
          placeholder: "e.g., Built a real-time chat application using Socket.io and MongoDB",
          examples: [
            "E-commerce website with payment integration",
            "Mobile app for task management",
            "Machine learning model for data analysis",
          ],
        }
      default:
        return {
          title: "Generate Content",
          description: "Describe what you'd like to generate.",
          placeholder: "Enter your description...",
          examples: [],
        }
    }
  }

  const content = getModalContent()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <Sparkles className="h-5 w-5 text-accent" />
            <span>{content.title}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">{content.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ai-query" className="text-foreground">
              Your Description
            </Label>
            <Textarea
              id="ai-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={content.placeholder}
              className="min-h-[100px] mt-2 bg-input border-border text-foreground focus:ring-primary focus:border-primary"
              disabled={isGenerating}
            />
          </div>

          {content.examples.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Example prompts:</Label>
              <div className="mt-2 space-y-1">
                {content.examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(example)}
                    className="block text-left text-sm text-primary hover:text-primary/90 hover:underline"
                    disabled={isGenerating}
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating}
            className="bg-transparent border-border text-foreground hover:bg-secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!query.trim() || isGenerating}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
