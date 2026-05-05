import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - ApexResume Help Center',
  description: 'Find answers to common questions about ApexResume, our AI-powered resume builder, templates, features, billing, and technical support.',
  keywords: [
    'ApexResume FAQ',
    'resume builder help',
    'AI resume questions',
    'resume templates FAQ',
    'ATS resume help',
    'resume builder support',
    'CV builder questions',
    'how to build resume',
    'resume writing help'
  ],
  openGraph: {
    title: 'FAQ - ApexResume Help Center',
    description: 'Get answers to frequently asked questions about ApexResume resume builder, AI features, templates, and more.',
    url: 'https://apexresume.com/faq',
    type: 'website',
    images: [
      {
        url: '/og-image-faq.jpg',
        width: 1200,
        height: 630,
        alt: 'ApexResume FAQ - Get Help with Resume Building',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ - ApexResume Help Center',
    description: 'Get answers to frequently asked questions about ApexResume resume builder.',
    images: ['/og-image-faq.jpg'],
  },
  alternates: {
    canonical: 'https://apexresume.com/faq',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}