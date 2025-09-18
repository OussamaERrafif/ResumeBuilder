/**
 * @fileoverview Analytics and tracking scripts for SEO monitoring
 * Placeholder for Google Analytics, Search Console, and other tracking
 */

import Script from 'next/script'

interface AnalyticsProps {
  gtmId?: string
  gtagId?: string
}

export function Analytics({ gtmId, gtagId }: AnalyticsProps = {}) {
  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics */}
      {gtagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
            strategy="afterInteractive"
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gtagId}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `,
            }}
          />
        </>
      )}

      {/* Placeholder for additional tracking scripts */}
      <Script
        id="seo-tracking"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Custom SEO tracking and monitoring
            console.log('ApexResume SEO tracking initialized');
            
            // Track page views for internal analytics
            if (typeof window !== 'undefined') {
              window.addEventListener('load', function() {
                // Custom page load tracking
                const performanceData = {
                  loadTime: performance.now(),
                  userAgent: navigator.userAgent,
                  referrer: document.referrer,
                  timestamp: new Date().toISOString()
                };
                
                // You can send this data to your analytics service
                console.log('Page performance:', performanceData);
              });
            }
          `,
        }}
      />
    </>
  )
}