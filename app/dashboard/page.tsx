"use client"

import React, { useState, useEffect, useMemo, useCallback, Suspense, memo } from "react"
import Link from "next/link"
import {
  FileText,
  Moon,
  Sun,
  Plus,
  Trash2,
  User,
  Search,
  Edit,
  LogOut,
  Upload,
  Copy,
  Sparkles,
  X,
  Star,
  Mail,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

import ProtectedRoute from "@/components/auth/protected-route"
import ResumeUploadModal from "@/components/resume-upload-modal"
import DuplicateResumeModal from "@/components/duplicate-resume-modal"
import ResumeBuilder from "../components/resume-builder"
import { TemplatePreview } from "../components/template-previews"
import { RESUME_TEMPLATES } from "../types/templates"

import { useAuth } from "@/hooks/use-auth"
import { ResumeService } from "@/lib/resume-service"

// TYPES
interface SavedResume {
  id: string
  name: string
  template_id: string
  data: any
  created_at: string
  updated_at: string
}

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Simple local storage hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

// Add Resume Card Component
const AddResumeCard = memo(({ onClick }: { onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -2 }}
    className="group cursor-pointer"
    onClick={onClick}
  >
    <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:border-primary/50 hover:bg-muted/40 transition-all duration-200 h-full min-h-[400px] flex items-center justify-center">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Create New Resume</h3>
        <p className="text-sm text-muted-foreground">Start building your professional resume</p>
      </CardContent>
    </Card>
  </motion.div>
))

AddResumeCard.displayName = "AddResumeCard"

// Optimized Resume Card Component
const ResumeCard = memo(
  ({
    resume,
    index,
    onEdit,
    onDuplicate,
    onDelete,
  }: {
    resume: SavedResume
    index: number
    onEdit: (id: string) => void
    onDuplicate: (resume: SavedResume) => void
    onDelete: (id: string) => void
  }) => {
    const template = useMemo(() => RESUME_TEMPLATES.find((t) => t.id === resume.template_id), [resume.template_id])

    const handleEdit = useCallback(() => onEdit(resume.id), [onEdit, resume.id])
    const handleDuplicate = useCallback(() => onDuplicate(resume), [onDuplicate, resume])
    const handleDelete = useCallback(() => onDelete(resume.id), [onDelete, resume.id])

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
        }}
        whileHover={{ y: -2 }}
        className="group"
      >
        <Card className="border border-border bg-card hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-foreground truncate text-base">{resume.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {template?.name ?? "Classic"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {resume.data?.personalInfo?.title || "No title"}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {/* TEMPLATE PREVIEW */}
            {template && (
              <div className="w-full h-32 border border-border rounded-lg overflow-hidden bg-white">
                <div className="transform scale-[0.25] origin-top-left w-[400%] h-[400%]">
                  <TemplatePreview template={template} data={resume.data} />
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" onClick={handleEdit} className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <Button size="sm" variant="outline" onClick={handleDuplicate} className="w-full bg-transparent">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>

              <Button size="sm" variant="outline" className="w-full bg-transparent">
                <Sparkles className="h-4 w-4 mr-2" />
                Review
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="w-full text-destructive bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  },
)

ResumeCard.displayName = "ResumeCard"

// Loading Skeleton Component
const LoadingSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="border border-border rounded-lg p-6 animate-pulse">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 bg-muted rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
        <div className="w-full h-32 bg-muted rounded-lg mb-4" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </div>
    ))}
  </div>
))

LoadingSkeleton.displayName = "LoadingSkeleton"

// DASHBOARD COMPONENT
export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  const [isDarkMode, setIsDarkMode] = useLocalStorage("theme", false)
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentView, setCurrentView] = useState<"dashboard" | "builder">("dashboard")
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicatingResume, setDuplicatingResume] = useState<SavedResume | null>(null)

  // Debounced search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // THEME
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    document.documentElement.classList.toggle("light", !isDarkMode)
  }, [isDarkMode])

  // DATA
  useEffect(() => {
    if (user) loadSavedResumes()
  }, [user])

  const loadSavedResumes = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await ResumeService.getUserResumes(user.id)
      if (error) {
        setError("Failed to load resumes")
        console.error(error)
      } else {
        setSavedResumes(data || [])
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const deleteResume = useCallback(
    async (id: string) => {
      if (!user) return
      try {
        const { error } = await ResumeService.deleteResume(id, user.id)
        if (error) {
          setError("Failed to delete resume")
        } else {
          setSavedResumes((prev) => prev.filter((r) => r.id !== id))
        }
      } catch (err) {
        setError("Failed to delete resume")
        console.error(err)
      }
    },
    [user],
  )

  const duplicateResume = useCallback(
    async (originalId: string, newName: string, templateId: string) => {
      if (!user) return
      try {
        const original = savedResumes.find((r) => r.id === originalId)
        if (!original) return

        const { error } = await ResumeService.createResume({
          user_id: user.id,
          name: newName,
          template_id: templateId,
          data: original.data,
        })

        if (error) {
          setError("Failed to duplicate resume")
        } else {
          loadSavedResumes()
        }
      } catch (err) {
        setError("Failed to duplicate resume")
        console.error(err)
      }
    },
    [user, savedResumes, loadSavedResumes],
  )

  // NAVIGATION
  const createNewResume = useCallback(() => {
    setEditingResumeId(null)
    setCurrentView("builder")
  }, [])

  const editResume = useCallback((id: string) => {
    setEditingResumeId(id)
    setCurrentView("builder")
  }, [])

  const backToDashboard = useCallback(() => {
    setCurrentView("dashboard")
    setEditingResumeId(null)
    loadSavedResumes()
  }, [loadSavedResumes])

  // SIGN-OUT
  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await signOut()
      if (error) setError("Failed to sign out")
    } catch (err) {
      setError("Failed to sign out")
      console.error(err)
    }
  }, [signOut])

  // DUPLICATE-MODAL
  const handleDuplicateClick = useCallback((resume: SavedResume) => {
    setDuplicatingResume(resume)
    setShowDuplicateModal(true)
  }, [])

  const handleDuplicateConfirm = useCallback(
    (name: string, templateId: string) => {
      if (duplicatingResume) {
        duplicateResume(duplicatingResume.id, name, templateId)
      }
      setShowDuplicateModal(false)
      setDuplicatingResume(null)
    },
    [duplicatingResume, duplicateResume],
  )

  // FILTER - Memoized for performance
  const filteredResumes = useMemo(
    () =>
      savedResumes.filter(
        (r) =>
          r.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (r.data?.personalInfo?.name || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      ),
    [savedResumes, debouncedSearchTerm],
  )

  // Resume Builder view
  if (currentView === "builder") {
    return (
      <ProtectedRoute>
        <Suspense
          fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-foreground text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p>Loading Resume Builder...</p>
              </div>
            </div>
          }
        >
          <ResumeBuilder onBack={backToDashboard} editingResumeId={editingResumeId} />
        </Suspense>
      </ProtectedRoute>
    )
  }

  // Dashboard view
  return (
    <ProtectedRoute>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {/* HEADER */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">ResumeAI</h1>
                      <p className="text-muted-foreground text-sm">Professional Resume Builder</p>
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <nav className="hidden md:flex items-center gap-1">
                    <Button variant="ghost" className="bg-primary/10 text-primary">
                      <FileText className="h-4 w-4 mr-2" />
                      Resumes
                    </Button>
                    <Link href="/cover-letters">
                      <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        Cover Letters
                      </Button>
                    </Link>
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

                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                      <Moon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-6 py-12">
            {/* HERO SECTION */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                Create Professional
                <br />
                <span className="text-muted-foreground">Resumes</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Build professional resumes with AI assistance, clean templates, and seamless export options.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={createNewResume} size="lg" className="px-8 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Resume
                </Button>
                <Button onClick={() => setShowUploadModal(true)} size="lg" variant="outline" className="px-8 py-3">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload & Analyze
                </Button>
              </div>
            </div>

            {/* ERROR ALERT */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8"
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STATS & SEARCH */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
              <div className="lg:col-span-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search your resumes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-12 h-12 text-base"
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
              </div>

              <Card className="h-12 flex items-center">
                <CardContent className="p-4 flex items-center gap-4 w-full">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{savedResumes.length}</p>
                    <p className="text-sm text-muted-foreground">Resumes</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RESUME GRID */}
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Add Resume Card - Always first */}
                <AddResumeCard onClick={createNewResume} />

                {/* Existing Resumes */}
                <AnimatePresence>
                  {filteredResumes.map((resume, index) => (
                    <ResumeCard
                      key={resume.id}
                      resume={resume}
                      index={index + 1} // +1 because AddResumeCard is index 0
                      onEdit={editResume}
                      onDuplicate={handleDuplicateClick}
                      onDelete={deleteResume}
                    />
                  ))}
                </AnimatePresence>

                {/* Empty State for Search */}
                {filteredResumes.length === 0 && searchTerm && (
                  <div className="col-span-full">
                    <Card className="text-center py-20">
                      <CardContent>
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                        <h3 className="text-2xl font-semibold text-foreground mb-2">No matches found</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                          Try adjusting your search terms or create a new resume.
                        </p>
                        <Button onClick={() => setSearchTerm("")} variant="outline">
                          Clear Search
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* MODALS */}
          {showUploadModal && (
            <ResumeUploadModal
              isOpen={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              onAnalysisComplete={async (data: { resumeData: any }) => {
                console.log('📄 Resume data received:', data.resumeData)
                
                if (user) {
                  try {
                    // Create a new resume with the parsed data
                    const resumeName = data.resumeData.personalInfo?.name 
                      ? `${data.resumeData.personalInfo.name}'s Resume`
                      : `Uploaded Resume ${new Date().toLocaleDateString()}`
                    
                    const { error } = await ResumeService.createResume({
                      user_id: user.id,
                      name: resumeName,
                      template_id: 'modern', // Default template
                      data: data.resumeData,
                    })

                    if (error) {
                      setError("Failed to create resume from uploaded file")
                      console.error(error)
                      toast({
                        title: "Error",
                        description: "Failed to create resume from uploaded file",
                        variant: "destructive",
                      })
                    } else {
                      console.log('✅ Resume created successfully from uploaded file')
                      toast({
                        title: "Success!",
                        description: `Resume "${resumeName}" created successfully from your uploaded file`,
                      })
                      loadSavedResumes()
                    }
                  } catch (err) {
                    setError("An unexpected error occurred while creating the resume")
                    console.error(err)
                    toast({
                      title: "Error",
                      description: "An unexpected error occurred while creating the resume",
                      variant: "destructive",
                    })
                  }
                }
              }}
            />
          )}
          {showDuplicateModal && (
            <DuplicateResumeModal
              isOpen={showDuplicateModal}
              onClose={() => setShowDuplicateModal(false)}
              onDuplicate={handleDuplicateConfirm}
              originalResumeName={duplicatingResume?.name || ""}
            />
          )}
        </div>
      </TooltipProvider>
    </ProtectedRoute>
  )
}
