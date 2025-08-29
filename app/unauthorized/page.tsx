"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Shield, Home, LogIn } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Unauthorized() {
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
            <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Access Denied</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                You don't have permission to access this page.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-amber-600 dark:text-amber-400 mb-2">403</div>
              <p className="text-muted-foreground">
                This page requires special permissions or you need to sign in to continue.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link href="/auth" className="w-full">
                <Button className="w-full" size="lg">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Need an account? <Link href="/auth" className="text-primary hover:underline">Sign up here</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
