/**
 * ATS Resume Exporter - PDF Generator Core
 * 
 * This PDF generator creates exports that match the 5 LaTeX templates exactly.
 * Each template has its own specific layout and styling.
 */

import { jsPDF } from 'jspdf'
import type {
  ResumeData,
  ATSTemplateConfig,
  PDFPageDimensions,
  PDFGeneratorState,
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
        top: 15,
        bottom: 15,
        left: 15,
        right: 15
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

  private setFillColor(hex: string): void {
    const rgb = this.hexToRGB(hex)
    this.doc.setFillColor(rgb.r, rgb.g, rgb.b)
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
      fontSize = 10,
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

    const lineHeight = fontSize * 0.45 // Slightly increased line height for readability

    // If No maxWidth provided, optimize for avoid boundary exceed
    const effectiveMaxWidth = maxWidth || (this.dimensions.width - x - this.dimensions.margins.right)

    if (text.length > 0) {
      const lines = this.doc.splitTextToSize(text, effectiveMaxWidth)
      let currentY = y

      for (const line of lines) {
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

      return lines.length * lineHeight
    } else {
      // Logic for single line or no wrapping needed (should rarely reach here if splitTextToSize acts correctly)
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

  private addLine(y: number, color?: string, startX?: number, endX?: number): void {
    this.setDrawColor(color || this.template.colors.primary)
    this.doc.setLineWidth(0.3)
    this.doc.line(
      startX ?? this.dimensions.margins.left,
      y,
      endX ?? this.dimensions.width - this.dimensions.margins.right,
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

  // Markdown-aware text renderer
  private renderFormattedBodyText(text: string, x: number, maxWidth: number, options: {
    fontSize?: number,
    color?: string
  } = {}): number {
    if (!text) return 0

    const lines = text.split('\n')
    let totalHeight = 0

    // Default bullet style
    const fontSize = options.fontSize || 9

    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed) return

      // Check if line is a bullet point (starts with - or *)
      const isBullet = /^[-*]\s/.test(trimmed)
      const cleanLine = isBullet ? trimmed.replace(/^[-*]\s/, '') : trimmed

      const currentX = isBullet ? x + 4 : x
      const currentMaxWidth = isBullet ? maxWidth - 4 : maxWidth

      if (isBullet) {
        // Draw bullet point
        this.addText('•', x, this.state.currentY, {
          fontSize: fontSize,
          color: options.color
        })
      }

      // Draw text
      const h = this.addText(cleanLine, currentX, this.state.currentY, {
        fontSize: fontSize,
        maxWidth: currentMaxWidth,
        color: options.color
      })

      this.state.currentY += h + 1.5 // Consistent spacing
      totalHeight += h + 1.5
    })

    return totalHeight
  }

  // ============================================================================
  // Main Generate Method - Routes to Template-Specific Generator
  // ============================================================================

  public generate(): jsPDF {
    switch (this.template.id) {
      case 'ats-classic':
        this.generateClassic()
        break
      case 'ats-creative':
        this.generateCreative()
        break
      case 'ats-minimal':
        this.generateMinimal()
        break
      case 'ats-modern':
        this.generateModern()
        break
      case 'ats-photo':
        this.generatePhoto()
        break
      default:
        this.generateClassic()
    }
    return this.doc
  }

  // ============================================================================
  // TEMPLATE 1: Classic (LaTeX lines 1-130)
  // Roboto font, centered header, pipe separators, titlerule sections
  // ============================================================================

  private generateClassic(): void {
    const { colors } = this.template

    // Centered Name
    this.addText((this.data.personalInfo.name || 'Your Name').toUpperCase(), this.dimensions.width / 2, this.state.currentY, {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      align: 'center',
      maxWidth: this.state.contentWidth
    })
    this.state.currentY += 8

    // Contact with pipe separators
    const contactParts = [
      this.data.personalInfo.phone,
      this.data.personalInfo.email,
      ...this.data.links.filter(l => l.url).slice(0, 2).map(l => l.name || l.url)
    ].filter(Boolean)

    if (contactParts.length > 0) {
      this.addText(contactParts.join(' | '), this.dimensions.width / 2, this.state.currentY, {
        fontSize: 9,
        color: colors.secondary,
        align: 'center',
        maxWidth: this.state.contentWidth
      })
      this.state.currentY += 8
    }

    // Summary
    if (this.data.personalInfo.summary) {
      this.addClassicSectionHeader('SUMMARY')
      const h = this.addText(this.data.personalInfo.summary, this.dimensions.margins.left, this.state.currentY, {
        fontSize: 9,
        maxWidth: this.state.contentWidth
      })
      this.state.currentY += h + 5
    }

    // Technical Skills
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addClassicSectionHeader('TECHNICAL SKILLS')
      if (this.data.skills.languages) {
        this.addText(`Programming Languages: ${this.data.skills.languages}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold', maxWidth: this.state.contentWidth })
        this.state.currentY += 5
      }
      if (this.data.skills.frameworks) {
        this.addText(`Frameworks & Libraries: ${this.data.skills.frameworks}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold', maxWidth: this.state.contentWidth })
        this.state.currentY += 5
      }
      if (this.data.skills.tools) {
        this.addText(`Tools & Platforms: ${this.data.skills.tools}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold', maxWidth: this.state.contentWidth })
        this.state.currentY += 5
      }
      this.state.currentY += 2
    }

    // Projects
    if (this.data.projects.some(p => p.name)) {
      this.addClassicSectionHeader('PROJECTS')
      this.data.projects.filter(p => p.name).slice(0, 5).forEach(proj => {
        this.checkPageBreak(15)

        // Project Header Row
        // Logic: Print Name left, Tech right. If collision, push Tech to next line

        this.addText(proj.name, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold', maxWidth: this.state.contentWidth - 50 })

        if (proj.technologies) {
          this.addText(proj.technologies, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
            fontSize: 8, fontStyle: 'italic', color: colors.secondary, align: 'right', maxWidth: 50
          })
        }

        this.state.currentY += 5
        if (proj.description) {
          const h = this.addText(proj.description, this.dimensions.margins.left + 3, this.state.currentY, { fontSize: 9, maxWidth: this.state.contentWidth - 3 })
          this.state.currentY += h + 3
        }
      })
    }

    // Experience
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addClassicSectionHeader('EXPERIENCE')
      this.data.experience.filter(e => e.jobTitle).slice(0, 5).forEach(exp => {
        this.checkPageBreak(25)

        this.addText(exp.jobTitle, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold', maxWidth: this.state.contentWidth - 40 })
        this.addText(exp.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
          fontSize: 9, color: colors.secondary, align: 'right', maxWidth: 40
        })
        this.state.currentY += 5

        this.addText(exp.company, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontStyle: 'italic', color: colors.secondary, maxWidth: this.state.contentWidth })
        this.state.currentY += 4

        if (exp.responsibilities) {
          this.renderFormattedBodyText(exp.responsibilities, this.dimensions.margins.left, this.state.contentWidth, {
            fontSize: 9,
            color: colors.text
          })
        }
        this.state.currentY += 4
      })
    }

    // Education
    if (this.data.education.some(e => e.school)) {
      this.addClassicSectionHeader('EDUCATION')
      this.data.education.filter(e => e.school).forEach(edu => {
        this.checkPageBreak(15)

        this.addText(edu.school, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold', maxWidth: this.state.contentWidth - 40 })
        this.addText(edu.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
          fontSize: 9, color: colors.secondary, align: 'right', maxWidth: 40
        })
        this.state.currentY += 5

        this.addText(edu.degree, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontStyle: 'italic', maxWidth: this.state.contentWidth })
        this.state.currentY += 5
      })
    }

    // Certifications
    if (this.data.certifications.some(c => c.name)) {
      this.addClassicSectionHeader('CERTIFICATIONS')
      this.data.certifications.filter(c => c.name).forEach(cert => {
        this.checkPageBreak(10)
        this.addText(`• ${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, maxWidth: this.state.contentWidth })
        this.state.currentY += 5
      })
    }
  }

  private addClassicSectionHeader(title: string): void {
    this.checkPageBreak(15)
    this.addText(title, this.dimensions.margins.left, this.state.currentY, {
      fontSize: 11,
      fontWeight: 'bold',
      color: this.template.colors.primary,
      maxWidth: this.state.contentWidth
    })
    this.state.currentY += 3
    this.addLine(this.state.currentY, this.template.colors.primary)
    this.state.currentY += 6
  }

  // ============================================================================
  // TEMPLATE 2: Creative/MaltaCV (LaTeX lines 131-337)
  // Colorful flame orange, bio section, multicol skills
  // ============================================================================

  private generateCreative(): void {
    const flame = this.template.colors.primary // #e85d04

    // Header Layout: Name (Left) | Photo (Right if exists)
    let headerHeight = 0
    if (this.data.personalInfo.profileImage) {
      try {
        const imgSize = 35
        const imgX = this.dimensions.width - this.dimensions.margins.right - imgSize
        this.doc.addImage(this.data.personalInfo.profileImage, imgX, this.state.currentY, imgSize, imgSize)
        // Ensure text doesn't overlap image
        this.state.contentWidth -= (imgSize + 5)
      } catch (e) {
        console.warn('Could not add profile image to creative template', e)
      }
    }

    // Name with color
    this.addText(this.data.personalInfo.name || 'Your Name', this.dimensions.margins.left, this.state.currentY, {
      fontSize: 22, fontWeight: 'bold', color: flame, maxWidth: this.state.contentWidth
    })
    this.state.currentY += 8

    // Tagline/Title
    this.addText(this.data.personalInfo.title || 'Professional Title', this.dimensions.margins.left, this.state.currentY, {
      fontSize: 11, fontStyle: 'italic', color: this.template.colors.secondary, maxWidth: this.state.contentWidth
    })
    this.state.currentY += 7

    // Reset content width for subsequent sections
    if (this.data.personalInfo.profileImage) {
      this.state.contentWidth = this.dimensions.width - this.dimensions.margins.left - this.dimensions.margins.right
    }

    // Contact row
    const contactParts = [
      this.data.personalInfo.email && `Email: ${this.data.personalInfo.email}`,
      this.data.personalInfo.phone && `Phone: ${this.data.personalInfo.phone}`,
      ...this.data.links.filter(l => l.url).slice(0, 2).map(l => l.name || l.url)
    ].filter(Boolean).join('   ')

    this.addText(contactParts, this.dimensions.margins.left, this.state.currentY, { fontSize: 8, color: this.template.colors.secondary, maxWidth: this.state.contentWidth })
    this.state.currentY += 8

    // Bio section with colored line
    if (this.data.personalInfo.summary) {
      this.setFillColor(flame)
      this.doc.rect(this.dimensions.margins.left, this.state.currentY, this.state.contentWidth, 0.5, 'F')
      this.state.currentY += 5
      const h = this.addText(this.data.personalInfo.summary, this.dimensions.margins.left, this.state.currentY, {
        fontSize: 9, maxWidth: this.state.contentWidth
      })
      this.state.currentY += h + 6
    }

    // Skills section
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addCreativeSectionHeader('SKILLS', flame)
      const allSkills = [
        ...(this.data.skills.languages?.split(',') || []),
        ...(this.data.skills.frameworks?.split(',') || []),
        ...(this.data.skills.tools?.split(',') || [])
      ].filter(s => s.trim()).slice(0, 15)

      // Grid layout
      let col = 0
      const colWidth = this.state.contentWidth / 4

      allSkills.forEach(skill => {
        const x = this.dimensions.margins.left + (col * colWidth)
        this.addText(skill.trim(), x, this.state.currentY, { fontSize: 8, maxWidth: colWidth - 2 })
        col++
        if (col >= 4) {
          col = 0
          this.state.currentY += 5
        }
      })
      if (col > 0) this.state.currentY += 5
      this.state.currentY += 4
    }

    // Education
    if (this.data.education.some(e => e.school)) {
      this.addCreativeSectionHeader('EDUCATION', flame)
      this.data.education.filter(e => e.school).forEach(edu => {
        this.checkPageBreak(15)
        this.addText(edu.degree, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold', maxWidth: this.state.contentWidth })
        this.state.currentY += 4
        this.addText(`${edu.school} | ${edu.date}`, this.dimensions.margins.left, this.state.currentY, {
          fontSize: 8, color: this.template.colors.secondary, maxWidth: this.state.contentWidth
        })
        this.state.currentY += 6
      })
    }

    // Experience
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addCreativeSectionHeader('EXPERIENCE', flame)
      this.data.experience.filter(e => e.jobTitle).slice(0, 5).forEach(exp => {
        this.checkPageBreak(25)
        this.addText(`${exp.jobTitle} at ${exp.company}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold', maxWidth: this.state.contentWidth - 30 })

        this.addText(exp.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
          fontSize: 8, align: 'right', color: this.template.colors.secondary, maxWidth: 30
        })
        this.state.currentY += 5

        if (exp.responsibilities) {
          this.renderFormattedBodyText(exp.responsibilities, this.dimensions.margins.left, this.state.contentWidth, {
            fontSize: 8,
            color: this.template.colors.text
          })
        }
        this.state.currentY += 4
      })
    }

    // Awards/Certifications
    if (this.data.certifications.some(c => c.name)) {
      this.addCreativeSectionHeader('AWARDS', flame)
      this.data.certifications.filter(c => c.name).slice(0, 5).forEach(cert => {
        this.checkPageBreak(10)
        this.addText(cert.name, this.dimensions.margins.left, this.state.currentY, { fontSize: 8, fontWeight: 'bold', maxWidth: this.state.contentWidth * 0.6 })
        if (cert.issuer) {
          this.addText(cert.issuer, this.dimensions.margins.left + (this.state.contentWidth * 0.65), this.state.currentY, { fontSize: 8, color: this.template.colors.secondary, maxWidth: this.state.contentWidth * 0.35 })
        }
        this.state.currentY += 5
      })
    }
  }

  private addCreativeSectionHeader(title: string, color: string): void {
    this.checkPageBreak(15)
    this.addText(title, this.dimensions.margins.left, this.state.currentY, { fontSize: 11, fontWeight: 'bold', color, maxWidth: this.state.contentWidth })
    this.state.currentY += 3
    this.setFillColor(color)
    this.doc.rect(this.dimensions.margins.left, this.state.currentY, 30, 0.5, 'F')
    this.state.currentY += 6
  }

  // ============================================================================
  // TEMPLATE 3: Minimal/Jitin Nair (LaTeX lines 338-556)
  // Clean black/white, dash bullets (--), centered header
  // ============================================================================

  private generateMinimal(): void {
    // Centered name
    this.addText((this.data.personalInfo.name || 'Your Name').toUpperCase(), this.dimensions.width / 2, this.state.currentY, {
      fontSize: 22, fontWeight: 'bold', align: 'center', maxWidth: this.state.contentWidth
    })
    this.state.currentY += 9

    // Contact with icons
    const contact = [
      this.data.links.filter(l => l.url).slice(0, 1).map(l => l.name || 'GitHub'),
      this.data.links.filter(l => l.url).slice(1, 2).map(l => l.name || 'LinkedIn'),
      this.data.personalInfo.email,
      this.data.personalInfo.phone
    ].flat().filter(Boolean).join('  |  ')

    this.addText(contact, this.dimensions.width / 2, this.state.currentY, { fontSize: 8, align: 'center', color: '#333333', maxWidth: this.state.contentWidth })
    this.state.currentY += 10

    // Summary
    if (this.data.personalInfo.summary) {
      this.addMinimalSectionHeader('Summary')
      const h = this.addText(this.data.personalInfo.summary, this.dimensions.margins.left, this.state.currentY, {
        fontSize: 9, maxWidth: this.state.contentWidth
      })
      this.state.currentY += h + 5
    }

    // Work Experience with dash bullets
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addMinimalSectionHeader('Work Experience')
      this.data.experience.filter(e => e.jobTitle).slice(0, 5).forEach(exp => {
        this.checkPageBreak(25)
        this.addText(exp.jobTitle, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold', maxWidth: this.state.contentWidth - 40 })
        this.addText(exp.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, { fontSize: 9, align: 'right', maxWidth: 40 })
        this.state.currentY += 5

        if (exp.responsibilities) {
          this.renderFormattedBodyText(exp.responsibilities, this.dimensions.margins.left, this.state.contentWidth, {
            fontSize: 9,
            color: '#333333'
          })
        }
        this.state.currentY += 4
      })
    }

    // Projects
    if (this.data.projects.some(p => p.name)) {
      this.addMinimalSectionHeader('Projects')
      this.data.projects.filter(p => p.name).slice(0, 5).forEach(proj => {
        this.checkPageBreak(20)
        this.addText(proj.name, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold', maxWidth: this.state.contentWidth })
        this.state.currentY += 4
        if (proj.description) {
          const h = this.addText(proj.description, this.dimensions.margins.left, this.state.currentY, {
            fontSize: 9, maxWidth: this.state.contentWidth, color: '#333333'
          })
          this.state.currentY += h + 3
        }
      })
      this.state.currentY += 2
    }

    // Education (tabular style)
    if (this.data.education.some(e => e.school)) {
      this.addMinimalSectionHeader('Education')
      this.data.education.filter(e => e.school).forEach(edu => {
        this.checkPageBreak(15)
        this.addText(edu.date, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, maxWidth: 30 })
        this.addText(`${edu.degree} at ${edu.school}`, this.dimensions.margins.left + 35, this.state.currentY, { fontSize: 9, maxWidth: this.state.contentWidth - 65 })
        if (edu.gpa) {
          this.addText(`(GPA: ${edu.gpa})`, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
            fontSize: 9, align: 'right', color: '#666666', maxWidth: 30
          })
        }
        this.state.currentY += 5
      })
      this.state.currentY += 3
    }

    // Skills (tabular)
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addMinimalSectionHeader('Skills')
      const labelWidth = 30
      const valueWidth = this.state.contentWidth - labelWidth - 5

      if (this.data.skills.languages) {
        this.addText('Languages', this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold', maxWidth: labelWidth })
        const h = this.addText(this.data.skills.languages, this.dimensions.margins.left + labelWidth + 5, this.state.currentY, { fontSize: 9, maxWidth: valueWidth })
        this.state.currentY += Math.max(5, h + 2)
      }
      if (this.data.skills.frameworks) {
        this.addText('Frameworks', this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold', maxWidth: labelWidth })
        const h = this.addText(this.data.skills.frameworks, this.dimensions.margins.left + labelWidth + 5, this.state.currentY, { fontSize: 9, maxWidth: valueWidth })
        this.state.currentY += Math.max(5, h + 2)
      }
      if (this.data.skills.tools) {
        this.addText('Tools', this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold', maxWidth: labelWidth })
        const h = this.addText(this.data.skills.tools, this.dimensions.margins.left + labelWidth + 5, this.state.currentY, { fontSize: 9, maxWidth: valueWidth })
        this.state.currentY += Math.max(5, h + 2)
      }
    }

    // Footer with date
    this.addText(`Last updated: ${new Date().toLocaleDateString()}`, this.dimensions.width / 2, this.dimensions.height - 10, {
      fontSize: 7, align: 'center', color: '#888888', maxWidth: this.state.contentWidth
    })
  }

  private addMinimalSectionHeader(title: string): void {
    this.checkPageBreak(15)
    this.addText(title.toUpperCase(), this.dimensions.margins.left, this.state.currentY, { fontSize: 12, fontWeight: 'bold', maxWidth: this.state.contentWidth })
    this.state.currentY += 4
    this.addLine(this.state.currentY, '#000000')
    this.state.currentY += 6
  }

  // ============================================================================
  // TEMPLATE 4: Modern/Anubhav Singh (LaTeX lines 557-739)
  // Left-aligned header, skills with dotted alignment (·····), circle bullets
  // ============================================================================

  private generateModern(): void {
    // Left-aligned header with links
    this.addText(this.data.personalInfo.name || 'Your Name', this.dimensions.margins.left, this.state.currentY, {
      fontSize: 20, fontWeight: 'bold', maxWidth: this.state.contentWidth * 0.6
    })

    this.addText(`Email: ${this.data.personalInfo.email || ''}`, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
      fontSize: 8, align: 'right', color: this.template.colors.secondary, maxWidth: this.state.contentWidth * 0.4
    })
    this.state.currentY += 6

    if (this.data.links.length > 0) {
      this.addText(`Portfolio: ${this.data.links[0]?.name || this.data.links[0]?.url || ''}`, this.dimensions.margins.left, this.state.currentY, {
        fontSize: 8, color: this.template.colors.secondary, maxWidth: this.state.contentWidth * 0.5
      })
      this.addText(`Mobile: ${this.data.personalInfo.phone || ''}`, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
        fontSize: 8, align: 'right', color: this.template.colors.secondary, maxWidth: this.state.contentWidth * 0.4
      })
      this.state.currentY += 5
    }
    if (this.data.links.length > 1) {
      this.addText(`Github: ${this.data.links[1]?.name || this.data.links[1]?.url || ''}`, this.dimensions.margins.left, this.state.currentY, {
        fontSize: 8, color: this.template.colors.secondary, maxWidth: this.state.contentWidth
      })
      this.state.currentY += 5
    }
    this.state.currentY += 4

    // Education
    if (this.data.education.some(e => e.school)) {
      this.addModernSectionHeader('Education')
      this.data.education.filter(e => e.school).forEach(edu => {
        this.checkPageBreak(15)
        this.addText(edu.school, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold', maxWidth: this.state.contentWidth - 40 })
        this.addText(edu.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
          fontSize: 9, align: 'right', color: this.template.colors.secondary, maxWidth: 40
        })
        this.state.currentY += 5
        this.addText(`${edu.degree}${edu.gpa ? `; GPA: ${edu.gpa}` : ''}`, this.dimensions.margins.left, this.state.currentY, {
          fontSize: 9, fontStyle: 'italic', color: this.template.colors.secondary, maxWidth: this.state.contentWidth
        })
        this.state.currentY += 6
      })
    }

    // Skills Summary with dotted leaders
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addModernSectionHeader('Skills Summary')
      const skills = [
        { label: 'Languages', value: this.data.skills.languages },
        { label: 'Frameworks', value: this.data.skills.frameworks },
        { label: 'Tools', value: this.data.skills.tools }
      ]

      const labelWidth = 35
      const valueX = this.dimensions.margins.left + labelWidth + 5
      const valueWidth = this.state.contentWidth - labelWidth - 5

      skills.forEach(skill => {
        if (skill.value) {
          this.checkPageBreak(10)
          this.addText(skill.label, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold', maxWidth: labelWidth })
          // Dotted leader simulation
          this.addText('.............................', this.dimensions.margins.left + 25, this.state.currentY, { fontSize: 9, color: '#e5e7eb', maxWidth: 10 })

          const h = this.addText(skill.value, valueX, this.state.currentY, { fontSize: 9, maxWidth: valueWidth })
          this.state.currentY += h + 2
        }
      })
      this.state.currentY += 3
    }

    // Experience with circle bullets
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addModernSectionHeader('Experience')
      this.data.experience.filter(e => e.jobTitle).slice(0, 5).forEach(exp => {
        this.checkPageBreak(25)
        this.addText(exp.company, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold', maxWidth: this.state.contentWidth - 40 })
        this.addText(exp.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
          fontSize: 9, align: 'right', color: this.template.colors.secondary, maxWidth: 40
        })
        this.state.currentY += 5
        this.addText(exp.jobTitle, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontStyle: 'italic', maxWidth: this.state.contentWidth })
        this.state.currentY += 5

        if (exp.responsibilities) {
          this.renderFormattedBodyText(exp.responsibilities, this.dimensions.margins.left, this.state.contentWidth, {
            fontSize: 9,
            color: this.template.colors.text
          })
        }
        this.state.currentY += 4
      })
    }

    // Projects with inline tech
    if (this.data.projects.some(p => p.name)) {
      this.addModernSectionHeader('Projects')
      this.data.projects.filter(p => p.name).slice(0, 5).forEach(proj => {
        this.checkPageBreak(10)
        const text = `${proj.name}${proj.technologies ? ` (${proj.technologies})` : ''}${proj.description ? `: ${proj.description}` : ''}`
        const h = this.addText(text, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, maxWidth: this.state.contentWidth })
        this.state.currentY += h + 3
      })
      this.state.currentY += 2
    }

    // Honors
    if (this.data.certifications.some(c => c.name)) {
      this.addModernSectionHeader('Honors and Awards')
      this.data.certifications.filter(c => c.name).forEach(cert => {
        this.checkPageBreak(8)
        this.addText(`• ${cert.name}${cert.date ? ` - ${cert.date}` : ''}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, maxWidth: this.state.contentWidth })
        this.state.currentY += 5
      })
    }
  }

  private addModernSectionHeader(title: string): void {
    this.checkPageBreak(15)
    this.addText(title.toUpperCase(), this.dimensions.margins.left, this.state.currentY, { fontSize: 11, fontWeight: 'bold', maxWidth: this.state.contentWidth })
    this.state.currentY += 4
    this.addLine(this.state.currentY, this.template.colors.primary)
    this.state.currentY += 6
  }

  // ============================================================================
  // TEMPLATE 5: Photo/LuxSleek (LaTeX lines 740-933)
  // Two-column: 33% dark navy sidebar, 67% white main content
  // ============================================================================

  private generatePhoto(): void {
    const sidebarWidth = this.dimensions.width * 0.33
    const mainX = sidebarWidth + 8
    const mainWidth = this.dimensions.width - mainX - this.dimensions.margins.right
    const navy = this.template.colors.primary // #304263

    // Draw sidebar background
    this.setFillColor(navy)
    this.doc.rect(0, 0, sidebarWidth, this.dimensions.height, 'F')

    // Sidebar content
    let sideY = 20

    // Profile Image
    if (this.data.personalInfo.profileImage) {
      try {
        const imgSize = 45
        const imgX = (sidebarWidth - imgSize) / 2
        // circular clip
        this.doc.circle(imgX + imgSize / 2, sideY + imgSize / 2, imgSize / 2, 'F')
        this.doc.addImage(this.data.personalInfo.profileImage, imgX, sideY, imgSize, imgSize)
        sideY += imgSize + 10
      } catch (e) {
        console.warn('Could not add profile image', e)
      }
    }

    // Name in sidebar (white text)
    const nameParts = (this.data.personalInfo.name || 'First Last').split(' ')
    this.addText(nameParts[0] || 'First', 10, sideY, { fontSize: 14, color: '#ffffff', maxWidth: sidebarWidth - 20 })

    sideY += 6
    this.addText((nameParts.slice(1).join(' ') || 'Last').toUpperCase(), 10, sideY, {
      fontSize: 14, fontWeight: 'bold', color: '#ffffff', maxWidth: sidebarWidth - 20
    })
    sideY += 15

    // Profile section
    if (this.data.personalInfo.summary) {
      this.addSidebarHeader('Profile', sideY, sidebarWidth)
      sideY += 8
      const h = this.addText(this.data.personalInfo.summary.substring(0, 300), 10, sideY, {
        fontSize: 8, color: '#e0e0e0', maxWidth: sidebarWidth - 20
      })
      sideY += h + 8
    }

    // Contact
    this.addSidebarHeader('Contact', sideY, sidebarWidth)
    sideY += 8

    if (this.data.personalInfo.phone) {
      this.addText(this.data.personalInfo.phone, 10, sideY, { fontSize: 8, color: '#e0e0e0', maxWidth: sidebarWidth - 20 })
      sideY += 5
    }
    if (this.data.personalInfo.email) {
      this.addText(this.data.personalInfo.email, 10, sideY, { fontSize: 8, color: '#e0e0e0', maxWidth: sidebarWidth - 20 })
      sideY += 5
    }
    if (this.data.personalInfo.location) {
      this.addText(this.data.personalInfo.location, 10, sideY, { fontSize: 8, color: '#e0e0e0', maxWidth: sidebarWidth - 20 })
      sideY += 5
    }

    this.data.links.slice(0, 2).forEach(link => {
      if (link.url) {
        this.addText(link.url.replace(/^https?:\/\//, ''), 10, sideY, { fontSize: 8, color: '#e0e0e0', maxWidth: sidebarWidth - 20 })
        sideY += 5
      }
    })
    sideY += 8

    // Skills in sidebar
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addSidebarHeader('Skills', sideY, sidebarWidth)
      sideY += 8

      const skills = [
        ...(this.data.skills.languages?.split(',') || []),
        ...(this.data.skills.frameworks?.split(',') || [])
      ].slice(0, 8)

      skills.forEach(skill => {
        if (skill.trim()) {
          this.addText(`• ${skill.trim()}`, 10, sideY, { fontSize: 8, color: '#e0e0e0', maxWidth: sidebarWidth - 20 })
          sideY += 5
        }
      })
    }

    // Main Content
    this.state.currentY = 20

    // Experience
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addMainSectionHeader('Experience', mainX, mainWidth)
      this.data.experience.filter(e => e.jobTitle).slice(0, 5).forEach(exp => {
        // Main content page logic for sidebar layout is tricky...
        // Ideally we check page break and redraw sidebar if needed.
        if (this.state.currentY + 25 > this.dimensions.height) {
          this.addPage()
          // Redraw sidebar on new page
          this.setFillColor(navy)
          this.doc.rect(0, 0, sidebarWidth, this.dimensions.height, 'F')
          this.state.currentY = 20
        }

        this.addText(exp.jobTitle, mainX, this.state.currentY, { fontSize: 11, fontWeight: 'bold', color: navy, maxWidth: mainWidth })
        this.state.currentY += 5

        this.addText(`${exp.company} | ${exp.date}`, mainX, this.state.currentY, { fontSize: 9, color: this.template.colors.secondary, maxWidth: mainWidth })
        this.state.currentY += 5

        if (exp.responsibilities) {
          const h = this.addText(exp.responsibilities, mainX, this.state.currentY, {
            fontSize: 9, color: this.template.colors.text, maxWidth: mainWidth
          })
          this.state.currentY += h + 6
        } else {
          this.state.currentY += 4
        }
      })
    }

    // Projects
    if (this.data.projects.some(p => p.name)) {
      this.addMainSectionHeader('Projects', mainX, mainWidth)
      this.data.projects.filter(p => p.name).slice(0, 4).forEach(proj => {
        if (this.state.currentY + 20 > this.dimensions.height) {
          this.addPage()
          this.setFillColor(navy)
          this.doc.rect(0, 0, sidebarWidth, this.dimensions.height, 'F')
          this.state.currentY = 20
        }

        this.addText(proj.name, mainX, this.state.currentY, { fontSize: 10, fontWeight: 'bold', color: navy, maxWidth: mainWidth })
        this.state.currentY += 4

        if (proj.description) {
          const h = this.addText(proj.description, mainX, this.state.currentY, {
            fontSize: 9, maxWidth: mainWidth
          })
          this.state.currentY += h + 4
        }
      })
    }

    // Education
    if (this.data.education.some(e => e.school)) {
      this.addMainSectionHeader('Education', mainX, mainWidth)
      this.data.education.filter(e => e.school).forEach(edu => {
        if (this.state.currentY + 15 > this.dimensions.height) {
          this.addPage()
          this.setFillColor(navy)
          this.doc.rect(0, 0, sidebarWidth, this.dimensions.height, 'F')
          this.state.currentY = 20
        }

        this.addText(edu.school, mainX, this.state.currentY, { fontSize: 10, fontWeight: 'bold', color: navy, maxWidth: mainWidth })
        this.state.currentY += 4
        this.addText(`${edu.degree} | ${edu.date}`, mainX, this.state.currentY, { fontSize: 9, maxWidth: mainWidth })
        this.state.currentY += 6
      })
    }
  }

  private addSidebarHeader(title: string, y: number, width: number): void {
    this.addText(title.toUpperCase(), 10, y, {
      fontSize: 10, fontWeight: 'bold', color: '#ffffff', maxWidth: width - 20
    })
    this.setDrawColor('#4a6fa5')
    this.doc.setLineWidth(0.5)
    this.doc.line(10, y + 4, width - 10, y + 4)
  }

  private addMainSectionHeader(title: string, x: number, width: number): void {
    if (this.state.currentY + 15 > this.dimensions.height) {
      this.addPage()
      // Redraw sidebar background
      this.setFillColor(this.template.colors.primary)
      this.doc.rect(0, 0, 70, this.dimensions.height, 'F') // 70 is approx sidebar width
      this.state.currentY = 20
    }

    this.addText(title.toUpperCase(), x, this.state.currentY, {
      fontSize: 12, fontWeight: 'bold', color: this.template.colors.primary, maxWidth: width
    })
    this.state.currentY += 4
    this.setDrawColor(this.template.colors.secondary)
    this.doc.setLineWidth(0.5)
    this.doc.line(x, this.state.currentY, x + width, this.state.currentY)
    this.state.currentY += 6
  }

  public download(filename: string): void {
    this.generate().save(filename)
  }

  public getPageCount(): number {
    return this.state.pageNumber
  }
}

/**
 * Standalone function to download PDF
 */
export const downloadATSResumePDF = (
  template: ATSTemplateConfig,
  data: ResumeData,
  filename: string
): void => {
  const generator = new ATSPDFGenerator(template, data)
  generator.download(filename)
}
