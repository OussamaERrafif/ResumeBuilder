"use client"

import React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownTextarea } from "@/components/ui/markdown-textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Download,
  Moon,
  Sun,
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
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

// DND-KIT IMPORTS
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
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
import { markdownToPlainText } from "@/lib/markdown"

import AIModal from "./ai-modal"
import ResumeAnalysis from "./resume-analysis"
import TemplateSelector from "./template-selector"
import { RESUME_TEMPLATES } from "../types/templates"
import {
  ClassicTemplate,
  ModernTemplate,
  CreativeTemplate,
  MinimalTemplate,
  ExecutiveTemplate,
  PhotoTemplate,
} from "./template-previews"
import { useAuth } from "@/hooks/use-auth"
import { ResumeService } from "@/lib/resume-service"
import { FileUpload } from "@/components/ui/file-upload"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  school: string
  degree: string
  date: string
  gpa?: string
}

interface Experience {
  jobTitle: string
  company: string
  date: string
  responsibilities: string
}

interface Project {
  name: string
  description: string
  technologies: string
  link?: string
}

interface Certification {
  name: string
  issuer: string
  date: string
}

interface Reference {
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
    const newItem = Object.fromEntries(Object.keys(initialValue[0] || {}).map((key) => [key, ""])) as T
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
  { id: "review", title: "Review", icon: Eye, description: "Final review and export" },
]

interface ResumeBuilderProps {
  onBack: () => void
  editingResumeId: string | null
}

// Default sample data helper
const getDefaultPersonalInfo = (data: ResumeData) => ({
  name: data.personalInfo.name || 'OUSSAMA ERRAFIF',
  title: data.personalInfo.title || 'Software engineer',
  email: data.personalInfo.email || 'oussama.errafif@example.com',
  phone: data.personalInfo.phone || '+212 6 12 34 56 78',
  location: data.personalInfo.location || 'Agadir, Morocco',
  summary: data.personalInfo.summary || 'Passionate software engineer with 2+ years of experience in full-stack development. Specialized in modern web technologies including React, Node.js, and Python. Proven track record of delivering high-quality applications and improving system performance.'
})

const getDefaultSkills = (data: ResumeData) => ({
  languages: data.skills.languages || 'C, C++, JAVA, Python, PHP, JavaScript, HTML, CSS, Bash, R',
  frameworks: data.skills.frameworks || 'ReactJS, Angular, NextJS, FastAPI, Redux, NumPy, Pandas, SciPy, Matplotlib',
  tools: data.skills.tools || 'Git, Linux, Docker, VS Code, Eclipse, MySQL, MongoDB'
})

// Helper function for consistent contact information across PDF generation
const getDefaultContactInfo = (data: ResumeData, separator = ' • ') => {
  const email = data.personalInfo.email || 'oussama.errafif@example.com'
  const phone = data.personalInfo.phone || '+212 6 12 34 56 78'
  const location = data.personalInfo.location || 'Agadir, Morocco'
  return `${email}${separator}${phone}${separator}${location}`
}

export default function ResumeBuilder({ onBack, editingResumeId }: ResumeBuilderProps) {
  const [currentSection, setCurrentSection] = useState("personal")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiModalType, setAiModalType] = useState<"summary" | "experience" | "project" | null>(null)
  const [aiModalIndex, setAiModalIndex] = useState<number | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("classic")
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Form fields
  const name = useFormField("OUSSAMA ERRAFIF")
  const title = useFormField("Software engineer")
  const email = useFormField("oussama.errafif@example.com")
  const phone = useFormField("+212 6 12 34 56 78")
  const location = useFormField("Agadir, Morocco")
  const summary = useFormField("Passionate software engineer with 2+ years of experience in full-stack development. Specialized in modern web technologies including React, Node.js, and Python. Proven track record of delivering high-quality applications and improving system performance.")

  const links = useArrayFormField([
    { name: "LinkedIn", url: "https://linkedin.com/in/oussama-errafif" },
    { name: "GitHub", url: "https://github.com/OussamaERrafif" },
    { name: "HackerRank", url: "https://hackerrank.com/oussama" },
    { name: "Portfolio", url: "https://oussama-portfolio.dev" }
  ])
  
  const education = useArrayFormField([
    { school: "ENSA", degree: "Engineer G INFO", date: "Act 2022 - July 2025", gpa: "16.5/20" },
    { school: "CPGE", degree: "DEUG PCSI", date: "Act 2020 - June 2022", gpa: "15.2/20" },
    { school: "EL FATIH", degree: "Baccalauréat", date: "2019 - 2020", gpa: "17.8/20" }
  ])
  
  const experience = useArrayFormField([
    { 
      jobTitle: "Full-Stack Developer", 
      company: "Lexovit", 
      date: "Mars | Fév 2025 - Sep 2025", 
      responsibilities: "• Created multiple pages using React and Redux for the frontend, and FastAPI for the backend\n• Developed an ETL process to import data from Excel to a MySQL database\n• Implemented a RAG (Retrieval-Augmented Generation) system for file applications" 
    },
    { 
      jobTitle: "Full-Stack Developer", 
      company: "PFA", 
      date: "Fév 2024 - Mai 2024", 
      responsibilities: "• Developed a full-stack web app using AngularJs and NextJS, achieving 30% faster frontend rendering and 25% quicker backend response times\n• Implemented secure JWT authentication, enhancing user data security and session management\n• Used advanced UI/UX with Angular and Next libraries and services rate, demonstrating robust scalability" 
    }
  ])
  
  const projects = useArrayFormField([
    { 
      name: "ResumeBuilderPy", 
      description: "• Developed a Python tool to generate professional resumes in LaTeX with customizable user inputs\n• Automated PDF compilation, reducing resume creation time by 70%", 
      technologies: "Python, LaTeX, JSON, PDF", 
      link: "https://github.com/OussamaERrafif/ResumeBuilderPy" 
    },
    { 
      name: "NetScan", 
      description: "• Developed a multithreaded network scanner with service/OS detection, traceroute, and export in JSON, XML, and CSV\n• Enhanced usability with rate limiting, a GUI, and an interactive network map", 
      technologies: "Python, Threading, Network Programming, GUI", 
      link: "https://github.com/OussamaERrafif/NetScan" 
    },
    { 
      name: "Machine Learning Models", 
      description: "• Built and optimized machine learning models (Decision Trees, Random Forest, Logistic Regression) for churn analysis, sentiment analysis and weather prediction, achieving up to 92% accuracy and 26% model performance enhancement\n• Applied techniques like Grid Search, cross-validation, feature selection, and text vectorization (TF-IDF, Bag of Words) effectively for optimal ML model selection from large-scale data", 
      technologies: "Python, Scikit-learn, Pandas, NumPy, TensorFlow", 
      link: "" 
    }
  ])
  
  const certifications = useArrayFormField([
    { name: "Python for Data Science, AI & Development", issuer: "IBM", date: "2024" },
    { name: "Neural Networks and Deep Learning", issuer: "DeepLearning.AI", date: "2024" }
  ])
  
  const references = useArrayFormField([
    { name: "Dr. Ahmed Bennani", title: "Professor", company: "ENSA Agadir", email: "a.bennani@ensa-agadir.ac.ma", phone: "+212 5 28 22 70 27" },
    { name: "Sarah Johnson", title: "Senior Developer", company: "Tech Solutions", email: "s.johnson@techsolutions.com", phone: "+1 555 123 4567" }
  ])

  const languages = useFormField("C, C++, JAVA, Python, PHP, JavaScript, HTML, CSS, Bash, R")
  const frameworks = useFormField("ReactJS, Angular, NextJS, FastAPI, Redux, NumPy, Pandas, SciPy, Matplotlib")
  const tools = useFormField("Git, Linux, Docker, VS Code, Eclipse, MySQL, MongoDB")

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
    ],
  )

  const { user } = useAuth()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Check if photo is required for selected template
  const selectedTemplateData = RESUME_TEMPLATES.find((t) => t.id === selectedTemplate)
  const isPhotoRequired = selectedTemplateData?.requiresPhoto || false

  // Clear profile image when switching to a template that doesn't require photos
  useEffect(() => {
    if (!isPhotoRequired && profileImage) {
      setProfileImage(null)
    }
  }, [isPhotoRequired, profileImage])

  // Load existing resume data if editing
  useEffect(() => {
    const loadResumeData = async () => {
      if (editingResumeId && user) {
        const { data, error } = await ResumeService.getResume(editingResumeId, user.id)

        if (error) {
          console.error("Error loading resume:", error)
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

          if (data.template_id) setSelectedTemplate(data.template_id)
        }
      }
    }

    loadResumeData()
  }, [editingResumeId, user])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    setIsDarkMode(savedTheme === "dark")
  }, [])

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
    document.documentElement.classList.toggle("dark", isDarkMode)
    document.documentElement.classList.toggle("light", !isDarkMode)
  }, [isDarkMode])

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
        console.error("Error updating resume:", error)
      }
    } else {
      // Create new resume
      const { error } = await ResumeService.createResume({
        user_id: user.id,
        name: resumeName,
        template_id: selectedTemplate,
        data: resumeDataToSave,
      })

      if (error) {
        setSaveError("Failed to create resume")
        console.error("Error creating resume:", error)
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

  // Auto-save functionality
  useEffect(() => {
    if (!user) return
    
    // Don't auto-save if we're still loading an existing resume
    if (editingResumeId && !lastSaved && !name.value) return
    
    // Don't auto-save immediately after loading or if no content
    if (!lastSaved && !name.value && !summary.value) return

    const autoSaveTimer = setTimeout(async () => {
      setIsAutoSaving(true)
      await saveResume()
      setLastSaved(new Date())
      setIsAutoSaving(false)
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
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

  // Helper function to validate template rendering
  const validateTemplateRendering = useCallback(() => {
    const previewElement = document.querySelector('.resume-preview-container') || 
                          document.getElementById('resume-preview-capture')
    if (!previewElement) {
      console.error('❌ Template validation failed: Preview element not found')
      return false
    }
    
    const hasVisibleContent = previewElement.scrollHeight > 100 && previewElement.scrollWidth > 100
    const hasTextContent = previewElement.textContent && previewElement.textContent.trim().length > 50
    
    console.log('🔍 Template validation:', {
      element: !!previewElement,
      dimensions: `${previewElement.scrollWidth}x${previewElement.scrollHeight}`,
      hasContent: hasVisibleContent,
      hasText: hasTextContent,
      template: selectedTemplate,
      textContentLength: previewElement.textContent?.trim().length || 0
    })
    
    return hasVisibleContent && hasTextContent
  }, [selectedTemplate])

  // Debug function - can be called from browser console: window.debugResumeDownload()
  useEffect(() => {
    (window as any).debugResumeDownload = () => {
      console.log('🐛 DEBUG: Resume Download System')
      console.log('📋 Current template:', selectedTemplate)
      console.log('📊 Resume data:', resumeData)
      console.log('🔍 Template validation:', validateTemplateRendering())
      
      const previewElement = document.querySelector('.resume-preview-container') || 
                             document.getElementById('resume-preview-capture')
      if (previewElement) {
        console.log('📐 Preview element:', {
          className: previewElement.className,
          id: previewElement.id,
          scrollWidth: previewElement.scrollWidth,
          scrollHeight: previewElement.scrollHeight,
          textContent: previewElement.textContent?.substring(0, 200) + '...',
          innerHTML: previewElement.innerHTML.substring(0, 500) + '...'
        })
      }
    }
    
    return () => {
      delete (window as any).debugResumeDownload
    }
  }, [selectedTemplate, resumeData, validateTemplateRendering])

  const handleDownload = useCallback(async () => {
    if (isDownloading) return
    
    setIsDownloading(true)
    await saveResume()

    try {
      console.log('🎯 ULTIMATE FIX: Starting download process for template:', selectedTemplate)
      
      // Method 1: Try to get the actual rendered template component
      const templateName = RESUME_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Resume'
      
      // Create a temporary container with the exact same template component
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.top = '-10000px'
      tempContainer.style.left = '-10000px'
      tempContainer.style.width = '210mm'
      tempContainer.style.height = '297mm'
      tempContainer.style.backgroundColor = '#ffffff'
      tempContainer.style.color = '#000000'
      tempContainer.style.padding = '20mm'
      tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif'
      tempContainer.style.fontSize = '12px'
      tempContainer.style.lineHeight = '1.4'
      tempContainer.className = 'temp-resume-container'
      
      document.body.appendChild(tempContainer)
      
      // Render the template directly to this container
      let templateHTML = ''
      
      switch (selectedTemplate) {
        case 'modern':
          templateHTML = generateModernHTML(resumeData)
          break
        case 'creative':
          templateHTML = generateCreativeHTML(resumeData)
          break
        case 'minimal':
          templateHTML = generateMinimalHTML(resumeData)
          break
        case 'executive':
          templateHTML = generateExecutiveHTML(resumeData)
          break
        case 'tech':
          templateHTML = generateModernHTML(resumeData) // Use modern for tech
          break
        case 'photo':
          templateHTML = generatePhotoHTML(resumeData)
          break
        default:
          templateHTML = generateClassicHTML(resumeData)
          break
      }
      
      tempContainer.innerHTML = templateHTML
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Now capture this container with html2canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        logging: false
      })
      
      // Clean up temp container
      document.body.removeChild(tempContainer)
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Fit to page with margins
      const margin = 10
      const maxWidth = pageWidth - (margin * 2)
      const maxHeight = pageHeight - (margin * 2)
      
      const imgAspectRatio = canvas.width / canvas.height
      const pageAspectRatio = maxWidth / maxHeight
      
      let finalWidth, finalHeight, xPosition, yPosition
      
      if (imgAspectRatio > pageAspectRatio) {
        finalWidth = maxWidth
        finalHeight = maxWidth / imgAspectRatio
        xPosition = margin
        yPosition = (pageHeight - finalHeight) / 2
      } else {
        finalHeight = maxHeight
        finalWidth = maxHeight * imgAspectRatio
        xPosition = (pageWidth - finalWidth) / 2
        yPosition = margin
      }
      
      pdf.addImage(imgData, 'PNG', xPosition, yPosition, finalWidth, finalHeight)
      
      const fileName = `${resumeData.personalInfo.name || "Resume"}_${templateName}_${Date.now()}.pdf`
      pdf.save(fileName)
      
      toast({
        title: "✅ SUCCESS! Resume Downloaded!",
        description: `Your ${templateName} template has been downloaded with EXACT preview matching!`,
        duration: 5000,
      })
      
    } catch (error) {
      console.error('❌ HTML method failed, using direct PDF generation:', error)
      
      // Fallback: Enhanced programmatic PDF generation that mimics templates
      generateEnhancedPDFByTemplate(selectedTemplate, resumeData)
      
      const templateName = RESUME_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Resume'
      toast({
        title: "✅ Resume Downloaded (Fallback)",
        description: `Generated ${templateName} PDF using enhanced fallback method.`,
        duration: 3000,
      })
    } finally {
      setIsDownloading(false)
    }
  }, [resumeData, selectedTemplate, saveResume, toast, isDownloading])

  const generateEnhancedPDFByTemplate = useCallback((templateId: string, data: ResumeData) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const template = RESUME_TEMPLATES.find(t => t.id === templateId) || RESUME_TEMPLATES[0]
    
    // Enhanced template-specific PDF generation with better styling
    switch (templateId) {
      case 'modern':
        generateEnhancedModernPDF(pdf, data, template)
        break
      case 'creative':
        generateEnhancedCreativePDF(pdf, data, template)
        break
      case 'minimal':
        generateEnhancedMinimalPDF(pdf, data, template)
        break
      case 'executive':
        generateEnhancedExecutivePDF(pdf, data, template)
        break
      case 'tech':
        generateEnhancedModernPDF(pdf, data, template)
        break
      case 'photo':
        generateEnhancedPhotoPDF(pdf, data, template)
        break
      default:
        generateEnhancedClassicPDF(pdf, data, template)
        break
    }

    const fileName = `${data.personalInfo.name || "Resume"}_${template.name}_Enhanced.pdf`
    pdf.save(fileName)
  }, [])

  // HTML Template Generation Functions
  const generateClassicHTML = useCallback((data: ResumeData) => {
    return `
      <div style="font-family: 'Times New Roman', serif; color: #000; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #000; padding-bottom: 15px;">
          <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 8px 0; letter-spacing: 1px;">${data.personalInfo.name || 'OUSSAMA ERRAFIF'}</h1>
          <p style="font-size: 16px; margin: 0 0 8px 0; font-weight: 500; color: #333;">${data.personalInfo.title || 'Software engineer'}</p>
          <p style="font-size: 13px; margin: 0; color: #555;">${data.personalInfo.email || 'oussama.errafif@example.com'} | ${data.personalInfo.phone || '+212 6 12 34 56 78'} | ${data.personalInfo.location || 'Agadir, Morocco'}</p>
        </div>
        
        ${data.personalInfo.summary ? `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #333; margin: 0 0 8px 0; padding-bottom: 4px; color: #333;">PROFESSIONAL SUMMARY</h2>
            <p style="font-size: 12px; text-align: justify; line-height: 1.6; margin: 8px 0; color: #444;">${data.personalInfo.summary}</p>
          </div>
        ` : ''}
        
        ${data.experience.filter(exp => exp.jobTitle).length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #333; margin: 0 0 12px 0; padding-bottom: 4px; color: #333;">EXPERIENCE</h2>
            ${data.experience.filter(exp => exp.jobTitle).map(exp => `
              <div style="margin-bottom: 15px; padding-left: 5px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                  <h3 style="font-size: 14px; font-weight: bold; margin: 0; color: #222;">${exp.jobTitle} - ${exp.company}</h3>
                  <span style="font-size: 11px; font-style: italic; color: #666;">${exp.date}</span>
                </div>
                ${exp.responsibilities ? `<div style="font-size: 11px; margin-top: 5px; text-align: justify; line-height: 1.5; color: #555;">${exp.responsibilities.replace(/\n/g, '<br>')}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${(data.skills.languages || data.skills.frameworks || data.skills.tools) ? `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #333; margin: 0 0 8px 0; padding-bottom: 4px; color: #333;">SKILLS</h2>
            <div style="padding-left: 5px;">
              <p style="font-size: 11px; margin: 6px 0; line-height: 1.4;"><strong style="color: #333;">Programming Languages:</strong> <span style="color: #555;">${data.skills.languages || 'C, C++, JAVA, Python, PHP, JavaScript, HTML, CSS, Bash, R'}</span></p>
              <p style="font-size: 11px; margin: 6px 0; line-height: 1.4;"><strong style="color: #333;">Libraries/Frameworks:</strong> <span style="color: #555;">${data.skills.frameworks || 'ReactJS, Angular, NextJS, FastAPI, Redux, NumPy, Pandas, SciPy, Matplotlib'}</span></p>
              <p style="font-size: 11px; margin: 6px 0; line-height: 1.4;"><strong style="color: #333;">Tools/Platforms:</strong> <span style="color: #555;">${data.skills.tools || 'Git, Linux, Docker, VS Code, Eclipse, MySQL, MongoDB'}</span></p>
              <p style="font-size: 11px; margin: 6px 0; line-height: 1.4;"><strong style="color: #333;">Databases:</strong> <span style="color: #555;">SQL, MongoDB</span></p>
            </div>
          </div>
        ` : `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #333; margin: 0 0 8px 0; padding-bottom: 4px; color: #333;">SKILLS</h2>
            <div style="padding-left: 5px;">
              <p style="font-size: 11px; margin: 6px 0; line-height: 1.4;"><strong style="color: #333;">Programming Languages:</strong> <span style="color: #555;">C, C++, JAVA, Python, PHP, JavaScript, HTML, CSS, Bash, R</span></p>
              <p style="font-size: 11px; margin: 6px 0; line-height: 1.4;"><strong style="color: #333;">Libraries/Frameworks:</strong> <span style="color: #555;">ReactJS, Angular, NextJS, FastAPI, Redux, NumPy, Pandas, SciPy, Matplotlib</span></p>
              <p style="font-size: 11px; margin: 6px 0; line-height: 1.4;"><strong style="color: #333;">Tools/Platforms:</strong> <span style="color: #555;">Git, Linux, Docker, VS Code, Eclipse, MySQL, MongoDB</span></p>
              <p style="font-size: 11px; margin: 6px 0; line-height: 1.4;"><strong style="color: #333;">Databases:</strong> <span style="color: #555;">SQL, MongoDB</span></p>
            </div>
          </div>
        `}
        
        ${data.education.filter(edu => edu.school).length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #333; margin: 0 0 8px 0; padding-bottom: 4px; color: #333;">EDUCATION</h2>
            ${data.education.filter(edu => edu.school).map(edu => `
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; padding-left: 5px;">
                <div>
                  <h3 style="font-size: 13px; font-weight: bold; margin: 0 0 2px 0; color: #222;">${edu.school}</h3>
                  <p style="font-size: 11px; margin: 0; color: #555;">${edu.degree}${edu.gpa ? ` - GPA: ${edu.gpa}` : ''}</p>
                </div>
                <span style="font-size: 11px; font-style: italic; color: #666;">${edu.date}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${data.projects.filter(proj => proj.name).length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #333; margin: 0 0 8px 0; padding-bottom: 4px; color: #333;">PROJECTS</h2>
            ${data.projects.filter(proj => proj.name).map(proj => `
              <div style="margin-bottom: 12px; padding-left: 5px;">
                <h3 style="font-size: 13px; font-weight: bold; margin: 0 0 3px 0; color: #222;">${proj.name}</h3>
                ${proj.description ? `<p style="font-size: 11px; margin: 3px 0; text-align: justify; line-height: 1.5; color: #555;">${proj.description}</p>` : ''}
                ${proj.technologies ? `<p style="font-size: 10px; font-style: italic; margin: 3px 0; color: #666;"><strong>Technologies:</strong> ${proj.technologies}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${data.certifications.filter(cert => cert.name).length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #333; margin: 0 0 8px 0; padding-bottom: 4px; color: #333;">CERTIFICATIONS</h2>
            ${data.certifications.filter(cert => cert.name).map(cert => `
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; padding-left: 5px;">
                <div>
                  <h3 style="font-size: 13px; font-weight: bold; margin: 0 0 2px 0; color: #222;">${cert.name}</h3>
                  <p style="font-size: 11px; margin: 0; color: #666;">${cert.issuer}</p>
                </div>
                <span style="font-size: 11px; font-style: italic; color: #666;">${cert.date}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `
  }, [])

  const generateModernHTML = useCallback((data: ResumeData) => {
    return `
      <div style="font-family: 'Inter', 'Segoe UI', sans-serif; color: #333; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; margin: -20px -20px 25px -20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="font-size: 32px; font-weight: 300; margin: 0 0 10px 0; letter-spacing: 2px;">${data.personalInfo.name || 'OUSSAMA ERRAFIF'}</h1>
          <p style="font-size: 18px; margin: 0 0 10px 0; opacity: 0.9; font-weight: 400;">${data.personalInfo.title || 'Software engineer'}</p>
          <p style="font-size: 14px; margin: 0; opacity: 0.8;">${data.personalInfo.email || 'oussama.errafif@example.com'} • ${data.personalInfo.phone || '+212 6 12 34 56 78'} • ${data.personalInfo.location || 'Agadir, Morocco'}</p>
        </div>
        
        ${data.personalInfo.summary ? `
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; font-weight: 600; color: #3b82f6; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.8px;">Professional Summary</h2>
            <p style="font-size: 12px; text-align: justify; color: #555; line-height: 1.6; padding: 15px; background: #f8fafc; border-radius: 6px; border-left: 4px solid #3b82f6;">${data.personalInfo.summary}</p>
          </div>
        ` : ''}
        
        ${data.experience.filter(exp => exp.jobTitle).length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; font-weight: 600; color: #3b82f6; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 0.8px;">Experience</h2>
            ${data.experience.filter(exp => exp.jobTitle).map(exp => `
              <div style="margin-bottom: 20px; padding: 18px; border-left: 4px solid #3b82f6; background: #f8fafc; border-radius: 0 6px 6px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <h3 style="font-size: 14px; font-weight: 600; margin: 0; color: #1e40af;">${exp.jobTitle}</h3>
                  <span style="font-size: 11px; color: #64748b; background: #e2e8f0; padding: 4px 12px; border-radius: 12px; font-weight: 500;">${exp.date}</span>
                </div>
                <p style="font-size: 13px; color: #475569; margin: 0 0 8px 0; font-weight: 500;">${exp.company}</p>
                ${exp.responsibilities ? `<div style="font-size: 11px; margin-top: 8px; color: #64748b; text-align: justify; line-height: 1.6;">${exp.responsibilities.replace(/\n/g, '<br>')}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${(data.skills.languages || data.skills.frameworks || data.skills.tools) ? `
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; font-weight: 600; color: #3b82f6; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.8px;">Skills</h2>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
              ${data.skills.languages ? `<p style="font-size: 12px; margin: 8px 0; line-height: 1.5;"><strong style="color: #1e40af; font-size: 12px;">Languages:</strong><br><span style="color: #64748b; margin-top: 4px; display: inline-block;">${data.skills.languages}</span></p>` : ''}
              ${data.skills.frameworks ? `<p style="font-size: 12px; margin: 8px 0; line-height: 1.5;"><strong style="color: #1e40af; font-size: 12px;">Frameworks:</strong><br><span style="color: #64748b; margin-top: 4px; display: inline-block;">${data.skills.frameworks}</span></p>` : ''}
              ${data.skills.tools ? `<p style="font-size: 12px; margin: 8px 0; line-height: 1.5;"><strong style="color: #1e40af; font-size: 12px;">Tools:</strong><br><span style="color: #64748b; margin-top: 4px; display: inline-block;">${data.skills.tools}</span></p>` : ''}
            </div>
          </div>
        ` : ''}
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
          ${data.education.filter(edu => edu.school).length > 0 ? `
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h2 style="font-size: 16px; font-weight: 600; color: #3b82f6; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.8px;">Education</h2>
              ${data.education.filter(edu => edu.school).map(edu => `
                <div style="margin-bottom: 12px; padding: 12px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h3 style="font-size: 13px; font-weight: 600; margin: 0 0 4px 0; color: #1e40af;">${edu.school}</h3>
                  <p style="font-size: 12px; margin: 2px 0; color: #64748b; line-height: 1.4;">${edu.degree}</p>
                  <p style="font-size: 10px; margin: 0; color: #94a3b8; font-weight: 500;">${edu.date}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data.projects.filter(proj => proj.name).length > 0 ? `
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h2 style="font-size: 16px; font-weight: 600; color: #3b82f6; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.8px;">Projects</h2>
              ${data.projects.filter(proj => proj.name).slice(0, 3).map(proj => `
                <div style="margin-bottom: 12px; padding: 12px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h3 style="font-size: 13px; font-weight: 600; margin: 0 0 4px 0; color: #1e40af;">${proj.name}</h3>
                  ${proj.description ? `<p style="font-size: 10px; margin: 2px 0; color: #64748b; text-align: justify; line-height: 1.4;">${proj.description.substring(0, 120)}...</p>` : ''}
                  ${proj.technologies ? `<p style="font-size: 9px; margin: 2px 0; color: #94a3b8; font-style: italic;"><strong>Tech:</strong> ${proj.technologies.split(',').slice(0, 3).join(', ')}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        ${data.certifications.filter(cert => cert.name).length > 0 ? `
          <div style="margin-top: 25px;">
            <h2 style="font-size: 16px; font-weight: 600; color: #3b82f6; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.8px;">Certifications</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
              ${data.certifications.filter(cert => cert.name).map(cert => `
                <div style="padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                  <h3 style="font-size: 13px; font-weight: 600; margin: 0 0 4px 0; color: #1e40af;">${cert.name}</h3>
                  <p style="font-size: 12px; margin: 2px 0; color: #64748b; font-weight: 500;">${cert.issuer}</p>
                  <p style="font-size: 10px; margin: 0; color: #94a3b8; font-weight: 500;">${cert.date}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `
  }, [])

  const generateCreativeHTML = useCallback((data: ResumeData) => {
    return `
      <div style="font-family: 'Helvetica', sans-serif; color: #2d3748; line-height: 1.4;">
        <div style="display: flex; margin-bottom: 20px;">
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #8b5cf6, #a855f7); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">${(data.personalInfo.name || 'OUSSAMA ERRAFIF').split(' ').map(n => n[0]).join('').substring(0,2)}</span>
          </div>
          <div style="flex: 1;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 5px 0; color: #8b5cf6;">${data.personalInfo.name || 'OUSSAMA ERRAFIF'}</h1>
            <p style="font-size: 14px; margin: 0 0 5px 0; color: #4a5568;">${data.personalInfo.title || 'Software engineer'}</p>
            <p style="font-size: 11px; margin: 0; color: #718096;">${data.personalInfo.email || 'oussama.errafif@example.com'} | ${data.personalInfo.phone || '+212 6 12 34 56 78'} | ${data.personalInfo.location || 'Agadir, Morocco'}</p>
          </div>
        </div>
        
        ${data.personalInfo.summary ? `
          <div style="margin-bottom: 18px; padding: 15px; background: linear-gradient(135deg, #f7fafc, #edf2f7); border-left: 4px solid #8b5cf6; border-radius: 0 6px 6px 0;">
            <h2 style="font-size: 13px; font-weight: 600; color: #8b5cf6; margin: 0 0 5px 0;">ABOUT ME</h2>
            <p style="font-size: 10px; text-align: justify; color: #4a5568; font-style: italic;">${data.personalInfo.summary}</p>
          </div>
        ` : ''}
        
        ${data.experience.filter(exp => exp.jobTitle).length > 0 ? `
          <div style="margin-bottom: 18px;">
            <h2 style="font-size: 13px; font-weight: 600; color: #8b5cf6; margin: 0 0 10px 0; position: relative;">
              <span style="background: #f7fafc; padding-right: 10px;">EXPERIENCE</span>
              <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e2e8f0; z-index: -1;"></div>
            </h2>
            ${data.experience.filter(exp => exp.jobTitle).map((exp, index) => `
              <div style="margin-bottom: 12px; position: relative; padding-left: 20px;">
                <div style="position: absolute; left: 0; top: 5px; width: 8px; height: 8px; background: ${index % 2 === 0 ? '#8b5cf6' : '#a855f7'}; border-radius: 50%;"></div>
                <div style="background: white; padding: 10px; border-radius: 6px; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.1); border: 1px solid #e2e8f0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                    <h3 style="font-size: 11px; font-weight: 600; margin: 0; color: #2d3748;">${exp.jobTitle}</h3>
                    <span style="font-size: 9px; color: #8b5cf6; background: #f3e8ff; padding: 2px 6px; border-radius: 8px;">${exp.date}</span>
                  </div>
                  <p style="font-size: 10px; color: #8b5cf6; margin: 0 0 5px 0; font-weight: 500;">${exp.company}</p>
                  ${exp.responsibilities ? `<div style="font-size: 9px; color: #4a5568; text-align: justify;">${exp.responsibilities.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          ${(data.skills.languages || data.skills.frameworks || data.skills.tools) ? `
            <div>
              <h2 style="font-size: 13px; font-weight: 600; color: #8b5cf6; margin: 0 0 8px 0;">SKILLS</h2>
              <div style="background: linear-gradient(135deg, #f3e8ff, #faf5ff); padding: 10px; border-radius: 6px;">
                ${data.skills.languages ? `<div style="margin-bottom: 5px;"><span style="font-size: 9px; font-weight: 600; color: #8b5cf6;">Languages:</span><br><span style="font-size: 8px; color: #4a5568;">${data.skills.languages}</span></div>` : ''}
                ${data.skills.frameworks ? `<div style="margin-bottom: 5px;"><span style="font-size: 9px; font-weight: 600; color: #8b5cf6;">Frameworks:</span><br><span style="font-size: 8px; color: #4a5568;">${data.skills.frameworks}</span></div>` : ''}
                ${data.skills.tools ? `<div><span style="font-size: 9px; font-weight: 600; color: #8b5cf6;">Tools:</span><br><span style="font-size: 8px; color: #4a5568;">${data.skills.tools}</span></div>` : ''}
              </div>
            </div>
          ` : ''}
          
          ${data.education.filter(edu => edu.school).length > 0 ? `
            <div>
              <h2 style="font-size: 13px; font-weight: 600; color: #8b5cf6; margin: 0 0 8px 0;">EDUCATION</h2>
              ${data.education.filter(edu => edu.school).map(edu => `
                <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #e2e8f0; margin-bottom: 5px;">
                  <h3 style="font-size: 10px; font-weight: 600; margin: 0; color: #2d3748;">${edu.school}</h3>
                  <p style="font-size: 9px; margin: 1px 0; color: #4a5568;">${edu.degree}</p>
                  <p style="font-size: 8px; margin: 0; color: #718096;">${edu.date}${edu.gpa ? ` • ${edu.gpa}` : ''}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        ${data.certifications.filter(cert => cert.name).length > 0 ? `
          <div style="margin-top: 15px;">
            <h2 style="font-size: 13px; font-weight: 600; color: #8b5cf6; margin: 0 0 8px 0;">CERTIFICATIONS</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
              ${data.certifications.filter(cert => cert.name).map(cert => `
                <div style="background: linear-gradient(135deg, #f3e8ff, #faf5ff); padding: 8px; border-radius: 4px; border: 1px solid #d8b4fe;">
                  <h3 style="font-size: 10px; font-weight: 600; margin: 0; color: #2d3748;">${cert.name}</h3>
                  <p style="font-size: 9px; margin: 1px 0; color: #4a5568;">${cert.issuer}</p>
                  <p style="font-size: 8px; margin: 0; color: #718096;">${cert.date}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `
  }, [])

  const generateMinimalHTML = useCallback((data: ResumeData) => {
    return `
      <div style="font-family: 'Arial', sans-serif; color: #1a1a1a; line-height: 1.5; max-width: 100%;">
        <div style="margin-bottom: 25px;">
          <h1 style="font-size: 32px; font-weight: 300; margin: 0 0 5px 0; letter-spacing: -0.5px;">${data.personalInfo.name || 'OUSSAMA ERRAFIF'}</h1>
          <p style="font-size: 14px; margin: 0 0 8px 0; color: #666;">${data.personalInfo.title || 'Software engineer'}</p>
          <p style="font-size: 11px; margin: 0; color: #888;">${data.personalInfo.email || 'oussama.errafif@example.com'} • ${data.personalInfo.phone || '+212 6 12 34 56 78'} • ${data.personalInfo.location || 'Agadir, Morocco'}</p>
        </div>
        
        ${data.personalInfo.summary ? `
          <div style="margin-bottom: 25px;">
            <p style="font-size: 11px; text-align: justify; color: #333; font-weight: 400; line-height: 1.6;">${data.personalInfo.summary}</p>
          </div>
        ` : ''}
        
        ${data.experience.filter(exp => exp.jobTitle).length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 12px; font-weight: 600; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a;">Experience</h2>
            ${data.experience.filter(exp => exp.jobTitle).map(exp => `
              <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px;">
                  <h3 style="font-size: 11px; font-weight: 600; margin: 0; color: #1a1a1a;">${exp.jobTitle}</h3>
                  <span style="font-size: 9px; color: #888; font-weight: 400;">${exp.date}</span>
                </div>
                <p style="font-size: 10px; margin: 0 0 5px 0; color: #666; font-weight: 500;">${exp.company}</p>
                ${exp.responsibilities ? `<div style="font-size: 10px; margin-top: 5px; color: #555; text-align: justify; line-height: 1.5;">${exp.responsibilities.replace(/\n/g, '<br>')}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${(data.skills.languages || data.skills.frameworks || data.skills.tools) ? `
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 12px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a;">Skills</h2>
            ${data.skills.languages ? `<p style="font-size: 10px; margin: 5px 0; color: #333;"><span style="font-weight: 600;">Languages</span> ${data.skills.languages}</p>` : ''}
            ${data.skills.frameworks ? `<p style="font-size: 10px; margin: 5px 0; color: #333;"><span style="font-weight: 600;">Frameworks</span> ${data.skills.frameworks}</p>` : ''}
            ${data.skills.tools ? `<p style="font-size: 10px; margin: 5px 0; color: #333;"><span style="font-weight: 600;">Tools</span> ${data.skills.tools}</p>` : ''}
          </div>
        ` : ''}
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          ${data.education.filter(edu => edu.school).length > 0 ? `
            <div>
              <h2 style="font-size: 12px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a;">Education</h2>
              ${data.education.filter(edu => edu.school).map(edu => `
                <div style="margin-bottom: 10px;">
                  <h3 style="font-size: 10px; font-weight: 600; margin: 0; color: #1a1a1a;">${edu.school}</h3>
                  <p style="font-size: 9px; margin: 2px 0; color: #666;">${edu.degree}</p>
                  <p style="font-size: 9px; margin: 0; color: #888;">${edu.date}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data.projects.filter(proj => proj.name).length > 0 ? `
            <div>
              <h2 style="font-size: 12px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a;">Projects</h2>
              ${data.projects.filter(proj => proj.name).slice(0, 3).map(proj => `
                <div style="margin-bottom: 10px;">
                  <h3 style="font-size: 10px; font-weight: 600; margin: 0; color: #1a1a1a;">${proj.name}</h3>
                  ${proj.description ? `<p style="font-size: 9px; margin: 2px 0; color: #666; text-align: justify;">${proj.description.substring(0, 120)}...</p>` : ''}
                  ${proj.technologies ? `<p style="font-size: 8px; margin: 2px 0; color: #888; font-style: italic;">${proj.technologies}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        ${data.certifications.filter(cert => cert.name).length > 0 ? `
          <div style="margin-top: 25px;">
            <h2 style="font-size: 12px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a;">Certifications</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              ${data.certifications.filter(cert => cert.name).map(cert => `
                <div style="border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">
                  <h3 style="font-size: 10px; font-weight: 600; margin: 0; color: #1a1a1a;">${cert.name}</h3>
                  <p style="font-size: 9px; margin: 2px 0; color: #666;">${cert.issuer}</p>
                  <p style="font-size: 9px; margin: 0; color: #888;">${cert.date}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `
  }, [])

  const generateExecutiveHTML = useCallback((data: ResumeData) => {
    return `
      <div style="font-family: 'Georgia', serif; color: #2c3e50; line-height: 1.5;">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px double #34495e;">
          <h1 style="font-size: 28px; font-weight: normal; margin: 0 0 8px 0; color: #2c3e50; font-variant: small-caps;">${data.personalInfo.name || 'OUSSAMA ERRAFIF'}</h1>
          <div style="width: 60px; height: 2px; background: #34495e; margin: 0 auto 8px auto;"></div>
          <p style="font-size: 16px; margin: 0 0 8px 0; color: #5d6d7e; font-style: italic;">${data.personalInfo.title || 'Software engineer'}</p>
          <p style="font-size: 12px; margin: 0; color: #7f8c8d;">${data.personalInfo.email || 'oussama.errafif@example.com'} | ${data.personalInfo.phone || '+212 6 12 34 56 78'} | ${data.personalInfo.location || 'Agadir, Morocco'}</p>
        </div>
        
        ${data.personalInfo.summary ? `
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 14px; font-weight: bold; color: #2c3e50; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; position: relative; padding-bottom: 5px;">
              Executive Summary
              <div style="position: absolute; bottom: 0; left: 0; width: 40px; height: 2px; background: #34495e;"></div>
            </h2>
            <p style="font-size: 11px; text-align: justify; color: #34495e; line-height: 1.6; font-style: italic;">${data.personalInfo.summary}</p>
          </div>
        ` : ''}
        
        ${data.experience.filter(exp => exp.jobTitle).length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 14px; font-weight: bold; color: #2c3e50; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px; position: relative; padding-bottom: 5px;">
              Professional Experience
              <div style="position: absolute; bottom: 0; left: 0; width: 40px; height: 2px; background: #34495e;"></div>
            </h2>
            ${data.experience.filter(exp => exp.jobTitle).map(exp => `
              <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #34495e; border-radius: 0 4px 4px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                  <h3 style="font-size: 12px; font-weight: bold; margin: 0; color: #2c3e50;">${exp.jobTitle}</h3>
                  <span style="font-size: 10px; color: #7f8c8d; font-style: italic; background: #ecf0f1; padding: 3px 8px; border-radius: 12px;">${exp.date}</span>
                </div>
                <p style="font-size: 11px; color: #34495e; margin: 0 0 8px 0; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px;">${exp.company}</p>
                ${exp.responsibilities ? `<div style="font-size: 10px; color: #5d6d7e; text-align: justify; line-height: 1.5;">${exp.responsibilities.replace(/\n/g, '<br>')}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
          ${(data.skills.languages || data.skills.frameworks || data.skills.tools) ? `
            <div>
              <h2 style="font-size: 14px; font-weight: bold; color: #2c3e50; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; position: relative; padding-bottom: 5px;">
                Core Competencies
                <div style="position: absolute; bottom: 0; left: 0; width: 40px; height: 2px; background: #34495e;"></div>
              </h2>
              <div style="background: #f8f9fa; padding: 12px; border-radius: 4px; border: 1px solid #ecf0f1;">
                ${data.skills.languages ? `<p style="font-size: 10px; margin: 5px 0; color: #2c3e50;"><span style="font-weight: bold; color: #34495e;">Languages:</span> <span style="color: #5d6d7e;">${data.skills.languages}</span></p>` : ''}
                ${data.skills.frameworks ? `<p style="font-size: 10px; margin: 5px 0; color: #2c3e50;"><span style="font-weight: bold; color: #34495e;">Frameworks:</span> <span style="color: #5d6d7e;">${data.skills.frameworks}</span></p>` : ''}
                ${data.skills.tools ? `<p style="font-size: 10px; margin: 5px 0; color: #2c3e50;"><span style="font-weight: bold; color: #34495e;">Tools:</span> <span style="color: #5d6d7e;">${data.skills.tools}</span></p>` : ''}
              </div>
            </div>
          ` : ''}
          
          ${data.education.filter(edu => edu.school).length > 0 ? `
            <div>
              <h2 style="font-size: 14px; font-weight: bold; color: #2c3e50; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; position: relative; padding-bottom: 5px;">
                Education
                <div style="position: absolute; bottom: 0; left: 0; width: 40px; height: 2px; background: #34495e;"></div>
              </h2>
              ${data.education.filter(edu => edu.school).map(edu => `
                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #ecf0f1; margin-bottom: 8px;">
                  <h3 style="font-size: 11px; font-weight: bold; margin: 0; color: #2c3e50;">${edu.school}</h3>
                  <p style="font-size: 10px; margin: 3px 0; color: #34495e; font-style: italic;">${edu.degree}</p>
                  <p style="font-size: 9px; margin: 0; color: #7f8c8d;">${edu.date}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        ${data.projects.filter(proj => proj.name).length > 0 ? `
          <div style="margin-top: 25px;">
            <h2 style="font-size: 14px; font-weight: bold; color: #2c3e50; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; position: relative; padding-bottom: 5px;">
              Key Projects
              <div style="position: absolute; bottom: 0; left: 0; width: 40px; height: 2px; background: #34495e;"></div>
            </h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              ${data.projects.filter(proj => proj.name).slice(0, 4).map(proj => `
                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #ecf0f1;">
                  <h3 style="font-size: 10px; font-weight: bold; margin: 0 0 5px 0; color: #2c3e50;">${proj.name}</h3>
                  ${proj.description ? `<p style="font-size: 9px; margin: 0 0 5px 0; color: #5d6d7e; text-align: justify;">${proj.description.substring(0, 100)}...</p>` : ''}
                  ${proj.technologies ? `<p style="font-size: 8px; margin: 0; color: #7f8c8d; font-style: italic;"><strong>Technologies:</strong> ${proj.technologies.split(',').slice(0, 3).join(', ')}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${data.certifications.filter(cert => cert.name).length > 0 ? `
          <div style="margin-top: 25px;">
            <h2 style="font-size: 14px; font-weight: bold; color: #2c3e50; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; position: relative; padding-bottom: 5px;">
              Certifications
              <div style="position: absolute; bottom: 0; left: 0; width: 40px; height: 2px; background: #34495e;"></div>
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
              ${data.certifications.filter(cert => cert.name).map(cert => `
                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #ecf0f1; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <h3 style="font-size: 10px; font-weight: bold; margin: 0; color: #2c3e50;">${cert.name}</h3>
                    <p style="font-size: 9px; margin: 2px 0; color: #5d6d7e; font-style: italic;">${cert.issuer}</p>
                  </div>
                  <span style="font-size: 9px; color: #7f8c8d; font-weight: 500;">${cert.date}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `
  }, [])

  const generatePhotoHTML = useCallback((data: ResumeData) => {
    return `
      <div style="font-family: 'Helvetica', sans-serif; color: #2d3748; line-height: 1.4;">
        <div style="display: flex; margin-bottom: 25px; align-items: center;">
          <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #4a90e2, #357abd); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 25px; flex-shrink: 0;">
            <span style="color: white; font-size: 32px; font-weight: 300;">${(data.personalInfo.name || 'OUSSAMA ERRAFIF').split(' ').map(n => n[0]).join('').substring(0,2)}</span>
          </div>
          <div style="flex: 1;">
            <h1 style="font-size: 26px; font-weight: 300; margin: 0 0 8px 0; color: #2d3748;">${data.personalInfo.name || 'OUSSAMA ERRAFIF'}</h1>
            <p style="font-size: 16px; margin: 0 0 8px 0; color: #4a90e2; font-weight: 500;">${data.personalInfo.title || 'Software engineer'}</p>
            <p style="font-size: 12px; margin: 0; color: #718096;">${data.personalInfo.email || 'oussama.errafif@example.com'} • ${data.personalInfo.phone || '+212 6 12 34 56 78'} • ${data.personalInfo.location || 'Agadir, Morocco'}</p>
          </div>
        </div>
        
        ${data.personalInfo.summary ? `
          <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #f7fafc, #edf2f7); border-radius: 8px; border-left: 4px solid #4a90e2;">
            <h2 style="font-size: 13px; font-weight: 600; color: #4a90e2; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Professional Profile</h2>
            <p style="font-size: 11px; text-align: justify; color: #4a5568; line-height: 1.6;">${data.personalInfo.summary}</p>
          </div>
        ` : ''}
        
        ${data.experience.filter(exp => exp.jobTitle).length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 14px; font-weight: 600; color: #4a90e2; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Professional Experience</h2>
            ${data.experience.filter(exp => exp.jobTitle).map(exp => `
              <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; box-shadow: 0 2px 4px rgba(74, 144, 226, 0.1); border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                  <h3 style="font-size: 12px; font-weight: 600; margin: 0; color: #2d3748;">${exp.jobTitle}</h3>
                  <span style="font-size: 10px; color: #4a90e2; background: #ebf4ff; padding: 3px 8px; border-radius: 12px; font-weight: 500;">${exp.date}</span>
                </div>
                <p style="font-size: 11px; color: #4a90e2; margin: 0 0 8px 0; font-weight: 500;">${exp.company}</p>
                ${exp.responsibilities ? `<div style="font-size: 10px; color: #4a5568; text-align: justify; line-height: 1.5;">${exp.responsibilities.replace(/\n/g, '<br>')}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          ${(data.skills.languages || data.skills.frameworks || data.skills.tools) ? `
            <div>
              <h2 style="font-size: 13px; font-weight: 600; color: #4a90e2; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Technical Skills</h2>
              <div style="background: linear-gradient(135deg, #ebf4ff, #f7fafc); padding: 12px; border-radius: 6px; border: 1px solid #bee3f8;">
                ${data.skills.languages ? `<div style="margin-bottom: 6px;"><span style="font-size: 10px; font-weight: 600; color: #4a90e2;">Languages:</span><br><span style="font-size: 9px; color: #4a5568;">${data.skills.languages}</span></div>` : ''}
                ${data.skills.frameworks ? `<div style="margin-bottom: 6px;"><span style="font-size: 10px; font-weight: 600; color: #4a90e2;">Frameworks:</span><br><span style="font-size: 9px; color: #4a5568;">${data.skills.frameworks}</span></div>` : ''}
                ${data.skills.tools ? `<div><span style="font-size: 10px; font-weight: 600; color: #4a90e2;">Tools:</span><br><span style="font-size: 9px; color: #4a5568;">${data.skills.tools}</span></div>` : ''}
              </div>
            </div>
          ` : ''}
          
          ${data.education.filter(edu => edu.school).length > 0 ? `
            <div>
              <h2 style="font-size: 13px; font-weight: 600; color: #4a90e2; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Education</h2>
              ${data.education.filter(edu => edu.school).map(edu => `
                <div style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(74, 144, 226, 0.1);">
                  <h3 style="font-size: 10px; font-weight: 600; margin: 0; color: #2d3748;">${edu.school}</h3>
                  <p style="font-size: 9px; margin: 2px 0; color: #4a5568;">${edu.degree}</p>
                  <p style="font-size: 8px; margin: 0; color: #718096;">${edu.date}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        ${data.projects.filter(proj => proj.name).length > 0 ? `
          <div style="margin-top: 20px;">
            <h2 style="font-size: 13px; font-weight: 600; color: #4a90e2; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Notable Projects</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${data.projects.filter(proj => proj.name).slice(0, 4).map(proj => `
                <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(74, 144, 226, 0.1);">
                  <h3 style="font-size: 9px; font-weight: 600; margin: 0 0 3px 0; color: #2d3748;">${proj.name}</h3>
                  ${proj.description ? `<p style="font-size: 8px; margin: 0 0 3px 0; color: #4a5568; text-align: justify;">${proj.description.substring(0, 80)}...</p>` : ''}
                  ${proj.technologies ? `<p style="font-size: 7px; margin: 0; color: #718096; font-style: italic;"><strong>Tech:</strong> ${proj.technologies.split(',').slice(0, 2).join(', ')}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${data.certifications.filter(cert => cert.name).length > 0 ? `
          <div style="margin-top: 20px;">
            <h2 style="font-size: 13px; font-weight: 600; color: #4a90e2; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Professional Certifications</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
              ${data.certifications.filter(cert => cert.name).map(cert => `
                <div style="background: linear-gradient(135deg, #ebf4ff, #f7fafc); padding: 10px; border-radius: 4px; border: 1px solid #bee3f8; box-shadow: 0 1px 3px rgba(74, 144, 226, 0.1);">
                  <h3 style="font-size: 9px; font-weight: 600; margin: 0 0 3px 0; color: #2d3748;">${cert.name}</h3>
                  <p style="font-size: 8px; margin: 0 0 2px 0; color: #4a5568;">${cert.issuer}</p>
                  <p style="font-size: 8px; margin: 0; color: #718096; font-weight: 500;">${cert.date}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `
  }, [])

  // Enhanced PDF Generation Functions
  const generateEnhancedClassicPDF = useCallback((pdf: any, data: ResumeData, template: any) => {
    let yPos = 20
    
    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text(data.personalInfo.name || 'OUSSAMA ERRAFIF', 105, yPos, { align: 'center' })
    yPos += 8
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(data.personalInfo.title || 'Software engineer', 105, yPos, { align: 'center' })
    yPos += 6
    
    pdf.setFontSize(10)
    const contact = `${data.personalInfo.email || 'oussama.errafif@example.com'} | ${data.personalInfo.phone || '+212 6 12 34 56 78'} | ${data.personalInfo.location || 'Agadir, Morocco'}`
    pdf.text(contact, 105, yPos, { align: 'center' })
    yPos += 10
    
    // Line separator
    pdf.line(20, yPos, 190, yPos)
    yPos += 8
    
    // Summary
    if (data.personalInfo.summary) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('PROFESSIONAL SUMMARY', 20, yPos)
      yPos += 6
      
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      const summaryLines = pdf.splitTextToSize(data.personalInfo.summary, 170)
      pdf.text(summaryLines, 20, yPos)
      yPos += summaryLines.length * 4 + 6
    }
    
    // Experience
    if (data.experience.filter(exp => exp.jobTitle).length > 0) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('EXPERIENCE', 20, yPos)
      yPos += 6
      
      data.experience.filter(exp => exp.jobTitle).forEach(exp => {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${exp.jobTitle} - ${exp.company}`, 20, yPos)
        pdf.setFont('helvetica', 'italic')
        pdf.text(exp.date || '', 190, yPos, { align: 'right' })
        yPos += 5
        
        if (exp.responsibilities) {
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'normal')
          const responsLines = pdf.splitTextToSize(exp.responsibilities, 170)
          pdf.text(responsLines, 20, yPos)
          yPos += responsLines.length * 3.5 + 4
        }
      })
      yPos += 4
    }
    
    // Skills
    if (data.skills.languages || data.skills.frameworks || data.skills.tools) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('SKILLS', 20, yPos)
      yPos += 6
      
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      if (data.skills.languages) {
        pdf.text(`Languages: ${data.skills.languages}`, 20, yPos)
        yPos += 4
      }
      if (data.skills.frameworks) {
        pdf.text(`Frameworks: ${data.skills.frameworks}`, 20, yPos)
        yPos += 4
      }
      if (data.skills.tools) {
        pdf.text(`Tools: ${data.skills.tools}`, 20, yPos)
        yPos += 4
      }
      yPos += 4
    }
    
    // Education
    if (data.education.filter(edu => edu.school).length > 0) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('EDUCATION', 20, yPos)
      yPos += 6
      
      data.education.filter(edu => edu.school).forEach(edu => {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text(edu.school, 20, yPos)
        pdf.setFont('helvetica', 'italic')
        pdf.text(edu.date || '', 190, yPos, { align: 'right' })
        yPos += 4
        
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.text(edu.degree + (edu.gpa ? ` - GPA: ${edu.gpa}` : ''), 20, yPos)
        yPos += 6
      })
    }
    
    // Certifications
    if (data.certifications.filter(cert => cert.name).length > 0) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('CERTIFICATIONS', 20, yPos)
      yPos += 6
      
      data.certifications.filter(cert => cert.name).forEach(cert => {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text(cert.name, 20, yPos)
        pdf.setFont('helvetica', 'italic')
        pdf.text(cert.date || '', 190, yPos, { align: 'right' })
        yPos += 4
        
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.text(cert.issuer, 20, yPos)
        yPos += 6
      })
    }
  }, [])

  const generateEnhancedModernPDF = useCallback((pdf: any, data: ResumeData, template: any) => {
    let yPos = 20
    
    // Modern header with blue background
    pdf.setFillColor(59, 130, 246)
    pdf.rect(0, 0, 210, 45, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'normal')
    pdf.text(data.personalInfo.name || 'OUSSAMA ERRAFIF', 105, 25, { align: 'center' })
    
    pdf.setFontSize(14)
    pdf.text(data.personalInfo.title || 'Software engineer', 105, 35, { align: 'center' })
    
    pdf.setFontSize(10)
    const contact = getDefaultContactInfo(data, ' • ')
    pdf.text(contact, 105, 42, { align: 'center' })
    
    yPos = 55
    pdf.setTextColor(0, 0, 0)
    
    // Summary
    if (data.personalInfo.summary) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(59, 130, 246)
      pdf.text('PROFESSIONAL SUMMARY', 20, yPos)
      yPos += 6
      
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(85, 85, 85)
      const summaryLines = pdf.splitTextToSize(data.personalInfo.summary, 170)
      pdf.text(summaryLines, 20, yPos)
      yPos += summaryLines.length * 4 + 8
    }
    
    // Experience with modern styling
    if (data.experience.filter(exp => exp.jobTitle).length > 0) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(59, 130, 246)
      pdf.text('EXPERIENCE', 20, yPos)
      yPos += 8
      
      data.experience.filter(exp => exp.jobTitle).forEach(exp => {
        // Blue left border for each experience
        pdf.setFillColor(59, 130, 246)
        pdf.rect(20, yPos - 3, 2, 15, 'F')
        
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(30, 64, 175)
        pdf.text(exp.jobTitle, 25, yPos)
        
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 116, 139)
        pdf.text(exp.date || '', 190, yPos, { align: 'right' })
        yPos += 5
        
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(71, 85, 105)
        pdf.text(exp.company, 25, yPos)
        yPos += 5
        
        if (exp.responsibilities) {
          pdf.setFontSize(9)
          pdf.setTextColor(100, 116, 139)
          const responsLines = pdf.splitTextToSize(exp.responsibilities, 165)
          pdf.text(responsLines, 25, yPos)
          yPos += responsLines.length * 3.5 + 6
        }
      })
      yPos += 4
    }
    
    // Skills in modern box
    if (data.skills.languages || data.skills.frameworks || data.skills.tools) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(59, 130, 246)
      pdf.text('SKILLS', 20, yPos)
      yPos += 8
      
      // Background box
      pdf.setFillColor(248, 250, 252)
      pdf.rect(20, yPos - 3, 170, 15, 'F')
      
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(30, 64, 175)
      let skillsY = yPos + 2
      
      if (data.skills.languages) {
        pdf.setFont('helvetica', 'bold')
        pdf.text('Languages:', 25, skillsY)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 116, 139)
        pdf.text(data.skills.languages, 50, skillsY)
        skillsY += 4
      }
      if (data.skills.frameworks) {
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(30, 64, 175)
        pdf.text('Frameworks:', 25, skillsY)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 116, 139)
        pdf.text(data.skills.frameworks, 55, skillsY)
        skillsY += 4
      }
      if (data.skills.tools) {
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(30, 64, 175)
        pdf.text('Tools:', 25, skillsY)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 116, 139)
        pdf.text(data.skills.tools, 40, skillsY)
      }
      yPos += 20
    }
    
    // Certifications
    if (data.certifications.filter(cert => cert.name).length > 0) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(59, 130, 246)
      pdf.text('CERTIFICATIONS', 20, yPos)
      yPos += 8
      
      data.certifications.filter(cert => cert.name).forEach(cert => {
        // Draw modern card-like background
        pdf.setFillColor(248, 250, 252)
        pdf.rect(20, yPos - 2, 170, 10, 'F')
        
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(30, 64, 175)
        pdf.text(cert.name, 25, yPos + 2)
        
        pdf.setFont('helvetica', 'italic')
        pdf.setTextColor(100, 116, 139)
        pdf.text(cert.date || '', 185, yPos + 2, { align: 'right' })
        
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(71, 85, 105)
        pdf.text(cert.issuer, 25, yPos + 6)
        yPos += 12
      })
    }
  }, [])

  const generateEnhancedCreativePDF = useCallback((pdf: any, data: ResumeData, template: any) => {
    let yPos = 30
    
    // Creative circle avatar
    pdf.setFillColor(139, 92, 246)
    pdf.circle(40, 30, 15, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    const initials = (data.personalInfo.name || 'Y N').split(' ').map(n => n[0]).join('').substring(0, 2)
    pdf.text(initials, 40, 35, { align: 'center' })
    
    // Name and title
    pdf.setTextColor(139, 92, 246)
    pdf.setFontSize(20)
    pdf.text(data.personalInfo.name || 'OUSSAMA ERRAFIF', 65, 25)
    
    pdf.setFontSize(12)
    pdf.setTextColor(74, 85, 104)
    pdf.text(data.personalInfo.title || 'Software engineer', 65, 35)
    
    pdf.setFontSize(9)
    pdf.setTextColor(113, 128, 150)
    const contact = getDefaultContactInfo(data, ' | ')
    pdf.text(contact, 65, 42)
    
    yPos = 55
    
    // Summary in creative box
    if (data.personalInfo.summary) {
      pdf.setFillColor(247, 250, 252)
      pdf.setDrawColor(139, 92, 246)
      pdf.rect(20, yPos - 5, 170, 18, 'FD')
      
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(139, 92, 246)
      pdf.text('ABOUT ME', 25, yPos)
      yPos += 6
      
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(74, 85, 104)
      const summaryLines = pdf.splitTextToSize(data.personalInfo.summary, 165)
      pdf.text(summaryLines, 25, yPos)
      yPos += summaryLines.length * 3.5 + 12
    }
    
    // Experience with creative dots
    if (data.experience.filter(exp => exp.jobTitle).length > 0) {
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(139, 92, 246)
      pdf.text('EXPERIENCE', 20, yPos)
      yPos += 8
      
      data.experience.filter(exp => exp.jobTitle).forEach((exp, index) => {
        // Creative dot
        const dotColor = index % 2 === 0 ? [139, 92, 246] : [168, 85, 247]
        pdf.setFillColor(...dotColor)
        pdf.circle(25, yPos - 1, 3, 'F')
        
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(45, 55, 72)
        pdf.text(exp.jobTitle, 35, yPos)
        
        pdf.setFontSize(8)
        pdf.setTextColor(139, 92, 246)
        pdf.text(exp.date || '', 190, yPos, { align: 'right' })
        yPos += 4
        
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(139, 92, 246)
        pdf.text(exp.company, 35, yPos)
        yPos += 5
        
        if (exp.responsibilities) {
          pdf.setFontSize(8)
          pdf.setTextColor(74, 85, 104)
          const responsLines = pdf.splitTextToSize(exp.responsibilities, 155)
          pdf.text(responsLines, 35, yPos)
          yPos += responsLines.length * 3 + 6
        }
      })
    }
    
    // Certifications
    if (data.certifications.filter(cert => cert.name).length > 0) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(139, 92, 246)
      pdf.text('CERTIFICATIONS', 35, yPos)
      yPos += 8
      
      data.certifications.filter(cert => cert.name).forEach(cert => {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(45, 55, 72)
        pdf.text(cert.name, 35, yPos)
        
        pdf.setFontSize(8)
        pdf.setTextColor(139, 92, 246)
        pdf.text(cert.date || '', 190, yPos, { align: 'right' })
        yPos += 4
        
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(139, 92, 246)
        pdf.text(cert.issuer, 35, yPos)
        yPos += 6
      })
    }
  }, [])

  const generateEnhancedMinimalPDF = useCallback((pdf: any, data: ResumeData, template: any) => {
    let yPos = 25
    
    // Minimal header
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(26, 26, 26)
    pdf.text(data.personalInfo.name?.toUpperCase() || 'OUSSAMA ERRAFIF', 20, yPos)
    yPos += 8
    
    pdf.setFontSize(12)
    pdf.setTextColor(102, 102, 102)
    pdf.text(data.personalInfo.title || 'Software engineer', 20, yPos)
    yPos += 6
    
    pdf.setFontSize(9)
    pdf.setTextColor(136, 136, 136)
    const contact = getDefaultContactInfo(data, ' • ')
    pdf.text(contact, 20, yPos)
    yPos += 12
    
    // Summary
    if (data.personalInfo.summary) {
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(51, 51, 51)
      const summaryLines = pdf.splitTextToSize(data.personalInfo.summary, 170)
      pdf.text(summaryLines, 20, yPos)
      yPos += summaryLines.length * 4 + 12
    }
    
    // Experience
    if (data.experience.filter(exp => exp.jobTitle).length > 0) {
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(26, 26, 26)
      pdf.text('EXPERIENCE', 20, yPos)
      yPos += 8
      
      data.experience.filter(exp => exp.jobTitle).forEach(exp => {
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'bold')
        pdf.text(exp.jobTitle, 20, yPos)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(136, 136, 136)
        pdf.text(exp.date || '', 190, yPos, { align: 'right' })
        yPos += 4
        
        pdf.setFontSize(8)
        pdf.setTextColor(102, 102, 102)
        pdf.text(exp.company, 20, yPos)
        yPos += 5
        
        if (exp.responsibilities) {
          pdf.setFontSize(8)
          pdf.setTextColor(85, 85, 85)
          const responsLines = pdf.splitTextToSize(exp.responsibilities, 170)
          pdf.text(responsLines, 20, yPos)
          yPos += responsLines.length * 3 + 6
        }
      })
    }
    
    // Certifications
    if (data.certifications.filter(cert => cert.name).length > 0) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(26, 26, 26)
      pdf.text('CERTIFICATIONS', 20, yPos)
      yPos += 8
      
      data.certifications.filter(cert => cert.name).forEach(cert => {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text(cert.name, 20, yPos)
        
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(85, 85, 85)
        pdf.text(cert.date || '', 190, yPos, { align: 'right' })
        yPos += 4
        
        pdf.setFontSize(9)
        pdf.setTextColor(102, 102, 102)
        pdf.text(cert.issuer, 20, yPos)
        yPos += 6
      })
    }
  }, [])

  const generateEnhancedExecutivePDF = useCallback((pdf: any, data: ResumeData, template: any) => {
    let yPos = 30
    
    // Executive header
    pdf.setTextColor(44, 62, 80)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text(data.personalInfo.name || 'OUSSAMA ERRAFIF', 105, yPos, { align: 'center' })
    yPos += 8
    
    // Underline
    pdf.setDrawColor(52, 73, 94)
    pdf.line(75, yPos - 2, 135, yPos - 2)
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'italic')
    pdf.setTextColor(93, 109, 126)
    pdf.text(data.personalInfo.title || 'Software engineer', 105, yPos + 3, { align: 'center' })
    yPos += 8
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(127, 140, 141)
    const contact = getDefaultContactInfo(data, ' | ')
    pdf.text(contact, 105, yPos, { align: 'center' })
    yPos += 15
    
    // Executive summary
    if (data.personalInfo.summary) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(44, 62, 80)
      pdf.text('EXECUTIVE SUMMARY', 20, yPos)
      
      // Underline for section
      pdf.setDrawColor(52, 73, 94)
      pdf.line(20, yPos + 2, 45, yPos + 2)
      yPos += 8
      
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'italic')
      pdf.setTextColor(52, 73, 94)
      const summaryLines = pdf.splitTextToSize(data.personalInfo.summary, 170)
      pdf.text(summaryLines, 20, yPos)
      yPos += summaryLines.length * 4 + 10
    }
    
    // Professional experience
    if (data.experience.filter(exp => exp.jobTitle).length > 0) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(44, 62, 80)
      pdf.text('PROFESSIONAL EXPERIENCE', 20, yPos)
      pdf.setDrawColor(52, 73, 94)
      pdf.line(20, yPos + 2, 70, yPos + 2)
      yPos += 10
      
      data.experience.filter(exp => exp.jobTitle).forEach(exp => {
        // Background for each position
        pdf.setFillColor(248, 249, 250)
        pdf.rect(20, yPos - 4, 170, 20, 'F')
        
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(44, 62, 80)
        pdf.text(exp.jobTitle, 25, yPos)
        
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'italic')
        pdf.setTextColor(127, 140, 141)
        pdf.text(exp.date || '', 185, yPos, { align: 'right' })
        yPos += 5
        
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(52, 73, 94)
        pdf.text(exp.company.toUpperCase(), 25, yPos)
        yPos += 6
        
        if (exp.responsibilities) {
          pdf.setFontSize(8)
          pdf.setTextColor(93, 109, 126)
          const responsLines = pdf.splitTextToSize(exp.responsibilities, 165)
          pdf.text(responsLines, 25, yPos)
          yPos += responsLines.length * 3 + 8
        }
      })
    }
    
    // Certifications
    if (data.certifications.filter(cert => cert.name).length > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(44, 62, 80)
      pdf.text('CERTIFICATIONS', 25, yPos)
      yPos += 10
      
      data.certifications.filter(cert => cert.name).forEach(cert => {
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(44, 62, 80)
        pdf.text(cert.name, 25, yPos)
        
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(93, 109, 126)
        pdf.text(cert.date || '', 185, yPos, { align: 'right' })
        yPos += 5
        
        pdf.setFontSize(10)
        pdf.setTextColor(127, 140, 141)
        pdf.text(cert.issuer, 25, yPos)
        yPos += 8
      })
    }
  }, [])

  const generateEnhancedPhotoPDF = useCallback((pdf: any, data: ResumeData, template: any) => {
    let yPos = 30
    
    // Photo placeholder and header
    pdf.setFillColor(74, 144, 226)
    pdf.circle(40, 35, 18, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'normal')
    const initials = (data.personalInfo.name || 'Y N').split(' ').map(n => n[0]).join('').substring(0, 2)
    pdf.text(initials, 40, 40, { align: 'center' })
    
    // Name and title
    pdf.setTextColor(45, 55, 72)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'normal')
    pdf.text(data.personalInfo.name || 'OUSSAMA ERRAFIF', 70, 30)
    
    pdf.setFontSize(12)
    pdf.setTextColor(74, 144, 226)
    pdf.text(data.personalInfo.title || 'Software engineer', 70, 40)
    
    pdf.setFontSize(9)
    pdf.setTextColor(113, 128, 150)
    const contact = getDefaultContactInfo(data, ' • ')
    pdf.text(contact, 70, 48)
    
    yPos = 65
    
    // Professional profile
    if (data.personalInfo.summary) {
      pdf.setFillColor(247, 250, 252)
      pdf.setDrawColor(74, 144, 226)
      pdf.rect(20, yPos - 5, 170, 20, 'FD')
      
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(74, 144, 226)
      pdf.text('PROFESSIONAL PROFILE', 25, yPos)
      yPos += 6
      
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(74, 85, 104)
      const summaryLines = pdf.splitTextToSize(data.personalInfo.summary, 165)
      pdf.text(summaryLines, 25, yPos)
      yPos += summaryLines.length * 3.5 + 15
    }
    
    // Experience
    if (data.experience.filter(exp => exp.jobTitle).length > 0) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(74, 144, 226)
      pdf.text('PROFESSIONAL EXPERIENCE', 20, yPos)
      pdf.setDrawColor(226, 232, 240)
      pdf.line(20, yPos + 2, 190, yPos + 2)
      yPos += 10
      
      data.experience.filter(exp => exp.jobTitle).forEach(exp => {
        pdf.setFillColor(255, 255, 255)
        pdf.setDrawColor(226, 232, 240)
        pdf.rect(20, yPos - 4, 170, 18, 'FD')
        
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(45, 55, 72)
        pdf.text(exp.jobTitle, 25, yPos)
        
        pdf.setFontSize(8)
        pdf.setTextColor(74, 144, 226)
        pdf.text(exp.date || '', 185, yPos, { align: 'right' })
        yPos += 5
        
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(74, 144, 226)
        pdf.text(exp.company, 25, yPos)
        yPos += 6
        
        if (exp.responsibilities) {
          pdf.setFontSize(8)
          pdf.setTextColor(74, 85, 104)
          const responsLines = pdf.splitTextToSize(exp.responsibilities, 165)
          pdf.text(responsLines, 25, yPos)
          yPos += responsLines.length * 3 + 8
        }
      })
    }
    
    // Certifications
    if (data.certifications.filter(cert => cert.name).length > 0) {
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(74, 144, 226)
      pdf.text('PROFESSIONAL CERTIFICATIONS', 25, yPos)
      yPos += 8
      
      data.certifications.filter(cert => cert.name).forEach(cert => {
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(45, 55, 72)
        pdf.text(cert.name, 25, yPos)
        
        pdf.setFontSize(8)
        pdf.setTextColor(74, 144, 226)
        pdf.text(cert.date || '', 185, yPos, { align: 'right' })
        yPos += 5
        
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(74, 144, 226)
        pdf.text(cert.issuer, 25, yPos)
        yPos += 8
      })
    }
  }, [])

  const handleAIGenerate = async (type: "summary" | "experience" | "project", query: string, index?: number) => {
    try {
      // Call the AI API
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, query }),
      })

      const data = await response.json()

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

        // Show success message if it was a fallback
        if (data.fallback) {
          toast({
            title: "Content Generated",
            description: "Using fallback templates. Add your Gemini API key to .env.local for AI-powered content.",
            duration: 5000,
          })
        } else {
          toast({
            title: "AI Content Generated",
            description: "Successfully generated professional content using Google Gemini.",
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
      console.error('Error calling AI API:', error)
      
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
  const handleDragStart = useCallback((event: any) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event
      if (active.id !== over.id) {
        const [activeSection, activeIndexStr] = active.id.split("-")
        const [overSection, overIndexStr] = over.id.split("-")

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
                <h1 className="text-2xl font-bold text-foreground">
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
              <Button 
                onClick={() => setShowAnalysis(true)} 
                variant="outline" 
                size="sm"
                className="bg-accent/10 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Analysis
              </Button>

              <Button onClick={() => setShowTemplateSelector(true)} variant="outline" size="sm">
                <Palette className="h-4 w-4 mr-2" />
                Template
              </Button>

              <Button onClick={saveResume} variant="outline" size="sm" disabled={isAutoSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isAutoSaving ? 'Saving...' : 'Save Now'}
              </Button>

              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Section Navigation */}
        <div className="mb-8">
          <Card className="border border-border">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Resume Sections</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {SECTIONS.map((section) => {
                  const Icon = section.icon
                  const isActive = section.id === currentSection

                  return (
                    <Button
                      key={section.id}
                      onClick={() => setCurrentSection(section.id)}
                      variant={isActive ? "default" : "outline"}
                      className={`flex flex-col items-center space-y-2 p-4 h-auto ${isActive ? "" : "bg-transparent"}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium text-center">{section.title}</span>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Alert variant="destructive">
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo Required Warning */}
        {isPhotoRequired && !profileImage && (
          <Alert className="mb-8 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              ⚠️ This template requires a profile photo. Please upload one in the Personal Info section.
            </AlertDescription>
          </Alert>
        )}

        {/* Form Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="border border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center space-x-3 text-foreground">
                {React.createElement(SECTIONS.find((s) => s.id === currentSection)?.icon || User, {
                  className: "h-6 w-6",
                })}
                <span>{SECTIONS.find((s) => s.id === currentSection)?.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
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
                  {currentSection === "review" && <ReviewStep data={resumeData} onDownload={handleDownload} />}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="border border-border sticky top-8 h-fit">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center justify-between text-foreground">
                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5" />
                  <span>Live Preview</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Live</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-white overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
                <div 
                  className="resume-preview-container" 
                  style={{ 
                    minHeight: '297mm', // A4 height
                    width: '210mm', // A4 width
                    maxWidth: '100%',
                    margin: '0 auto',
                    padding: '20mm', // Standard A4 margins
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                    position: 'relative',
                    zIndex: 1,
                    // Ensure proper rendering for HTML2Canvas
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                    // Prevent text selection during capture
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                  id="resume-preview-capture"
                >
                  <ResumePreview data={resumeData} templateId={selectedTemplate} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Button */}
        <div className="flex justify-center mt-12">
          <Button 
            onClick={handleDownload} 
            size="lg" 
            className="px-12 py-4 text-lg"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-background border-t-current"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-3 h-6 w-6" />
                Download Resume
              </>
            )}
          </Button>
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
          console.log('🔄 Closing analysis modal...')
          setShowAnalysis(false)
        }}
        resumeData={resumeData}
      />
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
    "• Led cross-functional teams in {query} initiatives, resulting in improved efficiency and cost savings\n• Implemented best practices and modern methodologies to streamline processes\n• Collaborated with stakeholders to define requirements and deliver solutions\n• Mentored junior team members and conducted knowledge sharing sessions",
    "• Developed and maintained {query} systems with focus on scalability and performance\n• Participated in code reviews and architectural decisions\n• Worked closely with product managers to translate business requirements into technical solutions\n• Contributed to documentation and process improvement initiatives",
    "• Managed {query} projects from conception to deployment\n• Coordinated with multiple departments to ensure project success\n• Implemented quality assurance processes and testing strategies\n• Provided technical support and troubleshooting for production systems",
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
  useMarkdown = false,
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
  useMarkdown?: boolean
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
      {type === "textarea" && useMarkdown ? (
        <MarkdownTextarea
          label=""
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          showAI={showAI}
          onAIClick={onAIClick}
          error={error}
        />
      ) : type === "textarea" ? (
        <Textarea
          id={label.toLowerCase().replace(/\s+/g, "-")}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="min-h-[120px] resize-none"
        />
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
      {showAI && !useMarkdown && (
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
    {error && !useMarkdown && (
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

const ArrayFormField = ({
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
  values: any[]
  onChange: (index: number, field: string, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  fields: { name: string; label: string; type?: string; placeholder?: string; showAI?: boolean; useMarkdown?: boolean }[]
  showAI?: boolean
  onAIClick?: (index: number, field: string) => void
  draggable?: boolean
  sectionId: string
  sensors?: ReturnType<typeof useSensors>
  onDragStart?: (event: any) => void
  onDragEnd?: (event: any) => void
}) => {
  const items = values.map((value, index) => (
    <SortableItem key={`${sectionId}-${index}`} id={`${sectionId}-${index}`}>
      <div className="space-y-4 p-6 border border-border rounded-lg bg-card w-full">
        {fields.map((field) => (
          <FormField
            key={field.name}
            label={field.label}
            value={value[field.name] || ""}
            onChange={(e) => onChange(index, field.name, e.target.value)}
            type={field.type || "text"}
            placeholder={field.placeholder}
            showAI={field.showAI}
            onAIClick={() => onAIClick && onAIClick(index, field.name)}
            useMarkdown={field.useMarkdown}
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
}: any) => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-2">Let's start with the basics</h3>
      <p className="text-muted-foreground">Tell us about yourself and make a great first impression</p>
      {isPhotoRequired && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">⚠️ This template requires a profile photo</p>
      )}
    </div>

    <div className="flex flex-col lg:flex-row gap-8">
      <div className={`${isPhotoRequired ? 'flex-1' : 'w-full'} space-y-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Full Name" {...name} required placeholder="John Doe" />
          <FormField label="Professional Title" {...title} required placeholder="Software Engineer" />
          <FormField label="Email Address" {...email} type="email" required placeholder="john@example.com" />
          <FormField label="Phone Number" {...phone} type="tel" required placeholder="+1 (555) 123-4567" />
        </div>
        <FormField label="Location" {...location} required placeholder="New York, NY" />
      </div>

      {isPhotoRequired && (
        <div className="lg:w-64">
          <FileUpload
            label="Profile Picture (Required)"
            accept="image/*"
            onFileSelect={onProfileImageChange}
            preview={profileImage}
            className="h-full"
          />
        </div>
      )}
    </div>

    <FormField
      label="Professional Summary"
      {...summary}
      type="textarea"
      placeholder="Write a compelling summary that highlights your key achievements and career goals..."
      showAI={true}
      onAIClick={() => onAIGenerate("summary")}
      useMarkdown={true}
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

const ExperienceStep = ({ experience, onAIGenerate, sensors, activeId, onDragStart, onDragEnd }: any) => (
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
          type: "textarea",
          placeholder: "Describe your main responsibilities, achievements, and impact...",
          showAI: true,
          useMarkdown: true,
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

const EducationStep = ({ education, sensors, activeId, onDragStart, onDragEnd }: any) => (
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

const SkillsStep = ({ skills }: any) => (
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

const ProjectsStep = ({ projects, onAIGenerate, sensors, activeId, onDragStart, onDragEnd }: any) => (
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
          type: "textarea",
          placeholder: "Describe the project, your role, and the impact it made...",
          showAI: true,
          useMarkdown: true,
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

const AdditionalStep = ({ certifications, references, sensors, activeId, onDragStart, onDragEnd }: any) => (
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
      ]}
      sectionId="references"
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  </div>
)

const ReviewStep = ({ data, onDownload }: { data: ResumeData; onDownload: () => void }) => {
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
                alert('🚀 AI Analysis Button Clicked! (Review Step)')
                console.log('🚀 === AI Analysis Button Clicked (Review Step) ===')
                console.log('📊 Resume data exists:', !!data)
                console.log('📊 Resume data keys:', Object.keys(data))
                console.log('📋 Personal info:', data.personalInfo)
                console.log('📋 Full resume data:', JSON.stringify(data, null, 2))
                console.log('🔄 Setting showAnalysis to true...')
                setShowAnalysis(true)
                console.log('✅ showAnalysis state updated')
              }}
              variant="outline"
              className="bg-accent/10 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
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

      <div className="text-center space-y-4">
        <Button onClick={onDownload} size="lg" className="px-12 py-4 text-lg">
          <Download className="mr-3 h-6 w-6" />
          Download Your Resume
        </Button>
        <p className="text-muted-foreground text-sm">Your resume will be saved automatically</p>
      </div>

      <ResumeAnalysis
        isOpen={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        resumeData={data}
      />
    </div>
  )
}

const ResumePreview = ({ data, templateId = "classic" }: { data: ResumeData; templateId?: string }) => {
  const template = RESUME_TEMPLATES.find((t) => t.id === templateId) || RESUME_TEMPLATES[0]

  switch (templateId) {
    case "modern":
      return <ModernTemplate data={data} template={template} />
    case "creative":
      return <CreativeTemplate data={data} template={template} />
    case "minimal":
      return <MinimalTemplate data={data} template={template} />
    case "executive":
      return <ExecutiveTemplate data={data} template={template} />
    case "tech":
      return <ModernTemplate data={data} template={template} />
    case "photo":
      return <PhotoTemplate data={data} template={template} />
    default:
      return <ClassicTemplate data={data} template={template} />
  }
}

// PDF Generation Functions for Each Template
function generateClassicPDF(pdf: jsPDF, data: ResumeData, template: any) {
  pdf.setFont("Times", "normal")
  pdf.setFontSize(12)
  
  // Header
  pdf.setFont("Times", "bold")
  pdf.setFontSize(16)
  pdf.text(data.personalInfo.name.toUpperCase(), 105, 20, { align: "center" })
  
  pdf.setFontSize(12)
  pdf.setFont("Times", "normal")
  pdf.text(data.personalInfo.title, 105, 28, { align: "center" })
  pdf.setFontSize(10)
  pdf.text(
    `${data.personalInfo.email} | ${data.personalInfo.phone} | ${data.personalInfo.location}`,
    105, 34, { align: "center" }
  )
  
  let yPos = 45
  
  // Summary
  if (data.personalInfo.summary) {
    yPos += 5
    pdf.setFont("Times", "bold")
    pdf.text("SUMMARY", 10, yPos)
    pdf.line(10, yPos + 1, 200, yPos + 1)
    yPos += 8
    pdf.setFont("Times", "normal")
    const plainSummary = markdownToPlainText(data.personalInfo.summary)
    const splitSummary = pdf.splitTextToSize(plainSummary, 180)
    pdf.text(splitSummary, 10, yPos)
    yPos += splitSummary.length * 5 + 5
  }
  
  // Add other sections...
  addCommonSections(pdf, data, yPos)
}

function generateModernPDF(pdf: jsPDF, data: ResumeData, template: any) {
  // Modern template with blue accents
  pdf.setFont("Helvetica", "normal")
  
  // Header with color accent
  pdf.setFillColor(59, 130, 246) // Blue color
  pdf.rect(0, 0, 210, 30, 'F')
  
  pdf.setTextColor(255, 255, 255)
  pdf.setFont("Helvetica", "bold")
  pdf.setFontSize(18)
  pdf.text(data.personalInfo.name, 105, 15, { align: "center" })
  
  pdf.setFontSize(12)
  pdf.setFont("Helvetica", "normal")
  pdf.text(data.personalInfo.title, 105, 22, { align: "center" })
  
  // Reset color for body
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(10)
  pdf.text(`${data.personalInfo.email} | ${data.personalInfo.phone} | ${data.personalInfo.location}`, 105, 40, { align: "center" })
  
  addCommonSections(pdf, data, 50)
}

function generateCreativePDF(pdf: jsPDF, data: ResumeData, template: any) {
  // Creative template with purple accents
  pdf.setFont("Helvetica", "normal")
  
  // Creative header design
  pdf.setFillColor(124, 58, 237) // Purple color
  pdf.circle(20, 20, 15, 'F')
  
  pdf.setTextColor(124, 58, 237)
  pdf.setFont("Helvetica", "bold")
  pdf.setFontSize(16)
  pdf.text(data.personalInfo.name, 40, 18)
  
  pdf.setFont("Helvetica", "normal")
  pdf.setFontSize(12)
  pdf.text(data.personalInfo.title, 40, 25)
  
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(10)
  pdf.text(`${data.personalInfo.email} | ${data.personalInfo.phone} | ${data.personalInfo.location}`, 40, 32)
  
  addCommonSections(pdf, data, 45)
}

function generateMinimalPDF(pdf: jsPDF, data: ResumeData, template: any) {
  // Minimal black and white design
  pdf.setFont("Arial", "normal")
  
  pdf.setFont("Arial", "bold")
  pdf.setFontSize(16)
  pdf.text(data.personalInfo.name.toUpperCase(), 10, 20)
  
  pdf.setFont("Arial", "normal")
  pdf.setFontSize(12)
  pdf.text(data.personalInfo.title, 10, 28)
  
  pdf.setFontSize(10)
  pdf.text(`${data.personalInfo.email} • ${data.personalInfo.phone} • ${data.personalInfo.location}`, 10, 35)
  
  addCommonSections(pdf, data, 45)
}

function generateExecutivePDF(pdf: jsPDF, data: ResumeData, template: any) {
  // Executive template with elegant serif font
  pdf.setFont("Times", "normal")
  
  // Executive header
  pdf.setFont("Times", "bold")
  pdf.setFontSize(20)
  pdf.text(data.personalInfo.name, 105, 20, { align: "center" })
  
  pdf.line(60, 25, 150, 25)
  
  pdf.setFontSize(14)
  pdf.text(data.personalInfo.title, 105, 35, { align: "center" })
  
  pdf.setFont("Times", "normal")
  pdf.setFontSize(10)
  pdf.text(`${data.personalInfo.email} | ${data.personalInfo.phone} | ${data.personalInfo.location}`, 105, 42, { align: "center" })
  
  addCommonSections(pdf, data, 52)
}

function generatePhotoPDF(pdf: jsPDF, data: ResumeData, template: any) {
  // Photo template - similar to modern but with space for photo
  pdf.setFont("Helvetica", "normal")
  
  // Header
  pdf.setFont("Helvetica", "bold")
  pdf.setFontSize(16)
  pdf.text(data.personalInfo.name, 105, 20, { align: "center" })
  
  pdf.setFont("Helvetica", "normal")
  pdf.setFontSize(12)
  pdf.text(data.personalInfo.title, 105, 28, { align: "center" })
  
  pdf.setFontSize(10)
  pdf.text(`${data.personalInfo.email} | ${data.personalInfo.phone} | ${data.personalInfo.location}`, 105, 35, { align: "center" })
  
  // Note about photo (since we can't easily include it in PDF)
  pdf.setFontSize(8)
  pdf.text("(Profile photo not included in PDF version)", 105, 40, { align: "center" })
  
  addCommonSections(pdf, data, 50)
}

function addCommonSections(pdf: jsPDF, data: ResumeData, startY: number) {
  let yPos = startY
  const leftMargin = 10
  const rightMargin = 200
  const lineHeight = 5
  
  // Summary
  if (data.personalInfo.summary) {
    yPos += 5
    pdf.setFont("Helvetica", "bold")
    pdf.setFontSize(12)
    pdf.text("SUMMARY", leftMargin, yPos)
    pdf.line(leftMargin, yPos + 1, rightMargin, yPos + 1)
    yPos += 8
    
    pdf.setFont("Helvetica", "normal")
    pdf.setFontSize(10)
    const plainSummary = markdownToPlainText(data.personalInfo.summary)
    const splitSummary = pdf.splitTextToSize(plainSummary, 180)
    pdf.text(splitSummary, leftMargin, yPos)
    yPos += splitSummary.length * lineHeight + 10
  }
  
  // Experience
  if (data.experience.some(exp => exp.jobTitle)) {
    pdf.setFont("Helvetica", "bold")
    pdf.setFontSize(12)
    pdf.text("EXPERIENCE", leftMargin, yPos)
    pdf.line(leftMargin, yPos + 1, rightMargin, yPos + 1)
    yPos += 8
    
    data.experience.filter(exp => exp.jobTitle).forEach(exp => {
      pdf.setFont("Helvetica", "bold")
      pdf.setFontSize(11)
      pdf.text(`${exp.jobTitle} at ${exp.company}`, leftMargin, yPos)
      pdf.setFont("Helvetica", "normal")
      pdf.setFontSize(10)
      pdf.text(exp.date, rightMargin, yPos, { align: "right" })
      yPos += 6
      
      if (exp.responsibilities) {
        const plainResp = markdownToPlainText(exp.responsibilities)
        const splitResp = pdf.splitTextToSize(plainResp, 180)
        pdf.text(splitResp, leftMargin, yPos)
        yPos += splitResp.length * lineHeight + 8
      }
    })
    yPos += 5
  }
  
  // Skills
  if (data.skills.languages || data.skills.frameworks || data.skills.tools) {
    if (yPos > 250) {
      pdf.addPage()
      yPos = 20
    }
    
    pdf.setFont("Helvetica", "bold")
    pdf.setFontSize(12)
    pdf.text("SKILLS", leftMargin, yPos)
    pdf.line(leftMargin, yPos + 1, rightMargin, yPos + 1)
    yPos += 8
    
    pdf.setFont("Helvetica", "normal")
    pdf.setFontSize(10)
    if (data.skills.languages) {
      pdf.text(`Programming Languages: ${data.skills.languages}`, leftMargin, yPos)
      yPos += lineHeight
    }
    if (data.skills.frameworks) {
      pdf.text(`Frameworks & Libraries: ${data.skills.frameworks}`, leftMargin, yPos)
      yPos += lineHeight
    }
    if (data.skills.tools) {
      pdf.text(`Tools & Platforms: ${data.skills.tools}`, leftMargin, yPos)
      yPos += lineHeight
    }
    yPos += 10
  }
  
  // Education
  if (data.education.some(edu => edu.school)) {
    if (yPos > 250) {
      pdf.addPage()
      yPos = 20
    }
    
    pdf.setFont("Helvetica", "bold")
    pdf.setFontSize(12)
    pdf.text("EDUCATION", leftMargin, yPos)
    pdf.line(leftMargin, yPos + 1, rightMargin, yPos + 1)
    yPos += 8
    
    data.education.filter(edu => edu.school).forEach(edu => {
      pdf.setFont("Helvetica", "bold")
      pdf.setFontSize(10)
      pdf.text(edu.school, leftMargin, yPos)
      pdf.setFont("Helvetica", "normal")
      pdf.text(edu.date, rightMargin, yPos, { align: "right" })
      yPos += 5
      pdf.text(edu.degree, leftMargin, yPos)
      if (edu.gpa) {
        pdf.text(`GPA: ${edu.gpa}`, leftMargin, yPos + 5)
        yPos += 5
      }
      yPos += 8
    })
  }
  
  // Projects
  if (data.projects.some(proj => proj.name)) {
    if (yPos > 220) {
      pdf.addPage()
      yPos = 20
    }
    
    pdf.setFont("Helvetica", "bold")
    pdf.setFontSize(12)
    pdf.text("PROJECTS", leftMargin, yPos)
    pdf.line(leftMargin, yPos + 1, rightMargin, yPos + 1)
    yPos += 8
    
    data.projects.filter(proj => proj.name).forEach(proj => {
      pdf.setFont("Helvetica", "bold")
      pdf.setFontSize(11)
      pdf.text(proj.name, leftMargin, yPos)
      yPos += 6
      
      if (proj.description) {
        pdf.setFont("Helvetica", "normal")
        pdf.setFontSize(10)
        const plainDesc = markdownToPlainText(proj.description)
        const splitDesc = pdf.splitTextToSize(plainDesc, 180)
        pdf.text(splitDesc, leftMargin, yPos)
        yPos += splitDesc.length * lineHeight + 3
      }
      
      if (proj.technologies) {
        pdf.setFont("Helvetica", "italic")
        pdf.setFontSize(9)
        pdf.text(`Technologies: ${proj.technologies}`, leftMargin, yPos)
        yPos += lineHeight + 5
      }
    })
  }
}
