"use client"

import dynamic from "next/dynamic"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import { EtherealShadow } from "@/components/ui/ethereal-shadow"
import { HeroSection } from "@/components/landing/hero-section"

// Section skeleton
function SectionSkeleton() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="space-y-8">
          <div className="h-10 w-64 bg-muted rounded mx-auto animate-pulse" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Dynamic imports for interactive/animated sections (below the fold)
const ValuePropsSection = dynamic(
  () => import("@/components/landing/value-props-section").then(mod => mod.ValuePropsSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
)
const FeaturesSection = dynamic(
  () => import("@/components/landing/features-section").then(mod => mod.FeaturesSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
)
const TemplatesSection = dynamic(
  () => import("@/components/landing/templates-section").then(mod => mod.TemplatesSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
)
const CommunitySection = dynamic(
  () => import("@/components/landing/community-section").then(mod => mod.CommunitySection),
  { ssr: false, loading: () => <SectionSkeleton /> }
)
const PricingSection = dynamic(
  () => import("@/components/landing/pricing-section").then(mod => mod.PricingSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
)
const CTASection = dynamic(
  () => import("@/components/landing/cta-section").then(mod => mod.CTASection),
  { ssr: false, loading: () => <SectionSkeleton /> }
)

/**
 * Client-side landing page content
 * Hero section is statically imported for immediate LCP
 * Heavier downstream sections are code-split
 */
export function LandingPageContent() {
  return (
    <EtherealShadow
      color="rgba(100, 50, 200, 0.6)"
      animation={{ scale: 50, speed: 30 }}
      noise={{ opacity: 0.3, scale: 2 }}
      className="min-h-screen"
    >
      <HeroSection />
      <ValuePropsSection />
      <FeaturesSection />
      <TemplatesSection />
      <CommunitySection />
      <PricingSection />
      <CTASection />

      <ScrollToTop />
    </EtherealShadow>
  )
}


