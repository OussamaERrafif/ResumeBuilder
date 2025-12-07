"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, Github, Star, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

export function HeroSection() {
  const [isHovered, setIsHovered] = useState(false)
  const [currentTagIndex, setCurrentTagIndex] = useState(0)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const socialRef = useRef<HTMLDivElement>(null)
  const blob1Ref = useRef<HTMLDivElement>(null)
  const blob2Ref = useRef<HTMLDivElement>(null)
  
  const tags = ["✨ Free Forever", "🤖 AI Powered", "📄 ATS Friendly"]
  
  // Tag rotation logic
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentTagIndex((prev) => (prev + 1) % tags.length)
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [isHovered, tags.length])

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // Initial animations
    tl.from(badgeRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8
    })
    .from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.1
    }, "-=0.4")
    .from(descRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8
    }, "-=0.6")
    .from(ctaRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8
    }, "-=0.6")
    .from(socialRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8
    }, "-=0.6")

    // Blob animations (floating)
    gsap.to(blob1Ref.current, {
      x: "random(-50, 50)",
      y: "random(-50, 50)",
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    })
    
    gsap.to(blob2Ref.current, {
      x: "random(-50, 50)",
      y: "random(-50, 50)",
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    })

    // Mouse movement parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const x = (clientX / window.innerWidth - 0.5) * 20
      const y = (clientY / window.innerHeight - 0.5) * 20

      gsap.to(titleRef.current, {
        x: x,
        y: y,
        duration: 1,
        ease: "power2.out"
      })
      
      gsap.to(blob1Ref.current, {
        x: -x * 2,
        y: -y * 2,
        duration: 2,
        ease: "power2.out"
      })
      
      gsap.to(blob2Ref.current, {
        x: x * 2,
        y: y * 2,
        duration: 2,
        ease: "power2.out"
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="pt-32 pb-20 lg:pt-40 lg:pb-32 relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background" />
      
      {/* Decorative blobs */}
      <div ref={blob1Ref} className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div ref={blob2Ref} className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <div ref={badgeRef} className="flex justify-center">
            <Badge variant="secondary" className="text-sm px-4 py-1.5 bg-accent border-border">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
              <span className="text-foreground">Open Source Resume Builder</span>
            </Badge>
          </div>

          {/* Main heading */}
          <div ref={titleRef} className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-foreground">
              Build Professional
              <br />
              <span className="text-primary">Resumes</span>
              <br />
              <span className="text-muted-foreground">That Get You Hired</span>
            </h1>
            
            <p ref={descRef} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create ATS-friendly resumes with AI assistance. Open-source, free to start, 
              and designed to help you land your dream job.
            </p>
          </div>

          {/* CTA Button */}
          <div ref={ctaRef} className="flex justify-center pt-4">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="text-base sm:text-lg px-8 py-6 h-auto relative overflow-hidden min-w-[240px] rounded-xl shadow-lg shadow-primary/25 group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                  setIsHovered(false)
                  setCurrentTagIndex(0)
                }}
              >
                <div className="relative z-10 flex items-center justify-center">
                  {!isHovered ? (
                    <span key={`tag-${currentTagIndex}`} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {tags[currentTagIndex]}
                    </span>
                  ) : (
                    <span className="flex items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                      Start Building Now
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </div>
              </Button>
            </Link>
          </div>

          {/* Social proof badges */}
          <div ref={socialRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {/* Product Hunt Badge */}
            <a 
              href="https://www.producthunt.com/products/apexresume" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="flex items-center space-x-3 bg-card border border-border rounded-xl px-5 py-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 hover:scale-105">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-muted-foreground">Featured on</div>
                  <div className="text-base font-bold text-orange-500">
                    Product Hunt
                  </div>
                </div>
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </div>
            </a>

            {/* GitHub Badge */}
            <a 
              href="https://github.com/OussamaERrafif/ResumeBuilder" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="flex items-center space-x-3 bg-card border border-border rounded-xl px-5 py-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 hover:scale-105">
                <div className="w-9 h-9 bg-foreground rounded-lg flex items-center justify-center">
                  <Github className="h-4 w-4 text-background" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-muted-foreground">Open Source on</div>
                  <div className="text-base font-bold text-foreground">
                    GitHub
                  </div>
                </div>
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}