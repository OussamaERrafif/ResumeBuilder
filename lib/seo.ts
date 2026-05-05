/**
 * @fileoverview SEO utility functions and helpers
 * Common SEO functions used across the application
 */

import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  noIndex?: boolean
}

/**
 * Generate comprehensive metadata for pages
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  noIndex = false
}: SEOProps): Metadata {
  const defaultTitle = 'ApexResume - Professional AI-Powered Resume Builder'
  const defaultDescription = 'Build professional, ATS-optimized resumes in minutes with AI assistance. Choose from 7 beautiful templates and land your dream job faster.'
  
  const fullTitle = title ? `${title} | ApexResume` : defaultTitle
  const fullDescription = description || defaultDescription
  const fullUrl = url ? `https://apexresume.com${url}` : 'https://apexresume.com'
  const imageUrl = image.startsWith('http') ? image : `https://apexresume.com${image}`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [...keywords, 'resume builder', 'AI resume', 'professional resume', 'ATS optimized', 'CV builder'],
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      siteName: 'ApexResume',
      locale: 'en_US',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [imageUrl],
      creator: '@apexresume',
      site: '@apexresume',
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Generate meta tags for social sharing
 */
export function generateSocialTags(title: string, description: string, image?: string) {
  return {
    'og:title': title,
    'og:description': description,
    'og:image': image || '/og-image.jpg',
    'og:type': 'website',
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image || '/og-image.jpg',
  }
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string) {
  return `https://apexresume.com${path}`
}

/**
 * Validate and clean meta description
 */
export function cleanMetaDescription(description: string, maxLength = 160): string {
  if (description.length <= maxLength) return description
  
  // Find last complete sentence within limit
  const truncated = description.substring(0, maxLength)
  const lastSentence = truncated.lastIndexOf('.')
  
  if (lastSentence > maxLength * 0.8) {
    return truncated.substring(0, lastSentence + 1)
  }
  
  // Fallback to word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  return truncated.substring(0, lastSpace) + '...'
}

/**
 * Generate breadcrumb items for a path
 */
export function generateBreadcrumbs(path: string) {
  const segments = path.split('/').filter(Boolean)
  const breadcrumbs = [{ name: 'Home', href: '/' }]
  
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
    breadcrumbs.push({ name, href: currentPath })
  }
  
  return breadcrumbs
}