"use client"

import { useState } from "react"
import { Sparkles, FileText, AlertCircle, Loader2, Briefcase } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCredits } from "@/hooks/use-credits"
import type { ResumeData } from "@/types/resume"

const JOB_RESUME_COST = 10

interface SavedResume {
  id: string
  name: string
  template_id: string
  data: ResumeData
}

interface JobResumeModalProps {
  isOpen: boolean
  onClose: () => void
  savedResumes: SavedResume[]
  userId: string
  onSuccess: (resumeData: ResumeData, resumeName: string, creditsRemaining: number) => void
}

export default function JobResumeModal({
  isOpen,
  onClose,
  savedResumes,
  userId,
  onSuccess,
}: JobResumeModalProps) {
  const { balance, refreshBalance } = useCredits()
  const [jobPost, setJobPost] = useState("")
  const [sourceType, setSourceType] = useState<"scratch" | "resume">("scratch")
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasEnoughCredits = balance ? balance.current >= JOB_RESUME_COST : false
  const selectedResume = savedResumes.find((r) => r.id === selectedResumeId)

  const handleGenerate = async () => {
    setError(null)

    if (!jobPost.trim() || jobPost.trim().length < 50) {
      setError("Please paste a complete job description (at least 50 characters).")
      return
    }

    if (sourceType === "resume" && !selectedResumeId) {
      setError("Please select an existing resume to use as a base.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ai/generate-from-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPost: jobPost.trim(),
          userId,
          baseResume: sourceType === "resume" ? selectedResume?.data : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          setError(
            `Not enough credits. You need ${data.creditsRequired} but have ${data.creditsAvailable}. Purchase more from your profile.`
          )
        } else {
          setError(data.error || "Failed to generate resume. Please try again.")
        }
        return
      }

      const jobTitle = data.resumeData?.personalInfo?.title || "Tailored"
      const resumeName = `${jobTitle} - Job Tailored Resume`

      await refreshBalance()
      onSuccess(data.resumeData, resumeName, data.creditsRemaining)
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setJobPost("")
    setSourceType("scratch")
    setSelectedResumeId("")
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            AI Resume from Job Post
          </DialogTitle>
          <DialogDescription>
            Paste a job description and AI will generate a perfectly tailored resume for that role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Credits cost banner */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">This feature costs</span>
              <Badge variant="secondary" className="font-semibold">{JOB_RESUME_COST} credits</Badge>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Your balance: </span>
              <span className={`font-semibold ${hasEnoughCredits ? "text-foreground" : "text-destructive"}`}>
                {balance?.current ?? "—"} credits
              </span>
            </div>
          </div>

          {!hasEnoughCredits && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need {JOB_RESUME_COST} credits for this feature.{" "}
                <a href="/profile" className="underline font-medium">
                  Purchase more credits
                </a>
                .
              </AlertDescription>
            </Alert>
          )}

          {/* Job post input */}
          <div className="space-y-2">
            <Label htmlFor="job-post" className="text-sm font-medium">
              Job Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="job-post"
              placeholder={`Paste the full job description here...

Example:
Senior Software Engineer – Full Stack
We are looking for an experienced engineer to join our team...

Requirements:
• 5+ years of experience with React and Node.js
• Experience with cloud platforms (AWS/GCP)
...`}
              value={jobPost}
              onChange={(e) => setJobPost(e.target.value)}
              className="min-h-[200px] resize-y font-mono text-sm"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {jobPost.length.toLocaleString()}/10,000 characters — The more complete the posting, the better the result.
            </p>
          </div>

          {/* Starting point selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Starting Point</Label>
            <div className="space-y-2">
              {/* From scratch */}
              <div
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  sourceType === "scratch"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/40"
                }`}
                onClick={() => setSourceType("scratch")}
              >
                <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  sourceType === "scratch" ? "border-primary" : "border-muted-foreground"
                }`}>
                  {sourceType === "scratch" && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Start from scratch</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    AI builds a complete resume tailored to the role. You fill in your real details afterward.
                  </p>
                </div>
              </div>

              {/* From existing resume */}
              <div
                className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                  savedResumes.length === 0
                    ? "border-border opacity-50 cursor-not-allowed"
                    : sourceType === "resume"
                    ? "border-primary bg-primary/5 cursor-pointer"
                    : "border-border hover:bg-muted/40 cursor-pointer"
                }`}
                onClick={() => savedResumes.length > 0 && setSourceType("resume")}
              >
                <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  sourceType === "resume" ? "border-primary" : "border-muted-foreground"
                }`}>
                  {sourceType === "resume" && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Tailor an existing resume
                    {savedResumes.length === 0 && (
                      <span className="text-xs text-muted-foreground font-normal ml-2">(no resumes yet)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    AI rewrites your existing resume content to match this specific job posting.
                  </p>
                </div>
              </div>
            </div>

            {/* Resume picker */}
            {sourceType === "resume" && savedResumes.length > 0 && (
              <div className="ml-7 space-y-2">
                <Label className="text-xs text-muted-foreground">Select a resume to tailor:</Label>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {savedResumes.map((resume) => (
                    <div
                      key={resume.id}
                      onClick={() => setSelectedResumeId(resume.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedResumeId === resume.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{resume.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {resume.data?.personalInfo?.title || "No title"}
                        </p>
                      </div>
                      {selectedResumeId === resume.id && (
                        <Badge variant="secondary" className="text-xs shrink-0">Selected</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={loading || !hasEnoughCredits || !jobPost.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Resume…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate ({JOB_RESUME_COST} credits)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
