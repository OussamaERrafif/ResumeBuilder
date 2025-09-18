import Link from "next/link"
import { ArrowLeft, Shield, Eye, Lock, Users, FileText, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb } from "@/components/seo/breadcrumb"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Privacy Policy - ApexResume Data Protection & Security',
  description: 'Learn how ApexResume protects your personal data and privacy. Read our comprehensive privacy policy covering data collection, usage, storage, and your rights.',
  keywords: [
    'ApexResume privacy policy',
    'data protection',
    'privacy rights',
    'data security',
    'GDPR compliance',
    'personal data',
    'cookie policy',
    'data collection',
    'resume builder privacy'
  ],
  openGraph: {
    title: 'Privacy Policy - ApexResume',
    description: 'Privacy policy and data protection information for ApexResume resume builder.',
    url: 'https://apexresume.com/privacy',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy - ApexResume',
    description: 'Privacy policy and data protection for ApexResume resume builder.',
  },
  alternates: {
    canonical: 'https://apexresume.com/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground text-sm">How we protect and handle your data</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={[{ name: 'Privacy Policy', href: '/privacy' }]} 
          className="mb-8"
        />
        
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                At ApexResume, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our AI-powered resume building service.
              </p>
              <p className="text-muted-foreground">
                <strong>Last updated:</strong> January 2024
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Name, email address, and contact information</li>
                  <li>Professional information (work experience, education, skills)</li>
                  <li>Profile photos (if uploaded)</li>
                  <li>Resume content and templates used</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Usage Information</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>How you interact with our service</li>
                  <li>Features used and time spent on the platform</li>
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>To provide and maintain our resume building service</li>
                <li>To personalize your experience and improve our AI recommendations</li>
                <li>To communicate with you about your account and service updates</li>
                <li>To analyze usage patterns and improve our platform</li>
                <li>To detect and prevent fraud or security issues</li>
                <li>To comply with legal obligations and enforce our terms</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure cloud storage with regular backups</li>
                <li>Multi-factor authentication for account access</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Limited access to personal data on a need-to-know basis</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We do not sell, trade, or rent your personal information to third parties. We may share your information
                only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements or court orders</li>
                <li>To protect our rights, property, or safety</li>
                <li>
                  With trusted service providers who assist in our operations (under strict confidentiality agreements)
                </li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <strong>Access:</strong> Request a copy of your personal data
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct inaccurate information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal data
                </li>
                <li>
                  <strong>Portability:</strong> Export your data in a machine-readable format
                </li>
                <li>
                  <strong>Opt-out:</strong> Unsubscribe from marketing communications
                </li>
                <li>
                  <strong>Restriction:</strong> Limit how we process your data
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Essential cookies for basic functionality</li>
                <li>Analytics cookies to understand usage patterns</li>
                <li>Preference cookies to remember your settings</li>
                <li>Marketing cookies for personalized content (with your consent)</li>
              </ul>
              <p className="text-muted-foreground">
                You can control cookie preferences through your browser settings or our cookie consent banner.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">We retain your personal information only as long as necessary:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Account data: Until you delete your account</li>
                <li>Resume data: Until you delete specific resumes</li>
                <li>Usage analytics: Up to 2 years for service improvement</li>
                <li>Legal compliance: As required by applicable laws</li>
              </ul>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. We ensure
                adequate protection through:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Standard contractual clauses approved by regulatory authorities</li>
                <li>Adequacy decisions for countries with equivalent protection</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our service is not intended for children under 16 years of age. We do not knowingly collect personal
                information from children under 16. If you believe we have collected information from a child under 16,
                please contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Changes to This Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
                new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this
                Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong>Email:</strong> privacy@resumegenerator.com
                </p>
                <p>
                  <strong>Address:</strong> 123 Privacy Street, Data City, DC 12345
                </p>
                <p>
                  <strong>Phone:</strong> +1 (555) 123-PRIVACY
                </p>
              </div>
              <p className="text-muted-foreground">We will respond to your inquiry within 30 days.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
