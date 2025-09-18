import type React from "react"
import type { Metadata, Viewport } from "next"
// import { Inter } from "next/font/google" // Temporarily disabled due to network issues
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { PreferencesProvider } from "@/hooks/use-preferences"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { StructuredData } from "@/components/seo/structured-data"
import { generateOrganizationSchema, generateWebApplicationSchema, generateSoftwareApplicationSchema } from "@/lib/structured-data"

// Temporary fallback for Inter font
// const inter = Inter({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800"],
//   display: "swap",
//   variable: "--font-inter",
// })

// Fallback font configuration
const fontFallback = {
  variable: "--font-inter",
  className: "font-sans"
}

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
    "resume creator",
    "online resume builder",
    "modern resume templates",
    "cover letter generator"
  ],
  authors: [{ name: "ApexResume Team" }],
  creator: "ApexResume",
  publisher: "ApexResume",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apexresume.com",
    title: "ApexResume - Professional AI-Powered Resume Builder",
    description:
      "Build professional, ATS-optimized resumes in minutes with AI assistance. Choose from 7 beautiful templates and land your dream job faster.",
    siteName: "ApexResume",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ApexResume - Professional Resume Builder",
        type: "image/jpeg"
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ApexResume - Professional AI-Powered Resume Builder",
    description: "Build professional, ATS-optimized resumes in minutes with AI assistance. Free to start.",
    images: ["/og-image.jpg"],
    creator: "@apexresume",
    site: "@apexresume"
  },
  alternates: {
    canonical: "https://apexresume.com",
  },
  category: "productivity",
  generator: "Next.js",
  applicationName: "ApexResume",
  referrer: "origin-when-cross-origin",
  appLinks: {
    web: {
      url: "https://apexresume.com",
      should_fallback: true
    }
  },
  verification: {
    google: "google-site-verification-code", // Replace with actual verification code
    yandex: "yandex-verification-code", // Replace with actual verification code  
    yahoo: "yahoo-verification-code" // Replace with actual verification code
  },
  other: {
    "msapplication-TileColor": "#8B5CF6",
    "theme-color": "#8B5CF6"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={fontFallback.variable}>
      <head>
        <link rel="icon" href="/icon.ico" />
        <link rel="shortcut icon" href="/icon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//api.producthunt.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${fontFallback.className} font-sans`} suppressHydrationWarning>
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
              {children}
              <Toaster />
            </PreferencesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
