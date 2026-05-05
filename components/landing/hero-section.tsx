"use client"

import Link from "next/link"
import { ArrowRight, Github, CheckCircle2, Sparkles, ExternalLink, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GridPattern } from "@/components/shared/grid-pattern"
import { HeroDashboardPreview } from "@/components/landing/hero-dashboard-preview"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">

      {/* Static Grid Layout - Extremely Performant */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]">
        <GridPattern width={40} height={40} className="w-full h-full text-foreground/20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">

          {/* Badge */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-primary fill-primary/20" />
              <span className="text-foreground/80 font-medium tracking-wide text-xs uppercase">v2.0 Now Available</span>
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out delay-100">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground text-balance">
              Building Your <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                Dream Resume
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
              The free, open-source resume builder designed for developers and professionals.
              <span className="text-foreground/80 font-medium"> ATS-friendly, privacy-focused, and 100% free forever.</span>
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out delay-200">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                Start Building Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="https://github.com/OussamaERrafif/ResumeBuilder" target="_blank" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full text-base border-border/60 hover:bg-muted/50 transition-all">
                <Github className="mr-2 h-4 w-4" />
                Star on GitHub
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground/60 animate-in fade-in delay-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500/80" />
              <span>No Sign Up Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500/80" />
              <span>PDF Export</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500/80" />
              <span>Privacy First</span>
            </div>
          </div>
        </div>

        {/* Hero Visual - Dashboard Preview */}
        <div className="mt-16 relative mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-12 duration-1200 ease-out delay-300 perspective-1000">

          {/* Abstract Glow Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 dark:opacity-30" />

          {/* The High-Fidelity Mockup */}
          <HeroDashboardPreview />

        </div>
      </div>
    </section>
  )
}