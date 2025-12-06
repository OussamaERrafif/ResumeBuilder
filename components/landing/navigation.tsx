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
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4 sm:pt-6"
      initial={{ y: 0 }}
      animate={{ 
        y: isVisible ? 0 : -100,
        transition: { 
          duration: 0.3, 
          ease: "easeInOut" 
        }
      }}
    >
      <nav className="container mx-auto bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl px-4 sm:px-6 lg:px-8 py-4 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ApexResume</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              href="#features" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent text-sm font-medium"
            >
              Features
            </Link>
            <Link 
              href="#templates" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent text-sm font-medium"
            >
              Templates
            </Link>
            <Link 
              href="#pricing" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent text-sm font-medium"
            >
              Pricing
            </Link>
            <Link 
              href="/faq" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent text-sm font-medium"
            >
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="ghost" className="rounded-lg px-4">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="rounded-lg px-6">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-lg" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 border-t border-border/50 mt-4">
                <div className="flex flex-col space-y-1">
                  <Link 
                    href="#features" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200 px-4 py-3 rounded-lg text-sm font-medium"
                  >
                    Features
                  </Link>
                  <Link 
                    href="#templates" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200 px-4 py-3 rounded-lg text-sm font-medium"
                  >
                    Templates
                  </Link>
                  <Link 
                    href="#pricing" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200 px-4 py-3 rounded-lg text-sm font-medium"
                  >
                    Pricing
                  </Link>
                  <Link 
                    href="/faq" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200 px-4 py-3 rounded-lg text-sm font-medium"
                  >
                    FAQ
                  </Link>
                  
                  <div className="flex flex-col space-y-2 pt-4 mt-2 border-t border-border/50">
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-lg">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full rounded-lg">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.div>
  )
}