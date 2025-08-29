"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Palette,
  CreditCard,
  Shield,
  FileText,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const FAQ_CATEGORIES = [
  { id: "general", name: "General", icon: HelpCircle },
  { id: "ai", name: "AI Features", icon: Sparkles },
  { id: "templates", name: "Templates", icon: Palette },
  { id: "billing", name: "Billing", icon: CreditCard },
  { id: "privacy", name: "Privacy", icon: Shield },
  { id: "technical", name: "Technical", icon: FileText },
]

const FAQ_DATA = [
  {
    id: 1,
    category: "general",
    question: "What is ApexResume?",
    answer:
      "ApexResume is an AI-powered platform that helps you create professional resumes quickly and easily. Our advanced AI technology provides personalized suggestions for content, formatting, and design to help you stand out to employers.",
  },
  {
    id: 2,
    category: "general",
    question: "How does the AI resume builder work?",
    answer:
      "Our AI analyzes your input and generates tailored content suggestions based on industry best practices. It can help write compelling summaries, optimize job descriptions, and suggest relevant skills and achievements for your specific field.",
  },
  {
    id: 3,
    category: "general",
    question: "Is ApexResume free to use?",
    answer:
      "We offer both free and premium plans. The free plan includes basic templates and limited AI features. Premium plans unlock advanced templates, unlimited AI assistance, and additional customization options.",
  },
  {
    id: 4,
    category: "ai",
    question: "How accurate are the AI suggestions?",
    answer:
      "Our AI is trained on thousands of successful resumes and industry standards. While suggestions are highly relevant, we recommend reviewing and customizing all AI-generated content to ensure it accurately represents your experience and achievements.",
  },
  {
    id: 5,
    category: "ai",
    question: "Can the AI write my entire resume?",
    answer:
      "The AI can provide substantial assistance with content generation, but it works best when you provide the core information about your experience. Think of it as an intelligent writing assistant that helps you articulate your achievements more effectively.",
  },
  {
    id: 6,
    category: "ai",
    question: "What languages does the AI support?",
    answer:
      "Currently, our AI primarily supports English content generation. We're working on expanding language support and plan to add Spanish, French, and German in future updates.",
  },
  {
    id: 7,
    category: "templates",
    question: "How many resume templates are available?",
    answer:
      "We offer 6 professionally designed templates: Classic, Modern, Creative, Minimal, Executive, and Photo. Each template is optimized for different industries and career levels, with customizable colors and layouts.",
  },
  {
    id: 8,
    category: "templates",
    question: "Can I customize the template colors and fonts?",
    answer:
      "Yes! Premium users can customize colors, fonts, and layout elements. Free users have access to default styling options for each template.",
  },
  {
    id: 9,
    category: "templates",
    question: "Are the templates ATS-friendly?",
    answer:
      "All our templates are designed to be ATS (Applicant Tracking System) compatible, ensuring your resume can be properly parsed by automated screening systems used by many employers.",
  },
  {
    id: 10,
    category: "billing",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and various digital payment methods. All payments are processed securely through encrypted connections.",
  },
  {
    id: 11,
    category: "billing",
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time from your account settings. Your premium features will remain active until the end of your current billing period.",
  },
  {
    id: 12,
    category: "billing",
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee for all premium subscriptions. If you're not satisfied with our service, contact us within 30 days of purchase for a full refund.",
  },
  {
    id: 13,
    category: "privacy",
    question: "How secure is my personal information?",
    answer:
      "We take data security very seriously. All data is encrypted in transit and at rest, stored on secure servers, and we never share your personal information with third parties without your explicit consent.",
  },
  {
    id: 14,
    category: "privacy",
    question: "Can I delete my account and data?",
    answer:
      "Yes, you can permanently delete your account and all associated data at any time from your account settings. This action is irreversible, so please make sure to download any resumes you want to keep first.",
  },
  {
    id: 15,
    category: "technical",
    question: "What file formats can I download my resume in?",
    answer:
      "Currently, we support PDF downloads, which is the most widely accepted format by employers. We're working on adding Word document (.docx) export in future updates.",
  },
]

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/landing">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h1>
              <p className="text-muted-foreground text-sm">Find answers to common questions about ApexResume</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory("all")}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  All Questions
                </Button>
                {FAQ_CATEGORIES.map((category) => {
                  const Icon = category.icon
                  const count = FAQ_DATA.filter((faq) => faq.category === category.id).length
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                      <Badge variant="secondary" className="ml-auto">
                        {count}
                      </Badge>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No questions found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or browse different categories.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFAQs.map((faq) => {
                  const isExpanded = expandedItems.includes(faq.id)
                  const category = FAQ_CATEGORIES.find((cat) => cat.id === faq.category)

                  return (
                    <Card key={faq.id} className="transition-all duration-200 hover:shadow-md">
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleExpanded(faq.id)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {category && <category.icon className="h-4 w-4 text-muted-foreground" />}
                              <Badge variant="outline" className="text-xs">
                                {category?.name}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-foreground text-left">{faq.question}</h3>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-6 pb-6">
                            <div className="border-t border-border pt-4">
                              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Still Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Can't find the answer you're looking for? Our support team is here to help you get the most out of
                  ApexResume.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    View Documentation
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Email:</strong> support@resumegenerator.com
                  </p>
                  <p>
                    <strong>Response time:</strong> Usually within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
