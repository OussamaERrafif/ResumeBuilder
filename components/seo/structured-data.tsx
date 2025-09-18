/**
 * @fileoverview Structured Data component for injecting JSON-LD scripts
 * Handles structured data injection for improved SEO
 */

import Script from 'next/script'

interface StructuredDataProps {
  data: object | object[]
}

export function StructuredData({ data }: StructuredDataProps) {
  const structuredDataArray = Array.isArray(data) ? data : [data]
  
  return (
    <>
      {structuredDataArray.map((schema, index) => (
        <Script
          key={index}
          id={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
    </>
  )
}