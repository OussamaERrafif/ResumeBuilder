"use client"

import Link from "next/link"
import { Palette, Award, Eye, ChevronRight, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RESUME_TEMPLATES } from "@/app/types/templates"
import { TemplatePreview } from "./template-preview"
import { useRef } from "react"

export function TemplatesSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section id="templates" className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4 bg-accent/50 border-accent backdrop-blur-sm">
              <Palette className="h-3 w-3 mr-1.5 text-primary" />
              <span className="text-foreground">Professional Templates</span>
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
              Designed to get you <span className="text-primary">hired.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Choose from our collection of ATS-optimized templates. Clean, professional, and free to use.
            </p>
          </div>

          <div className="flex gap-2 hidden md:flex">
            <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-full h-12 w-12 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card">
              <ArrowRight className="h-5 w-5 rotate-180" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-full h-12 w-12 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scroll Snap Carousel - Native CSS, zero lag */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {RESUME_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="snap-center shrink-0 w-[85vw] sm:w-[350px] md:w-[380px]"
            >
              <div className="group relative h-full">
                <Card className="h-full border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 rounded-2xl">

                  {/* Preview Area */}
                  <div className="aspect-[3/4] relative bg-muted/30 p-6 overflow-hidden">
                    {/* Template Card Shadow/Depth */}
                    <div className="absolute inset-x-8 top-8 bottom-0 bg-background shadow-2xl rounded-t-lg transform transition-transform duration-500 group-hover:-translate-y-2 border border-border/10 ring-1 ring-black/5">
                      <TemplatePreview template={template} />
                    </div>

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <Link href="/dashboard">
                        <Button size="lg" className="rounded-full px-8 shadow-xl shadow-primary/20 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          <Eye className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{template.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{template.description}</p>
                      </div>
                      {template.isPremium && (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0 ml-2">
                          <Award className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted/50 text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                        {template.category || "General"}
                      </span>
                      <div className="flex items-center gap-1 ml-auto">
                        {[template.colors.primary, template.colors.secondary, template.colors.accent].filter(Boolean).map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-full shadow-sm ring-1 ring-border" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="md:hidden flex justify-center mt-4">
          <span className="text-xs text-muted-foreground/60 flex items-center gap-2 animate-pulse">
            Swipe to explore <ChevronRight className="h-3 w-3" />
          </span>
        </div>

      </div>
    </section>
  )
}
