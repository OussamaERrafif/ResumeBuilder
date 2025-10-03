"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Palette, Award, ChevronRight, ChevronLeft, ChevronRight as ArrowRight } from "lucide-react"
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
      spacing: 24,
    },
    breakpoints: {
      "(min-width: 768px)": {
        slides: { perView: 2.2, spacing: 32 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 36 },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
  })

  return (
    <section id="templates" className="py-20 bg-muted/30 relative">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            <Palette className="h-3 w-3 mr-1" />
            Professional Templates
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Choose Your Perfect Template
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select from our collection of professionally designed, ATS-optimized templates. 
            Each template is crafted to help you stand out while ensuring compatibility with applicant tracking systems.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div ref={sliderRef} className="keen-slider">
            {RESUME_TEMPLATES.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="keen-slider__slide flex justify-center"
              >
                <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden max-w-sm w-full">
                  <div className="aspect-[3/4] bg-white p-6 relative overflow-hidden">
                    <TemplatePreview template={template} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      {template.isPremium && (
                        <Badge variant="secondary">
                          <Award className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                    <div className="flex items-center justify-between">
                      {/* Colors */}
                      <div className="flex space-x-1">
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: template.colors.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: template.colors.accent }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: template.colors.secondary }}
                        />
                      </div>
                      {/* Button */}
                      <Link href="/dashboard">
                        <Button
                          size="sm"
                          variant="outline"
                          className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                        >
                          Use Template
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Arrows */}
          {instanceRef.current && (
            <>
              <button
                onClick={() => instanceRef.current?.prev()}
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:bg-primary hover:text-white transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => instanceRef.current?.next()}
                className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:bg-primary hover:text-white transition"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dots */}
          {instanceRef.current && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: instanceRef.current.track.details.slides.length }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => instanceRef.current?.moveToIdx(i)}
                  className={`w-3 h-3 rounded-full transition ${
                    currentSlide === i ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
