import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/admin/',
        '/profile/',
        '/settings/',
        '/_next/',
        '/setup/',
        '/unauthorized/'
      ],
    },
    sitemap: 'https://apexresume.com/sitemap.xml',
  }
}