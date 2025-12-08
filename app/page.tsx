import { Suspense } from "react"
import { StructuredData } from "@/components/seo/structured-data"
import { generateOrganizationSchema, generateWebApplicationSchema } from "@/lib/structured-data"

// Server-rendered components (static content)
import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"

// Client-side content with dynamic imports
import { LandingPageContent } from "@/components/landing/landing-content"

// Loading skeleton for the main content
function ContentSkeleton() {
  return (
    <div className="min-h-screen">
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
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
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
      <Suspense fallback={<ContentSkeleton />}>
        <LandingPageContent />
      </Suspense>

      {/* Footer - Server rendered */}
      <Footer />
    </div>
  )
}

