"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Palette, Eye } from "lucide-react"
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
      profileImage: "/placeholder.svg?height=100&width=100",
    },
    links: [{ name: "LinkedIn", url: "#" }],
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border-border rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2 text-xl sm:text-2xl">
                <Palette className="mr-3 h-6 w-6 text-primary" />
                Choose Your Template
              </h2>
              <p className="text-muted-foreground mt-1">Select a professional template that matches your style</p>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="bg-transparent border-border text-foreground hover:bg-secondary"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className={
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-transparent border-border text-foreground hover:bg-secondary"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onHoverStart={() => setHoveredTemplate(template.id)}
                  onHoverEnd={() => setHoveredTemplate(null)}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg bg-background border-border rounded-xl ${
                      selectedTemplate === template.id ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center text-foreground">
                            {template.name}
                            {selectedTemplate === template.id && <Check className="ml-2 h-5 w-5 text-primary" />}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1 capitalize bg-secondary text-secondary-foreground">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Template Preview */}
                      <div className="relative">
                        <div
                          className="w-full h-48 rounded-lg border-2 border-border overflow-hidden"
                          style={{ backgroundColor: template.colors.background }}
                        >
                          <TemplatePreview template={template} data={mockResumeData} />
                        </div>
                        {hoveredTemplate === template.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center"
                          >
                            <Button size="sm" className="bg-white text-black hover:bg-gray-100">
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </Button>
                          </motion.div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground">{template.description}</p>

                      {/* Color Palette */}
                      <div className="flex space-x-2">
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
                          <Badge key={index} variant="outline" className="text-xs border-border text-foreground">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 2 && (
                          <Badge variant="outline" className="text-xs border-border text-foreground">
                            +{template.features.length - 2} more
                          </Badge>
                        )}
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
}
