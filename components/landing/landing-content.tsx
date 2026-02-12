"use client"

import dynamic from "next/dynamic"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import { HeroSection } from "@/components/landing/hero-section"

// Section skeleton
function SectionSkeleton() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="space-y-8">
          <div className="h-10 w-64 bg-muted/50 rounded mx-auto animate-pulse" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted/30 rounded-xl animate-pulse" />
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

export function LandingPageContent() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">

      {/* Global Background Gradient - Static CSS, highly performant */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
      </div>

      <main className="relative z-10">
        <HeroSection />
        <ValuePropsSection />
        <FeaturesSection />
        <TemplatesSection />
        <CommunitySection />
        <PricingSection />
        <CTASection />
      </main>

      <ScrollToTop />
    </div>
  )
}
