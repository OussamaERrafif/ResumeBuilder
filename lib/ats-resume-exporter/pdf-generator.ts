/**
 * ATS Resume Exporter - PDF Generator Core
 * 
 * This is the core PDF generation engine built from the ground up for ATS compatibility.
 * 
 * Key ATS-Friendly Features:
 * - Pure text-based PDF generation (no images/canvas)
 * - Proper text encoding for ATS parsing
 * - Simple, single-column layouts
 * - Standard fonts embedded in PDF
 * - Clean, parseable text hierarchy
 * - Semantic structure with proper headings
 */

import { jsPDF } from 'jspdf'
import type {
  ResumeData,
  ATSTemplateConfig,
  PDFPageDimensions,
  PDFGeneratorState,
  TextStyle,
  FontFamily
} from './types'

// ============================================================================
// PDF Generator Class
// ============================================================================

export class ATSPDFGenerator {
  private doc: jsPDF
  private template: ATSTemplateConfig
  private data: ResumeData
  private state: PDFGeneratorState
  private dimensions: PDFPageDimensions

  // A4 dimensions in mm
  private static readonly A4_WIDTH = 210
  private static readonly A4_HEIGHT = 297

  constructor(template: ATSTemplateConfig, data: ResumeData) {
    this.template = template
    this.data = data
    
    // Initialize jsPDF with A4 format
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    })

    // Set page dimensions
    this.dimensions = {
      width: ATSPDFGenerator.A4_WIDTH,
      height: ATSPDFGenerator.A4_HEIGHT,
      margins: {
        top: template.spacing.marginTop,
        bottom: template.spacing.marginBottom,
        left: template.spacing.marginLeft,
        right: template.spacing.marginRight
      }
    }

    // Initialize generator state
    this.state = {
      currentY: this.dimensions.margins.top,
      pageNumber: 1,
      contentWidth: this.dimensions.width - this.dimensions.margins.left - this.dimensions.margins.right,
      contentHeight: this.dimensions.height - this.dimensions.margins.top - this.dimensions.margins.bottom
    }

    // Set default font
    this.doc.setFont(this.template.font, 'normal')
  }

  // ============================================================================
  // Color Utilities
  // ============================================================================

  private hexToRGB(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return { r: 0, g: 0, b: 0 }
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
  }

  private setTextColor(hex: string): void {
    const rgb = this.hexToRGB(hex)
    this.doc.setTextColor(rgb.r, rgb.g, rgb.b)
  }

  private setDrawColor(hex: string): void {
    const rgb = this.hexToRGB(hex)
    this.doc.setDrawColor(rgb.r, rgb.g, rgb.b)
  }

  // ============================================================================
  // Text Rendering Utilities
  // ============================================================================

  private setFont(weight: 'normal' | 'bold', style: 'normal' | 'italic' = 'normal'): void {
    let fontStyle = 'normal'
    if (weight === 'bold' && style === 'italic') {
      fontStyle = 'bolditalic'
    } else if (weight === 'bold') {
      fontStyle = 'bold'
    } else if (style === 'italic') {
      fontStyle = 'italic'
    }
    this.doc.setFont(this.template.font, fontStyle)
  }

  private addText(
    text: string,
    x: number,
    y: number,
    options: {
      fontSize?: number
      fontWeight?: 'normal' | 'bold'
      fontStyle?: 'normal' | 'italic'
      color?: string
      align?: 'left' | 'center' | 'right'
      maxWidth?: number
    } = {}
  ): number {
    const {
      fontSize = this.template.fonts.body.size,
      fontWeight = 'normal',
      fontStyle = 'normal',
      color = this.template.colors.text,
      align = 'left',
      maxWidth
    } = options

    this.doc.setFontSize(fontSize)
    this.setFont(fontWeight, fontStyle)
    this.setTextColor(color)

    if (!text || text.trim() === '') return 0

    // Calculate line height
    const lineHeightMultiplier = this.template.spacing.lineHeight
    const lineHeight = fontSize * lineHeightMultiplier * 0.35 // Convert to mm

    // Split text if maxWidth is specified
    if (maxWidth && text.length > 0) {
      const lines = this.doc.splitTextToSize(text, maxWidth)
      let currentY = y
      
      for (const line of lines) {
        // Check for page break
        if (currentY + lineHeight > this.dimensions.height - this.dimensions.margins.bottom) {
          this.addPage()
          currentY = this.state.currentY
        }
        
        let textX = x
        if (align === 'center') {
          textX = this.dimensions.width / 2
        } else if (align === 'right') {
          textX = this.dimensions.width - this.dimensions.margins.right
        }
        
        this.doc.text(line, textX, currentY, { align })
        currentY += lineHeight
      }
      
      return (lines.length * lineHeight)
    } else {
      let textX = x
      if (align === 'center') {
        textX = this.dimensions.width / 2
      } else if (align === 'right') {
        textX = this.dimensions.width - this.dimensions.margins.right
      }
      
      this.doc.text(text, textX, y, { align })
      return lineHeight
    }
  }

  private addLine(y: number, color?: string): void {
    this.setDrawColor(color || this.template.colors.accent)
    this.doc.setLineWidth(0.3)
    this.doc.line(
      this.dimensions.margins.left,
      y,
      this.dimensions.width - this.dimensions.margins.right,
      y
    )
  }

  private addPage(): void {
    this.doc.addPage()
    this.state.pageNumber++
    this.state.currentY = this.dimensions.margins.top
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.state.currentY + requiredSpace > this.dimensions.height - this.dimensions.margins.bottom) {
      this.addPage()
    }
  }

  // ============================================================================
  // Section Rendering Methods
  // ============================================================================

  private renderHeader(): void {
    const { personalInfo, links } = this.data
    const { fonts, colors, features } = this.template
    
    const xPos = features.centeredHeader 
      ? this.dimensions.width / 2 
      : this.dimensions.margins.left
    const align = features.centeredHeader ? 'center' : 'left'

    // Name
    const nameHeight = this.addText(
      personalInfo.name || 'Your Name',
      xPos,
      this.state.currentY,
      {
        fontSize: fonts.name.size,
        fontWeight: fonts.name.weight,
        color: colors.primary,
        align
      }
    )
    this.state.currentY += nameHeight + 2

    // Title
    if (personalInfo.title) {
      const titleHeight = this.addText(
        personalInfo.title,
        xPos,
        this.state.currentY,
        {
          fontSize: fonts.title.size,
          fontWeight: fonts.title.weight,
          color: colors.secondary,
          align
        }
      )
      this.state.currentY += titleHeight + 3
    }

    // Contact Information - single line or multiple lines based on space
    const contactParts: string[] = []
    if (personalInfo.email) contactParts.push(personalInfo.email)
    if (personalInfo.phone) contactParts.push(personalInfo.phone)
    if (personalInfo.location) contactParts.push(personalInfo.location)
    
    if (contactParts.length > 0) {
      const contactLine = contactParts.join('  •  ')
      const contactHeight = this.addText(
        contactLine,
        xPos,
        this.state.currentY,
        {
          fontSize: fonts.small.size,
          color: colors.muted,
          align
        }
      )
      this.state.currentY += contactHeight + 2
    }

    // Links (LinkedIn, Portfolio, etc.)
    const validLinks = links.filter(link => link.name && link.url)
    if (validLinks.length > 0) {
      const linksLine = validLinks.map(link => `${link.name}: ${link.url}`).join('  |  ')
      const linksHeight = this.addText(
        linksLine,
        xPos,
        this.state.currentY,
        {
          fontSize: fonts.small.size,
          color: colors.muted,
          align,
          maxWidth: this.state.contentWidth
        }
      )
      this.state.currentY += linksHeight
    }

    // Add separator line
    if (features.showLines) {
      this.state.currentY += 4
      this.addLine(this.state.currentY, colors.primary)
    }

    this.state.currentY += this.template.spacing.sectionGap
  }

  private renderSectionHeader(title: string): void {
    const { fonts, colors, features } = this.template
    
    this.checkPageBreak(20)

    // Section title
    const headerHeight = this.addText(
      title.toUpperCase(),
      this.dimensions.margins.left,
      this.state.currentY,
      {
        fontSize: fonts.sectionHeader.size,
        fontWeight: fonts.sectionHeader.weight,
        color: colors.primary
      }
    )
    this.state.currentY += headerHeight + 1

    // Section underline
    if (features.showLines) {
      this.addLine(this.state.currentY, colors.accent)
      this.state.currentY += 3
    } else {
      this.state.currentY += 2
    }
  }

  private renderSummary(): void {
    const { summary } = this.data.personalInfo
    if (!summary || summary.trim() === '') return

    this.renderSectionHeader('Professional Summary')

    const summaryHeight = this.addText(
      summary,
      this.dimensions.margins.left,
      this.state.currentY,
      {
        fontSize: this.template.fonts.body.size,
        color: this.template.colors.text,
        maxWidth: this.state.contentWidth
      }
    )
    this.state.currentY += summaryHeight + this.template.spacing.sectionGap
  }

  private renderExperience(): void {
    const experiences = this.data.experience.filter(exp => exp.jobTitle && exp.company)
    if (experiences.length === 0) return

    this.renderSectionHeader('Professional Experience')

    experiences.forEach((exp, index) => {
      this.checkPageBreak(25)

      const { fonts, colors, spacing, features } = this.template
      
      // Job Title and Date on same line
      this.addText(
        exp.jobTitle,
        this.dimensions.margins.left,
        this.state.currentY,
        {
          fontSize: fonts.itemHeader.size,
          fontWeight: fonts.itemHeader.weight,
          color: colors.primary
        }
      )
      
      if (exp.date) {
        this.addText(
          exp.date,
          this.dimensions.width - this.dimensions.margins.right,
          this.state.currentY,
          {
            fontSize: fonts.small.size,
            color: colors.muted,
            align: 'right'
          }
        )
      }
      this.state.currentY += fonts.itemHeader.size * 0.4 + 1

      // Company and Location
      const companyLine = exp.location 
        ? `${exp.company}  |  ${exp.location}`
        : exp.company
      
      const companyHeight = this.addText(
        companyLine,
        this.dimensions.margins.left,
        this.state.currentY,
        {
          fontSize: fonts.body.size,
          fontStyle: 'italic',
          color: colors.secondary
        }
      )
      this.state.currentY += companyHeight + 2

      // Responsibilities
      if (exp.responsibilities) {
        const responsibilities = this.parseResponsibilities(exp.responsibilities)
        
        responsibilities.forEach(resp => {
          this.checkPageBreak(8)
          
          const bulletPrefix = features.showBullets ? '•  ' : ''
          const respHeight = this.addText(
            bulletPrefix + resp,
            this.dimensions.margins.left + (features.showBullets ? 0 : 0),
            this.state.currentY,
            {
              fontSize: fonts.body.size,
              color: colors.text,
              maxWidth: this.state.contentWidth
            }
          )
          this.state.currentY += respHeight
        })
      }

      // Gap between experiences
      if (index < experiences.length - 1) {
        this.state.currentY += spacing.itemGap
      }
    })

    this.state.currentY += this.template.spacing.sectionGap
  }

  private renderEducation(): void {
    const education = this.data.education.filter(edu => edu.school && edu.degree)
    if (education.length === 0) return

    this.renderSectionHeader('Education')

    const { fonts, colors, spacing } = this.template

    education.forEach((edu, index) => {
      this.checkPageBreak(15)

      // School and Date
      this.addText(
        edu.school,
        this.dimensions.margins.left,
        this.state.currentY,
        {
          fontSize: fonts.itemHeader.size,
          fontWeight: fonts.itemHeader.weight,
          color: colors.primary
        }
      )
      
      if (edu.date) {
        this.addText(
          edu.date,
          this.dimensions.width - this.dimensions.margins.right,
          this.state.currentY,
          {
            fontSize: fonts.small.size,
            color: colors.muted,
            align: 'right'
          }
        )
      }
      this.state.currentY += fonts.itemHeader.size * 0.4 + 1

      // Degree
      const degreeHeight = this.addText(
        edu.degree,
        this.dimensions.margins.left,
        this.state.currentY,
        {
          fontSize: fonts.body.size,
          color: colors.text
        }
      )
      this.state.currentY += degreeHeight

      // GPA if available
      if (edu.gpa) {
        const gpaHeight = this.addText(
          `GPA: ${edu.gpa}`,
          this.dimensions.margins.left,
          this.state.currentY,
          {
            fontSize: fonts.small.size,
            color: colors.muted
          }
        )
        this.state.currentY += gpaHeight
      }

      // Honors if available
      if (edu.honors) {
        const honorsHeight = this.addText(
          edu.honors,
          this.dimensions.margins.left,
          this.state.currentY,
          {
            fontSize: fonts.small.size,
            fontStyle: 'italic',
            color: colors.muted
          }
        )
        this.state.currentY += honorsHeight
      }

      if (index < education.length - 1) {
        this.state.currentY += spacing.itemGap
      }
    })

    this.state.currentY += this.template.spacing.sectionGap
  }

  private renderSkills(): void {
    const { skills } = this.data
    if (!skills.languages && !skills.frameworks && !skills.tools) return

    this.renderSectionHeader('Technical Skills')

    const { fonts, colors, spacing } = this.template

    const skillCategories = [
      { label: 'Programming Languages', value: skills.languages },
      { label: 'Frameworks & Libraries', value: skills.frameworks },
      { label: 'Tools & Platforms', value: skills.tools }
    ].filter(cat => cat.value && cat.value.trim() !== '')

    skillCategories.forEach((category, index) => {
      this.checkPageBreak(8)

      const skillLine = `${category.label}: ${category.value}`
      const skillHeight = this.addText(
        skillLine,
        this.dimensions.margins.left,
        this.state.currentY,
        {
          fontSize: fonts.body.size,
          color: colors.text,
          maxWidth: this.state.contentWidth
        }
      )
      this.state.currentY += skillHeight

      if (index < skillCategories.length - 1) {
        this.state.currentY += 2
      }
    })

    this.state.currentY += this.template.spacing.sectionGap
  }

  private renderProjects(): void {
    const projects = this.data.projects.filter(proj => proj.name)
    if (projects.length === 0) return

    this.renderSectionHeader('Projects')

    const { fonts, colors, spacing, features } = this.template

    projects.forEach((project, index) => {
      this.checkPageBreak(20)

      // Project Name
      const nameHeight = this.addText(
        project.name,
        this.dimensions.margins.left,
        this.state.currentY,
        {
          fontSize: fonts.itemHeader.size,
          fontWeight: fonts.itemHeader.weight,
          color: colors.primary
        }
      )
      this.state.currentY += nameHeight + 1

      // Description
      if (project.description) {
        const descHeight = this.addText(
          project.description,
          this.dimensions.margins.left,
          this.state.currentY,
          {
            fontSize: fonts.body.size,
            color: colors.text,
            maxWidth: this.state.contentWidth
          }
        )
        this.state.currentY += descHeight + 1
      }

      // Technologies
      if (project.technologies) {
        const techHeight = this.addText(
          `Technologies: ${project.technologies}`,
          this.dimensions.margins.left,
          this.state.currentY,
          {
            fontSize: fonts.small.size,
            color: colors.muted
          }
        )
        this.state.currentY += techHeight
      }

      // Link
      if (project.link) {
        const linkHeight = this.addText(
          project.link,
          this.dimensions.margins.left,
          this.state.currentY,
          {
            fontSize: fonts.small.size,
            color: colors.accent
          }
        )
        this.state.currentY += linkHeight
      }

      if (index < projects.length - 1) {
        this.state.currentY += spacing.itemGap
      }
    })

    this.state.currentY += this.template.spacing.sectionGap
  }

  private renderCertifications(): void {
    const certifications = this.data.certifications.filter(cert => cert.name)
    if (certifications.length === 0) return

    this.renderSectionHeader('Certifications')

    const { fonts, colors, spacing } = this.template

    certifications.forEach((cert, index) => {
      this.checkPageBreak(10)

      // Certification name and issuer
      const certLine = cert.issuer 
        ? `${cert.name} - ${cert.issuer}`
        : cert.name

      this.addText(
        certLine,
        this.dimensions.margins.left,
        this.state.currentY,
        {
          fontSize: fonts.body.size,
          color: colors.text
        }
      )

      // Date on right
      if (cert.date) {
        this.addText(
          cert.date,
          this.dimensions.width - this.dimensions.margins.right,
          this.state.currentY,
          {
            fontSize: fonts.small.size,
            color: colors.muted,
            align: 'right'
          }
        )
      }

      this.state.currentY += fonts.body.size * 0.4 + spacing.itemGap / 2
    })

    this.state.currentY += this.template.spacing.sectionGap
  }

  private renderReferences(): void {
    const references = this.data.references.filter(ref => ref.name)
    if (references.length === 0) return

    this.renderSectionHeader('References')

    const { fonts, colors, spacing } = this.template

    references.forEach((ref, index) => {
      this.checkPageBreak(15)

      // Name and Title
      const nameHeight = this.addText(
        ref.name,
        this.dimensions.margins.left,
        this.state.currentY,
        {
          fontSize: fonts.itemHeader.size,
          fontWeight: fonts.itemHeader.weight,
          color: colors.primary
        }
      )
      this.state.currentY += nameHeight + 1

      // Title and Company
      const titleLine = ref.company 
        ? `${ref.title} at ${ref.company}`
        : ref.title

      const titleHeight = this.addText(
        titleLine,
        this.dimensions.margins.left,
        this.state.currentY,
        {
          fontSize: fonts.body.size,
          color: colors.secondary
        }
      )
      this.state.currentY += titleHeight

      // Contact info
      const contactParts = []
      if (ref.email) contactParts.push(ref.email)
      if (ref.phone) contactParts.push(ref.phone)
      
      if (contactParts.length > 0) {
        const contactHeight = this.addText(
          contactParts.join('  |  '),
          this.dimensions.margins.left,
          this.state.currentY,
          {
            fontSize: fonts.small.size,
            color: colors.muted
          }
        )
        this.state.currentY += contactHeight
      }

      if (index < references.length - 1) {
        this.state.currentY += spacing.itemGap
      }
    })
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private parseResponsibilities(text: string): string[] {
    // Split by newlines, bullet points, or numbered lists
    const lines = text.split(/[\n\r]+|(?:^|\s)[•\-\*]\s|(?:^|\s)\d+\.\s/)
      .map(line => line.trim())
      .filter(line => line.length > 0)

    // If no splits found, treat as single paragraph
    if (lines.length === 0) {
      return [text.trim()]
    }

    return lines
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Generate the complete PDF document
   */
  public generate(): jsPDF {
    // Render all sections
    this.renderHeader()
    this.renderSummary()
    this.renderExperience()
    this.renderEducation()
    this.renderSkills()
    this.renderProjects()
    this.renderCertifications()
    this.renderReferences()

    return this.doc
  }

  /**
   * Generate and download the PDF
   */
  public download(filename?: string): void {
    const pdf = this.generate()
    const name = filename || this.generateFilename()
    pdf.save(name)
  }

  /**
   * Generate and return as blob
   */
  public async toBlob(): Promise<Blob> {
    const pdf = this.generate()
    return pdf.output('blob')
  }

  /**
   * Generate and return as base64
   */
  public toBase64(): string {
    const pdf = this.generate()
    return pdf.output('datauristring')
  }

  /**
   * Get page count
   */
  public getPageCount(): number {
    this.generate()
    return this.state.pageNumber
  }

  private generateFilename(): string {
    const name = this.data.personalInfo.name || 'Resume'
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_')
    const templateName = this.template.name.replace(/[^a-zA-Z0-9]/g, '_')
    const date = new Date().toISOString().split('T')[0]
    return `${cleanName}_${templateName}_${date}.pdf`
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a new ATS PDF Generator instance
 */
export function createATSPDFGenerator(
  template: ATSTemplateConfig,
  data: ResumeData
): ATSPDFGenerator {
  return new ATSPDFGenerator(template, data)
}

/**
 * Quick download function
 */
export async function downloadATSResumePDF(
  template: ATSTemplateConfig,
  data: ResumeData,
  filename?: string
): Promise<void> {
  const generator = new ATSPDFGenerator(template, data)
  generator.download(filename)
}
