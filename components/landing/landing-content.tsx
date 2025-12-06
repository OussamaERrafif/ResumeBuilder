"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Skeleton for hero section
function HeroSkeleton() {
  return (
    <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 min-h-[90vh] flex items-center">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="h-6 w-48 bg-muted rounded-full mx-auto animate-pulse" />
          <div className="space-y-4">
            <div className="h-12 w-3/4 bg-muted rounded mx-auto animate-pulse" />
            <div className="h-12 w-1/2 bg-muted rounded mx-auto animate-pulse" />
          </div>
          <div className="h-14 w-60 bg-muted rounded-xl mx-auto animate-pulse" />
        </div>
      </div>
    </section>
  )
}

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

// Dynamic imports for interactive/animated sections (client-side only)
const EtherealShadow = dynamic(
  () => import("@/components/ui/ethereal-shadow").then(mod => mod.EtherealShadow),
  { ssr: false }
)
const HeroSection = dynamic(
  () => import("@/components/landing/hero-section").then(mod => mod.HeroSection),
  { ssr: false, loading: () => <HeroSkeleton /> }
)
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
 * Client-side landing page content with dynamic imports
 * This allows heavy animation libraries to be code-split
 */
export function LandingPageContent() {
  return (
    <Suspense fallback={<HeroSkeleton />}>
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
      </EtherealShadow>
    </Suspense>
  )
}
