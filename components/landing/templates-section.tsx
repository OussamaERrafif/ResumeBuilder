"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Palette, Award, ChevronRight, ChevronLeft, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RESUME_TEMPLATES } from "@/app/types/templates"
import { TemplatePreview } from "./template-preview"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import { useState } from "react"

export function TemplatesSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "free-snap",
    slides: {
      perView: 1.1,
      spacing: 16,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 1.5, spacing: 20 },
      },
      "(min-width: 768px)": {
        slides: { perView: 2.2, spacing: 24 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 28 },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
  })

  return (
    <section id="templates" className="py-24 lg:py-32 bg-muted/30 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <Badge variant="secondary" className="mb-4 bg-accent border-border">
            <Palette className="h-3 w-3 mr-1.5 text-primary" />
            <span className="text-foreground">Professional Templates</span>
          </Badge>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 lg:mb-6">
            Choose Your Perfect Template
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Select from our collection of professionally designed, ATS-optimized templates. 
            Each template is crafted to help you stand out.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative px-4 sm:px-12">
          <div ref={sliderRef} className="keen-slider">
            {RESUME_TEMPLATES.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="keen-slider__slide flex justify-center"
              >
                <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden max-w-sm w-full border-border hover:border-primary/30 rounded-2xl">
                  {/* Preview Container with Paper Effect */}
                  <div className="aspect-[3/4] bg-gradient-to-b from-muted/50 to-muted/30 p-4 sm:p-5 relative overflow-hidden">
                    {/* Paper Shadow */}
                    <div className="absolute inset-4 sm:inset-5 bg-black/5 dark:bg-black/20 rounded-lg blur-lg transform translate-y-2 pointer-events-none"></div>
                    
                    {/* Paper Container */}
                    <div className="relative h-full w-full rounded-lg overflow-hidden bg-white shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                      <TemplatePreview template={template} />
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-4 sm:inset-5 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
                      <Link href="/dashboard">
                        <Button size="sm" className="shadow-lg rounded-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 sm:p-5 bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{template.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-1 mt-0.5">{template.description}</p>
                      </div>
                      {template.isPremium && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 shrink-0 ml-2">
                          <Award className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      {/* Colors */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground mr-1">Colors:</span>
                        <div
                          className="w-4 h-4 rounded-full ring-1 ring-black/10 shadow-sm"
                          style={{ backgroundColor: template.colors.primary }}
                          title="Primary color"
                        />
                        <div
                          className="w-4 h-4 rounded-full ring-1 ring-black/10 shadow-sm"
                          style={{ backgroundColor: template.colors.accent }}
                          title="Accent color"
                        />
                        <div
                          className="w-4 h-4 rounded-full ring-1 ring-black/10 shadow-sm"
                          style={{ backgroundColor: template.colors.secondary }}
                          title="Secondary color"
                        />
                      </div>
                      {/* Category Badge */}
                      <Badge variant="outline" className="text-xs capitalize rounded-md">
                        {template.category || "classic"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {instanceRef.current && (
            <>
              <button
                onClick={() => instanceRef.current?.prev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-card border border-border shadow-lg rounded-full flex items-center justify-center hover:bg-accent hover:border-primary/30 transition-all duration-200 z-10"
                aria-label="Previous template"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={() => instanceRef.current?.next()}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-card border border-border shadow-lg rounded-full flex items-center justify-center hover:bg-accent hover:border-primary/30 transition-all duration-200 z-10"
                aria-label="Next template"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </>
          )}

          {/* Dots */}
          {instanceRef.current && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: instanceRef.current.track.details.slides.length }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => instanceRef.current?.moveToIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    currentSlide === i 
                      ? "bg-primary w-6" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to template ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
