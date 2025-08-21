"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Target, 
  TrendingUp, 
  FileSearch,
  Lightbulb,
  Award,
  Users
} from "lucide-react"
import { motion } from "framer-motion"

interface AnalysisResult {
  overallScore: number
  sections: {
    personalInfo: { score: number; feedback: string[] }
    summary: { score: number; feedback: string[] }
    experience: { score: number; feedback: string[] }
    education: { score: number; feedback: string[] }
    skills: { score: number; feedback: string[] }
    projects: { score: number; feedback: string[] }
  }
  strengths: string[]
  improvements: string[]
  atsCompatibility: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  industryFit: {
    detectedIndustry: string
    score: number
    recommendations: string[]
  }
}

interface ResumeAnalysisProps {
  isOpen: boolean
  onClose: () => void
  resumeData: any
}

export default function ResumeAnalysis({ isOpen, onClose, resumeData }: ResumeAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFallback, setIsFallback] = useState(false)

  // Auto-trigger analysis when modal opens
  useEffect(() => {
    if (isOpen && !analysis && !isAnalyzing && !error) {
      handleAnalyze()
    }
  }, [isOpen])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeData }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.analysis) {
        setAnalysis(data.analysis)
        setIsFallback(data.fallback || false)
      } else {
        throw new Error(data.error || 'Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-card border-border rounded-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <Sparkles className="h-5 w-5 text-accent" />
            <span>AI Resume Analysis</span>
            {isFallback && (
              <Badge variant="secondary" className="ml-2">
                Template Mode
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Get comprehensive feedback on your resume's effectiveness and improvement suggestions
          </DialogDescription>
        </DialogHeader>

        {!analysis && !isAnalyzing && (
          <div className="text-center py-8">
            <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-6">
              Ready to analyze your resume? Get detailed insights about content quality, 
              ATS compatibility, and improvement suggestions.
            </p>
            <Button 
              onClick={handleAnalyze}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start AI Analysis
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-12 w-12 text-accent mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing Your Resume...</h3>
            <p className="text-muted-foreground">
              Our AI is evaluating your resume across multiple dimensions
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Analysis Failed</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              onClick={handleAnalyze} 
              variant="outline"
              className="bg-transparent border-border text-foreground hover:bg-secondary"
            >
              Try Again
            </Button>
          </div>
        )}

        {analysis && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Overall Score</h3>
                  <Badge variant={getScoreVariant(analysis.overallScore)} className="text-lg px-3 py-1">
                    {analysis.overallScore}/100
                  </Badge>
                </div>
                <Progress value={analysis.overallScore} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {analysis.overallScore >= 80 && "Excellent! Your resume is well-optimized."}
                  {analysis.overallScore >= 60 && analysis.overallScore < 80 && "Good foundation with room for improvement."}
                  {analysis.overallScore < 60 && "Several areas need attention to improve effectiveness."}
                </p>
              </CardContent>
            </Card>

            {/* Section Scores */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Section Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analysis.sections).map(([key, section]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <span className={`font-semibold ${getScoreColor(section.score)}`}>
                        {section.score}/100
                      </span>
                    </div>
                    <Progress value={section.score} className="h-2" />
                    {section.feedback.length > 0 && (
                      <ul className="text-sm text-muted-foreground ml-4">
                        {section.feedback.map((feedback, index) => (
                          <li key={index} className="list-disc mb-1">
                            {feedback}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-green-800 dark:text-green-200">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card className="border border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                    <Lightbulb className="h-5 w-5" />
                    Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <span className="text-orange-800 dark:text-orange-200">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* ATS Compatibility */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSearch className="h-5 w-5" />
                    ATS Compatibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">ATS Score</span>
                    <Badge variant={getScoreVariant(analysis.atsCompatibility.score)}>
                      {analysis.atsCompatibility.score}/100
                    </Badge>
                  </div>
                  <Progress value={analysis.atsCompatibility.score} className="h-2" />
                  
                  {analysis.atsCompatibility.issues.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Issues:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {analysis.atsCompatibility.issues.map((issue, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysis.atsCompatibility.suggestions.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Suggestions:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {analysis.atsCompatibility.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <TrendingUp className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Industry Fit */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Industry Fit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Detected Industry</span>
                    <Badge variant="outline">
                      {analysis.industryFit.detectedIndustry}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Industry Alignment</span>
                    <Badge variant={getScoreVariant(analysis.industryFit.score)}>
                      {analysis.industryFit.score}/100
                    </Badge>
                  </div>
                  <Progress value={analysis.industryFit.score} className="h-2" />
                  
                  {analysis.industryFit.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Recommendations:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {analysis.industryFit.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Award className="h-3 w-3 text-purple-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={handleAnalyze}
                variant="outline"
                className="bg-transparent border-border text-foreground hover:bg-secondary"
              >
                Re-analyze
              </Button>
              <Button
                onClick={onClose}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Close Analysis
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
