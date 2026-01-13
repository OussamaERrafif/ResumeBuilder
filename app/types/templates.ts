export interface Template {
  id: string
  name: string
  description: string
  category: "classic" | "creative" | "minimal" | "modern" | "photo"
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
    // LaTeX Template 1: Classic single-column (Lines 1-130)
    // Roboto font, centered header, pipe separators, titlerule sections
    id: "classic",
    name: "Classic Professional",
    description: "Clean single-column layout with centered header and section underlines",
    category: "classic",
    requiresPhoto: false,
    preview: "Classic professional template",
    colors: {
      primary: "#1f2937",
      secondary: "#4b5563",
      accent: "#374151",
      text: "#111827",
      background: "#ffffff",
      muted: "#6b7280",
    },
    features: ["Single column", "Centered header", "Section rules", "ATS-optimized"],
  },
  {
    // LaTeX Template 2: MaltaCV (Lines 131-337)
    // Colorful raisinblack_flame, bio section, multicolumn skills
    id: "creative",
    name: "Creative MaltaCV",
    description: "Colorful design with bio section and multi-column skill grid",
    category: "creative",
    requiresPhoto: false,
    isPremium: true,
    preview: "Creative MaltaCV template",
    colors: {
      primary: "#e85d04",  // flame orange
      secondary: "#232323", // raisinblack
      accent: "#f48c06",
      text: "#1f2937",
      background: "#ffffff",
      muted: "#6b7280",
    },
    features: ["Colorful accents", "Bio section", "Multi-column skills", "Awards section"],
  },
  {
    // LaTeX Template 3: Jitin Nair (Lines 338-556)
    // Clean with fontawesome icons, jobshort/joblong, -- bullets
    id: "minimal",
    name: "Minimal Clean",
    description: "Ultra-clean design with dash bullets and icon-style contact info",
    category: "minimal",
    requiresPhoto: false,
    preview: "Minimal clean template",
    colors: {
      primary: "#000000",
      secondary: "#333333",
      accent: "#0066cc",  // linkcolour
      text: "#000000",
      background: "#ffffff",
      muted: "#666666",
    },
    features: ["Dash bullets", "Centered header", "Tabular layout", "Maximum readability"],
  },
  {
    // LaTeX Template 4: Anubhav Singh (Lines 557-739)
    // Detailed resume subheadings, skills with alignment, projects section
    id: "modern",
    name: "Modern Developer",
    description: "Detailed tech-focused layout with aligned skills and project highlights",
    category: "modern",
    requiresPhoto: false,
    preview: "Modern developer template",
    colors: {
      primary: "#1f2937",
      secondary: "#374151",
      accent: "#3b82f6",
      text: "#111827",
      background: "#ffffff",
      muted: "#6b7280",
    },
    features: ["Skills alignment", "Project descriptions", "Course listings", "Tech-focused"],
  },
  {
    // LaTeX Template 5: LuxSleek (Lines 740-933)
    // Two-column with dark navy sidebar, photo, FiraSans
    id: "photo",
    name: "LuxSleek Sidebar",
    description: "Two-column layout with dark navy sidebar featuring profile and contact",
    category: "photo",
    requiresPhoto: true,
    isPremium: true,
    preview: "LuxSleek sidebar template",
    colors: {
      primary: "#304263",  // cvblue
      secondary: "#1e3a5f",
      accent: "#4a6fa5",
      text: "#1f2937",
      background: "#ffffff",
      muted: "#6b7280",
    },
    features: ["Two-column", "Photo sidebar", "Dark accent", "Professional"],
  },
]
