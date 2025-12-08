"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { FileText, User, LogOut, Mail, ChevronDown, Home, Sparkles, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { useCredits } from "@/hooks/use-credits"
import { useScrollHide } from "@/hooks/use-scroll-hide"

export function DashboardNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { balance, loading: creditsLoading } = useCredits()
  const { isVisible } = useScrollHide({ threshold: 50 })
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <motion.header 
      className="border-b border-border bg-background/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-50"
      initial={{ y: 0 }}
      animate={{ 
        y: isVisible ? 0 : -100,
        transition: { 
          duration: 0.3, 
          ease: "easeInOut" 
        }
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 overflow-hidden">
                <Image 
                  src="/icon.png" 
                  alt="ApexResume Logo" 
                  width={36} 
                  height={36} 
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">ApexResume</h1>
              </div>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`rounded-lg ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/cover-letters">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`rounded-lg ${isActive('/cover-letters') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Cover Letters
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Credits Display */}
            {!creditsLoading && balance && (
              <Link href="/profile" className="hidden sm:block">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-muted ${balance.current <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-muted/50 text-foreground'}`}>
                  <Sparkles className={`h-4 w-4 ${balance.current <= 5 ? 'text-destructive' : 'text-yellow-500'}`} />
                  <span className="text-sm font-medium">{balance.current}</span>
                  <span className="text-xs text-muted-foreground">credits</span>
                </div>
              </Link>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 sm:gap-3 text-sm text-foreground bg-muted hover:bg-muted/80 rounded-xl px-3 py-2 transition-all duration-200"
              >
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="hidden sm:inline truncate max-w-28 text-sm">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    <div className="py-1">
                      <Link href="/profile" className="block">
                        <button 
                          className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-3"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          Profile & Settings
                        </button>
                      </Link>
                      <div className="border-t border-border my-1"></div>
                      <button 
                        onClick={() => {
                          setShowProfileDropdown(false)
                          handleSignOut()
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-3"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-muted rounded-xl p-0.5">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
