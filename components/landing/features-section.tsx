"use client"

import { useRef } from "react"
import { Sparkles, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FEATURES } from "@/constants/landing"

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background">

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16 lg:mb-20 text-center mx-auto">
          <Badge variant="secondary" className="mb-4 bg-accent/50 border-accent backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-1.5 text-primary" />
            <span className="text-foreground">Powerful Features</span>
          </Badge>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Everything you need. <br className="hidden sm:block" />
            <span className="text-muted-foreground">Nothing you don't.</span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Professional tools designed for modern job seekers. No bloat, no gimmicks—just features that work.
          </p>
        </div>

        {/* Features Grid - Clean CSS Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card border border-border/50 rounded-2xl hover:border-primary/20 hover:bg-muted/30 transition-all duration-300 overflow-hidden"
            >
              <div className="p-8 h-full flex flex-col">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-sm text-foreground font-medium">100+ Resumes Created This Week</span>
          </div>
        </div>
      </div>
    </section>
  )
}
