// Simplified template configurations for better PDF generation
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
  }
}

export const SIMPLIFIED_TEMPLATES: TemplateConfig[] = [
  {
    id: 'professional',
    name: 'Professional',
    layout: 'single-column',
    fonts: {
      primary: 'helvetica',
      secondary: 'helvetica'
    },
    colors: {
      primary: '#1f2937',
      secondary: '#4b5563',
      accent: '#3b82f6',
      text: '#111827'
    },
    spacing: {
      headerHeight: 35,
      sectionSpacing: 6,
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
    id: 'modern',
    name: 'Modern',
    layout: 'two-column',
    fonts: {
      primary: 'helvetica',
      secondary: 'helvetica'
    },
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      text: '#1f2937'
    },
    spacing: {
      headerHeight: 40,
      sectionSpacing: 8,
      itemSpacing: 5
    },
    features: {
      coloredHeader: true,
      sectionLines: true,
      bulletPoints: false,
      boldSectionTitles: true
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    layout: 'single-column',
    fonts: {
      primary: 'helvetica',
      secondary: 'helvetica'
    },
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      text: '#000000'
    },
    spacing: {
      headerHeight: 30,
      sectionSpacing: 5,
      itemSpacing: 3
    },
    features: {
      coloredHeader: false,
      sectionLines: false,
      bulletPoints: false,
      boldSectionTitles: true
    }
  },
  {
    id: 'executive',
    name: 'Executive',
    layout: 'header-focus',
    fonts: {
      primary: 'times',
      secondary: 'times'
    },
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#34d399',
      text: '#1f2937'
    },
    spacing: {
      headerHeight: 45,
      sectionSpacing: 7,
      itemSpacing: 4
    },
    features: {
      coloredHeader: false,
      sectionLines: true,
      bulletPoints: true,
      boldSectionTitles: true
    }
  }
]
