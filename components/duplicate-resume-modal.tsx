"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Palette, Check } from "lucide-react"
import { RESUME_TEMPLATES } from "@/app/types/templates"

interface DuplicateResumeModalProps {
  isOpen: boolean
  onClose: () => void
  onDuplicate: (name: string, templateId: string) => void
  originalResumeName: string
}

export default function DuplicateResumeModal({
  isOpen,
  onClose,
  onDuplicate,
  originalResumeName,
}: DuplicateResumeModalProps) {
  const [newName, setNewName] = useState(`${originalResumeName} (Copy)`)
  const [selectedTemplate, setSelectedTemplate] = useState("classic")
  const [error, setError] = useState("")

  const handleDuplicate = () => {
    if (!newName.trim()) {
      setError("Please enter a name for the new resume")
      return
    }

    onDuplicate(newName.trim(), selectedTemplate)
    handleClose()
  }

  const handleClose = () => {
    setNewName(`${originalResumeName} (Copy)`)
    setSelectedTemplate("classic")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <Copy className="h-5 w-5 text-primary" />
            <span>Duplicate Resume</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a copy of your resume with a new name and template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resume Name */}
          <div className="space-y-2">
            <Label htmlFor="resume-name" className="text-foreground">
              Resume Name
            </Label>
            <Input
              id="resume-name"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value)
                if (error) setError("")
              }}
              placeholder="Enter resume name"
              className={
                error
                  ? "border-destructive bg-input text-foreground focus:ring-destructive focus:border-destructive"
                  : "bg-input border-border text-foreground focus:ring-primary focus:border-primary"
              }
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          {/* Template Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-primary" />
              <Label className="text-foreground">Choose Template</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {RESUME_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md bg-background border-border rounded-lg ${
                    selectedTemplate === template.id ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-sm text-foreground">{template.name}</h3>
                          {selectedTemplate === template.id && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground mb-2">
                          {template.category}
                        </Badge>
                        <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>
                      </div>
                    </div>

                    {/* Color Preview */}
                    <div className="flex space-x-2 mb-3">
                      <div
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: template.colors.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: template.colors.accent }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: template.colors.secondary }}
                      />
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 2).map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-secondary text-secondary-foreground"
                        >
                          {feature}
                        </Badge>
                      ))}
                      {template.features.length > 2 && (
                        <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                          +{template.features.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="bg-transparent border-border text-foreground hover:bg-secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={!newName.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
