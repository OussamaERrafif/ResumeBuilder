// Simplified template configurations for PDF generation
// Matching the 5 LaTeX templates from tempalte.ltx

export interface TemplateConfig {
  id: string
  name: string
  layout: 'single-column' | 'two-column' | 'header-focus'
  fonts: {
    primary: 'helvetica' | 'times' | 'courier'
    secondary: 'helvetica' | 'times' | 'courier'
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    sidebar?: string  // For two-column templates
  }
  spacing: {
    headerHeight: number
    sectionSpacing: number
    itemSpacing: number
  }
  features: {
    coloredHeader: boolean
    sectionLines: boolean
    bulletPoints: boolean
    boldSectionTitles: boolean
    dashBullets?: boolean
    sidebarPhoto?: boolean
  }
}

export const SIMPLIFIED_TEMPLATES: TemplateConfig[] = [
  {
    // LaTeX Template 1: Classic (Lines 1-130)
    // Roboto sans-serif, centered header, titlerule under sections
    id: 'classic',
    name: 'Classic Professional',
    layout: 'single-column',
    fonts: {
      primary: 'helvetica',  // Closest to Roboto
      secondary: 'helvetica'
    },
    colors: {
      primary: '#1f2937',
      secondary: '#4b5563',
      accent: '#374151',
      text: '#111827'
    },
    spacing: {
      headerHeight: 30,
      sectionSpacing: 6,
      itemSpacing: 4
    },
    features: {
      coloredHeader: false,
      sectionLines: true,  // titlerule
      bulletPoints: true,
      boldSectionTitles: true
    }
  },
  {
    // LaTeX Template 2: MaltaCV/Creative (Lines 131-337)
    // Colorful flame orange, bio section, multicol skills
    id: 'creative',
    name: 'Creative MaltaCV',
    layout: 'header-focus',
    fonts: {
      primary: 'helvetica',  // tgheros/sans-serif
      secondary: 'helvetica'
    },
    colors: {
      primary: '#e85d04',  // flame
      secondary: '#232323', // raisinblack
      accent: '#f48c06',
      text: '#1f2937'
    },
    spacing: {
      headerHeight: 35,
      sectionSpacing: 8,
      itemSpacing: 5
    },
    features: {
      coloredHeader: true,
      sectionLines: true,
      bulletPoints: true,
      boldSectionTitles: true
    }
  },
  {
    // LaTeX Template 3: Jitin Nair/Minimal (Lines 338-556)
    // Clean black/white, dash bullets, tabularx
    id: 'minimal',
    name: 'Minimal Clean',
    layout: 'single-column',
    fonts: {
      primary: 'helvetica',
      secondary: 'helvetica'
    },
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#0066cc',
      text: '#000000'
    },
    spacing: {
      headerHeight: 28,
      sectionSpacing: 5,
      itemSpacing: 3
    },
    features: {
      coloredHeader: false,
      sectionLines: true,
      bulletPoints: false,
      boldSectionTitles: true,
      dashBullets: true
    }
  },
  {
    // LaTeX Template 4: Anubhav Singh/Modern (Lines 557-739)
    // Detailed subheadings, skills alignment, tech focus
    id: 'modern',
    name: 'Modern Developer',
    layout: 'single-column',
    fonts: {
      primary: 'helvetica',
      secondary: 'helvetica'
    },
    colors: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#3b82f6',
      text: '#111827'
    },
    spacing: {
      headerHeight: 32,
      sectionSpacing: 5,
      itemSpacing: 4
    },
    features: {
      coloredHeader: false,
      sectionLines: true,
      bulletPoints: true,
      boldSectionTitles: true
    }
  },
  {
    // LaTeX Template 5: LuxSleek/Photo (Lines 740-933)
    // Two-column with dark navy sidebar, profile photo
    id: 'photo',
    name: 'LuxSleek Sidebar',
    layout: 'two-column',
    fonts: {
      primary: 'helvetica',  // FiraSans
      secondary: 'helvetica'
    },
    colors: {
      primary: '#304263',  // cvblue
      secondary: '#1e3a5f',
      accent: '#4a6fa5',
      text: '#1f2937',
      sidebar: '#304263'
    },
    spacing: {
      headerHeight: 0,  // No traditional header
      sectionSpacing: 6,
      itemSpacing: 4
    },
    features: {
      coloredHeader: false,
      sectionLines: true,
      bulletPoints: true,
      boldSectionTitles: true,
      sidebarPhoto: true
    }
  }
]
