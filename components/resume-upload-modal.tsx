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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResumeUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onAnalysisComplete: (data: any) => void
}

interface AnalysisResult {
  score: number
  grade: string
  strengths: string[]
  improvements: string[]
  sections: {
    name: string
    score: number
    feedback: string
  }[]
  keywords: string[]
  atsCompatibility: number
}

export default function ResumeUploadModal({ isOpen, onClose, onAnalysisComplete }: ResumeUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile)
    setAnalysisResult(null)
  }

  const handleAnalyze = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setUploadProgress(0)

    // Simulate file upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock analysis result
    const mockResult: AnalysisResult = {
      score: 78,
      grade: "B+",
      strengths: [
        "Strong technical skills section",
        "Clear work experience descriptions",
        "Professional formatting and layout",
        "Good use of action verbs",
      ],
      improvements: [
        "Add quantifiable achievements with metrics",
        "Include more relevant keywords for ATS",
        "Expand professional summary",
        "Add certifications section",
      ],
      sections: [
        { name: "Contact Information", score: 95, feedback: "Complete and professional" },
        { name: "Professional Summary", score: 65, feedback: "Could be more compelling and specific" },
        { name: "Work Experience", score: 82, feedback: "Good descriptions, add more metrics" },
        { name: "Skills", score: 88, feedback: "Comprehensive technical skills listed" },
        { name: "Education", score: 90, feedback: "Well formatted and complete" },
      ],
      keywords: ["JavaScript", "React", "Node.js", "Python", "AWS", "Git", "Agile"],
      atsCompatibility: 85,
    }

    setAnalysisResult(mockResult)
    setIsAnalyzing(false)
  }

  const handleClose = () => {
    setFile(null)
    setAnalysisResult(null)
    setUploadProgress(0)
    setIsAnalyzing(false)
    onClose()
  }

  const handleUseAnalysis = () => {
    if (analysisResult) {
      onAnalysisComplete(analysisResult)
      handleClose()
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (grade.startsWith("B")) return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card border-border rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <Upload className="h-5 w-5 text-primary" />
            <span>Upload & Analyze Resume</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload your existing resume to get AI-powered analysis and improvement suggestions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!analysisResult ? (
            <>
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
                      <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                      <p className="text-sm text-muted-foreground">Supports PDF, DOC, DOCX files up to 10MB</p>
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
                        accept=".pdf,.doc,.docx"
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

              {/* Upload Progress */}
              {isAnalyzing && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="font-medium mb-2 text-foreground">Analyzing your resume...</p>
                    <Progress value={uploadProgress} className="w-full bg-secondary" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {uploadProgress < 100 ? "Uploading file..." : "AI analysis in progress..."}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Analysis Results */
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="bg-card border-border rounded-xl">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className={cn("text-4xl font-bold", getScoreColor(analysisResult.score))}>
                        {analysisResult.score}
                      </div>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                    </div>
                    <div className="text-center">
                      <Badge className={getGradeColor(analysisResult.grade)} variant="secondary">
                        {analysisResult.grade}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">Grade</p>
                    </div>
                    <div className="text-center">
                      <div className={cn("text-2xl font-bold", getScoreColor(analysisResult.atsCompatibility))}>
                        {analysisResult.atsCompatibility}%
                      </div>
                      <p className="text-sm text-muted-foreground">ATS Compatible</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Section Scores */}
              <Card className="bg-card border-border rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-foreground">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>Section Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.sections.map((section, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-foreground">{section.name}</span>
                        <span className={cn("font-bold", getScoreColor(section.score))}>{section.score}%</span>
                      </div>
                      <Progress value={section.score} className="h-2 bg-secondary" />
                      <p className="text-xs text-muted-foreground mt-1">{section.feedback}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Strengths and Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-card border-border rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-primary">
                      <CheckCircle className="h-5 w-5" />
                      <span>Strengths</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-sm text-foreground">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-accent">
                      <AlertCircle className="h-5 w-5" />
                      <span>Improvements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                          <span className="text-sm text-foreground">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Keywords */}
              <Card className="bg-card border-border rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-foreground">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Detected Keywords</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="border-border text-foreground">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
          {!analysisResult ? (
            <Button
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
            </Button>
          ) : (
            <Button onClick={handleUseAnalysis} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Use Analysis Results
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
