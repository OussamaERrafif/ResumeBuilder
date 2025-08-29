"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Wrench, Clock, RefreshCcw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function Maintenance() {
  const estimatedTime = "30 minutes"
  
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
              <Wrench className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Under Maintenance</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                We're currently performing some updates to improve your experience.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Estimated completion time: <strong>{estimatedTime}</strong>
                </span>
              </div>
              
              <p className="text-muted-foreground">
                Thank you for your patience. Your resumes and data are safe and will be available once maintenance is complete.
              </p>
            </div>
            
            {/* Progress bar animation */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full animate-pulse"
                style={{ width: '70%' }}
              ></div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.location.reload()} className="w-full" size="lg">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Check Status
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Follow us for updates: 
                  <Link href="#" className="text-primary hover:underline ml-1">@ApexResume</Link>
                </p>
              </div>
            </div>
            
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Need immediate help? <Link href="mailto:support@apexresume.com" className="text-primary hover:underline">Contact Support</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
