"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Palette, Eye, X, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { RESUME_TEMPLATES } from "../types/templates"
import { TemplatePreview } from "./template-previews" // Import TemplatePreview

interface TemplateSelectorProps {
  selectedTemplate: string
  onTemplateSelect: (templateId: string) => void
  onClose: () => void
}

export default function TemplateSelector({ selectedTemplate, onTemplateSelect, onClose }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Lock body scroll when modal is open
  useEffect(() => {
    setMounted(true)
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "classic", name: "Classic" },
    { id: "modern", name: "Modern" },
    { id: "creative", name: "Creative" },
    { id: "minimal", name: "Minimal" },
    { id: "executive", name: "Executive" },
    { id: "tech", name: "Tech" },
  ]

  const filteredTemplates =
    selectedCategory === "all"
      ? RESUME_TEMPLATES
      : RESUME_TEMPLATES.filter((template) => template.category === selectedCategory)

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect(templateId)
    onClose()
  }

  // Mock resume data for template previews
  const mockResumeData = {
    personalInfo: {
      name: "John Doe",
      title: "Software Engineer",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      summary: "Highly motivated software engineer with 5 years of experience in developing scalable web applications.",
      profileImage: "",
    },
    links: [{ name: "LinkedIn", url: "https://linkedin.com/in/johndoe" }],
    education: [{ school: "University of Tech", degree: "B.S. Computer Science", date: "2020" }],
    experience: [
      {
        jobTitle: "Software Engineer",
        company: "Tech Solutions",
        date: "2020-Present",
        responsibilities: "Developed and maintained web applications.",
      },
    ],
    skills: { languages: "JavaScript, Python", frameworks: "React, Node.js", tools: "Git, Docker" },
    projects: [
      {
        name: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform.",
        technologies: "React, Node.js, MongoDB",
      },
    ],
    certifications: [{ name: "AWS Certified Developer", issuer: "AWS", date: "2022" }],
    references: [],
  }

  // Don't render until mounted (for portal)
  if (!mounted) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center">
                <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground">
                  Choose Your Template
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">Select a professional template that matches your style</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 hover:bg-muted shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-background/50 shrink-0 overflow-x-auto">
          <div className="flex gap-2 justify-start min-w-max">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                className={`rounded-full transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gradient-to-b from-background to-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onHoverStart={() => setHoveredTemplate(template.id)}
                  onHoverEnd={() => setHoveredTemplate(null)}
                  whileHover={{ y: -4 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 bg-card border-border rounded-2xl overflow-hidden group ${
                      selectedTemplate === template.id 
                        ? "ring-2 ring-primary shadow-xl shadow-primary/10" 
                        : "hover:shadow-xl hover:shadow-black/5"
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    {/* Template Preview */}
                    <div className="relative">
                      <div
                        className="w-full h-52 overflow-hidden bg-gradient-to-b from-muted/50 to-muted/30 p-3"
                      >
                        {/* Paper effect container */}
                        <div className="relative h-full w-full">
                          <div className="absolute inset-0 bg-black/5 rounded-lg blur-md transform translate-y-1"></div>
                          <div 
                            className="relative h-full w-full rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-black/5"
                            style={{ backgroundColor: template.colors.background }}
                          >
                            <div className="transform scale-[0.35] origin-top-left w-[286%] h-[286%]">
                              <TemplatePreview template={template} data={mockResumeData} />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover overlay */}
                      <AnimatePresence>
                        {hoveredTemplate === template.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end justify-center pb-4"
                          >
                            <Button size="sm" className="rounded-full shadow-lg">
                              <Eye className="mr-2 h-4 w-4" />
                              Use Template
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Selected checkmark */}
                      {selectedTemplate === template.id && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 space-y-3">
                      {/* Title and Category */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{template.description}</p>
                        </div>
                        <Badge variant="secondary" className="capitalize text-xs rounded-md shrink-0">
                          {template.category}
                        </Badge>
                      </div>

                      {/* Color Palette & Features */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-4 h-4 rounded-full ring-1 ring-black/10 shadow-sm"
                            style={{ backgroundColor: template.colors.primary }}
                            title="Primary"
                          />
                          <div
                            className="w-4 h-4 rounded-full ring-1 ring-black/10 shadow-sm"
                            style={{ backgroundColor: template.colors.accent }}
                            title="Accent"
                          />
                          <div
                            className="w-4 h-4 rounded-full ring-1 ring-black/10 shadow-sm"
                            style={{ backgroundColor: template.colors.secondary }}
                            title="Secondary"
                          />
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {template.features.slice(0, 1).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 rounded-md border-border">
                              {feature}
                            </Badge>
                          ))}
                          {template.features.length > 1 && (
                            <span className="text-[10px] text-muted-foreground">+{template.features.length - 1}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
