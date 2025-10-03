import {
  Brain,
  Palette,
  Zap,
  Shield,
  Clock,
  Download,
  Github,
  Award,
  Users,
} from "lucide-react"

export const FEATURES = [
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

export const COMMUNITY_FEATURES = [
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

export const VALUE_PROPS = [
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

export const PRICING_PLANS = [
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