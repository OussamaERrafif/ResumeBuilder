"use client"

import { Zap, ShieldCheck, Download, Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ValuePropsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">

        <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Why Choose <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">ResumeBuilder?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We've stripped away the complexity. Get powerful features without the bloat, designed for speed and effectiveness.
          </p>
        </div>

        {/* Bento Grid Layout - Pure CSS, highly performant */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">

          {/* Card 1: AI Power (Large) */}
          <div className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-6 md:p-10 hover:bg-card/80 transition-colors duration-300 select-none">
            <div className="flex flex-col md:flex-row gap-8 h-full">
              <div className="flex-1 space-y-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">AI-Powered Assistant</h3>
                  <p className="text-muted-foreground text-lg">
                    Real-time suggestions to improve your grammar, tone, and impact.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-semibold border border-primary/10">Grammar Fix</span>
                  <span className="px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-semibold border border-primary/10">Stronger Verbs</span>
                </div>
              </div>

              {/* Mock UI: AI Chat / Suggestion Box */}
              <div className="flex-1 relative pt-4 md:pt-0 min-h-[200px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-l from-background/80 to-transparent z-0 hidden md:block" />

                {/* The Chat Bubble UI */}
                <div className="relative z-10 w-full max-w-sm bg-background border border-border/40 rounded-xl shadow-xl overflow-hidden transform transition-transform group-hover:scale-[1.02] duration-500">
                  <div className="bg-muted/30 p-3 border-b border-border/40 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="ml-auto text-[10px] text-muted-foreground font-mono">ai-helper.ts</span>
                  </div>
                  <div className="p-4 space-y-3 text-xs">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="bg-primary/5 p-3 rounded-tr-xl rounded-b-xl text-foreground/80">
                        <p>I noticed you used "Managed" three times. Try these stronger alternatives:</p>
                        <div className="mt-2 flex gap-1.5 flex-wrap">
                          <span className="bg-background border border-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] cursor-default hover:bg-primary/10">Orchestrated</span>
                          <span className="bg-background border border-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] cursor-default hover:bg-primary/10">Spearheaded</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <div className="w-3 h-3 bg-muted-foreground/30 rounded-full" />
                      </div>
                      <div className="bg-muted p-2 rounded-tl-xl rounded-b-xl text-foreground/80">
                        <p>Update it!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Privacy (Tall) */}
          <div className="md:row-span-2 relative group overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-8 hover:bg-card/80 transition-colors duration-300 flex flex-col justify-between select-none">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold">Privacy First</h3>
              <p className="text-muted-foreground">
                Zero data tracking. Your resume data lives in your browser's local storage.
              </p>
            </div>

            {/* Mock UI: Encrypted Storage Visual */}
            <div className="mt-8 relative h-48 w-full bg-background/40 rounded-xl overflow-hidden border border-border/30 flex items-center justify-center">
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-green-500/5 to-transparent" />

              <div className="relative z-10 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-background border-2 border-green-500/20 flex items-center justify-center relative shadow-lg shadow-green-500/10">
                  <ShieldCheck className="w-8 h-8 text-green-500" />
                  <div className="absolute -right-1 -top-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center text-[10px] text-white font-bold">✓</div>
                </div>
                <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-1.5 text-[10px] font-mono text-muted-foreground shadow-sm">
                  localStorage.resume_data <span className="text-green-500">● Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Speed */}
          <div className="relative group overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-8 hover:bg-card/80 transition-colors duration-300 select-none">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-3 max-w-[60%]">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold">Instant</h3>
                <p className="text-sm text-muted-foreground">No server lag. Real-time rendering.</p>
              </div>

              {/* Mock UI: Speed Score */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-muted/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-yellow-500 drop-shadow-lg" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
                <span className="absolute text-xl font-bold font-mono text-foreground">100</span>
              </div>
            </div>
          </div>

          {/* Card 4: Export */}
          <div className="relative group overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-8 hover:bg-card/80 transition-colors duration-300 select-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-500" />
                </div>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-none font-mono text-[10px]">.pdf</Badge>
              </div>

              <h3 className="text-xl font-bold">One-Click PDF</h3>

              {/* Mock UI: Download Button */}
              <div className="mt-2 w-full bg-background border border-border/40 rounded-lg p-3 flex items-center gap-3 shadow-sm group-hover:border-blue-500/30 transition-colors">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-md shrink-0">
                  <div className="text-[10px] font-bold text-red-600 dark:text-red-400">PDF</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-1.5 w-3/4 bg-muted rounded-full mb-1.5" />
                  <div className="h-1 w-1/2 bg-muted/60 rounded-full" />
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}