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

    const lineHeight = fontSize * 0.4

    if (maxWidth && text.length > 0) {
      const lines = this.doc.splitTextToSize(text, maxWidth)
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
    const startY = this.state.currentY

    // Default bullet style
    const fontSize = options.fontSize || 9
    const lineHeight = fontSize * 0.45

    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed) return

      // Check if line is a bullet point (starts with - or *)
      const isBullet = /^[-*]\s/.test(trimmed)
      const cleanLine = isBullet ? trimmed.replace(/^[-*]\s/, '') : trimmed

      const currentX = isBullet ? x + 3 : x
      const currentMaxWidth = isBullet ? maxWidth - 3 : maxWidth

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

      this.state.currentY += h + (isBullet ? 2 : 1) // Add slightly more spacing after bullets
      totalHeight += h + (isBullet ? 2 : 1)
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
      align: 'center'
    })
    this.state.currentY += 7

    // Contact with pipe separators
    const contactParts = [
      this.data.personalInfo.phone,
      this.data.personalInfo.email,
      ...this.data.links.filter(l => l.url).slice(0, 2).map(l => l.name || l.url)
    ].filter(Boolean)

    this.addText(contactParts.join(' | '), this.dimensions.width / 2, this.state.currentY, {
      fontSize: 9,
      color: colors.secondary,
      align: 'center'
    })
    this.state.currentY += 6

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
        this.addText(`Programming Languages: ${this.data.skills.languages}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold' })
        this.state.currentY += 4
      }
      if (this.data.skills.frameworks) {
        this.addText(`Frameworks & Libraries: ${this.data.skills.frameworks}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold' })
        this.state.currentY += 4
      }
      if (this.data.skills.tools) {
        this.addText(`Tools & Platforms: ${this.data.skills.tools}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold' })
        this.state.currentY += 4
      }
      this.state.currentY += 2
    }

    // Projects
    if (this.data.projects.some(p => p.name)) {
      this.addClassicSectionHeader('PROJECTS')
      this.data.projects.filter(p => p.name).slice(0, 3).forEach(proj => {
        this.checkPageBreak(15)
        this.addText(proj.name, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold' })
        if (proj.technologies) {
          this.addText(proj.technologies, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
            fontSize: 8, fontStyle: 'italic', color: colors.secondary, align: 'right'
          })
        }
        this.state.currentY += 4
        if (proj.description) {
          this.addText(`- ${proj.description}`, this.dimensions.margins.left + 3, this.state.currentY, { fontSize: 8, maxWidth: this.state.contentWidth - 6 })
          this.state.currentY += 5
        }
      })
    }

    // Experience
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addClassicSectionHeader('EXPERIENCE')
      this.data.experience.filter(e => e.jobTitle).slice(0, 3).forEach(exp => {
        this.checkPageBreak(20)
        this.addText(exp.jobTitle, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold' })
        this.addText(exp.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
          fontSize: 9, color: colors.secondary, align: 'right'
        })
        this.state.currentY += 4
        this.addText(exp.company, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontStyle: 'italic', color: colors.secondary })
        this.state.currentY += 4
        if (exp.responsibilities) {
          this.renderFormattedBodyText(exp.responsibilities, this.dimensions.margins.left, this.state.contentWidth, {
            fontSize: 8,
            color: colors.text
          })
        }
        this.state.currentY += 2
      })
    }

    // Education
    if (this.data.education.some(e => e.school)) {
      this.addClassicSectionHeader('EDUCATION')
      this.data.education.filter(e => e.school).forEach(edu => {
        this.checkPageBreak(10)
        this.addText(edu.school, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold' })
        this.addText(edu.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
          fontSize: 9, color: colors.secondary, align: 'right'
        })
        this.state.currentY += 4
        this.addText(edu.degree, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontStyle: 'italic' })
        this.state.currentY += 5
      })
    }

    // Certifications
    if (this.data.certifications.some(c => c.name)) {
      this.addClassicSectionHeader('CERTIFICATIONS')
      this.data.certifications.filter(c => c.name).forEach(cert => {
        this.addText(`- ${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 9 })
        this.state.currentY += 4
      })
    }
  }

  private addClassicSectionHeader(title: string): void {
    this.checkPageBreak(15)
    this.addText(title, this.dimensions.margins.left, this.state.currentY, {
      fontSize: 11,
      fontWeight: 'bold',
      color: this.template.colors.primary
    })
    this.state.currentY += 3
    this.addLine(this.state.currentY, this.template.colors.primary)
    this.state.currentY += 5
  }

  // ============================================================================
  // TEMPLATE 2: Creative/MaltaCV (LaTeX lines 131-337)
  // Colorful flame orange, bio section, multicol skills
  // ============================================================================

  private generateCreative(): void {
    const flame = this.template.colors.primary // #e85d04

    // Name with color
    this.addText(this.data.personalInfo.name || 'Your Name', this.dimensions.margins.left, this.state.currentY, {
      fontSize: 22, fontWeight: 'bold', color: flame
    })
    this.state.currentY += 7

    // Tagline/Title
    this.addText(this.data.personalInfo.title || 'Professional Title', this.dimensions.margins.left, this.state.currentY, {
      fontSize: 11, fontStyle: 'italic', color: this.template.colors.secondary
    })
    this.state.currentY += 6

    // Contact row
    const contactParts = [
      this.data.personalInfo.email && `Email: ${this.data.personalInfo.email}`,
      this.data.personalInfo.phone && `Phone: ${this.data.personalInfo.phone}`,
      ...this.data.links.filter(l => l.url).slice(0, 2).map(l => l.name || l.url)
    ].filter(Boolean).join('   ')
    this.addText(contactParts, this.dimensions.margins.left, this.state.currentY, { fontSize: 8, color: this.template.colors.secondary })
    this.state.currentY += 6

    // Bio section with colored line
    if (this.data.personalInfo.summary) {
      this.setFillColor(flame)
      this.doc.rect(this.dimensions.margins.left, this.state.currentY, this.state.contentWidth, 0.5, 'F')
      this.state.currentY += 4
      const h = this.addText(this.data.personalInfo.summary, this.dimensions.margins.left, this.state.currentY, {
        fontSize: 9, maxWidth: this.state.contentWidth
      })
      this.state.currentY += h + 4
    }

    // Skills section
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addCreativeSectionHeader('SKILLS', flame)
      const allSkills = [
        ...(this.data.skills.languages?.split(',') || []),
        ...(this.data.skills.frameworks?.split(',') || []),
        ...(this.data.skills.tools?.split(',') || [])
      ].filter(s => s.trim()).slice(0, 10)

      // Grid layout
      let col = 0
      const colWidth = this.state.contentWidth / 5
      allSkills.forEach(skill => {
        const x = this.dimensions.margins.left + (col * colWidth)
        this.addText(skill.trim(), x, this.state.currentY, { fontSize: 8 })
        col++
        if (col >= 5) {
          col = 0
          this.state.currentY += 4
        }
      })
      if (col > 0) this.state.currentY += 4
      this.state.currentY += 3
    }

    // Education
    if (this.data.education.some(e => e.school)) {
      this.addCreativeSectionHeader('EDUCATION', flame)
      this.data.education.filter(e => e.school).forEach(edu => {
        this.addText(edu.degree, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold' })
        this.state.currentY += 3
        this.addText(`${edu.school} | ${edu.date}`, this.dimensions.margins.left, this.state.currentY, {
          fontSize: 8, color: this.template.colors.secondary
        })
        this.state.currentY += 5
      })
    }

    // Experience
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addCreativeSectionHeader('EXPERIENCE', flame)
      this.data.experience.filter(e => e.jobTitle).slice(0, 3).forEach(exp => {
        this.checkPageBreak(15)
        this.addText(`${exp.jobTitle} at ${exp.company}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold' })
        this.addText(exp.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
          fontSize: 8, align: 'right', color: this.template.colors.secondary
        })
        this.state.currentY += 4
        if (exp.responsibilities) {
          this.renderFormattedBodyText(exp.responsibilities, this.dimensions.margins.left, this.state.contentWidth, {
            fontSize: 8,
            color: this.template.colors.text
          })
        }
        this.state.currentY += 3
      })
    }

    // Awards/Certifications
    if (this.data.certifications.some(c => c.name)) {
      this.addCreativeSectionHeader('AWARDS', flame)
      this.data.certifications.filter(c => c.name).slice(0, 3).forEach(cert => {
        this.addText(cert.name, this.dimensions.margins.left, this.state.currentY, { fontSize: 8, fontWeight: 'bold' })
        if (cert.issuer) {
          this.addText(cert.issuer, this.dimensions.margins.left + 50, this.state.currentY, { fontSize: 8, color: this.template.colors.secondary })
        }
        this.state.currentY += 4
      })
    }
  }

  private addCreativeSectionHeader(title: string, color: string): void {
    this.checkPageBreak(12)
    this.addText(title, this.dimensions.margins.left, this.state.currentY, { fontSize: 11, fontWeight: 'bold', color })
    this.state.currentY += 3
    this.setFillColor(color)
    this.doc.rect(this.dimensions.margins.left, this.state.currentY, 30, 0.5, 'F')
    this.state.currentY += 5
  }

  // ============================================================================
  // TEMPLATE 3: Minimal/Jitin Nair (LaTeX lines 338-556)
  // Clean black/white, dash bullets (--), centered header
  // ============================================================================

  private generateMinimal(): void {
    // Centered name
    this.addText(this.data.personalInfo.name || 'Your Name', this.dimensions.width / 2, this.state.currentY, {
      fontSize: 22, fontWeight: 'bold', align: 'center'
    })
    this.state.currentY += 8

    // Contact with icons
    const contact = [
      this.data.links.filter(l => l.url).slice(0, 1).map(l => l.name || 'GitHub'),
      this.data.links.filter(l => l.url).slice(1, 2).map(l => l.name || 'LinkedIn'),
      this.data.personalInfo.email,
      this.data.personalInfo.phone
    ].flat().filter(Boolean).join('  |  ')
    this.addText(contact, this.dimensions.width / 2, this.state.currentY, { fontSize: 8, align: 'center', color: '#333333' })
    this.state.currentY += 8

    // Summary
    if (this.data.personalInfo.summary) {
      this.addMinimalSectionHeader('Summary')
      const h = this.addText(this.data.personalInfo.summary, this.dimensions.margins.left, this.state.currentY, {
        fontSize: 9, maxWidth: this.state.contentWidth
      })
      this.state.currentY += h + 4
    }

    // Work Experience with dash bullets
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addMinimalSectionHeader('Work Experience')
      this.data.experience.filter(e => e.jobTitle).slice(0, 3).forEach(exp => {
        this.checkPageBreak(15)
        this.addText(exp.jobTitle, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold' })
        this.addText(exp.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, { fontSize: 9, align: 'right' })
        this.state.currentY += 4
        if (exp.responsibilities) {
          this.renderFormattedBodyText(exp.responsibilities, this.dimensions.margins.left, this.state.contentWidth, {
            fontSize: 8,
            color: '#333333'
          })
        }
        this.state.currentY += 2
      })
    }

    // Projects
    if (this.data.projects.some(p => p.name)) {
      this.addMinimalSectionHeader('Projects')
      this.data.projects.filter(p => p.name).slice(0, 3).forEach(proj => {
        this.checkPageBreak(10)
        this.addText(proj.name, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold' })
        this.state.currentY += 3
        if (proj.description) {
          const h = this.addText(proj.description, this.dimensions.margins.left, this.state.currentY, {
            fontSize: 8, maxWidth: this.state.contentWidth, color: '#333333'
          })
          this.state.currentY += h + 2
        }
      })
      this.state.currentY += 2
    }

    // Education (tabular style)
    if (this.data.education.some(e => e.school)) {
      this.addMinimalSectionHeader('Education')
      this.data.education.filter(e => e.school).forEach(edu => {
        this.addText(edu.date, this.dimensions.margins.left, this.state.currentY, { fontSize: 9 })
        this.addText(`${edu.degree} at ${edu.school}`, this.dimensions.margins.left + 30, this.state.currentY, { fontSize: 9 })
        if (edu.gpa) {
          this.addText(`(GPA: ${edu.gpa})`, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
            fontSize: 8, align: 'right', color: '#666666'
          })
        }
        this.state.currentY += 4
      })
      this.state.currentY += 2
    }

    // Skills (tabular)
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addMinimalSectionHeader('Skills')
      if (this.data.skills.languages) {
        this.addText('Languages', this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold' })
        this.addText(this.data.skills.languages, this.dimensions.margins.left + 25, this.state.currentY, { fontSize: 9 })
        this.state.currentY += 4
      }
      if (this.data.skills.frameworks) {
        this.addText('Frameworks', this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold' })
        this.addText(this.data.skills.frameworks, this.dimensions.margins.left + 25, this.state.currentY, { fontSize: 9 })
        this.state.currentY += 4
      }
      if (this.data.skills.tools) {
        this.addText('Tools', this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold' })
        this.addText(this.data.skills.tools, this.dimensions.margins.left + 25, this.state.currentY, { fontSize: 9 })
        this.state.currentY += 4
      }
    }

    // Footer with date
    this.addText(`Last updated: ${new Date().toLocaleDateString()}`, this.dimensions.width / 2, this.dimensions.height - 10, {
      fontSize: 7, align: 'center', color: '#888888'
    })
  }

  private addMinimalSectionHeader(title: string): void {
    this.checkPageBreak(12)
    this.addText(title.toUpperCase(), this.dimensions.margins.left, this.state.currentY, { fontSize: 12, fontWeight: 'bold' })
    this.state.currentY += 3
    this.addLine(this.state.currentY, '#000000')
    this.state.currentY += 5
  }

  // ============================================================================
  // TEMPLATE 4: Modern/Anubhav Singh (LaTeX lines 557-739)
  // Left-aligned header, skills with dotted alignment (·····), circle bullets
  // ============================================================================

  private generateModern(): void {
    // Left-aligned header with links
    this.addText(this.data.personalInfo.name || 'Your Name', this.dimensions.margins.left, this.state.currentY, {
      fontSize: 20, fontWeight: 'bold'
    })
    this.addText(`Email: ${this.data.personalInfo.email || ''}`, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
      fontSize: 8, align: 'right', color: this.template.colors.secondary
    })
    this.state.currentY += 5

    if (this.data.links.length > 0) {
      this.addText(`Portfolio: ${this.data.links[0]?.name || this.data.links[0]?.url || ''}`, this.dimensions.margins.left, this.state.currentY, {
        fontSize: 8, color: this.template.colors.secondary
      })
      this.addText(`Mobile: ${this.data.personalInfo.phone || ''}`, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
        fontSize: 8, align: 'right', color: this.template.colors.secondary
      })
      this.state.currentY += 4
    }
    if (this.data.links.length > 1) {
      this.addText(`Github: ${this.data.links[1]?.name || this.data.links[1]?.url || ''}`, this.dimensions.margins.left, this.state.currentY, {
        fontSize: 8, color: this.template.colors.secondary
      })
      this.state.currentY += 4
    }
    this.state.currentY += 3

    // Education
    if (this.data.education.some(e => e.school)) {
      this.addModernSectionHeader('Education')
      this.data.education.filter(e => e.school).forEach(edu => {
        this.addText(edu.school, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold' })
        this.addText(edu.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
          fontSize: 9, align: 'right', color: this.template.colors.secondary
        })
        this.state.currentY += 4
        this.addText(`${edu.degree}${edu.gpa ? `; GPA: ${edu.gpa}` : ''}`, this.dimensions.margins.left, this.state.currentY, {
          fontSize: 9, fontStyle: 'italic', color: this.template.colors.secondary
        })
        this.state.currentY += 5
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
      skills.forEach(skill => {
        if (skill.value) {
          this.addText(skill.label, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontWeight: 'bold' })
          this.addText('.....', this.dimensions.margins.left + 25, this.state.currentY, { fontSize: 9, color: '#cccccc' })
          this.addText(skill.value, this.dimensions.margins.left + 35, this.state.currentY, { fontSize: 9 })
          this.state.currentY += 4
        }
      })
      this.state.currentY += 2
    }

    // Experience with circle bullets
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addModernSectionHeader('Experience')
      this.data.experience.filter(e => e.jobTitle).slice(0, 3).forEach(exp => {
        this.checkPageBreak(15)
        this.addText(exp.company, this.dimensions.margins.left, this.state.currentY, { fontSize: 10, fontWeight: 'bold' })
        this.addText(exp.date, this.dimensions.width - this.dimensions.margins.right, this.state.currentY, {
          fontSize: 9, align: 'right', color: this.template.colors.secondary
        })
        this.state.currentY += 4
        this.addText(exp.jobTitle, this.dimensions.margins.left, this.state.currentY, { fontSize: 9, fontStyle: 'italic' })
        this.state.currentY += 4
        if (exp.responsibilities) {
          this.renderFormattedBodyText(exp.responsibilities, this.dimensions.margins.left, this.state.contentWidth, {
            fontSize: 8,
            color: this.template.colors.text
          })
        }
        this.state.currentY += 2
      })
    }

    // Projects with inline tech
    if (this.data.projects.some(p => p.name)) {
      this.addModernSectionHeader('Projects')
      this.data.projects.filter(p => p.name).slice(0, 4).forEach(proj => {
        this.checkPageBreak(8)
        const text = `${proj.name}${proj.technologies ? ` (${proj.technologies})` : ''}${proj.description ? `: ${proj.description}` : ''}`
        const h = this.addText(text, this.dimensions.margins.left, this.state.currentY, { fontSize: 8, maxWidth: this.state.contentWidth })
        this.state.currentY += h + 2
      })
      this.state.currentY += 2
    }

    // Honors
    if (this.data.certifications.some(c => c.name)) {
      this.addModernSectionHeader('Honors and Awards')
      this.data.certifications.filter(c => c.name).forEach(cert => {
        this.addText(`- ${cert.name}${cert.date ? ` - ${cert.date}` : ''}`, this.dimensions.margins.left, this.state.currentY, { fontSize: 8 })
        this.state.currentY += 4
      })
    }
  }

  private addModernSectionHeader(title: string): void {
    this.checkPageBreak(12)
    this.addText(title.toUpperCase(), this.dimensions.margins.left, this.state.currentY, { fontSize: 11, fontWeight: 'bold' })
    this.state.currentY += 3
    this.addLine(this.state.currentY, this.template.colors.primary)
    this.state.currentY += 5
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

    // Name in sidebar (white text)
    const nameParts = (this.data.personalInfo.name || 'First Last').split(' ')
    this.addText(nameParts[0] || 'First', 10, sideY, { fontSize: 14, color: '#ffffff' })
    this.addText((nameParts.slice(1).join(' ') || 'Last').toUpperCase(), 10, sideY + 5, {
      fontSize: 14, fontWeight: 'bold', color: '#ffffff'
    })
    sideY += 15

    // Profile section
    if (this.data.personalInfo.summary) {
      this.addSidebarHeader('Profile', sideY, sidebarWidth)
      sideY += 6
      const h = this.addText(this.data.personalInfo.summary.substring(0, 200), 10, sideY, {
        fontSize: 7, color: '#e0e0e0', maxWidth: sidebarWidth - 20
      })
      sideY += h + 6
    }

    // Contact details
    this.addSidebarHeader('Contact Details', sideY, sidebarWidth)
    sideY += 6
    if (this.data.personalInfo.email) {
      this.addText(`> ${this.data.personalInfo.email}`, 10, sideY, { fontSize: 7, color: '#e0e0e0' })
      sideY += 4
    }
    if (this.data.personalInfo.phone) {
      this.addText(`> ${this.data.personalInfo.phone}`, 10, sideY, { fontSize: 7, color: '#e0e0e0' })
      sideY += 4
    }
    if (this.data.links.length > 0) {
      this.addText(`> ${this.data.links[0]?.name || this.data.links[0]?.url}`, 10, sideY, { fontSize: 7, color: '#e0e0e0' })
      sideY += 4
    }
    if (this.data.personalInfo.location) {
      this.addText(`> ${this.data.personalInfo.location}`, 10, sideY, { fontSize: 7, color: '#e0e0e0' })
      sideY += 4
    }
    sideY += 4

    // Skills with diamond bullets
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addSidebarHeader('Skills', sideY, sidebarWidth)
      sideY += 6
      const allSkills = [
        ...(this.data.skills.languages?.split(',').slice(0, 3) || []),
        ...(this.data.skills.frameworks?.split(',').slice(0, 2) || []),
        ...(this.data.skills.tools?.split(',').slice(0, 2) || [])
      ]
      allSkills.filter(s => s.trim()).forEach(skill => {
        this.addText(`* ${skill.trim()}`, 10, sideY, { fontSize: 7, color: '#e0e0e0' })
        sideY += 4
      })
    }

    // Main content (right side)
    let mainY = 20

    // Experience
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addPhotoSectionHeader('Experience', mainX, mainY, mainWidth)
      mainY += 7
      this.data.experience.filter(e => e.jobTitle).slice(0, 4).forEach(exp => {
        this.addText(exp.jobTitle.toUpperCase(), mainX, mainY, { fontSize: 9, fontWeight: 'bold', color: '#1f2937' })
        this.addText(exp.date, mainX + mainWidth, mainY, { fontSize: 7, fontWeight: 'bold', color: '#666666', align: 'right' })
        mainY += 4
        this.addText(`at ${exp.company}`, mainX, mainY, { fontSize: 8, fontStyle: 'italic', color: '#666666' })
        mainY += 4
        if (exp.responsibilities) {
          const line = exp.responsibilities.split('\n')[0]?.replace(/^[•\-]\s*/, '') || ''
          this.addText(`* ${line.substring(0, 100)}`, mainX, mainY, { fontSize: 7, color: '#666666' })
          mainY += 5
        }
        mainY += 2
      })
    }

    // Education
    if (this.data.education.some(e => e.school)) {
      this.addPhotoSectionHeader('Education', mainX, mainY, mainWidth)
      mainY += 7
      this.data.education.filter(e => e.school).forEach(edu => {
        this.addText(edu.degree.toUpperCase(), mainX, mainY, { fontSize: 9, fontWeight: 'bold', color: '#1f2937' })
        this.addText(edu.date, mainX + mainWidth, mainY, { fontSize: 7, fontWeight: 'bold', color: '#666666', align: 'right' })
        mainY += 4
        this.addText(`${edu.school}`, mainX, mainY, { fontSize: 8, fontStyle: 'italic', color: '#666666' })
        mainY += 5
      })
    }

    // Projects
    if (this.data.projects.some(p => p.name)) {
      this.addPhotoSectionHeader('Projects', mainX, mainY, mainWidth)
      mainY += 7
      this.data.projects.filter(p => p.name).slice(0, 3).forEach(proj => {
        this.addText(proj.name.toUpperCase(), mainX, mainY, { fontSize: 9, fontWeight: 'bold', color: '#1f2937' })
        mainY += 4
        if (proj.description) {
          this.addText(`* ${proj.description.substring(0, 80)}`, mainX, mainY, { fontSize: 7, color: '#666666' })
          mainY += 5
        }
      })
    }

    // Certifications
    if (this.data.certifications.some(c => c.name)) {
      this.addPhotoSectionHeader('Certifications', mainX, mainY, mainWidth)
      mainY += 7
      this.data.certifications.filter(c => c.name).forEach(cert => {
        this.addText(`* ${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`, mainX, mainY, { fontSize: 8 })
        mainY += 4
      })
    }
  }

  private addSidebarHeader(title: string, y: number, width: number): void {
    this.addText(title.toUpperCase(), 10, y, { fontSize: 8, fontWeight: 'bold', color: '#ffffff' })
    this.setDrawColor('#ffffff')
    this.doc.setLineWidth(0.2)
    this.doc.line(10, y + 2, width - 10, y + 2)
  }

  private addPhotoSectionHeader(title: string, x: number, y: number, width: number): void {
    const navy = this.template.colors.primary
    this.addText(title.toUpperCase(), x, y, { fontSize: 11, fontWeight: 'bold', color: navy })
    this.setFillColor(navy)
    this.doc.rect(x, y + 2, width, 0.5, 'F')
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  public download(filename?: string): void {
    const pdf = this.generate()
    const name = filename || this.generateFilename()
    pdf.save(name)
  }

  public async toBlob(): Promise<Blob> {
    const pdf = this.generate()
    return pdf.output('blob')
  }

  public toBase64(): string {
    const pdf = this.generate()
    return pdf.output('datauristring')
  }

  public getPageCount(): number {
    return this.state.pageNumber
  }

  public generateFilename(): string {
    const name = this.data.personalInfo.name || 'Resume'
    const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50)
    const date = new Date().toISOString().split('T')[0]
    return `${cleanName}_Resume_${date}.pdf`
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createATSPDFGenerator(
  template: ATSTemplateConfig,
  data: ResumeData
): ATSPDFGenerator {
  return new ATSPDFGenerator(template, data)
}

export async function downloadATSResumePDF(
  template: ATSTemplateConfig,
  data: ResumeData,
  filename?: string
): Promise<void> {
  const generator = new ATSPDFGenerator(template, data)
  generator.download(filename)
}
