"use client"

import { FileText, Loader2, HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ApexResume</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                <HelpCircle className="h-8 w-8 text-primary" />
                <Loader2 className="h-10 w-10 text-primary/50 animate-spin absolute" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Loading FAQ...</h2>
                <p className="text-muted-foreground">
                  Getting answers to your questions
                </p>
              </div>
              
              {/* Loading animation dots */}
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
