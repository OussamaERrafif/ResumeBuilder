"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, Github, Star, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  const [isHovered, setIsHovered] = useState(false)
  const [currentTagIndex, setCurrentTagIndex] = useState(0)
  
  const tags = ["✨ Free Forever", "🤖 AI Powered", "📄 ATS Friendly"]
  
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentTagIndex((prev) => (prev + 1) % tags.length)
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [isHovered, tags.length])

  return (
    <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background" />
      
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <Badge variant="secondary" className="text-sm px-4 py-1.5 bg-accent border-border">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
              <span className="text-foreground">Open Source Resume Builder</span>
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-foreground">
              Build Professional
              <br />
              <span className="text-primary">Resumes</span>
              <br />
              <span className="text-muted-foreground">That Get You Hired</span>
            </h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Create ATS-friendly resumes with AI assistance. Open-source, free to start, 
              and designed to help you land your dream job.
            </motion.p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center pt-4"
          >
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="text-base sm:text-lg px-8 py-6 h-auto relative overflow-hidden min-w-[240px] rounded-xl shadow-lg shadow-primary/25"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                  setIsHovered(false)
                  setCurrentTagIndex(0)
                }}
              >
                <AnimatePresence mode="wait">
                  {!isHovered ? (
                    <motion.div
                      key={`tag-${currentTagIndex}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center justify-center"
                    >
                      {tags[currentTagIndex]}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="cta"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center"
                    >
                      Start Building Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </Link>
          </motion.div>

          {/* Social proof badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            {/* Product Hunt Badge */}
            <motion.a 
              href="https://www.producthunt.com/products/apexresume" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3 bg-card border border-border rounded-xl px-5 py-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-muted-foreground">Featured on</div>
                  <div className="text-base font-bold text-orange-500">
                    Product Hunt
                  </div>
                </div>
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </div>
            </motion.a>

            {/* GitHub Badge */}
            <motion.a 
              href="https://github.com/OussamaERrafif/ResumeBuilder" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3 bg-card border border-border rounded-xl px-5 py-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
                <div className="w-9 h-9 bg-foreground rounded-lg flex items-center justify-center">
                  <Github className="h-4 w-4 text-background" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-muted-foreground">Open Source on</div>
                  <div className="text-base font-bold text-foreground">
                    GitHub
                  </div>
                </div>
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </div>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}