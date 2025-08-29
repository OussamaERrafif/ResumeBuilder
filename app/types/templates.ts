export interface Template {
  id: string
  name: string
  description: string
  category: "classic" | "modern" | "creative" | "minimal" | "executive" | "tech" | "photo"
  preview: string
  requiresPhoto: boolean
  isPremium?: boolean
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
    muted: string
  }
  features: string[]
}

export const RESUME_TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "Professional Classic",
    description: "Timeless design perfect for traditional corporate environments",
    category: "classic",
    requiresPhoto: false,
    preview: "Classic professional template preview",
    colors: {
      primary: "#1f2937",
      secondary: "#374151",
      accent: "#6b7280",
      text: "#111827",
      background: "#f9fafb",
      muted: "#9ca3af",
    },
    features: ["Traditional layout", "Corporate-friendly", "ATS-optimized", "Clean typography"],
  },
  {
    id: "modern",
    name: "Contemporary Professional",
    description: "Modern design with vibrant accents for progressive companies",
    category: "modern",
    requiresPhoto: false,
    preview: "Modern professional template preview",
    colors: {
      primary: "#3b82f6",
      secondary: "#1e40af",
      accent: "#60a5fa",
      text: "#1f2937",
      background: "#ffffff",
      muted: "#6b7280",
    },
    features: ["Contemporary styling", "Color accents", "Professional appeal", "Versatile layout"],
  },
  {
    id: "creative",
    name: "Creative Professional",
    description: "Bold design for creative fields with striking visual elements",
    category: "creative",
    requiresPhoto: false,
    isPremium: true,
    preview: "Creative template preview",
    colors: {
      primary: "#7c3aed",
      secondary: "#5b21b6",
      accent: "#a78bfa",
      text: "#1f2937",
      background: "#ffffff",
      muted: "#6b7280",
    },
    features: ["Creative design", "Bold colors", "Visual hierarchy", "Industry-appropriate"],
  },
  {
    id: "minimal",
    name: "Minimalist ATS-Friendly",
    description: "Ultra-clean black and white design optimized for ATS systems",
    category: "minimal",
    requiresPhoto: false,
    preview: "Minimal template preview",
    colors: {
      primary: "#000000",
      secondary: "#333333",
      accent: "#666666",
      text: "#000000",
      background: "#ffffff",
      muted: "#888888",
    },
    features: ["ATS-optimized", "Black & white only", "Maximum readability", "Clean typography"],
  },
  {
    id: "executive",
    name: "Executive Professional",
    description: "Premium design for senior-level positions and leadership roles",
    category: "executive",
    requiresPhoto: false,
    isPremium: true,
    preview: "Executive template preview",
    colors: {
      primary: "#059669",
      secondary: "#047857",
      accent: "#34d399",
      text: "#1f2937",
      background: "#ffffff",
      muted: "#6b7280",
    },
    features: ["Executive styling", "Premium appearance", "Leadership-focused", "Sophisticated layout"],
  },
  {
    id: "tech",
    name: "Technology Professional",
    description: "Clean, modern template optimized for technology professionals",
    category: "tech",
    requiresPhoto: false,
    preview: "Tech template preview",
    colors: {
      primary: "#dc2626",
      secondary: "#b91c1c",
      accent: "#f87171",
      text: "#1f2937",
      background: "#ffffff",
      muted: "#6b7280",
    },
    features: ["Tech-optimized", "Modern layout", "Skill-focused", "Industry-standard"],
  },
  {
    id: "photo",
    name: "Photo Professional",
    description: "Elegant template that showcases your professional photo prominently",
    category: "photo",
    requiresPhoto: true,
    isPremium: true,
    preview: "Photo-focused template preview",
    colors: {
      primary: "#1f2937",
      secondary: "#374151",
      accent: "#3b82f6",
      text: "#111827",
      background: "#f8fafc",
      muted: "#64748b",
    },
    features: ["Photo-centric", "Professional showcase", "Personal branding", "Visual impact"],
  },
]
