"use client"

import { StructuredData } from "@/components/seo/structured-data"
import { generateOrganizationSchema, generateWebApplicationSchema } from "@/lib/structured-data"
import { EtherealShadow } from "@/components/ui/ethereal-shadow"

// Landing page sections
import { Navigation } from "@/components/landing/navigation"
import { HeroSection } from "@/components/landing/hero-section"
import { ValuePropsSection } from "@/components/landing/value-props-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { TemplatesSection } from "@/components/landing/templates-section"
import { CommunitySection } from "@/components/landing/community-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <EtherealShadow
      color="rgba(100, 50, 200, 0.6)"
      animation={{ scale: 50, speed: 30 }}
      noise={{ opacity: 0.3, scale: 2 }}
      className="min-h-screen"
    >
      {/* Structured Data for Landing Page */}
      <StructuredData 
        data={[
          generateOrganizationSchema(),
          generateWebApplicationSchema()
        ]} 
      />
      
      <Navigation />
      <HeroSection />
      <ValuePropsSection />
      <FeaturesSection />
      <TemplatesSection />
      <CommunitySection />
      <PricingSection />
      <CTASection />
      <Footer />
    </EtherealShadow>
  )
}

