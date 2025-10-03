"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollHide } from "@/hooks/use-scroll-hide"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isVisible } = useScrollHide({ threshold: 50 })

  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 z-50 p-6"
      initial={{ y: 0 }}
      animate={{ 
        y: isVisible ? 0 : -100,
        transition: { 
          duration: 0.3, 
          ease: "easeInOut" 
        }
      }}
    >
      <nav className="container mx-auto bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl px-8 py-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ResumeBuilder</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-all duration-300 px-4 py-2.5 rounded-full hover:bg-white/10 hover:backdrop-blur-sm">
              Features
            </Link>
            <Link href="#templates" className="text-muted-foreground hover:text-foreground transition-all duration-300 px-4 py-2.5 rounded-full hover:bg-white/10 hover:backdrop-blur-sm">
              Templates
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-all duration-300 px-4 py-2.5 rounded-full hover:bg-white/10 hover:backdrop-blur-sm">
              Pricing
            </Link>
            <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-all duration-300 px-4 py-2.5 rounded-full hover:bg-white/10 hover:backdrop-blur-sm">
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-full px-6 py-2 border-white/20 hover:bg-white/10 transition-all duration-300">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="rounded-full px-6 py-2 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden rounded-full hover:bg-white/10 transition-all duration-300" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-6 pb-4 border-t border-white/20 pt-4 rounded-2xl bg-white/5 backdrop-blur-sm"
            >
              <div className="flex flex-col space-y-4">
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-all duration-300 px-4 py-3 rounded-full hover:bg-white/10 hover:backdrop-blur-sm block">
                  Features
                </Link>
                <Link href="#templates" className="text-muted-foreground hover:text-foreground transition-all duration-300 px-4 py-3 rounded-full hover:bg-white/10 hover:backdrop-blur-sm block">
                  Templates
                </Link>
                <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-all duration-300 px-4 py-3 rounded-full hover:bg-white/10 hover:backdrop-blur-sm block">
                  Pricing
                </Link>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-all duration-300 px-4 py-3 rounded-full hover:bg-white/10 hover:backdrop-blur-sm block">
                  FAQ
                </Link>
                <div className="flex flex-col space-y-3 pt-4">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full rounded-full py-3 border-white/20 hover:bg-white/10 transition-all duration-300">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button className="w-full rounded-full py-3 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.div>
  )
}