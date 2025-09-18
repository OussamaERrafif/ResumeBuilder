/**
 * @fileoverview Structured data (JSON-LD) generators for SEO
 * Provides schema.org structured data for better search engine understanding
 */

export interface StructuredDataProps {
  title?: string
  description?: string
  url?: string
  image?: string
  datePublished?: string
  dateModified?: string
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ApexResume",
    "alternateName": "ResumeBuilder",
    "url": "https://apexresume.com",
    "logo": "https://apexresume.com/logo.png",
    "description": "Professional AI-powered resume builder helping job seekers create ATS-optimized resumes and cover letters.",
    "foundingDate": "2024",
    "sameAs": [
      "https://github.com/OussamaERrafif/ResumeBuilder",
      "https://www.producthunt.com/products/apexresume"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://github.com/OussamaERrafif/ResumeBuilder/issues"
    }
  }
}

/**
 * Generate WebApplication structured data
 */
export function generateWebApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ApexResume - Professional Resume Builder",
    "alternateName": "ApexResume",
    "url": "https://apexresume.com",
    "description": "Build professional, ATS-optimized resumes in minutes with AI assistance. Choose from 7 beautiful templates, get AI-powered content suggestions, and land your dream job faster.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "category": "Free"
    },
    "featureList": [
      "AI-powered resume builder",
      "ATS-optimized templates", 
      "Professional CV templates",
      "Cover letter generator",
      "PDF export",
      "Real-time editing",
      "Multiple resume formats"
    ],
    "screenshot": "https://apexresume.com/og-image.jpg",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    }
  }
}

/**
 * Generate FAQ Page structured data
 */
export function generateFAQPageSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

/**
 * Generate Article structured data for blog posts/pages
 */
export function generateArticleSchema(props: StructuredDataProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": props.title,
    "description": props.description,
    "url": props.url,
    "image": props.image || "https://apexresume.com/og-image.jpg",
    "datePublished": props.datePublished || new Date().toISOString(),
    "dateModified": props.dateModified || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "ApexResume Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ApexResume",
      "logo": {
        "@type": "ImageObject",
        "url": "https://apexresume.com/logo.png"
      }
    }
  }
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  }
}

/**
 * Generate SoftwareApplication structured data for the resume builder tool
 */
export function generateSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ApexResume Resume Builder",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "url": "https://apexresume.com",
    "description": "Professional AI-powered resume builder with ATS optimization and multiple templates",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "featureList": [
      "Resume templates",
      "AI content suggestions", 
      "ATS optimization",
      "PDF export",
      "Cover letter templates"
    ]
  }
}