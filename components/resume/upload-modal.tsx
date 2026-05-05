"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, Sparkles } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import ResumeAnalysis from "@/app/components/resume-analysis"

interface ResumeUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onAnalysisComplete: (data: { resumeData: any }) => void
}

export default function ResumeUploadModal({ isOpen, onClose, onAnalysisComplete }: ResumeUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [parsedResumeData, setParsedResumeData] = useState<any>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [includeAnalysis, setIncludeAnalysis] = useState(true)
  const { toast } = useToast()

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile)
    setParsedResumeData(null)
    setShowAnalysis(false)
  }

  const handleUploadAndParse = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      setUploadProgress(30)

      const formData = new FormData()
      formData.append('file', file)

      const parseResponse = await fetch('/api/ai/parse-resume', {
        method: 'POST',
        body: formData,
      })

      const parseResult = await parseResponse.json()

      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Failed to parse resume')
      }

      setUploadProgress(100)
      setParsedResumeData(parseResult.data)

      if (includeAnalysis) {
        setShowAnalysis(true)
        toast({
          title: "Upload Successful!",
          description: "Resume parsed successfully. Opening analysis...",
        })
      } else {
        // Skip analysis, just complete the upload
        onAnalysisComplete({ resumeData: parseResult.data })
        toast({
          title: "Upload Successful!",
          description: "Resume parsed and imported.",
        })
        handleClose()
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleAnalysisComplete = () => {
    if (parsedResumeData) {
      onAnalysisComplete({ resumeData: parsedResumeData })
      handleClose()
    }
  }

  const handleClose = () => {
    setFile(null)
    setParsedResumeData(null)
    setShowAnalysis(false)
    setUploadProgress(0)
    setIsUploading(false)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen && !showAnalysis} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-foreground">
              <Upload className="h-5 w-5 text-primary" />
              <span>Upload & Analyze Resume</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload your existing resume to get AI-powered analysis and create a new resume
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <Label className="text-foreground">Select Resume File</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  file ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                )}
              >
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 mx-auto text-primary" />
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.size > 1024 * 1024
                        ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                        : `${(file.size / 1024).toFixed(0)} KB`}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="bg-transparent border-border text-foreground hover:bg-secondary"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-lg font-medium text-foreground">Drop your resume here</p>
                    <p className="text-sm text-muted-foreground">Supports PDF files up to 10MB</p>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("resume-upload")?.click()}
                      className="bg-transparent border-border text-foreground hover:bg-secondary"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] || null
                        handleFileSelect(selectedFile)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Option */}
            <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="space-y-1 flex-1 mr-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="include-analysis" className="text-sm font-semibold cursor-pointer">
                    Include AI Analysis
                  </Label>
                  <span className="flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Sparkles className="h-3 w-3 mr-1" />
                    3 Credits
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get detailed feedback, strengths, and improvement suggestions for your resume.
                </p>
              </div>
              <Switch
                id="include-analysis"
                checked={includeAnalysis}
                onCheckedChange={setIncludeAnalysis}
                disabled={isUploading}
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="font-medium mb-2 text-foreground">
                    {uploadProgress < 50 ? "Uploading and parsing..." : "Processing completed..."}
                  </p>
                  <Progress value={uploadProgress} className="w-full bg-secondary" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {uploadProgress < 50 ? "Extracting text from your resume" : includeAnalysis ? "Preparing analysis" : "Finalizing..."}
                  </p>
                </div>
              </div>
            )}
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
              onClick={handleUploadAndParse}
              disabled={!file || isUploading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isUploading ? "Processing..." : includeAnalysis ? "Upload & Analyze" : "Upload Only"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resume Analysis Modal */}
      {showAnalysis && parsedResumeData && (
        <ResumeAnalysis
          isOpen={showAnalysis}
          onClose={handleAnalysisComplete}
          resumeData={parsedResumeData}
        />
      )}
    </>
  )
}
