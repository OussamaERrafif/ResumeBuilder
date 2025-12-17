"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from "recharts"
import { Lock, Sparkles, Target, Briefcase, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ResumeData, ResumeAnalysis } from "@/types/resume"
import { useCredits } from "@/hooks/use-credits"

interface SkillJobMatchAnalysisProps {
    resumeData: ResumeData
    onAnalysisComplete: (analysis: ResumeAnalysis) => void
    userId?: string
}

export function SkillJobMatchAnalysis({ resumeData, onAnalysisComplete, userId }: SkillJobMatchAnalysisProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const { balance, refreshBalance } = useCredits()

    const analysis = resumeData.analysis

    const handleUnlockAnalysis = async () => {
        if (!userId) {
            toast({
                title: "Authentication Required",
                description: "Please sign in to use this feature",
                variant: "destructive"
            })
            return
        }

        const COST = 10
        // if (balance && balance.current < COST) {
        //     toast({
        //         title: "Insufficient Credits",
        //         description: `You need ${COST} credits to unlock this analysis.`,
        //         variant: "destructive"
        //     })
        //     return
        // }

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

            toast({
                title: "Analysis Complete",
                description: "Your Resume Skill & Job Match Report is ready!",
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
