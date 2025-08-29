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
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Logo and Theme Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ApexResume</span>
          </div>
          <ThemeToggle />
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Something went wrong!</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                We encountered an unexpected error. Don't worry, your data is safe.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
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
              <Button onClick={reset} className="w-full" size="lg">
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
                Still having issues? <Link href="/faq" className="text-primary hover:underline">Contact Support</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
