"use client"

import { FileText, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header with Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ApexResume</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-2xl shadow-primary/5 rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Loading Dashboard...</h2>
                <p className="text-muted-foreground text-sm">
                  Getting your resumes ready
                </p>
              </div>
              
              {/* Loading animation dots */}
              <div className="flex justify-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
              </div>
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
