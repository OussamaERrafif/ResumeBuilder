import { StructuredData } from "@/components/seo/structured-data"
import { generateOrganizationSchema, generateWebApplicationSchema } from "@/lib/structured-data"

// Server-rendered components (static content)
import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"

// Client-side content with dynamic imports
import { LandingPageContent } from "@/components/landing/landing-content"

export default function LandingPage() {
  return (
    <>
      {/* Structured Data for SEO - Server rendered */}
      <StructuredData 
        data={[
          generateOrganizationSchema(),
          generateWebApplicationSchema()
        ]} 
      />
      
      {/* Navigation - Server rendered */}
      <Navigation />
      
      {/* Client-side interactive content with lazy loading */}
      <LandingPageContent />
      
      {/* Footer - Server rendered */}
      <Footer />
    </>
  )
}

