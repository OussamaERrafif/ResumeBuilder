"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Home, ArrowLeft, Search } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header with Logo and Theme Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ApexResume</span>
          </div>
          <div className="bg-muted rounded-xl p-0.5">
            <ThemeToggle />
          </div>
        </div>

        <Card className="border-border/50 shadow-2xl shadow-primary/5 rounded-2xl overflow-hidden">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Page Not Found</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                The page you're looking for doesn't exist or has been moved.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">404</div>
              <p className="text-muted-foreground text-sm">
                Don't worry, even the best resumes sometimes get lost in the shuffle.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link href="/dashboard" className="w-full">
                <Button className="w-full shadow-lg shadow-primary/20" size="lg">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Need help? <Link href="/faq" className="text-primary hover:underline transition-colors">Check our FAQ</Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  )
}
