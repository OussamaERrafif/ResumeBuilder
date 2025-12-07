"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { FileText, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollHide } from "@/hooks/use-scroll-hide"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isVisible } = useScrollHide({ threshold: 50 })
  const navRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuIconRef = useRef<HTMLDivElement>(null)
  const closeIconRef = useRef<HTMLDivElement>(null)

  // Sticky Header Animation
  useGSAP(() => {
    gsap.to(navRef.current, {
      y: isVisible ? 0 : -100,
      duration: 0.3,
      ease: "power2.inOut"
    })
  }, [isVisible])

  // Mobile Menu Animation
  useGSAP(() => {
    if (isMenuOpen) {
      gsap.fromTo(mobileMenuRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" }
      )
    }
  }, [isMenuOpen])

  // Icon Animation
  useEffect(() => {
    if (isMenuOpen) {
      if (menuIconRef.current) gsap.to(menuIconRef.current, { rotate: 90, opacity: 0, duration: 0.15 })
      if (closeIconRef.current) gsap.fromTo(closeIconRef.current, { rotate: -90, opacity: 0 }, { rotate: 0, opacity: 1, duration: 0.15 })
    } else {
      if (menuIconRef.current) gsap.fromTo(menuIconRef.current, { rotate: 90, opacity: 0 }, { rotate: 0, opacity: 1, duration: 0.15 })
      if (closeIconRef.current) gsap.to(closeIconRef.current, { rotate: -90, opacity: 0, duration: 0.15 })
    }
  }, [isMenuOpen])

  return (
    <div
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4 sm:pt-6"
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
            className="md:hidden rounded-lg relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {/* We render both and animate opacity/rotation */}
              <div ref={menuIconRef} className={`absolute ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
                <Menu className="h-5 w-5" />
              </div>
              <div ref={closeIconRef} className={`absolute ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
                <X className="h-5 w-5" />
              </div>
            </div>
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
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
          </div>
        )}
      </nav>
    </div>
  )
}