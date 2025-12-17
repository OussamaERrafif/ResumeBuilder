"use client"

import React, { useState, useEffect, useMemo, useCallback, Suspense, memo } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  FileText,
  Plus,
  Trash2,
  Search,
  Edit,
  Upload,
  Copy,
  Sparkles,
  X,
  Star,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardNav } from "@/components/dashboard-nav"
import { useToast } from "@/hooks/use-toast"

import ProtectedRoute from "@/components/auth/protected-route"
import { RESUME_TEMPLATES } from "../types/templates"

import { useAuth } from "@/hooks/use-auth"
import { useCredits } from "@/hooks/use-credits"
import { ResumeService } from "@/lib/resume-service"

// Lazy load heavy components - only loaded when needed
const ResumeUploadModal = dynamic(() => import("@/components/resume-upload-modal"), {
  ssr: false,
  loading: () => null
})
const DuplicateResumeModal = dynamic(() => import("@/components/duplicate-resume-modal"), {
  ssr: false,
  loading: () => null
})
const ResumeBuilder = dynamic(() => import("../components/resume-builder"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Loading Resume Builder...</p>
      </div>
    </div>
  )
})
const TemplatePreview = dynamic(
  () => import("../components/template-previews").then(mod => ({ default: mod.TemplatePreview })),
  { ssr: false, loading: () => <div className="w-full h-32 bg-muted animate-pulse rounded-xl" /> }
)

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
// Add Resume Card Component
const AddResumeCard = memo(({ onClick }: { onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -4, scale: 1.01 }}
    className="group cursor-pointer"
    onClick={onClick}
  >
    <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/10 hover:border-primary hover:bg-primary/5 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.2)] transition-all duration-300 h-full min-h-[400px] flex items-center justify-center rounded-2xl cursor-pointer">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-primary/25">
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
        whileHover={{ y: -4 }}
        className="group"
      >
        <Card className="border border-border bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-foreground truncate text-base font-semibold">{resume.name}</CardTitle>
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {resume.data?.personalInfo?.title || "No title"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs rounded-md">
                    {template?.name ?? "Classic"}
                  </Badge>
                  <Badge variant="outline" className="text-xs rounded-md text-emerald-600 border-emerald-200 dark:border-emerald-800">
                    <Star className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {/* TEMPLATE PREVIEW - Simplified: show template name/icon instead of full render */}
            <div className="w-full h-32 border border-border rounded-xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted group-hover:border-primary/30 transition-colors flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{template?.name || "Classic"} Template</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" onClick={handleEdit} className="w-full rounded-lg">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <Button size="sm" variant="outline" onClick={handleDuplicate} className="w-full bg-transparent rounded-lg">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>

              <Button size="sm" variant="outline" className="w-full bg-transparent rounded-lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Review
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="w-full text-destructive hover:bg-destructive/10 bg-transparent rounded-lg"
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
  const { balance } = useCredits()
  const { toast } = useToast()

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

  // Define loadSavedResumes before using it in useEffect
  const loadSavedResumes = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error: fetchError } = await ResumeService.getUserResumes(user.id)
      if (fetchError) {
        setError("Failed to load resumes")
      } else {
        setSavedResumes(data || [])
      }
    } catch (_err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [user])

  // DATA - load resumes when user changes
  useEffect(() => {
    if (user) loadSavedResumes()
  }, [user, loadSavedResumes])

  const deleteResume = useCallback(
    async (id: string) => {
      if (!user) return
      try {
        const { error: deleteError } = await ResumeService.deleteResume(id, user.id)
        if (deleteError) {
          setError("Failed to delete resume")
        } else {
          setSavedResumes((prev) => prev.filter((r) => r.id !== id))
        }
      } catch (_err) {
        setError("Failed to delete resume")
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

        const { error: createError } = await ResumeService.createResume({
          user_id: user.id,
          name: newName,
          template_id: templateId,
          data: original.data,
        })

        if (createError) {
          setError("Failed to duplicate resume")
        } else {
          loadSavedResumes()
        }
      } catch (_err) {
        setError("Failed to duplicate resume")
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
      const { error: signOutError } = await signOut()
      if (signOutError) setError("Failed to sign out")
    } catch (_err) {
      setError("Failed to sign out")
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
          <DashboardNav />

          <main className="container mx-auto px-4 sm:px-6 py-8 pt-20">
            {/* HERO SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12 lg:mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
                Create Professional
                <br />
                <span className="gradient-text-accent">Resumes</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Build professional resumes with AI assistance, clean templates, and seamless export options.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={createNewResume} size="lg" className="px-8 py-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Resume
                </Button>
                <Button onClick={() => setShowUploadModal(true)} size="lg" variant="outline" className="px-8 py-3">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload & Analyze
                </Button>
              </div>

              {/* Credits Quick Info */}
              {balance && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8"
                >
                  <Link href="/profile">
                    <div className="inline-flex items-center gap-4 px-6 py-3 bg-muted/50 hover:bg-muted rounded-xl border border-border transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Sparkles className={`h-5 w-5 ${balance.current <= 5 ? 'text-destructive' : 'text-yellow-500'}`} />
                        <span className="text-lg font-semibold">{balance.current}</span>
                        <span className="text-muted-foreground">AI Credits</span>
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">1 credit</span> = summary/experience •
                        <span className="font-medium text-foreground ml-1">5 credits</span> = cover letter
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </motion.div>

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10"
            >
              <div className="lg:col-span-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search your resumes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-12 h-12 text-base rounded-xl"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-lg"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <Card className="flex items-center rounded-xl">
                <CardContent className="p-4 flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{savedResumes.length}</p>
                    <p className="text-xs text-muted-foreground">Total Resumes</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

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
              onAnalysisComplete={async (data: { resumeData: Record<string, unknown> }) => {

                if (user) {
                  try {
                    // Create a new resume with the parsed data
                    const personalInfo = data.resumeData.personalInfo as { name?: string } | undefined
                    const resumeName = personalInfo?.name
                      ? `${personalInfo.name}'s Resume`
                      : `Uploaded Resume ${new Date().toLocaleDateString()}`

                    const { error: createError } = await ResumeService.createResume({
                      user_id: user.id,
                      name: resumeName,
                      template_id: 'modern', // Default template
                      data: data.resumeData,
                    })

                    if (createError) {
                      setError("Failed to create resume from uploaded file")
                      toast({
                        title: "Error",
                        description: "Failed to create resume from uploaded file",
                        variant: "destructive",
                      })
                    } else {
                      toast({
                        title: "Success!",
                        description: `Resume "${resumeName}" created successfully from your uploaded file`,
                      })
                      loadSavedResumes()
                    }
                  } catch (_err) {
                    setError("An unexpected error occurred while creating the resume")
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
