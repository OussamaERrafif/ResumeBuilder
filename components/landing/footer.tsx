"use client"

import Link from "next/link"
import { FileText, Github, Twitter, Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useEffect } from "react"

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initAnimation = async () => {
      try {
        const gsapModule = await import("gsap")
        const scrollTriggerModule = await import("gsap/ScrollTrigger")
        const gsap = gsapModule.default
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger
        
        gsap.registerPlugin(ScrollTrigger)
        
        if (columnsRef.current) {
          gsap.from(columnsRef.current.children, {
            scrollTrigger: {
              trigger: columnsRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse"
            },
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out"
          })
        }
      } catch (error) {
        console.warn("Footer animation failed:", error)
      }
    }
    
    initAnimation()
  }, [])

  return (
    <footer ref={containerRef} className="border-t border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div ref={columnsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">ApexResume</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Open-source resume builder helping job seekers create professional resumes.
              Built with transparency and community in mind.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-accent" asChild>
                <a href="https://github.com/OussamaERrafif/ResumeBuilder" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-accent" asChild>
                <a href="https://www.producthunt.com/products/apexresume" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-accent" asChild>
                <a href="https://www.producthunt.com/products/apexresume" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Pricing
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/OussamaERrafif/ResumeBuilder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Open Source
                </a>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/OussamaERrafif/ResumeBuilder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/OussamaERrafif/ResumeBuilder/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Report Issues
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/OussamaERrafif/ResumeBuilder/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Contribute
                </a>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm text-center sm:text-left">
            © {new Date().getFullYear()} ApexResume. Open source project by OussamaERrafif.
          </p>
          <Button variant="ghost" size="sm" className="text-sm" asChild>
            <a href="https://github.com/OussamaERrafif/ResumeBuilder/issues" target="_blank" rel="noopener noreferrer">
              <Mail className="h-4 w-4 mr-2" />
              Get Support on GitHub
            </a>
          </Button>
        </div>
      </div>
    </footer>
  )
}