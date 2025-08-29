"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  X,
  Sparkles,
  ArrowLeft,
  Briefcase,
  Building,
  Users,
  Loader2,
  Copy,
  Mail,
  User,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

import ProtectedRoute from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { CoverLetterService, type CoverLetter } from "@/lib/cover-letter-service"
import { ResumeService } from "@/lib/resume-service"

interface SavedResume {
  id: string
  name: string
  template_id: string
  data: any
  created_at: string
  updated_at: string
}

interface CoverLetterFormData {
  name: string
  jobTitle: string
  companyName: string
  jobDescription: string
  resumeId: string
  content: string
  specialInstructions: string
}

export default function CoverLettersPage() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  // State
  const [currentView, setCurrentView] = useState<"list" | "create" | "edit">("list")
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingCoverLetter, setEditingCoverLetter] = useState<CoverLetter | null>(null)

  // Form data
  const [formData, setFormData] = useState<CoverLetterFormData>({
    name: "",
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    resumeId: "",
    content: "",
    specialInstructions: "",
  })

  const [resumeOptimizationSuggestions, setResumeOptimizationSuggestions] = useState<string[]>([])

  // Sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await signOut()
      if (error) setError("Failed to sign out")
    } catch (err) {
      setError("Failed to sign out")
      console.error(err)
    }
  }, [signOut])

  // Load data
  useEffect(() => {
    if (user) {
      loadCoverLetters()
      loadResumes()
    }
  }, [user])

  const loadCoverLetters = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await CoverLetterService.getUserCoverLetters(user.id)
      if (error) {
        setError("Failed to load cover letters")
        console.error(error)
      } else {
        setCoverLetters(data || [])
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const loadResumes = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await ResumeService.getUserResumes(user.id)
      if (error) {
        console.error("Failed to load resumes:", error)
      } else {
        setSavedResumes(data || [])
      }
    } catch (err) {
      console.error("Error loading resumes:", err)
    }
  }, [user])

  // Generate cover letter using AI
  const generateCoverLetter = useCallback(async () => {
    if (!formData.jobDescription || !formData.resumeId) {
      toast({
        title: "Missing Information",
        description: "Please provide job description and select a resume",
        variant: "destructive",
      })
      return
    }

    const selectedResume = savedResumes.find((r) => r.id === formData.resumeId)
    if (!selectedResume) {
      toast({
        title: "Resume Not Found",
        description: "Please select a valid resume",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    try {
      const response = await fetch("/api/ai/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: formData.jobDescription,
          resumeData: selectedResume.data,
          jobTitle: formData.jobTitle,
          companyName: formData.companyName,
          specialInstructions: formData.specialInstructions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate cover letter")
      }

      const data = await response.json()

      setFormData((prev) => ({
        ...prev,
        content: data.coverLetter,
        name: prev.name || `Cover Letter - ${formData.companyName || formData.jobTitle || "New Position"}`,
      }))

      if (data.resumeOptimizationSuggestions) {
        setResumeOptimizationSuggestions(data.resumeOptimizationSuggestions)
      }

      toast({
        title: "Cover Letter Generated!",
        description: data.fallback 
          ? "Generated using fallback template. Please review and customize."
          : "Your cover letter has been generated successfully.",
        variant: data.fallback ? "destructive" : "default",
      })
    } catch (err) {
      console.error("Error generating cover letter:", err)
      toast({
        title: "Generation Failed",
        description: "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }, [formData, savedResumes, toast])

  // Save cover letter
  const saveCoverLetter = useCallback(async () => {
    if (!user || !formData.content || !formData.name) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and content for the cover letter",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingCoverLetter) {
        // Update existing cover letter
        const { error } = await CoverLetterService.updateCoverLetter(editingCoverLetter.id, {
          name: formData.name,
          job_title: formData.jobTitle || null,
          company_name: formData.companyName || null,
          job_description: formData.jobDescription || null,
          resume_id: formData.resumeId || null,
          content: formData.content,
        })

        if (error) {
          throw new Error("Failed to update cover letter")
        }

        toast({
          title: "Cover Letter Updated",
          description: "Your cover letter has been updated successfully",
        })
      } else {
        // Create new cover letter
        const { error } = await CoverLetterService.createCoverLetter({
          user_id: user.id,
          name: formData.name,
          job_title: formData.jobTitle || null,
          company_name: formData.companyName || null,
          job_description: formData.jobDescription || null,
          resume_id: formData.resumeId || null,
          content: formData.content,
        })

        if (error) {
          throw new Error("Failed to create cover letter")
        }

        toast({
          title: "Cover Letter Saved",
          description: "Your cover letter has been saved successfully",
        })
      }

      // Refresh the list and go back
      await loadCoverLetters()
      setCurrentView("list")
      resetForm()
    } catch (err) {
      console.error("Error saving cover letter:", err)
      toast({
        title: "Save Failed",
        description: "Failed to save cover letter. Please try again.",
        variant: "destructive",
      })
    }
  }, [user, formData, editingCoverLetter, loadCoverLetters, toast])

  // Delete cover letter
  const deleteCoverLetter = useCallback(
    async (id: string) => {
      if (!user) return

      try {
        const { error } = await CoverLetterService.deleteCoverLetter(id, user.id)
        if (error) {
          throw new Error("Failed to delete cover letter")
        }

        setCoverLetters((prev) => prev.filter((cl) => cl.id !== id))
        toast({
          title: "Cover Letter Deleted",
          description: "Cover letter has been deleted successfully",
        })
      } catch (err) {
        console.error("Error deleting cover letter:", err)
        toast({
          title: "Delete Failed",
          description: "Failed to delete cover letter. Please try again.",
          variant: "destructive",
        })
      }
    },
    [user, toast]
  )

  // Form management
  const resetForm = () => {
    setFormData({
      name: "",
      jobTitle: "",
      companyName: "",
      jobDescription: "",
      resumeId: "",
      content: "",
      specialInstructions: "",
    })
    setResumeOptimizationSuggestions([])
    setEditingCoverLetter(null)
  }

  const startCreateNew = () => {
    resetForm()
    setCurrentView("create")
  }

  const startEditing = (coverLetter: CoverLetter) => {
    setFormData({
      name: coverLetter.name,
      jobTitle: coverLetter.job_title || "",
      companyName: coverLetter.company_name || "",
      jobDescription: coverLetter.job_description || "",
      resumeId: coverLetter.resume_id || "",
      content: coverLetter.content,
      specialInstructions: "",
    })
    setEditingCoverLetter(coverLetter)
    setCurrentView("edit")
  }

  const backToList = () => {
    setCurrentView("list")
    resetForm()
  }

  // Download cover letter as text file
  const downloadCoverLetter = (coverLetter: CoverLetter) => {
    const element = document.createElement("a")
    const file = new Blob([coverLetter.content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${coverLetter.name}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Copy to clipboard
  const copyCoverLetter = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  // Filter cover letters
  const filteredCoverLetters = useMemo(
    () =>
      coverLetters.filter(
        (cl) =>
          cl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cl.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cl.job_title || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [coverLetters, searchTerm]
  )

  // Render functions
  const renderListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cover Letters</h1>
          <p className="text-muted-foreground">Create and manage your professional cover letters</p>
        </div>
        <Button onClick={startCreateNew} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Cover Letter
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cover letters by name, company, or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Card className="h-12 flex items-center">
          <CardContent className="p-4 flex items-center gap-4 w-full">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{coverLetters.length}</p>
              <p className="text-sm text-muted-foreground">Cover Letters</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cover Letters Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCoverLetters.length === 0 ? (
        <Card className="text-center py-20">
          <CardContent>
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            {searchTerm ? (
              <>
                <h3 className="text-2xl font-semibold text-foreground mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Try adjusting your search terms or create a new cover letter.
                </p>
                <Button onClick={() => setSearchTerm("")} variant="outline">
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-foreground mb-2">No cover letters yet</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Create your first cover letter to get started. Our AI will help you craft the perfect letter for any job.
                </p>
                <Button onClick={startCreateNew} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Cover Letter
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCoverLetters.map((coverLetter, index) => (
              <motion.div
                key={coverLetter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Card className="border border-border bg-card hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
                      {coverLetter.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {coverLetter.company_name && (
                        <Badge variant="secondary" className="text-xs">
                          <Building className="w-3 h-3 mr-1" />
                          {coverLetter.company_name}
                        </Badge>
                      )}
                      {coverLetter.job_title && (
                        <Badge variant="outline" className="text-xs">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {coverLetter.job_title}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {coverLetter.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>Created {new Date(coverLetter.created_at).toLocaleDateString()}</span>
                      <span>{Math.ceil(coverLetter.content.length / 5)} words</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEditing(coverLetter)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyCoverLetter(coverLetter.content)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadCoverLetter(coverLetter)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCoverLetter(coverLetter.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )

  const renderFormView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={backToList} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cover Letters
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {editingCoverLetter ? "Edit Cover Letter" : "Create Cover Letter"}
          </h1>
          <p className="text-muted-foreground">
            {editingCoverLetter 
              ? "Update your cover letter details" 
              : "Generate a personalized cover letter with AI assistance"
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Cover Letter Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Software Engineer - Google"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Job Title</label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Company Name</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                    placeholder="e.g., Google"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Resume *
                </label>
                <Select
                  value={formData.resumeId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, resumeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a resume to base the cover letter on" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedResumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{resume.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Job Description *
                </label>
                <Textarea
                  value={formData.jobDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, jobDescription: e.target.value }))}
                  placeholder="Paste the job description here..."
                  rows={8}
                  className="resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Special Instructions <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Textarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Add any specific instructions for the AI (e.g., tone, emphasis, additional requirements)..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={generateCoverLetter}
                disabled={!formData.jobDescription || !formData.resumeId || generating}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Cover Letter...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Cover Letter with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resume Optimization Suggestions */}
          {resumeOptimizationSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Resume Optimization Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resumeOptimizationSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-primary-foreground font-medium">{index + 1}</span>
                      </div>
                      <p className="text-sm text-foreground">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cover Letter Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Cover Letter Content
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Your cover letter content will appear here after generation, or you can write it manually..."
                  rows={20}
                  className="resize-none font-mono text-sm"
                />
              </div>

              {formData.content && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{Math.ceil(formData.content.length / 5)} words</span>
                  <span>{formData.content.length} characters</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={saveCoverLetter}
                  disabled={!formData.content || !formData.name}
                  className="flex-1"
                >
                  {editingCoverLetter ? "Update Cover Letter" : "Save Cover Letter"}
                </Button>
                {formData.content && (
                  <Button
                    variant="outline"
                    onClick={() => copyCoverLetter(formData.content)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">ApexResume</h1>
                    <p className="text-muted-foreground text-sm">Professional Resume Builder</p>
                  </div>
                </div>
                
                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                      <FileText className="h-4 w-4 mr-2" />
                      Resumes
                    </Button>
                  </Link>
                  <Button variant="ghost" className="bg-primary/10 text-primary">
                    <Mail className="h-4 w-4 mr-2" />
                    Cover Letters
                  </Button>
                </nav>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="flex items-center gap-3 text-sm text-foreground bg-muted/50 rounded-lg px-4 py-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="truncate max-w-32">{user?.user_metadata?.full_name || user?.email}</span>
                </div>

                <div className="flex items-center gap-4">
                  <Button onClick={handleSignOut} size="sm" variant="outline">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>

                  <div className="bg-muted rounded-lg p-1">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {currentView === "list" ? renderListView() : renderFormView()}
        </div>
      </div>
    </ProtectedRoute>
  )
}
