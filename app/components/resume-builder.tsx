"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Download,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  Award,
  Eye,
  ArrowLeft,
  Save,
  Sparkles,
  Palette,
  GripVertical,
  Target,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Coins,
  Maximize2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// DND-KIT IMPORTS
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { createPortal } from "react-dom"
import { toast } from "@/hooks/use-toast"

// Lazy load heavy modal components - only loaded when needed
const AIModal = dynamic(() => import("./ai-modal"), {
  ssr: false,
  loading: () => null
})
const ResumeAnalysis = dynamic(() => import("./resume-analysis"), {
  ssr: false,
  loading: () => null
})
import { type ResumeAnalysis as ResumeAnalysisType } from "@/types/resume"
import { SkillJobMatchAnalysis } from "@/components/resume/skill-job-match-analysis"

const TemplateSelector = dynamic(() => import("./templates/selector/template-selector"), {
  ssr: false,
  loading: () => null
})
const ATSTemplateSelector = dynamic(() => import("./templates/selector/ats-template-selector"), {
  ssr: false,
  loading: () => null
})

import "easymde/dist/easymde.min.css"
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false })

import { RESUME_TEMPLATES } from "../types/templates"

// Lazy load PDF export (heavy jspdf library) - only imported when downloading
const exportResumePDF = async (...args: Parameters<typeof import("@/lib/ats-resume-exporter").exportResumePDF>) => {
  const { exportResumePDF: exportFn } = await import("@/lib/ats-resume-exporter")
  return exportFn(...args)
}

import {
  type ATSTemplateId,
  mapLegacyTemplateId
} from "@/lib/ats-resume-exporter"
import {
  ClassicTemplate,
  ModernTemplate,
  CreativeTemplate,
  MinimalTemplate,
  PhotoTemplate,
} from "./templates/preview"
import { useAuth } from "@/hooks/use-auth"
import { useCredits } from "@/hooks/use-credits"
import { ResumeService } from "@/lib/resume-service"
import { FileUpload } from "@/components/ui/file-upload"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Types (same as before)
interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  summary: string
  profileImage?: string
}

interface Link {
  name: string
  url: string
}

interface Education {
  id: string
  school: string
  degree: string
  date: string
  gpa?: string
}

interface Experience {
  id: string
  jobTitle: string
  company: string
  date: string
  responsibilities: string
}

interface Project {
  id: string
  name: string
  description: string
  technologies: string
  link?: string
}

interface Certification {
  id: string
  name: string
  issuer: string
  date: string
}

interface Reference {
  id: string
  name: string
  title: string
  company: string
  email: string
  phone: string
}

interface Skills {
  languages: string
  frameworks: string
  tools: string
}

interface ResumeData {
  personalInfo: PersonalInfo
  links: Link[]
  education: Education[]
  experience: Experience[]
  skills: Skills
  projects: Project[]
  certifications: Certification[]
  references: Reference[]
  analysis?: ResumeAnalysisType
}

// Custom hooks (same as before)
const useFormField = (initialValue: string) => {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState("")

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value)
      if (error) setError("")
    },
    [error],
  )

  const validate = useCallback(
    (required = true) => {
      if (required && !value.trim()) {
        setError("This field is required")
        return false
      }
      if (value.includes("@") && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setError("Please enter a valid email address")
        return false
      }
      return true
    },
    [value],
  )

  const setValue2 = useCallback(
    (newValue: string) => {
      setValue(newValue)
      if (error) setError("")
    },
    [error],
  )

  return { value, onChange, error, validate, setError, setValue: setValue2 }
}

const useArrayFormField = <T extends Record<string, string>>(initialValue: T[]) => {
  const [values, setValues] = useState(initialValue)

  const onChange = useCallback((index: number, field: string, value: string) => {
    setValues((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }, [])

  const add = useCallback(() => {
    const newItem = Object.fromEntries(Object.keys(initialValue[0] || {}).map((key) => {
      if (key === "id") return [key, crypto.randomUUID()]
      return [key, ""]
    })) as T
    setValues((prev) => [...prev, newItem])
  }, [initialValue])

  const remove = useCallback((index: number) => {
    setValues((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const reorder = useCallback((oldIndex: number, newIndex: number) => {
    setValues((items) => {
      const newItems = [...items]
      const [removed] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, removed)
      return newItems
    })
  }, [])

  return { values, onChange, add, remove, reorder, setValues }
}

// Form sections configuration
const SECTIONS = [
  { id: "personal", title: "Personal Info", icon: User, description: "Basic information and profile" },
  { id: "experience", title: "Experience", icon: Briefcase, description: "Work history and achievements" },
  { id: "education", title: "Education", icon: GraduationCap, description: "Academic background" },
  { id: "skills", title: "Skills", icon: Code, description: "Technical and soft skills" },
  { id: "projects", title: "Projects", icon: FolderOpen, description: "Portfolio and projects" },
  { id: "additional", title: "Additional", icon: Award, description: "Certifications and references" },
  { id: "analysis", title: "Skill Match", icon: Target, description: "AI Skill & Job Match" },
  { id: "review", title: "Review", icon: Eye, description: "Final review and export" },
]

interface ResumeBuilderProps {
  onBack: () => void
  editingResumeId: string | null
}

export default function ResumeBuilder({ onBack, editingResumeId }: ResumeBuilderProps) {
  const [currentSection, setCurrentSection] = useState("personal")
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiModalType, setAiModalType] = useState<"summary" | "experience" | "project" | null>(null)
  const [aiModalIndex, setAiModalIndex] = useState<number | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysis, setAnalysis] = useState<ResumeAnalysisType | undefined>(undefined)
  const [selectedTemplate, setSelectedTemplate] = useState("classic")
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showATSExporter, setShowATSExporter] = useState(false)
  const [atsTemplateId, setATSTemplateId] = useState<ATSTemplateId>("ats-classic")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(editingResumeId)

  // Preview State
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)
  const [previewScale, setPreviewScale] = useState(0.65)
  const [expandedPreviewScale, setExpandedPreviewScale] = useState(0.8)

  // Sync ATS template with selected preview template
  useEffect(() => {
    const mappedId = mapLegacyTemplateId(selectedTemplate)
    setATSTemplateId(mappedId)
  }, [selectedTemplate])

  // Form fields
  const name = useFormField("")
  const title = useFormField("")
  const email = useFormField("")
  const phone = useFormField("")
  const location = useFormField("")
  const summary = useFormField("")

  const links = useArrayFormField([{ name: "", url: "" }])
  const education = useArrayFormField([{ id: "", school: "", degree: "", date: "", gpa: "" }])
  const experience = useArrayFormField([{ id: "", jobTitle: "", company: "", date: "", responsibilities: "" }])
  const projects = useArrayFormField([{ id: "", name: "", description: "", technologies: "", link: "" }])
  const certifications = useArrayFormField([{ id: "", name: "", issuer: "", date: "" }])
  const references = useArrayFormField([{ id: "", name: "", title: "", company: "", email: "", phone: "", relationship: "" }])

  const languages = useFormField("")
  const frameworks = useFormField("")
  const tools = useFormField("")

  const skills = useMemo(
    () => ({
      languages,
      frameworks,
      tools,
    }),
    [languages, frameworks, tools],
  )

  const resumeData: ResumeData = useMemo(
    () => ({
      personalInfo: {
        name: name.value,
        title: title.value,
        email: email.value,
        phone: phone.value,
        location: location.value,
        summary: summary.value,
        profileImage: profileImage || undefined,
      },
      links: links.values,
      education: education.values,
      experience: experience.values,
      skills: {
        languages: skills.languages.value,
        frameworks: skills.frameworks.value,
        tools: skills.tools.value,
      },
      projects: projects.values,
      certifications: certifications.values,
      references: references.values,
      analysis: analysis,
    }),
    [
      name.value,
      title.value,
      email.value,
      phone.value,
      location.value,
      summary.value,
      profileImage,
      links.values,
      education.values,
      experience.values,
      skills,
      projects.values,
      certifications.values,
      references.values,
      analysis,
    ],
  )

  const { user } = useAuth()
  const { balance, refreshBalance, getFeatureCost } = useCredits()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Check if photo is required for selected template
  const selectedTemplateData = RESUME_TEMPLATES.find((t) => t.id === selectedTemplate)
  const isPhotoRequired = selectedTemplateData?.requiresPhoto || false

  // Load existing resume data if editing
  useEffect(() => {
    const loadResumeData = async () => {
      if (editingResumeId && user) {
        const { data, error } = await ResumeService.getResume(editingResumeId, user.id)

        if (error) {
          return
        }

        if (data && data.data) {
          const resumeData = data.data
          name.setValue(resumeData.personalInfo.name || "")
          title.setValue(resumeData.personalInfo.title || "")
          email.setValue(resumeData.personalInfo.email || "")
          phone.setValue(resumeData.personalInfo.phone || "")
          location.setValue(resumeData.personalInfo.location || "")
          summary.setValue(resumeData.personalInfo.summary || "")
          languages.setValue(resumeData.skills.languages || "")
          frameworks.setValue(resumeData.skills.frameworks || "")
          tools.setValue(resumeData.skills.tools || "")
          setProfileImage(resumeData.personalInfo.profileImage || null)

          if (resumeData.links) links.setValues(resumeData.links)
          if (resumeData.education) education.setValues(resumeData.education)
          if (resumeData.experience) experience.setValues(resumeData.experience)
          if (resumeData.projects) projects.setValues(resumeData.projects)
          if (resumeData.certifications) certifications.setValues(resumeData.certifications)
          if (resumeData.references) references.setValues(resumeData.references)
          if (resumeData.analysis) setAnalysis(resumeData.analysis)

          if (data.template_id) setSelectedTemplate(data.template_id)
        }
      }
    }

    loadResumeData()
  }, [editingResumeId, user])

  const saveResume = useCallback(async () => {
    if (!user) return

    setSaveError(null)
    const resumeName = name.value || "Untitled Resume"

    const resumeDataToSave = {
      personalInfo: {
        name: name.value,
        title: title.value,
        email: email.value,
        phone: phone.value,
        location: location.value,
        summary: summary.value,
        profileImage: profileImage || undefined,
      },
      links: links.values,
      education: education.values,
      experience: experience.values,
      skills: {
        languages: skills.languages.value,
        frameworks: skills.frameworks.value,
        tools: skills.tools.value,
      },
      projects: projects.values,
      certifications: certifications.values,
      references: references.values,
    }

    if (editingResumeId) {
      // Update existing resume
      const { error } = await ResumeService.updateResume(editingResumeId, {
        name: resumeName,
        template_id: selectedTemplate,
        data: resumeDataToSave,
      })

      if (error) {
        setSaveError("Failed to save resume")
      }
    } else {
      // Create new resume
      const { data, error } = await ResumeService.createResume({
        user_id: user.id,
        name: resumeName,
        template_id: selectedTemplate,
        data: resumeDataToSave,
      })

      if (error) {
        setSaveError("Failed to create resume")
      } else if (data?.id) {
        // Track the new resume ID so analysis can be saved
        setCurrentResumeId(data.id)
      }
    }
  }, [
    editingResumeId,
    name.value,
    selectedTemplate,
    user,
    profileImage,
    summary.value,
    title.value,
    email.value,
    phone.value,
    location.value,
    links.values,
    education.values,
    experience.values,
    skills.languages.value,
    skills.frameworks.value,
    skills.tools.value,
    projects.values,
    certifications.values,
    references.values,
  ])

  // Track if data has actually changed for smarter auto-save
  const lastSavedDataRef = useRef<string>("")
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const resumeDataRef = useRef(resumeData)

  // Keep ref in sync without triggering re-renders
  useEffect(() => {
    resumeDataRef.current = resumeData
  }, [resumeData])

  // Optimized auto-save - uses refs to avoid dependency array issues
  useEffect(() => {
    if (!user) return

    // Don't auto-save if we're still loading an existing resume
    if (editingResumeId && !lastSaved && !name.value) return

    // Don't auto-save immediately after loading or if no content
    if (!lastSaved && !name.value && !summary.value) return

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Create a hash of current data to detect actual changes
    const currentDataHash = JSON.stringify(resumeData)

    // Skip if no actual changes
    if (currentDataHash === lastSavedDataRef.current) return

    autoSaveTimerRef.current = setTimeout(async () => {
      // Double-check we still have changes before saving
      const latestHash = JSON.stringify(resumeDataRef.current)
      if (latestHash === lastSavedDataRef.current) return

      setIsAutoSaving(true)
      await saveResume()
      lastSavedDataRef.current = latestHash
      setLastSaved(new Date())
      setIsAutoSaving(false)
    }, 8000) // Increased to 8 seconds for better batching

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [
    resumeData,
    selectedTemplate,
    user,
    saveResume,
    editingResumeId,
    lastSaved,
    name.value,
    summary.value,
  ])

  const handleDownload = useCallback(async () => {
    // Save the resume first
    saveResume()

    try {
      // Use new ATS-friendly PDF generator
      const result = await exportResumePDF(atsTemplateId, resumeData)

      if (result.success) {
        toast({
          title: "Success! 🎉",
          description: `Your ATS-friendly resume has been downloaded (${result.pages} page${result.pages > 1 ? 's' : ''})`,
        })
      } else {
        throw new Error(result.error || 'Failed to generate PDF')
      }
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }, [resumeData, atsTemplateId, saveResume])

  const handleAIGenerate = async (type: "summary" | "experience" | "project", query: string, index?: number) => {
    try {
      // Call the AI API with userId for credit deduction
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          query,
          userId: user?.id,
          context: resumeData
        }),
      })

      const data = await response.json()

      // Handle insufficient credits (402 Payment Required)
      if (response.status === 402) {
        toast({
          title: "Insufficient Credits",
          description: data.message || `You need ${data.creditsRequired || 'more'} credits but only have ${data.creditsAvailable || 0}. Please purchase more credits to continue.`,
          variant: "destructive",
          duration: 6000,
        })
        setShowAIModal(false)
        setAiModalType(null)
        setAiModalIndex(null)
        return
      }

      if (data.success && data.content) {
        const aiContent = data.content

        switch (type) {
          case "summary":
            summary.setValue(aiContent)
            break
          case "experience":
            if (index !== undefined && index !== null) {
              experience.onChange(index, "responsibilities", aiContent)
            }
            break
          case "project":
            if (index !== undefined && index !== null) {
              projects.onChange(index, "description", aiContent)
            }
            break
        }

        // Refresh credit balance after successful operation
        if (data.creditsRemaining !== undefined) {
          await refreshBalance()
        }

        // Show success message if it was a fallback
        if (data.fallback) {
          toast({
            title: "Content Generated",
            description: "Using fallback templates. Add your OpenAI API key to .env.local for AI-powered content.",
            duration: 5000,
          })
        } else {
          toast({
            title: "AI Content Generated ✨",
            description: data.creditsRemaining !== undefined
              ? `Successfully generated content. ${data.creditsRemaining} credits remaining.`
              : "Successfully generated professional content.",
            duration: 3000,
          })
        }
      } else {
        // Fallback to mock data if API fails
        const mockData = generateMockAIData(type, query)

        switch (type) {
          case "summary":
            summary.setValue(mockData)
            break
          case "experience":
            if (index !== undefined && index !== null) {
              experience.onChange(index, "responsibilities", mockData)
            }
            break
          case "project":
            if (index !== undefined && index !== null) {
              projects.onChange(index, "description", mockData)
            }
            break
        }

        toast({
          title: "Content Generated",
          description: "Using template content. Check your API configuration for AI features.",
          duration: 4000,
        })
      }
    } catch (error) {
      // Fallback to mock data
      const mockData = generateMockAIData(type, query)

      switch (type) {
        case "summary":
          summary.setValue(mockData)
          break
        case "experience":
          if (index !== undefined && index !== null) {
            experience.onChange(index, "responsibilities", mockData)
          }
          break
        case "project":
          if (index !== undefined && index !== null) {
            projects.onChange(index, "description", mockData)
          }
          break
      }

      toast({
        title: "Content Generated",
        description: "Using template content due to API error. Please check your configuration.",
        variant: "destructive",
        duration: 4000,
      })
    }

    setShowAIModal(false)
    setAiModalType(null)
    setAiModalIndex(null)
  }

  const openAIModal = (type: "summary" | "experience" | "project", index?: number) => {
    setAiModalType(type)
    setAiModalIndex(index !== undefined ? index : null)
    setShowAIModal(true)
  }

  const handleProfileImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setProfileImage(null)
    }
  }

  // DND-KIT SENSORS
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // DND-KIT DRAG STATE
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeItem = useMemo(() => {
    if (!activeId) return null
    const [section, indexStr] = activeId.split("-")
    const index = Number.parseInt(indexStr)
    if (section === "experience") return experience.values[index]
    if (section === "education") return education.values[index]
    if (section === "projects") return projects.values[index]
    if (section === "certifications") return certifications.values[index]
    if (section === "references") return references.values[index]
    return null
  }, [activeId, experience.values, education.values, projects.values, certifications.values, references.values])

  // DND-KIT HANDLERS
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const [activeSection, activeIndexStr] = String(active.id).split("-")
      const [overSection, overIndexStr] = String(over.id).split("-")

      if (activeSection === overSection) {
        const activeIndex = Number.parseInt(activeIndexStr)
        const overIndex = Number.parseInt(overIndexStr)

        if (activeSection === "experience") {
          experience.reorder(activeIndex, overIndex)
        } else if (activeSection === "education") {
          education.reorder(activeIndex, overIndex)
        } else if (activeSection === "projects") {
          projects.reorder(activeIndex, overIndex)
        } else if (activeSection === "certifications") {
          certifications.reorder(activeIndex, overIndex)
        } else if (activeSection === "references") {
          references.reorder(activeIndex, overIndex)
        }
      }

      setActiveId(null)
    },
    [experience, education, projects, certifications, references],
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {editingResumeId ? "Edit Resume" : "Create Resume"}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground text-sm">AI-Powered Resume Builder</p>
                  {isAutoSaving && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      Saving...
                    </span>
                  )}
                  {lastSaved && !isAutoSaving && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Saved {new Date().getTime() - lastSaved.getTime() < 10000 ? 'just now' : 'recently'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Credit Balance Display */}
              {balance && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {balance.current} credits
                  </span>
                </div>
              )}

              <Button
                onClick={() => {
                  setShowAnalysis(true)
                }}
                variant="outline"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Analysis
              </Button>

              <Button onClick={() => setShowTemplateSelector(true)} variant="outline" size="sm">
                <Palette className="h-4 w-4 mr-2" />
                Preview Template
              </Button>

              <Button onClick={saveResume} variant="outline" size="sm" disabled={isAutoSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isAutoSaving ? 'Saving...' : 'Save Now'}
              </Button>

              <Button onClick={() => setShowATSExporter(true)} size="sm" className="bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" />
                Export ATS PDF
              </Button>

              <div className="bg-muted rounded-lg p-1">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Main Navigation Sidebar */}

          <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-24 space-y-4">

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">

              <div className="p-4 border-b border-border bg-muted/30">

                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">

                  Editor Sections

                </h3>

              </div>

              <div className="p-2 space-y-1">

                {SECTIONS.map((section) => {

                  const Icon = section.icon

                  const isActive = section.id === currentSection



                  return (

                    <button

                      key={section.id}

                      onClick={() => setCurrentSection(section.id)}

                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${isActive

                        ? "bg-primary text-primary-foreground shadow-md"

                        : "text-muted-foreground hover:bg-muted hover:text-foreground"

                        }`}

                    >

                      <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-white/20" : "bg-muted group-hover:bg-background"

                        }`}>

                        <Icon className="h-4 w-4" />

                      </div>

                      <div className="flex flex-col items-start overflow-hidden">

                        <span className="text-sm font-semibold truncate w-full">

                          {section.title}

                        </span>

                        <span className={`text-[10px] truncate w-full ${isActive ? "text-primary-foreground/70" : "text-muted-foreground/60"

                          }`}>

                          {section.description}

                        </span>

                      </div>

                    </button>

                  )

                })}

              </div>



              <div className="p-4 border-t border-border bg-muted/10">

                <div className="flex items-center justify-between mb-3">

                  <div className="flex items-center gap-2">

                    <div className={`w-2 h-2 rounded-full ${isAutoSaving ? "bg-blue-500 animate-pulse" : "bg-emerald-500"}`}></div>

                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">

                      {isAutoSaving ? "Saving..." : "Synced"}

                    </span>

                  </div>

                  {lastSaved && (

                    <span className="text-[10px] text-muted-foreground/50">

                      {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                    </span>

                  )}

                </div>

                <div className="w-full bg-muted rounded-full h-1">

                  <div

                    className="bg-primary h-1 rounded-full transition-all duration-500"

                    style={{ width: `${((SECTIONS.findIndex(s => s.id === currentSection) + 1) / SECTIONS.length) * 100}%` }}

                  ></div>

                </div>

              </div>

            </div>



            {/* Support Actions */}

            <div className="hidden lg:grid grid-cols-2 gap-3">

              <Button

                variant="outline"

                size="sm"

                className="rounded-xl h-10 border-border bg-card hover:bg-muted text-xs font-medium"

                onClick={() => setShowAnalysis(true)}

              >

                <Sparkles className="h-3 w-3 mr-1.5 text-primary" />

                Analyze

              </Button>

              <Button

                variant="outline"

                size="sm"

                className="rounded-xl h-10 border-border bg-card hover:bg-muted text-xs font-medium"

                onClick={() => setShowTemplateSelector(true)}

              >

                <Palette className="h-3 w-3 mr-1.5 text-primary" />

                Style

              </Button>

            </div>

          </aside>



          {/* Workspace Content */}

          <main className="flex-1 min-w-0 w-full">

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

              {/* Form Area */}

              <div className="xl:col-span-7 space-y-6">

                <Card className="border border-border rounded-2xl shadow-sm overflow-hidden">

                  <div className="bg-muted/30 px-8 py-6 border-b border-border flex items-center justify-between">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">

                        {React.createElement(SECTIONS.find((s) => s.id === currentSection)?.icon || User, {

                          className: "h-6 w-6 text-primary",

                        })}

                      </div>

                      <div>

                        <h2 className="text-xl font-bold text-foreground">

                          {SECTIONS.find((s) => s.id === currentSection)?.title}

                        </h2>

                        <p className="text-sm text-muted-foreground">

                          {SECTIONS.find((s) => s.id === currentSection)?.description}

                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="p-8">

                    <AnimatePresence mode="wait">

                      <motion.div

                        key={currentSection}

                        initial={{ opacity: 0, y: 10 }}

                        animate={{ opacity: 1, y: 0 }}

                        exit={{ opacity: 0, y: -10 }}

                        transition={{ duration: 0.2 }}

                      >

                        {currentSection === "personal" && (

                          <PersonalInfoStep

                            name={name}

                            title={title}

                            email={email}

                            phone={phone}

                            location={location}

                            summary={summary}

                            links={links}

                            onAIGenerate={openAIModal}

                            profileImage={profileImage}

                            onProfileImageChange={handleProfileImageChange}

                            isPhotoRequired={isPhotoRequired}

                          />

                        )}

                        {currentSection === "experience" && (

                          <ExperienceStep

                            experience={experience}

                            onAIGenerate={openAIModal}

                            sensors={sensors}

                            activeId={activeId}

                            onDragStart={handleDragStart}

                            onDragEnd={handleDragEnd}

                          />

                        )}

                        {currentSection === "education" && (

                          <EducationStep

                            education={education}

                            sensors={sensors}

                            activeId={activeId}

                            onDragStart={handleDragStart}

                            onDragEnd={handleDragEnd}

                          />

                        )}

                        {currentSection === "skills" && <SkillsStep skills={skills} />}

                        {currentSection === "projects" && (

                          <ProjectsStep

                            projects={projects}

                            onAIGenerate={openAIModal}

                            sensors={sensors}

                            activeId={activeId}

                            onDragStart={handleDragStart}

                            onDragEnd={handleDragEnd}

                          />

                        )}

                        {currentSection === "additional" && (

                          <AdditionalStep

                            certifications={certifications}

                            references={references}

                            sensors={sensors}

                            activeId={activeId}

                            onDragStart={handleDragStart}

                            onDragEnd={handleDragEnd}

                          />

                        )}

                        {currentSection === "analysis" && (

                          <div className="space-y-6">

                            <SkillJobMatchAnalysis
                              resumeData={resumeData}
                              onAnalysisComplete={(newAnalysis: ResumeAnalysisType) => {
                                setAnalysis(newAnalysis)
                                setTimeout(() => saveResume(), 100)
                              }}
                              userId={user?.id}
                              resumeId={currentResumeId}
                            />

                          </div>

                        )}

                        {currentSection === "review" && (

                          <ReviewStep

                            data={resumeData}

                            onDownload={handleDownload}

                            onAnalysisComplete={(newAnalysis: ResumeAnalysisType) => {

                              setAnalysis(newAnalysis)

                              setTimeout(() => saveResume(), 100)

                            }}

                            userId={user?.id}

                            resumeId={currentResumeId}

                          />

                        )}

                      </motion.div>

                    </AnimatePresence>

                  </div>

                </Card>

              </div>



              {/* Live Preview Area */}

              <div className="xl:col-span-5 xl:sticky xl:top-24">

                <Card className="border border-border rounded-2xl overflow-hidden shadow-xl bg-card">

                  <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">

                        <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

                      </div>

                      <span className="font-bold text-sm">Live Preview</span>

                    </div>

                    <div className="flex items-center gap-1.5">

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setPreviewScale(Math.max(0.4, previewScale - 0.1))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setPreviewScale(Math.min(1.2, previewScale + 0.1))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setIsPreviewExpanded(true)}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>

                      <div className="h-4 w-[1px] bg-border mx-1"></div>

                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        {RESUME_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Classic'}
                      </span>
                    </div>

                  </div>



                  <div className="bg-[#f8f9fa] dark:bg-[#0f1115] overflow-auto max-h-[calc(100vh-200px)] p-8">

                    <div
                      id="resume-preview-container"
                      className="mx-auto origin-top transition-transform duration-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white"
                      style={{
                        width: '210mm',
                        minHeight: '297mm',
                        transform: `scale(${previewScale})`,
                        marginBottom: `-${(1 - previewScale) * 100}%`
                      }}
                    >
                      <div className="p-0 h-full">
                        <ResumePreview data={resumeData} templateId={selectedTemplate} />
                      </div>
                    </div>

                  </div>

                </Card>

              </div>

            </div>

          </main>

        </div>

      </div>

      {/* AI Modal */}
      <AIModal
        isOpen={showAIModal}
        onClose={() => {
          setShowAIModal(false)
          setAiModalType(null)
          setAiModalIndex(null)
        }}
        onGenerate={handleAIGenerate}
        type={aiModalType}
        index={aiModalIndex}
      />

      {showTemplateSelector && (
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateSelect={setSelectedTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {/* ATS Resume Exporter Modal */}
      <ATSTemplateSelector
        isOpen={showATSExporter}
        onClose={() => setShowATSExporter(false)}
        selectedTemplate={atsTemplateId}
        onTemplateSelect={setATSTemplateId}
        resumeData={resumeData}
        onExport={() => saveResume()}
      />

      {/* Drag Overlay for DND-KIT */}
      {createPortal(
        <DragOverlay>
          {activeId && activeItem ? (
            <div className="p-4 border rounded-lg bg-card border-border shadow-lg">
              <p className="font-semibold text-foreground">
                {(activeItem as any).jobTitle || (activeItem as any).school || (activeItem as any).name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(activeItem as any).company || (activeItem as any).degree || (activeItem as any).description || (activeItem as any).issuer}
              </p>
            </div>
          ) : null}
        </DragOverlay>,
        document.body,
      )}

      {/* Resume Analysis Modal */}
      <ResumeAnalysis
        isOpen={showAnalysis}
        onClose={() => {
          setShowAnalysis(false)
        }}
        resumeData={resumeData}
        userId={user?.id}
        resumeId={currentResumeId}
      />

      {/* Expanded Preview Modal */}
      <Dialog open={isPreviewExpanded} onOpenChange={setIsPreviewExpanded}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 gap-0 bg-secondary/20 backdrop-blur-sm border-none overflow-hidden flex flex-col">
          <div className="p-4 bg-background border-b flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Full Screen Preview</h3>
            </div>

            <div className="flex items-center gap-2 mr-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedPreviewScale(Math.max(0.4, expandedPreviewScale - 0.1))}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs font-mono w-12 text-center">
                {Math.round(expandedPreviewScale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedPreviewScale(Math.min(1.5, expandedPreviewScale + 0.1))}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 bg-zinc-100 dark:bg-zinc-900 flex justify-center items-start">
            <div
              className="bg-white shadow-2xl transition-transform duration-200 origin-top"
              style={{
                width: '210mm',
                minHeight: '297mm',
                transform: `scale(${expandedPreviewScale})`,
                marginBottom: `calc(${expandedPreviewScale * 50}vh)` // Extra scroll space
              }}
            >
              <ResumePreview data={resumeData} templateId={selectedTemplate} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Mock AI data generation function
function generateMockAIData(type: "summary" | "experience" | "project", query: string): string {
  const summaryTemplates = [
    "Experienced professional with a strong background in {query}. Proven track record of delivering high-quality results and driving innovation in fast-paced environments. Skilled in problem-solving, team collaboration, and strategic thinking.",
    "Results-driven {query} specialist with expertise in modern technologies and best practices. Passionate about creating efficient solutions and mentoring team members. Strong communication skills and ability to work across diverse teams.",
    "Dynamic {query} professional with extensive experience in project management and technical leadership. Committed to continuous learning and staying current with industry trends. Excellent analytical and problem-solving abilities.",
  ]

  const experienceTemplates = [
    "- Led cross-functional teams in {query} initiatives, resulting in improved efficiency and cost savings\n- Implemented best practices and modern methodologies to streamline processes\n- Collaborated with stakeholders to define requirements and deliver solutions\n- Mentored junior team members and conducted knowledge sharing sessions",
    "- Developed and maintained {query} systems with focus on scalability and performance\n- Participated in code reviews and architectural decisions\n- Worked closely with product managers to translate business requirements into technical solutions\n- Contributed to documentation and process improvement initiatives",
    "- Managed {query} projects from conception to deployment\n- Coordinated with multiple departments to ensure project success\n- Implemented quality assurance processes and testing strategies\n- Provided technical support and troubleshooting for production systems",
  ]

  const projectTemplates = [
    "Developed a comprehensive {query} solution that improved user experience and system performance. Utilized modern technologies and followed industry best practices. The project resulted in increased user engagement and positive feedback from stakeholders.",
    "Created an innovative {query} application with focus on scalability and maintainability. Implemented automated testing and continuous integration pipelines. The solution successfully addressed key business requirements and received recognition for its technical excellence.",
    "Built a robust {query} platform that streamlined business processes and enhanced productivity. Collaborated with cross-functional teams to gather requirements and deliver a user-friendly interface. The project was completed on time and within budget.",
  ]

  let templates: string[]
  switch (type) {
    case "summary":
      templates = summaryTemplates
      break
    case "experience":
      templates = experienceTemplates
      break
    case "project":
      templates = projectTemplates
      break
    default:
      return ""
  }

  const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
  return randomTemplate.replace(/{query}/g, query || "technology")
}

// Enhanced Form Components with minimalist styling
const FormField = ({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required = false,
  showAI = false,
  onAIClick,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
  showAI?: boolean
  onAIClick?: () => void
}) => (
  <div className="space-y-2">
    <Label
      htmlFor={label.toLowerCase().replace(/\s+/g, "-")}
      className="text-sm font-medium text-foreground flex items-center gap-2"
    >
      {label}
      {required && <span className="text-destructive">*</span>}
      {showAI && <Sparkles className="h-3 w-3 text-muted-foreground" />}
    </Label>
    <div className="relative">
      {type === "textarea" ? (
        <Textarea
          id={label.toLowerCase().replace(/\s+/g, "-")}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="min-h-[120px] resize-none"
        />
      ) : type === "markdown" ? (
        <div className="markdown-editor-wrapper">
          <SimpleMDE
            id={label.toLowerCase().replace(/\s+/g, "-")}
            value={value}
            onChange={(val) => {
              onChange({ target: { value: val } } as any)
            }}
            options={{
              spellChecker: false,
              maxHeight: "300px",
              placeholder: placeholder,
              status: false,
              toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "preview"]
            }}
          />
        </div>
      ) : (
        <Input
          type={type}
          id={label.toLowerCase().replace(/\s+/g, "-")}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-10"
        />
      )}
      {showAI && (
        <Button
          type="button"
          onClick={onAIClick}
          size="sm"
          variant="ghost"
          className="absolute right-2 top-2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      )}
    </div>
    {error && (
      <p className="text-destructive text-sm flex items-center gap-2">
        <Target className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
)

// Sortable Item Component for DND-KIT
interface SortableItemProps {
  id: string
  children: React.ReactNode
  className?: string
}

function SortableItem({ id, children, className }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.7 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={className}>
      <div className="flex items-start gap-3">
        <button
          className="cursor-grab touch-action-none text-muted-foreground hover:text-foreground mt-4 p-2 rounded-lg hover:bg-muted transition-colors"
          {...listeners}
          {...attributes}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

const ArrayFormField = <T,>({
  title,
  values,
  onChange,
  onAdd,
  onRemove,
  fields,
  showAI = false,
  onAIClick,
  draggable = false,
  sectionId,
  sensors,
  onDragStart,
  onDragEnd,
}: {
  title: string
  values: T[]
  onChange: (index: number, field: string, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  fields: { name: string; label: string; type?: string; placeholder?: string; showAI?: boolean }[]
  showAI?: boolean
  onAIClick?: (index: number, field: string) => void
  draggable?: boolean
  sectionId: string
  sensors?: ReturnType<typeof useSensors>
  onDragStart?: (event: DragStartEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
}) => {
  const items = values.map((value, index) => (
    <SortableItem key={`${sectionId}-${index}`} id={`${sectionId}-${index}`}>
      <div className="space-y-4 p-6 border border-border rounded-lg bg-card w-full">
        {fields.map((field) => (
          <FormField
            key={field.name}
            label={field.label}
            value={(value as Record<string, string>)[field.name] || ""}
            onChange={(e) => onChange(index, field.name, e.target.value)}
            type={field.type || "text"}
            placeholder={field.placeholder}
            showAI={field.showAI}
            onAIClick={() => onAIClick && onAIClick(index, field.name)}
          />
        ))}
        <Button onClick={() => onRemove(index)} variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Remove {title.slice(0, -1)}
        </Button>
      </div>
    </SortableItem>
  ))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {values.length} {values.length === 1 ? "item" : "items"}
        </div>
      </div>

      {draggable && sensors && onDragStart && onDragEnd ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={values.map((_, i) => `${sectionId}-${i}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">{items}</div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-4">{items}</div>
      )}

      <Button onClick={onAdd} variant="outline" size="lg" className="w-full h-12 bg-transparent">
        <Plus className="h-4 w-4 mr-2" />
        Add {title.slice(0, -1)}
      </Button>
    </div>
  )
}

// Enhanced Step Components
const PersonalInfoStep = ({
  name,
  title,
  email,
  phone,
  location,
  summary,
  links,
  onAIGenerate,
  profileImage,
  onProfileImageChange,
  isPhotoRequired,
}: {
  name: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; error: string }
  title: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; error: string }
  email: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; error: string }
  phone: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; error: string }
  location: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; error: string }
  summary: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; error: string }
  links: { values: Link[]; onChange: (index: number, field: string, value: string) => void; add: () => void; remove: (index: number) => void }
  onAIGenerate: (type: "summary") => void
  profileImage: string | null
  onProfileImageChange: (file: File | null) => void
  isPhotoRequired: boolean
}) => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-2">Let's start with the basics</h3>
      <p className="text-muted-foreground">Tell us about yourself and make a great first impression</p>
      {isPhotoRequired && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">⚠️ This template requires a profile photo</p>
      )}
    </div>

    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Full Name" {...name} required placeholder="John Doe" />
          <FormField label="Professional Title" {...title} required placeholder="Software Engineer" />
          <FormField label="Email Address" {...email} type="email" required placeholder="john@example.com" />
          <FormField label="Phone Number" {...phone} type="tel" required placeholder="+1 (555) 123-4567" />
        </div>
        <FormField label="Location" {...location} required placeholder="New York, NY" />
      </div>

      <div className="lg:w-64">
        <FileUpload
          label={isPhotoRequired ? "Profile Picture (Required)" : "Profile Picture"}
          accept="image/*"
          onFileSelect={onProfileImageChange}
          preview={profileImage}
          className="h-full"
        />
      </div>
    </div>

    <FormField
      label="Professional Summary"
      {...summary}
      type="markdown"
      placeholder="Write a compelling summary that highlights your key achievements and career goals..."
      showAI={true}
      onAIClick={() => onAIGenerate("summary")}
    />

    <ArrayFormField
      title="Professional Links"
      values={links.values}
      onChange={links.onChange}
      onAdd={links.add}
      onRemove={links.remove}
      fields={[
        { name: "name", label: "Platform", placeholder: "LinkedIn" },
        { name: "url", label: "URL", type: "url", placeholder: "https://linkedin.com/in/johndoe" },
      ]}
      sectionId="links"
    />
  </div>
)

const ExperienceStep = ({ experience, onAIGenerate, sensors, activeId, onDragStart, onDragEnd }: {
  experience: { values: Experience[]; onChange: (index: number, field: string, value: string) => void; add: () => void; remove: (index: number) => void }
  onAIGenerate: (type: "experience", index: number) => void
  sensors: ReturnType<typeof useSensors>
  activeId: string | null
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}) => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-2">Your Professional Journey</h3>
      <p className="text-muted-foreground">Showcase your work experience and key achievements</p>
    </div>

    <ArrayFormField
      draggable={true}
      title="Work Experience"
      values={experience.values}
      onChange={experience.onChange}
      onAdd={experience.add}
      onRemove={experience.remove}
      fields={[
        { name: "jobTitle", label: "Job Title", placeholder: "Senior Software Engineer" },
        { name: "company", label: "Company", placeholder: "Tech Corp Inc." },
        { name: "date", label: "Employment Period", placeholder: "Jan 2020 - Present" },
        {
          name: "responsibilities",
          label: "Key Responsibilities & Achievements",
          type: "markdown",
          placeholder: "Describe your main responsibilities, achievements, and impact...",
          showAI: true,
        },
      ]}
      onAIClick={(index, field) => {
        if (field === "responsibilities") {
          onAIGenerate("experience", index)
        }
      }}
      sectionId="experience"
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  </div>
)

const EducationStep = ({ education, sensors, activeId, onDragStart, onDragEnd }: {
  education: { values: Education[]; onChange: (index: number, field: string, value: string) => void; add: () => void; remove: (index: number) => void }
  sensors: ReturnType<typeof useSensors>
  activeId: string | null
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}) => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-2">Educational Background</h3>
      <p className="text-muted-foreground">Add your academic achievements and qualifications</p>
    </div>

    <ArrayFormField
      draggable={true}
      title="Education"
      values={education.values}
      onChange={education.onChange}
      onAdd={education.add}
      onRemove={education.remove}
      fields={[
        { name: "school", label: "Institution", placeholder: "University of Technology" },
        { name: "degree", label: "Degree & Major", placeholder: "Bachelor of Science in Computer Science" },
        { name: "date", label: "Graduation Date", placeholder: "May 2020" },
        { name: "gpa", label: "GPA (Optional)", placeholder: "3.8/4.0" },
      ]}
      sectionId="education"
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  </div>
)

const SkillsStep = ({ skills }: {
  skills: {
    languages: ReturnType<typeof useFormField>
    frameworks: ReturnType<typeof useFormField>
    tools: ReturnType<typeof useFormField>
  }
}) => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-2">Your Skill Arsenal</h3>
      <p className="text-muted-foreground">Highlight your technical expertise and capabilities</p>
    </div>

    <div className="grid grid-cols-1 gap-6">
      <FormField
        label="Programming Languages"
        {...skills.languages}
        placeholder="JavaScript, Python, Java, C++, TypeScript"
      />
      <FormField
        label="Frameworks & Libraries"
        {...skills.frameworks}
        placeholder="React, Node.js, Django, Spring Boot, Next.js"
      />
      <FormField label="Tools & Platforms" {...skills.tools} placeholder="Git, Docker, AWS, MongoDB, Kubernetes" />
    </div>
  </div>
)

const ProjectsStep = ({ projects, onAIGenerate, sensors, activeId, onDragStart, onDragEnd }: {
  projects: { values: Project[]; onChange: (index: number, field: string, value: string) => void; add: () => void; remove: (index: number) => void }
  onAIGenerate: (type: "project", index: number) => void
  sensors: ReturnType<typeof useSensors>
  activeId: string | null
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}) => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-2">Portfolio Showcase</h3>
      <p className="text-muted-foreground">Highlight your best projects and contributions</p>
    </div>

    <ArrayFormField
      draggable={true}
      title="Projects"
      values={projects.values}
      onChange={projects.onChange}
      onAdd={projects.add}
      onRemove={projects.remove}
      fields={[
        { name: "name", label: "Project Name", placeholder: "E-commerce Platform" },
        {
          name: "description",
          label: "Project Description",
          type: "markdown",
          placeholder: "Describe the project, your role, and the impact it made...",
          showAI: true,
        },
        { name: "technologies", label: "Technologies Used", placeholder: "React, Node.js, MongoDB, AWS" },
        {
          name: "link",
          label: "Project Link (Optional)",
          type: "url",
          placeholder: "https://github.com/johndoe/project",
        },
      ]}
      onAIClick={(index, field) => {
        if (field === "description") {
          onAIGenerate("project", index)
        }
      }}
      sectionId="projects"
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  </div>
)

const AdditionalStep = ({ certifications, references, sensors, activeId, onDragStart, onDragEnd }: {
  certifications: { values: Certification[]; onChange: (index: number, field: string, value: string) => void; add: () => void; remove: (index: number) => void }
  references: { values: Reference[]; onChange: (index: number, field: string, value: string) => void; add: () => void; remove: (index: number) => void }
  sensors: ReturnType<typeof useSensors>
  activeId: string | null
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}) => (
  <div className="space-y-12">
    <div className="text-center mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-2">Additional Credentials</h3>
      <p className="text-muted-foreground">Add certifications and references to strengthen your profile</p>
    </div>

    <ArrayFormField
      draggable={true}
      title="Certifications"
      values={certifications.values}
      onChange={certifications.onChange}
      onAdd={certifications.add}
      onRemove={certifications.remove}
      fields={[
        { name: "name", label: "Certification Name", placeholder: "AWS Certified Solutions Architect" },
        { name: "issuer", label: "Issuing Organization", placeholder: "Amazon Web Services" },
        { name: "date", label: "Date Obtained", placeholder: "March 2023" },
      ]}
      sectionId="certifications"
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />

    <ArrayFormField
      draggable={true}
      title="References"
      values={references.values}
      onChange={references.onChange}
      onAdd={references.add}
      onRemove={references.remove}
      fields={[
        { name: "name", label: "Full Name", placeholder: "Jane Smith" },
        { name: "title", label: "Job Title", placeholder: "Senior Manager" },
        { name: "company", label: "Company", placeholder: "Tech Corp Inc." },
        { name: "email", label: "Email", type: "email", placeholder: "jane.smith@techcorp.com" },
        { name: "phone", label: "Phone", type: "tel", placeholder: "+1 (555) 987-6543" },
        { name: "relationship", label: "Relationship", placeholder: "Former Manager" },
      ]}
      sectionId="references"
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  </div>
)


const ReviewStep = ({
  data,
  onDownload,
  onAnalysisComplete,
  userId,
  resumeId
}: {
  data: ResumeData;
  onDownload: () => void;
  onAnalysisComplete: (analysis: ResumeAnalysisType) => void;
  userId?: string;
  resumeId?: string | null;
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false)

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Launch!</h3>
        <p className="text-muted-foreground">Review your resume and download when you're satisfied</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardContent className="p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Name: <span className="text-foreground">{data.personalInfo.name || "Not provided"}</span>
              </p>
              <p className="text-muted-foreground">
                Title: <span className="text-foreground">{data.personalInfo.title || "Not provided"}</span>
              </p>
              <p className="text-muted-foreground">
                Email: <span className="text-foreground">{data.personalInfo.email || "Not provided"}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Summary
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Experience:{" "}
                <span className="text-foreground font-medium">
                  {data.experience.filter((exp) => exp.jobTitle).length} entries
                </span>
              </p>
              <p className="text-muted-foreground">
                Education:{" "}
                <span className="text-foreground font-medium">
                  {data.education.filter((edu) => edu.school).length} entries
                </span>
              </p>
              <p className="text-muted-foreground">
                Projects:{" "}
                <span className="text-foreground font-medium">
                  {data.projects.filter((proj) => proj.name).length} entries
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Card */}
      <Card className="border border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                AI Resume Analysis
              </h4>
              <p className="text-muted-foreground text-sm">
                Get professional insights and improvement suggestions powered by AI
              </p>
            </div>
            <Button
              onClick={() => {
                setShowAnalysis(true)
              }}
              size="lg"
              className="px-12 py-4 text-lg"
            >
              <Target className="mr-2 h-4 w-4" />
              Analyze Resume
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            • Comprehensive content analysis
            • ATS compatibility check
            • Industry-specific recommendations
            • Professional improvement suggestions
          </div>
        </CardContent>
      </Card>

      <ResumeAnalysis
        isOpen={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        resumeData={data}
        userId={userId}
        resumeId={resumeId}
      />
    </div>
  )
}

const ResumePreview = ({ data, templateId = "classic" }: { data: ResumeData; templateId?: string }) => {
  const template = RESUME_TEMPLATES.find((t) => t.id === templateId) || RESUME_TEMPLATES[0]

  switch (templateId) {
    case "classic":
      return <ClassicTemplate data={data} template={template} />
    case "creative":
      return <CreativeTemplate data={data} template={template} />
    case "minimal":
      return <MinimalTemplate data={data} template={template} />
    case "modern":
      return <ModernTemplate data={data} template={template} />
    case "photo":
      return <PhotoTemplate data={data} template={template} />
    default:
      return <ClassicTemplate data={data} template={template} />
  }
}
