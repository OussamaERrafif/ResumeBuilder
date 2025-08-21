import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "ResumeAI - Professional AI-Powered Resume Builder | Create ATS-Optimized Resumes",
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
    "resume generator",
    "career development",
  ],
  authors: [{ name: "ResumeAI Team" }],
  creator: "ResumeAI",
  publisher: "ResumeAI",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#8B5CF6",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://resumeai.com",
    title: "ResumeAI - Professional AI-Powered Resume Builder",
    description:
      "Build professional, ATS-optimized resumes in minutes with AI assistance. Choose from 7 beautiful templates and land your dream job faster.",
    siteName: "ResumeAI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ResumeAI - Professional Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeAI - Professional AI-Powered Resume Builder",
    description: "Build professional, ATS-optimized resumes in minutes with AI assistance. Free to start.",
    images: ["/og-image.jpg"],
    creator: "@resumeai",
  },
  alternates: {
    canonical: "https://resumeai.com",
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
      <body className={`${inter.className} font-sans`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
