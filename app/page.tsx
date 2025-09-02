"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  FileText,
  Download,
  Zap,
  Shield,
  Users,
  Star,
  CheckCircle,
  Play,
  Palette,
  Brain,
  Clock,
  Award,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Github,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { RESUME_TEMPLATES } from "./types/templates"

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Content",
    description:
      "Our advanced AI helps you write compelling summaries, job descriptions, and achievements that stand out to employers.",
  },
  {
    icon: Palette,
    title: "Professional Templates",
    description:
      "Choose from 6 beautifully designed templates, each optimized for different industries and career levels.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Create a professional resume in minutes, not hours. Our streamlined process gets you job-ready quickly.",
  },
  {
    icon: Shield,
    title: "ATS-Optimized",
    description:
      "All templates are designed to pass Applicant Tracking Systems, ensuring your resume reaches human recruiters.",
  },
  {
    icon: Clock,
    title: "Real-time Preview",
    description: "See your changes instantly with our live preview feature. What you see is exactly what you get.",
  },
  {
    icon: Download,
    title: "Multiple Formats",
    description: "Download your resume as a high-quality PDF, ready to submit to any employer or job board.",
  },
]

const COMMUNITY_FEATURES = [
  {
    icon: Github,
    title: "Open Source",
    description: "Built in the open with full transparency. Contribute to the project and help make it better for everyone.",
    link: "https://github.com/OussamaERrafif/ResumeBuilder",
  },
  {
    icon: Award,
    title: "Product Hunt Featured",
    description: "Discover why our resume builder is gaining traction in the tech community and beyond.",
    link: "#",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join our growing community of developers and job seekers sharing tips, templates, and success stories.",
    link: "#",
  },
]

const VALUE_PROPS = [
  { 
    icon: "🎯", 
    title: "Free Forever Plan", 
    description: "Start building professional resumes at no cost. No credit card required, no hidden fees." 
  },
  { 
    icon: "⚡", 
    title: "7-Day Pro Trial", 
    description: "Experience all premium features risk-free. Cancel anytime, no questions asked." 
  },
  { 
    icon: "🌟", 
    title: "Open Source", 
    description: "Transparent development, community-driven improvements, and complete code visibility on GitHub." 
  },
  { 
    icon: "🚀", 
    title: "ATS-Optimized", 
    description: "All templates designed to pass applicant tracking systems used by 95% of Fortune 500 companies." 
  },
]

const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Free forever. Start building professional resumes without any cost or commitment.",
    features: ["1 resume template", "Basic AI suggestions", "PDF download", "Email support"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "month",
    description: "Best for serious job seekers who want all features",
    features: [
      "All 6 premium templates",
      "Unlimited AI assistance",
      "Custom colors & fonts",
      "Priority support",
      "Cover letter builder",
      "LinkedIn optimization",
    ],
    cta: "Start 7-Day Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$29.99",
    period: "month",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Brand customization",
      "Analytics dashboard",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedTemplate((prev) => (prev + 1) % RESUME_TEMPLATES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ResumeBuilder</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#templates" className="text-muted-foreground hover:text-foreground transition-colors">
                Templates
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-muted rounded-lg p-1">
                <ThemeToggle />
              </div>
              <Link href="/dashboard">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Get Started</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
                className="md:hidden mt-4 pb-4 border-t border-border pt-4"
              >
                <div className="flex flex-col space-y-4">
                  <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </Link>
                  <Link href="#templates" className="text-muted-foreground hover:text-foreground transition-colors">
                    Templates
                  </Link>
                  <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                  <div className="bg-muted rounded-lg p-1 w-fit">
                    <ThemeToggle />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full bg-transparent">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Open Source Resume Builder
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Build Professional Resumes <span className="text-primary">That Get You Hired</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Open-source resume builder with AI assistance. Start free, upgrade when you need more. 
                  No fake promises, just a tool that works.
                </p>
              </div>

              {/* Product Hunt Badge */}
              <div className="flex items-center justify-start">
                <a href="https://www.producthunt.com/products/apexresume?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-apexresume" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  <img 
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1010727&theme=light&t=1756832115863" 
                    alt="apexresume - AI ATS friendly Resume generator and cover letter generator | Product Hunt" 
                    className="w-[250px] h-[54px]" 
                    width="250" 
                    height="54" 
                  />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Start Building Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                {/* <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button> */}
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Github className="h-3 w-3" />
                    <span className="text-xs">Open Source</span>
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span className="text-xs">Free Trial</span>
                  </Badge>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTemplate}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TemplatePreview template={RESUME_TEMPLATES[selectedTemplate]} />
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-center mt-4 space-x-2">
                  {RESUME_TEMPLATES.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTemplate(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedTemplate ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUE_PROPS.map((prop, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl mb-3">{prop.icon}</div>
                <div className="text-lg font-semibold text-foreground mb-2">{prop.title}</div>
                <div className="text-sm text-muted-foreground">{prop.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Everything You Need, Nothing You Don't
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              No bloated features or marketing gimmicks. Just clean, professional tools that help you 
              create resumes that actually work in today's job market.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              <Palette className="h-3 w-3 mr-1" />
              Professional Templates
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">Choose Your Perfect Template</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Select from our collection of professionally designed, ATS-optimized templates. 
              Each template is crafted to help you stand out while ensuring compatibility with applicant tracking systems.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {RESUME_TEMPLATES.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="aspect-[3/4] bg-white p-6 relative overflow-hidden">
                    <TemplatePreview template={template} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      {template.isPremium && (
                        <Badge variant="secondary">
                          <Award className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: template.colors.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: template.colors.accent }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: template.colors.secondary }}
                        />
                      </div>
                      <Link href="/dashboard">
                        <Button
                          size="sm"
                          variant="outline"
                          className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                        >
                          Use Template
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              <Github className="h-3 w-3 mr-1" />
              Open Source & Community
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">Built by Developers, for Everyone</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our commitment to transparency, community collaboration, and free access makes us different from other resume builders.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {COMMUNITY_FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-xl mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    {feature.link !== "#" && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={feature.link} target="_blank" rel="noopener noreferrer" className="bg-transparent">
                          Learn More
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">🎉 Try Everything Free</h3>
                <p className="text-muted-foreground mb-6">
                  Start with our forever-free plan or experience all premium features with a 7-day trial. 
                  No credit card required, cancel anytime.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/dashboard">
                    <Button size="lg" className="min-w-[160px]">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" asChild className="min-w-[160px] bg-transparent">
                    <a href="https://github.com/OussamaERrafif/ResumeBuilder" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      View on GitHub
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              <CheckCircle className="h-3 w-3 mr-1" />
              Simple Pricing
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">Simple, Honest Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              No hidden fees, no locked features behind paywalls. Start free, upgrade if you need more. Cancel anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full relative ${plan.popular ? "ring-2 ring-primary shadow-xl" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/dashboard">
                      <Button
                        className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">Ready to Build Your Resume?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start building today with our free plan. No credit card required, no hidden fees. 
              Upgrade to Pro when you need advanced features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Building Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  )
}

// Template Preview Component
function TemplatePreview({ template }: { template: any }) {
  return (
    <div
      className="w-full h-full bg-white rounded-lg overflow-hidden"
      style={{ backgroundColor: template.colors.background }}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="text-center">
          <div className="h-3 bg-gray-800 rounded mb-1" style={{ backgroundColor: template.colors.primary }} />
          <div
            className="h-2 bg-gray-600 rounded w-3/4 mx-auto"
            style={{ backgroundColor: template.colors.secondary }}
          />
        </div>

        {/* Contact Info */}
        <div className="flex justify-center space-x-2">
          <div className="h-1 bg-gray-400 rounded w-8" />
          <div className="h-1 bg-gray-400 rounded w-8" />
          <div className="h-1 bg-gray-400 rounded w-8" />
        </div>

        {/* Sections */}
        <div className="space-y-2">
          <div className="h-1.5 bg-gray-700 rounded w-1/3" style={{ backgroundColor: template.colors.primary }} />
          <div className="space-y-1">
            <div className="h-1 bg-gray-300 rounded" />
            <div className="h-1 bg-gray-300 rounded w-5/6" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-1.5 bg-gray-700 rounded w-1/4" style={{ backgroundColor: template.colors.primary }} />
          <div className="space-y-1">
            <div className="h-1 bg-gray-300 rounded w-4/5" />
            <div className="h-1 bg-gray-300 rounded w-3/4" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-1.5 bg-gray-700 rounded w-1/3" style={{ backgroundColor: template.colors.primary }} />
          <div className="space-y-1">
            <div className="h-1 bg-gray-300 rounded" />
            <div className="h-1 bg-gray-300 rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  )
}
