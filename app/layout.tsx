import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { PreferencesProvider } from "@/hooks/use-preferences"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8B5CF6",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://apexresume.com"),
  title: "ApexResume - Professional AI-Powered Resume Builder | Create ATS-Optimized Resumes",
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
  ],
  authors: [{ name: "ApexResume Team" }],
  creator: "ApexResume",
  publisher: "ApexResume",
  robots: "index, follow",
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
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ApexResume - Professional AI-Powered Resume Builder",
    description: "Build professional, ATS-optimized resumes in minutes with AI assistance. Free to start.",
    images: ["/og-image.jpg"],
    creator: "@apexresume",
  },
  alternates: {
    canonical: "https://apexresume.com",
  },
  category: "productivity",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/icon.ico" />
        <link rel="shortcut icon" href="/icon.ico" />
      </head>
      <body className={`${inter.className} font-sans`} suppressHydrationWarning>
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
