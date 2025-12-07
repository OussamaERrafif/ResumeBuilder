"use client"

import Link from "next/link"
import { Github, ArrowRight, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { COMMUNITY_FEATURES } from "@/constants/landing"
import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function CommunitySection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

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

    // Features Stagger Animation
    if (featuresRef.current) {
      gsap.from(featuresRef.current.children, {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse"
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out"
      })
    }

    // CTA Card Animation
    gsap.from(ctaRef.current, {
      scrollTrigger: {
        trigger: ctaRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: "power3.out"
    })

  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center mb-12 lg:mb-16">
          <Badge variant="secondary" className="mb-4 bg-accent border-border">
            <Github className="h-3 w-3 mr-1.5 text-primary" />
            <span className="text-foreground">Open Source & Community</span>
          </Badge>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 lg:mb-6">
            Built by Developers, for Everyone
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Our commitment to transparency, community collaboration, and free access makes us different from other resume builders.
          </p>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {COMMUNITY_FEATURES.map((feature, index) => (
            <div key={index}>
              <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group border-border">
                <CardContent className="p-6 lg:p-8 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 mx-auto group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    {feature.description}
                  </p>
                  {feature.link !== "#" && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={feature.link} target="_blank" rel="noopener noreferrer">
                        Learn More
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Featured CTA Card */}
        <div ref={ctaRef} className="text-center mt-12 lg:mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 via-accent/30 to-primary/5 border-primary/20 overflow-hidden">
            <CardContent className="p-8 lg:p-10">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">🎉 Try Everything Free</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Start with our forever-free plan or experience all premium features with a 7-day trial.
                No credit card required, cancel anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="min-w-[180px] shadow-lg shadow-primary/25">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" asChild className="min-w-[180px]">
                  <a href="https://github.com/OussamaERrafif/ResumeBuilder" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}