import type React from "react"
import type { Metadata, Viewport } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { PreferencesProvider } from "@/hooks/use-preferences"
import { CreditsProvider } from "@/hooks/use-credits"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { StructuredData } from "@/components/seo/structured-data"
import { generateOrganizationSchema, generateWebApplicationSchema, generateSoftwareApplicationSchema } from "@/lib/structured-data"

// Montserrat font configuration
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-montserrat",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8B5CF6",
  colorScheme: "light dark",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://apexresume.com"),
  title: {
    default: "ApexResume - Professional AI-Powered Resume Builder | Create ATS-Optimized Resumes",
    template: "%s | ApexResume - Professional Resume Builder"
  },
  description:
    "Build professional, ATS-optimized resumes in minutes with AI assistance. Choose from 7 beautiful templates, get AI-powered content suggestions, and land your dream job faster. Free to start.",
  keywords: [
    "resume builder",
    "AI resume",
    "professional resume",
    "ATS optimized",
    "CV builder",
    "job application",
    "career tools",
    "resume templates",
    "AI writing assistant",
    "job search",
    "resume maker",
    "professional CV",
    "apexresume",
    "career development",
    "free resume builder",
    "modern resume templates",
    "job interview preparation",
    "career advancement",
    "resume optimization",
    "applicant tracking system",
    "professional development",
    "employment tools",
    "career services"
  ],
  authors: [{ name: "ApexResume Team", url: "https://apexresume.com" }],
  creator: "ApexResume",
  publisher: "ApexResume",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apexresume.com",
    siteName: "ApexResume",
    title: "ApexResume - Professional AI-Powered Resume Builder",
    description:
      "Build professional, ATS-optimized resumes in minutes with AI assistance. Choose from 7 beautiful templates, get AI-powered content suggestions, and land your dream job faster.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ApexResume - Professional Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ApexResume - Professional AI-Powered Resume Builder",
    description:
      "Build professional, ATS-optimized resumes in minutes with AI assistance. Free to start.",
    images: ["/og-image.jpg"],
    creator: "@apexresume",
  },
  alternates: {
    canonical: "https://apexresume.com",
  },
  category: "technology",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icon.png",
        color: "#8B5CF6",
      },
    ],
  },
  other: {
    "msapplication-TileColor": "#8B5CF6",
    "msapplication-TileImage": "/icon.png",
    "theme-color": "#8B5CF6"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={montserrat.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <meta name="msapplication-TileImage" content="/icon.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//api.producthunt.com" />
        <link rel="dns-prefetch" href="//github.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ApexResume" />
      </head>
      <body className={`${montserrat.className} font-sans antialiased`} suppressHydrationWarning>
        <StructuredData 
          data={[
            generateOrganizationSchema(),
            generateWebApplicationSchema(),
            generateSoftwareApplicationSchema()
          ]} 
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <PreferencesProvider>
              <CreditsProvider>
                <div className="animate-fade-in">
                  {children}
                </div>
                <Toaster />
              </CreditsProvider>
            </PreferencesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}