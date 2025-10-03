import Link from "next/link"
import { FileText, Github, Twitter, Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">ResumeBuilder</span>
            </div>
            <p className="text-muted-foreground">
              Open-source resume builder helping job seekers create professional resumes. 
              Built with transparency and community in mind.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="https://github.com/OussamaERrafif/ResumeBuilder" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://www.producthunt.com/products/apexresume" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://www.producthunt.com/products/apexresume" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#templates" className="text-muted-foreground hover:text-foreground transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/OussamaERrafif/ResumeBuilder" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Open Source
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/OussamaERrafif/ResumeBuilder" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/OussamaERrafif/ResumeBuilder/issues" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Report Issues
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/OussamaERrafif/ResumeBuilder/blob/main/CONTRIBUTING.md" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contribute
                </a>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-muted-foreground hover:text-foreground transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">© 2024 ResumeBuilder. Open source project by OussamaERrafif.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com/OussamaERrafif/ResumeBuilder/issues" target="_blank" rel="noopener noreferrer">
                <Mail className="h-4 w-4 mr-2" />
                Get Support on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}