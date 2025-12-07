"use client"

import { useRef } from "react"
import { Sparkles, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FEATURES } from "@/constants/landing"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const socialProofRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Header Animation
    gsap.fromTo(headerRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%", // Trigger earlier
          toggleActions: "play none none reverse"
        }
      }
    )

    // Cards Stagger Animation
    const cards = cardsRef.current?.children
    if (cards) {
      gsap.fromTo(cards,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%", // Trigger earlier
            toggleActions: "play none none reverse"
          }
        }
      )
    }

    // Social Proof Animation
    gsap.fromTo(socialProofRef.current,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: socialProofRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      }
    )

    // Pulse animation for the green dot
    gsap.to(".live-dot", {
      scale: 1.2,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    })

  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="features" className="py-24 lg:py-32 relative overflow-hidden bg-muted/30">
      {/* Subtle grid pattern - works in both light and dark mode */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="max-w-3xl mb-16 lg:mb-20">
          <Badge variant="secondary" className="mb-6 bg-accent border-border">
            <Sparkles className="h-3 w-3 mr-1.5 text-primary" />
            <span className="text-foreground">Powerful Features</span>
          </Badge>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight text-balance">
            Everything you need to land your dream job.
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Professional tools designed for modern job seekers. No bloat, no gimmicks—just features that work.
          </p>
        </div>

        {/* Features Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

              <div className="relative p-6 lg:p-8 h-full flex flex-col">
                {/* Icon */}
                <div className="mb-5 relative transform transition-transform duration-200 group-hover:scale-105">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/15 transition-all duration-300">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>

                  {/* Featured badge for first item */}
                  {index === 0 && (
                    <Badge
                      variant="default"
                      className="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 bg-primary text-primary-foreground"
                    >
                      Popular
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>

                {/* Hover indicator */}
                <div className="mt-5 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="mr-1">Learn more</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div ref={socialProofRef} className="flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full border border-border bg-card shadow-sm">
            <div className="live-dot w-2.5 h-2.5 rounded-full bg-green-500" />
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground tabular-nums">100+</span>
              <span className="text-sm text-muted-foreground">resumes created and counting</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
