"use client"

import Link from "next/link"
import { CheckCircle, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PRICING_PLANS } from "@/constants/landing"
import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function PricingSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const plansRef = useRef<HTMLDivElement>(null)

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

    // Plans Stagger Animation
    if (plansRef.current) {
      gsap.from(plansRef.current.children, {
        scrollTrigger: {
          trigger: plansRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse"
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      })
    }
  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="pricing" className="py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center mb-12 lg:mb-16">
          <Badge variant="secondary" className="mb-4 bg-accent border-border">
            <Sparkles className="h-3 w-3 mr-1.5 text-primary" />
            <span className="text-foreground">Simple Pricing</span>
          </Badge>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 lg:mb-6">
            Simple, Honest Pricing
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            No hidden fees, no locked features behind paywalls. Start free, upgrade if you need more. Cancel anytime.
          </p>
        </div>

        <div ref={plansRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan, index) => (
            <div key={index} className="relative">
              <Card className={`h-full relative border-border transition-all duration-300 hover:shadow-lg ${plan.popular
                  ? "ring-2 ring-primary shadow-xl shadow-primary/10 hover:shadow-primary/20"
                  : "hover:border-primary/30"
                }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-6 pt-8">
                  <CardTitle className="text-xl lg:text-2xl mb-3 text-foreground">{plan.name}</CardTitle>
                  <div className="mb-3">
                    <span className="text-4xl lg:text-5xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/dashboard" className="block">
                    <Button
                      className={`w-full ${plan.popular
                          ? "bg-primary hover:bg-primary/90 shadow-md"
                          : ""
                        }`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}