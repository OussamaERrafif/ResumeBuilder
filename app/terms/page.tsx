import Link from "next/link"
import { ArrowLeft, FileText, Scale, Shield, CreditCard, AlertTriangle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb } from "@/components/seo/breadcrumb"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Terms of Service - ApexResume Legal Information',
  description: 'Read the Terms of Service for ApexResume resume builder. Understand your rights, our policies, payment terms, and legal obligations when using our platform.',
  keywords: [
    'ApexResume terms of service',
    'resume builder terms',
    'legal terms',
    'user agreement',
    'service conditions',
    'privacy policy',
    'billing terms',
    'subscription terms'
  ],
  openGraph: {
    title: 'Terms of Service - ApexResume',
    description: 'Terms of Service and legal information for ApexResume resume builder platform.',
    url: 'https://apexresume.com/terms',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service - ApexResume',
    description: 'Terms of Service and legal information for ApexResume resume builder.',
  },
  alternates: {
    canonical: 'https://apexresume.com/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfService() {
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
              <Scale className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground text-sm">Legal terms and conditions for using our service</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={[{ name: 'Terms of Service', href: '/terms' }]} 
          className="mb-8"
        />
        
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Welcome to ApexResume. These Terms of Service ("Terms") govern your use of our AI-powered resume
                building platform. By accessing or using our service, you agree to be bound by these Terms.
              </p>
              <p className="text-muted-foreground">
                <strong>Last updated:</strong> January 2024
              </p>
              <p className="text-muted-foreground">
                If you do not agree to these Terms, please do not use our service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                ApexResume provides an AI-powered platform that helps users create professional resumes through:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Multiple professional resume templates</li>
                <li>AI-assisted content generation and suggestions</li>
                <li>Resume editing and customization tools</li>
                <li>PDF export and download functionality</li>
                <li>Cloud storage for your resume data</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                User Accounts and Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Creation</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must be at least 16 years old to create an account</li>
                  <li>One person may not maintain multiple accounts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Account Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Keep your login credentials confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>You are liable for all activities under your account</li>
                  <li>Maintain current and accurate account information</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Permitted Uses</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Create resumes for legitimate job applications</li>
                  <li>Use AI suggestions to improve your content</li>
                  <li>Download and share your own resumes</li>
                  <li>Provide feedback to improve our service</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Prohibited Uses</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Upload false, misleading, or fraudulent information</li>
                  <li>Attempt to reverse engineer or copy our AI technology</li>
                  <li>Use the service for illegal or harmful purposes</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Interfere with or disrupt our service</li>
                  <li>Create resumes for other people without permission</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Intellectual Property Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Our Rights</h4>
                <p className="text-muted-foreground">
                  ApexResume owns all rights to our platform, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Software, algorithms, and AI technology</li>
                  <li>Resume templates and design elements</li>
                  <li>Trademarks, logos, and branding</li>
                  <li>Website content and documentation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Your Rights</h4>
                <p className="text-muted-foreground">You retain ownership of the content you create, including:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Personal information and resume content</li>
                  <li>Photos and documents you upload</li>
                  <li>Final resume documents you generate</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment and Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Subscription Plans</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Free plan with basic features and limited templates</li>
                  <li>Premium plans with advanced features and unlimited access</li>
                  <li>Pricing is displayed clearly before purchase</li>
                  <li>All prices are in USD unless otherwise stated</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Billing and Refunds</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Subscriptions are billed in advance</li>
                  <li>Auto-renewal can be cancelled anytime</li>
                  <li>Refunds available within 30 days of purchase</li>
                  <li>No refunds for partial subscription periods</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Service Availability and Modifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We strive to provide reliable service but cannot guarantee 100% uptime. We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Modify or discontinue features with reasonable notice</li>
                <li>Perform maintenance that may temporarily affect service</li>
                <li>Update our AI algorithms and templates</li>
                <li>Change pricing with 30 days advance notice</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your privacy is important to us. Our data practices are governed by our Privacy Policy, which includes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>How we collect and use your information</li>
                <li>Data security measures we implement</li>
                <li>Your rights regarding your personal data</li>
                <li>How to contact us about privacy concerns</li>
              </ul>
              <p className="text-muted-foreground">
                Please review our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                for complete details.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Disclaimers and Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Disclaimers</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>AI suggestions are automated and may not always be accurate</li>
                  <li>We do not guarantee job placement or interview success</li>
                  <li>Users are responsible for verifying resume accuracy</li>
                  <li>Service is provided "as is" without warranties</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                <p className="text-muted-foreground">
                  Our liability is limited to the amount you paid for the service in the 12 months preceding any claim.
                  We are not liable for indirect, incidental, or consequential damages.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Account Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Termination by You</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You may delete your account at any time</li>
                  <li>Cancellation takes effect at the end of your billing period</li>
                  <li>You can export your data before termination</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Termination by Us</h4>
                <p className="text-muted-foreground">
                  We may suspend or terminate your account for violations of these Terms, illegal activity, or other
                  reasons with appropriate notice when possible.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Governing Law and Disputes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                These Terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved through:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Good faith negotiation as the first step</li>
                <li>Binding arbitration if negotiation fails</li>
                <li>Courts in [Your Jurisdiction] for non-arbitrable matters</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update these Terms from time to time. We will notify users of material changes via email or
                platform notification at least 30 days before they take effect. Continued use of the service after
                changes constitutes acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong>Email:</strong> legal@resumegenerator.com
                </p>
                <p>
                  <strong>Address:</strong> 123 Legal Street, Terms City, TC 12345
                </p>
                <p>
                  <strong>Phone:</strong> +1 (555) 123-TERMS
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
