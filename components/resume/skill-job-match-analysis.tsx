"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts"
import { Lock, Sparkles, Target, Briefcase, TrendingUp, RefreshCw, Clock, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ResumeData, ResumeAnalysis } from "@/types/resume"
import { useCredits } from "@/hooks/use-credits"
import { Loader2 } from "lucide-react"

interface SkillJobMatchAnalysisProps {
    resumeData: ResumeData
    onAnalysisComplete: (analysis: ResumeAnalysis) => void
    userId?: string
    resumeId?: string | null
}

export function SkillJobMatchAnalysis({ resumeData, onAnalysisComplete, userId, resumeId }: SkillJobMatchAnalysisProps) {
    const [loading, setLoading] = useState(false)
    const [isLoadingSaved, setIsLoadingSaved] = useState(false)
    const { toast } = useToast()
    const { balance, refreshBalance } = useCredits()
    const [analyzedAt, setAnalyzedAt] = useState<string | null>(null)
    const [isSaved, setIsSaved] = useState(false)

    const analysis = resumeData.analysis

    // Load saved analysis on mount
    useEffect(() => {
        if (!analysis && resumeId && userId) {
            loadSavedAnalysis()
        }
    }, [resumeId, userId])

    const loadSavedAnalysis = async () => {
        if (!resumeId || !userId) return

        setIsLoadingSaved(true)
        try {
            const response = await fetch(
                `/api/ai/analysis?resumeId=${resumeId}&userId=${userId}&type=skill_job_match`
            )
            const data = await response.json()

            if (data.success && data.hasAnalysis && data.analysis) {
                onAnalysisComplete(data.analysis)
                setAnalyzedAt(data.analyzedAt)
                setIsSaved(true)
            }
        } catch (err) {
            console.error("Failed to load saved skill-job analysis:", err)
        } finally {
            setIsLoadingSaved(false)
        }
    }

    const saveAnalysisToDb = async (analysisResult: ResumeAnalysis) => {
        if (!resumeId || !userId) return

        try {
            await fetch("/api/ai/analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeId,
                    userId,
                    analysisType: "skill_job_match",
                    analysisData: analysisResult,
                    overallScore: null,
                    isFallback: false,
                }),
            })
            setIsSaved(true)
            setAnalyzedAt(new Date().toISOString())
        } catch (err) {
            console.error("Failed to save skill-job analysis:", err)
        }
    }

    const handleUnlockAnalysis = async () => {
        if (!userId) {
            toast({
                title: "Authentication Required",
                description: "Please sign in to use this feature",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch("/api/ai/skill-job-match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeData, userId })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Analysis failed")
            }

            const result = await response.json()

            onAnalysisComplete(result)
            refreshBalance()

            // Save to Supabase
            await saveAnalysisToDb(result)

            toast({
                title: "Analysis Complete ✨",
                description: "Your Skill & Job Match Report is ready and saved!",
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Analysis Failed",
                description: error instanceof Error ? error.message : "Something went wrong",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // --- Loading saved analysis ---
    if (isLoadingSaved && !analysis) {
        return (
            <Card className="border border-border">
                <CardContent className="p-8 text-center">
                    <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-3 animate-spin" />
                    <p className="text-muted-foreground text-sm">Loading saved analysis...</p>
                </CardContent>
            </Card>
        )
    }

    // --- Render Locked State ---
    if (!analysis) {
        return (
            <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background/90 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Unlock Skill & Job Match Analysis</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Get a detailed AI visualization of your skill profile and see exactly which jobs you are most qualified for.
                    </p>
                    <div className="flex items-center gap-4">
                        <Button
                            size="lg"
                            onClick={handleUnlockAnalysis}
                            disabled={loading}
                            className="px-8 shadow-lg hover:shadow-primary/25 transition-all"
                        >
                            {loading ? (
                                <>Analyzing...</>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Unlock Report (3 Credits)
                                </>
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                        Uses AI to analyze your skills and match you with suitable job roles.
                    </p>
                    {!resumeId && (
                        <p className="text-xs text-muted-foreground mt-2">
                            💡 Save your resume first to persist analysis results.
                        </p>
                    )}
                </div>

                {/* Placeholder UI behind blur */}
                <CardContent className="opacity-20 blur-sm p-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Skeleton className="h-64 rounded-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // --- Render Unlocked Report ---
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Status bar */}
            {(isSaved || analyzedAt) && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        {isSaved && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                                <Save className="h-3 w-3 mr-1" />
                                Saved
                            </Badge>
                        )}
                        {analyzedAt && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Last analyzed: {formatDate(analyzedAt)}
                            </span>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUnlockAnalysis}
                        disabled={loading}
                        className="gap-1"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Re-analyze (3 Credits)
                    </Button>
                </div>
            )}

            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/20 p-3 rounded-lg mt-1">
                            <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-primary mb-1">Career Profile Summary</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {analysis.summary}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Skill Radar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-500" />
                            Skill Proficiency Profile
                        </CardTitle>
                        <CardDescription>AI-assessed proficiency based on your resume</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.skillsAnalysis}>
                                <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                                <PolarAngleAxis
                                    dataKey="name"
                                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                                />
                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 100]}
                                    tick={false}
                                    axisLine={false}
                                />
                                <Radar
                                    name="Proficiency"
                                    dataKey="proficiency"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.3}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--popover))",
                                        borderColor: "hsl(var(--border))",
                                        borderRadius: "8px",
                                        color: "hsl(var(--popover-foreground))"
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Job Matches */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-green-500" />
                            Top Job Matches
                        </CardTitle>
                        <CardDescription>Roles you are best suited for</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {analysis.jobMatches.map((job, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-foreground">{job.title}</h4>
                                    <Badge
                                        variant={job.matchPercentage > 85 ? "default" : "secondary"}
                                        className={job.matchPercentage > 85 ? "bg-green-500 hover:bg-green-600" : ""}
                                    >
                                        {job.matchPercentage}% Match
                                    </Badge>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${job.matchPercentage}%` }}
                                        transition={{ duration: 1, delay: idx * 0.2 }}
                                        className={`h-full rounded-full ${job.matchPercentage > 90 ? 'bg-green-500' :
                                            job.matchPercentage > 75 ? 'bg-blue-500' : 'bg-yellow-500'
                                            }`}
                                    />
                                </div>

                                <p className="text-sm text-muted-foreground mt-1">
                                    {job.reasoning}
                                </p>
                                {job.salaryRange && (
                                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                                        <span className="opacity-75 mr-1">Est. Salary:</span> {job.salaryRange}
                                    </p>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
