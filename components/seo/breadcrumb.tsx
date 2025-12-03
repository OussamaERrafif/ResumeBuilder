/**
 * @fileoverview Breadcrumb navigation component with SEO structured data
 */

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { StructuredData } from './structured-data'
import { generateBreadcrumbSchema } from '@/lib/structured-data'

export interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const fullItems = [
    { name: 'Home', url: 'https://apexresume.com' },
    ...items.map(item => ({ name: item.name, url: `https://apexresume.com${item.href}` }))
  ]

  return (
    <>
      <StructuredData data={generateBreadcrumbSchema(fullItems)} />
      <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}>
        <Link 
          href="/" 
          className="flex items-center hover:text-foreground transition-colors"
          aria-label="Go to homepage"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only">Home</span>
        </Link>
        
        {items.map((item, index) => (
          <div key={item.href} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4" />
            {index === items.length - 1 ? (
              <span 
                className="font-medium text-foreground" 
                aria-current="page"
              >
                {item.name}
              </span>
            ) : (
              <Link 
                href={item.href} 
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}