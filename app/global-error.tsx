"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, RefreshCcw, AlertCircle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Global error occurred
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header with Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">ApexResume</span>
            </div>
          </div>

          <Card className="border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Critical Error</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                  A critical error occurred that prevented the application from loading properly.
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                  Error: {error.message || "A critical system error occurred"}
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={reset} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  size="lg"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Reload Application
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline" 
                  className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                  size="lg"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>
              
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  If this problem persists, please contact our support team.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
