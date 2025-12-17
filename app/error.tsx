"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, RefreshCcw, Home, AlertTriangle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Error occurred
    if (error) {
       // Check for chunk loading errors
       const isChunkError = error.message?.includes('Loading chunk') || 
                          error.message?.includes('minified React error');
       
       if (isChunkError) {
         // Force a hard reload to get new assets
         window.location.reload();
       }
    }
  }, [error])

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
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Something went wrong!</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                We encountered an unexpected error. Don't worry, your data is safe.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground font-mono">
                Error: {error.message || "An unexpected error occurred"}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <Button onClick={reset} className="w-full shadow-lg shadow-primary/20" size="lg">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Still having issues? <Link href="/faq" className="text-primary hover:underline transition-colors">Contact Support</Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-destructive/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  )
}
