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
    <section className="py-20 lg:py-32 relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Simple Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
      
      <div className="container mx-auto px-6 relative">
        <div className="text-center space-y-12 max-w-5xl mx-auto">
          {/* Simple Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Badge variant="secondary" className="text-base px-6 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Open Source Resume Builder
            </Badge>
          </motion.div>

          {/* Clean Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-foreground"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Build Professional
              <br />
              <span className="text-primary">Resumes</span>
              <br />
              That Get You Hired
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Create ATS-friendly resumes with AI assistance. Open-source, free to start, 
              and designed to help you land your dream job.
            </motion.p>
          </motion.div>

          {/* Interactive Call to Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex justify-center"
          >
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 hover:scale-105 transition-all duration-300 relative overflow-hidden min-w-[220px] h-[56px]"
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
                      transition={{ duration: 0.3 }}
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
                      transition={{ duration: 0.3 }}
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

          {/* Product Hunt and GitHub Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            {/* Product Hunt Badge */}
            <motion.a 
              href="https://www.producthunt.com/products/apexresume" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-3 bg-muted/50 border rounded-full px-6 py-3 hover:bg-muted transition-all duration-300">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-foreground">Featured on</div>
                  <div className="text-lg font-bold text-orange-500">
                    Product Hunt
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-muted-foreground">#</span>
                </div>
              </div>
            </motion.a>

            {/* GitHub Badge */}
            <motion.a 
              href="https://github.com/OussamaERrafif/ResumeBuilder" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-3 bg-muted/50 border rounded-full px-6 py-3 hover:bg-muted transition-all duration-300">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <Github className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-foreground">Open Source on</div>
                  <div className="text-lg font-bold text-foreground">
                    GitHub
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-muted-foreground"></span>
                </div>
              </div>
            </motion.a>
          </motion.div>


        </div>
      </div>
    </section>
  )
}