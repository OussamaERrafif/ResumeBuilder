"use client"

import { useRef, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, AlertCircle, CheckCircle } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Analysis interface matching the actual app structure
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

// Static data using the actual analysis structure for before/after comparison
const beforeResumeData: AnalysisResult = {
  overallScore: 35,
  sections: {
    personalInfo: { score: 40, feedback: ["Missing professional title", "No LinkedIn profile"] },
    summary: { score: 25, feedback: ["Generic summary", "No quantified achievements"] },
    experience: { score: 30, feedback: ["Vague job descriptions", "No measurable results"] },
    education: { score: 60, feedback: ["Basic education info", "Missing relevant coursework"] },
    skills: { score: 45, feedback: ["Unorganized skills list", "Missing key technologies"] },
    projects: { score: 20, feedback: ["No projects listed", "Missing portfolio work"] }
  },
  strengths: ["Basic contact information", "Education completed"],
  improvements: [
    "Add quantified achievements in experience section",
    "Include professional summary with measurable results",
    "Optimize for ATS compatibility",
    "Add relevant projects and portfolio work"
  ],
  atsCompatibility: { 
    score: 30, 
    issues: ["Non-standard section headers", "Poor keyword optimization"],
    suggestions: ["Use standard section names", "Include industry keywords"]
  },
  industryFit: { 
    score: 25, 
    detectedIndustry: "Generic",
    recommendations: ["Add industry-specific skills", "Include relevant certifications"]
  }
}

const afterResumeData: AnalysisResult = {
  overallScore: 92,
  sections: {
    personalInfo: { score: 95, feedback: ["Complete contact info", "Professional title included"] },
    summary: { score: 90, feedback: ["Compelling professional summary", "Quantified achievements"] },
    experience: { score: 95, feedback: ["Detailed accomplishments", "Measurable impact shown"] },
    education: { score: 85, feedback: ["Relevant education highlighted", "Key coursework included"] },
    skills: { score: 90, feedback: ["Well-organized skill categories", "Industry-relevant technologies"] },
    projects: { score: 88, feedback: ["Impressive project portfolio", "Technical details included"] }
  },
  strengths: [
    "Strong quantified achievements throughout",
    "Excellent ATS optimization",
    "Industry-specific skill alignment",
    "Comprehensive project portfolio"
  ],
  improvements: [
    "Consider adding leadership examples",
    "Include recent certifications"
  ],
  atsCompatibility: { 
    score: 95, 
    issues: [],
    suggestions: ["Perfect ATS compatibility achieved"]
  },
  industryFit: { 
    score: 90, 
    detectedIndustry: "Technology",
    recommendations: ["Excellent industry alignment", "Strong technical focus"]
  }
}

// Animated Counter Component
interface AnimatedCounterProps {
  from: number
  to: number
  duration: number
  delay?: number
  prefix?: string
  suffix?: string
  triggerId?: string
}

function AnimatedCounter({ from, to, duration, delay = 0, prefix = "", suffix = "", triggerId }: AnimatedCounterProps) {
  const [count, setCount] = useState(from)
  const countRef = useRef({ value: from })
  const spanRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const trigger = triggerId ? `#${triggerId}` : spanRef.current
    
    gsap.to(countRef.current, {
      value: to,
      duration: duration,
      delay: delay,
      ease: "power2.out",
      onUpdate: () => setCount(Math.round(countRef.current.value)),
      scrollTrigger: {
        trigger: trigger,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    })
  }, [to, duration, delay, triggerId])

  return <span ref={spanRef}>{prefix}{count}{suffix}</span>
}

// Animated Progress Bar Component
function AnimatedProgress({ value, className, delay = 0, triggerId }: { value: number; className?: string; delay?: number; triggerId?: string }) {
  const [currentValue, setCurrentValue] = useState(0)
  const progressRef = useRef({ value: 0 })
  const divRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const trigger = triggerId ? `#${triggerId}` : divRef.current

    gsap.to(progressRef.current, {
      value: value,
      duration: 1.5,
      delay: delay,
      ease: "power2.out",
      onUpdate: () => setCurrentValue(progressRef.current.value),
      scrollTrigger: {
        trigger: trigger,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    })
  }, [value, delay, triggerId])

  return (
    <div ref={divRef}>
      <Progress value={currentValue} className={className} />
    </div>
  )
}

// Reusable score display component matching the actual app style
function ScoreDisplay({ analysis, type, idPrefix }: { analysis: AnalysisResult; type: 'before' | 'after'; idPrefix: string }) {
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

  const isGood = type === 'after'
  const cardId = `${idPrefix}-card`

  return (
    <Card id={cardId} className="border border-border h-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-foreground">
          {isGood ? "After AI Enhancement" : "Before AI Enhancement"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score - matching actual app structure */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Score</span>
            <Badge variant={getScoreVariant(analysis.overallScore)} className="text-lg px-3 py-1">
              <AnimatedCounter from={0} to={analysis.overallScore} duration={2} delay={0.5} triggerId={cardId} />/100
            </Badge>
          </div>
          <AnimatedProgress value={analysis.overallScore} className="h-3" delay={0.8} triggerId={cardId} />
          <p className="text-sm text-muted-foreground">
            {analysis.overallScore >= 80 && "Excellent! Ready for top employers"}
            {analysis.overallScore >= 60 && analysis.overallScore < 80 && "Good foundation with room for improvement"}
            {analysis.overallScore < 60 && "Needs significant improvement"}
          </p>
        </div>

        {/* Section Analysis - matching actual app structure */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            Section Analysis
          </h4>
          {Object.entries(analysis.sections).slice(0, 4).map(([key, section], index) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className={`font-semibold ${getScoreColor(section.score)}`}>
                  <AnimatedCounter from={0} to={section.score} duration={1.5} delay={1 + index * 0.2} triggerId={cardId} />/100
                </span>
              </div>
              <AnimatedProgress value={section.score} className="h-1" delay={1.2 + index * 0.2} triggerId={cardId} />
            </div>
          ))}
        </div>

        {/* Key Points */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">
            {isGood ? "Key Strengths:" : "Key Issues:"}
          </h4>
          <ul className="text-xs space-y-1">
            {(isGood ? analysis.strengths : analysis.improvements).slice(0, 3).map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                {isGood ? (
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ATS Compatibility */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>ATS Compatibility</span>
            <Badge variant={getScoreVariant(analysis.atsCompatibility.score)} className="text-xs">
              <AnimatedCounter from={0} to={analysis.atsCompatibility.score} duration={1.8} delay={2.5} triggerId={cardId} />/100
            </Badge>
          </div>
          <AnimatedProgress value={analysis.atsCompatibility.score} className="h-1" delay={2.7} triggerId={cardId} />
        </div>
      </CardContent>
    </Card>
  )
}

export function ValuePropsSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const beforeCardRef = useRef<HTMLDivElement>(null)
  const afterCardRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Header Animation
    gsap.from(headerRef.current, {
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    })

    // Before Card Animation
    gsap.from(beforeCardRef.current, {
      scrollTrigger: {
        trigger: beforeCardRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      x: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    })

    // After Card Animation
    gsap.from(afterCardRef.current, {
      scrollTrigger: {
        trigger: afterCardRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      x: 50,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out"
    })

    // Arrow and Stats Animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: arrowRef.current,
        start: "top 75%",
        toggleActions: "play none none reverse"
      }
    })

    tl.from(arrowRef.current, {
      scale: 0,
      rotation: 0,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.7)"
    })
    .to(arrowRef.current, {
      rotation: -180,
      duration: 1,
      ease: "power2.inOut"
    }, "-=0.4")

    // Stats stagger
    if (statsRef.current) {
      gsap.from(statsRef.current.children, {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power3.out"
      })
    }

    // Summary Animation
    gsap.from(summaryRef.current, {
      scrollTrigger: {
        trigger: summaryRef.current,
        start: "top 90%",
        toggleActions: "play none none reverse"
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.5,
      ease: "power3.out"
    })

  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            See the AI Difference
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your resume from mediocre to exceptional with our AI-powered analysis and suggestions
          </p>
        </div>

        {/* Before/After Comparison with Modern Side-by-Side Layout */}
        <div className="relative">
          {/* Before/After Cards Container */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16">
            {/* Before Section */}
            <div ref={beforeCardRef} className="relative max-w-md w-full lg:flex-shrink-0">
              {/* Simple "BEFORE" Label */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-muted text-muted-foreground px-4 py-2 rounded-full font-medium text-sm">
                  BEFORE
                </div>
              </div>

              <ScoreDisplay analysis={beforeResumeData} type="before" idPrefix="before" />
            </div>

            {/* Arrow with Animated Impact Stats - Positioned Between Cards */}
            <div ref={statsRef} className="relative flex flex-col lg:flex-col justify-center items-center space-y-6 lg:space-y-8 lg:mt-16">
              {/* Stats Above Arrow */}
              <div className="flex flex-col items-center gap-4 lg:gap-6">
                {/* +163% Stat */}
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                    <AnimatedCounter from={0} to={163} duration={2} prefix="+" suffix="%" triggerId="before-card" />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Score Improvement</div>
                </div>

                {/* 95% Stat */}
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                    <AnimatedCounter from={0} to={95} duration={2.2} suffix="%" triggerId="before-card" />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">ATS Compatible</div>
                </div>
              </div>

              {/* Arrow Image */}
              <div ref={arrowRef}>
                <img
                  src="/arrow.png"
                  alt="Transformation Arrow"
                  width={100}
                  height={100}
                  className="filter dark:invert opacity-70 lg:rotate-90"
                />
              </div>

              {/* Stats Below Arrow */}
              <div className="flex flex-col items-center gap-4 lg:gap-6">
                {/* 3x Stat */}
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                    <AnimatedCounter from={1} to={3} duration={1.8} suffix="x" triggerId="before-card" />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">More Callbacks</div>
                </div>

                {/* Score Range Display */}
                <div className="text-center">
                  <div className="text-base lg:text-lg font-bold text-muted-foreground mb-1">
                    <AnimatedCounter from={35} to={35} duration={0.5} triggerId="before-card" />
                    <span className="mx-2">→</span>
                    <span className="text-foreground">
                      <AnimatedCounter from={35} to={92} duration={2.5} delay={0.5} triggerId="before-card" />
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Score Range</div>
                </div>
              </div>
            </div>

            {/* After Section - Slightly Offset Lower */}
            <div ref={afterCardRef} className="relative max-w-md w-full lg:flex-shrink-0 lg:mt-8">
              {/* Simple "AFTER" Label */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-foreground text-background px-4 py-2 rounded-full font-medium text-sm">
                  AFTER
                </div>
              </div>

              <ScoreDisplay analysis={afterResumeData} type="after" idPrefix="after" />
            </div>
          </div>
        </div>

        {/* Summary Text */}
        <div ref={summaryRef} className="text-center mt-12">
          <p className="text-lg font-medium text-foreground mb-2">
            Ready to transform your resume?
          </p>
          <p className="text-muted-foreground text-sm">
            Join thousands who've already boosted their career prospects with AI-powered optimization
          </p>
        </div>
      </div>
    </section>
  )
}