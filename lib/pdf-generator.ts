import { jsPDF } from 'jspdf'
import type { Template } from '../app/types/templates'

interface ResumeData {
  personalInfo: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    summary: string
    profileImage?: string
  }
  links: Array<{ name: string; url: string }>
  education: Array<{ school: string; degree: string; date: string; gpa?: string }>
  experience: Array<{ jobTitle: string; company: string; date: string; responsibilities: string }>
  skills: {
    languages: string
    frameworks: string
    tools: string
  }
  projects: Array<{ name: string; description: string; technologies: string; link?: string }>
  certifications: Array<{ name: string; issuer: string; date: string }>
  references: Array<{ name: string; title: string; company: string; email: string; phone: string }>
}

export class PDFGenerator {
  private doc: jsPDF
  private template: Template
  private data: ResumeData
  private yPos: number = 20
  private pageWidth: number = 210 // A4 width in mm
  private pageHeight: number = 297 // A4 height in mm
  private margins = { left: 12, right: 12, top: 15, bottom: 15 }
  private contentWidth: number
  private maxContentHeight: number

  constructor(template: Template, data: ResumeData) {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.template = template
    this.data = data
    this.contentWidth = this.pageWidth - this.margins.left - this.margins.right
    this.maxContentHeight = this.pageHeight - this.margins.top - this.margins.bottom
  }

  // Utility methods
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  private setColor(color: string) {
    const rgb = this.hexToRgb(color)
    this.doc.setTextColor(rgb.r, rgb.g, rgb.b)
  }

  private setFillColor(color: string) {
    const rgb = this.hexToRgb(color)
    this.doc.setFillColor(rgb.r, rgb.g, rgb.b)
  }

  private setDrawColor(color: string) {
    const rgb = this.hexToRgb(color)
    this.doc.setDrawColor(rgb.r, rgb.g, rgb.b)
  }

  private addText(text: string, x: number, y: number, options?: {
    fontSize?: number
    fontStyle?: 'normal' | 'bold' | 'italic'
    color?: string
    align?: 'left' | 'center' | 'right'
    maxWidth?: number
    font?: 'helvetica' | 'times' | 'courier'
  }) {
    const fontSize = options?.fontSize || 10
    const fontStyle = options?.fontStyle || 'normal'
    const font = options?.font || 'helvetica'
    
    this.doc.setFont(font, fontStyle)
    this.doc.setFontSize(fontSize)
    
    if (options?.color) {
      this.setColor(options.color)
    }
    
    if (options?.maxWidth && text) {
      const lines = this.doc.splitTextToSize(text, options.maxWidth)
      this.doc.text(lines, x, y, { align: options?.align || 'left' })
      return Array.isArray(lines) ? lines.length * fontSize * 0.35 : fontSize * 0.35
    } else {
      this.doc.text(text, x, y, { align: options?.align || 'left' })
      return fontSize * 0.35
    }
  }

  // Template-specific generators that mirror the React components exactly
  generateClassicPDF(): jsPDF {
    this.doc.setFont('times', 'normal')
    
    // Header section - exactly like ClassicTemplate
    this.generateClassicHeader()
    
    // Calculate remaining space and distribute sections efficiently
    const remainingSpace = this.maxContentHeight - this.yPos + this.margins.top
    
    // Professional Summary
    if (this.data.personalInfo.summary && remainingSpace > 20) {
      this.generateClassicSection('PROFESSIONAL SUMMARY', () => {
        const height = this.addText(this.data.personalInfo.summary, this.margins.left, this.yPos, {
          fontSize: 9,
          maxWidth: this.contentWidth,
          font: 'times'
        })
        this.yPos += height + 3
      })
    }
    
    // Experience
    if (this.data.experience.some(exp => exp.jobTitle)) {
      this.generateClassicSection('PROFESSIONAL EXPERIENCE', () => {
        this.generateClassicExperience()
      })
    }
    
    // Education
    if (this.data.education.some(edu => edu.school)) {
      this.generateClassicSection('EDUCATION', () => {
        this.generateClassicEducation()
      })
    }
    
    // Skills
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.generateClassicSection('CORE COMPETENCIES', () => {
        this.generateClassicSkills()
      })
    }
    
    // Projects
    if (this.data.projects.some(proj => proj.name)) {
      this.generateClassicSection('PROJECTS', () => {
        this.generateClassicProjects()
      })
    }
    
    // Certifications
    if (this.data.certifications.some(cert => cert.name)) {
      this.generateClassicSection('CERTIFICATIONS', () => {
        this.generateClassicCertifications()
      })
    }
    
    return this.doc
  }

  generateModernPDF(): jsPDF {
    this.doc.setFont('helvetica', 'normal')
    
    // Modern header with colored accent
    this.generateModernHeader()
    
    // Two-column layout like ModernTemplate
    this.generateModernTwoColumnLayout()
    
    return this.doc
  }

  generateMinimalPDF(): jsPDF {
    this.doc.setFont('helvetica', 'normal')
    
    // Ultra-clean minimal header
    this.generateMinimalHeader()
    
    // Minimal sections with proper spacing
    this.generateMinimalContent()
    
    return this.doc
  }

  // Classic Template implementations
  private generateClassicHeader() {
    const startY = this.yPos

    // Name
    this.addText(this.data.personalInfo.name || 'Your Name', this.pageWidth / 2, this.yPos, {
      fontSize: 18,
      fontStyle: 'bold',
      color: '#374151',
      align: 'center',
      font: 'times'
    })
    this.yPos += 7

    // Title
    this.addText(this.data.personalInfo.title || 'Your Professional Title', this.pageWidth / 2, this.yPos, {
      fontSize: 12,
      color: '#4b5563',
      align: 'center',
      font: 'times'
    })
    this.yPos += 6

    // Contact info
    const contactParts = [
      this.data.personalInfo.email,
      this.data.personalInfo.phone,
      this.data.personalInfo.location
    ].filter(Boolean)
    
    const contactInfo = contactParts.join(' • ')
    this.addText(contactInfo, this.pageWidth / 2, this.yPos, {
      fontSize: 9,
      color: '#6b7280',
      align: 'center',
      font: 'times'
    })
    this.yPos += 5

    // Links
    if (this.data.links.some(link => link.name && link.url)) {
      const links = this.data.links
        .filter(link => link.name && link.url)
        .map(link => link.name)
        .join(' • ')
      
      this.addText(links, this.pageWidth / 2, this.yPos, {
        fontSize: 8,
        color: '#6b7280',
        align: 'center',
        font: 'times'
      })
      this.yPos += 4
    }

    // Add classic border line
    this.setDrawColor('#1f2937')
    this.doc.setLineWidth(0.8)
    this.doc.line(this.margins.left, this.yPos + 2, this.pageWidth - this.margins.right, this.yPos + 2)
    this.yPos += 6
  }

  private generateClassicSection(title: string, contentGenerator: () => void) {
    // Check if we have space for at least the section title
    if (this.yPos + 15 > this.pageHeight - this.margins.bottom) {
      return // Skip if not enough space
    }

    // Section title
    this.addText(title, this.margins.left, this.yPos, {
      fontSize: 11,
      fontStyle: 'bold',
      color: '#374151',
      font: 'times'
    })
    
    // Underline
    this.setDrawColor('#6b7280')
    this.doc.setLineWidth(0.3)
    this.doc.line(this.margins.left, this.yPos + 1, this.pageWidth - this.margins.right, this.yPos + 1)
    this.yPos += 6

    // Content
    contentGenerator()
    this.yPos += 2
  }

  private generateClassicExperience() {
    this.data.experience.filter(exp => exp.jobTitle).forEach((exp, index) => {
      if (this.yPos + 15 > this.pageHeight - this.margins.bottom) return

      // Job title and date
      this.addText(exp.jobTitle, this.margins.left, this.yPos, {
        fontSize: 10,
        fontStyle: 'bold',
        color: '#374151',
        font: 'times'
      })
      
      this.addText(exp.date, this.pageWidth - this.margins.right, this.yPos, {
        fontSize: 9,
        color: '#6b7280',
        align: 'right',
        font: 'times'
      })
      this.yPos += 4

      // Company
      this.addText(exp.company, this.margins.left, this.yPos, {
        fontSize: 9,
        color: '#6b7280',
        font: 'times'
      })
      this.yPos += 4

      // Responsibilities (truncated if needed)
      if (exp.responsibilities) {
        const maxLines = Math.floor((this.pageHeight - this.margins.bottom - this.yPos) / 3.5)
        let respText = exp.responsibilities
        
        if (maxLines < 3) {
          respText = respText.substring(0, 100) + '...'
        }
        
        const height = this.addText(respText, this.margins.left, this.yPos, {
          fontSize: 8,
          maxWidth: this.contentWidth,
          font: 'times'
        })
        this.yPos += Math.min(height, maxLines * 3.5) + 3
      }
    })
  }

  private generateClassicEducation() {
    this.data.education.filter(edu => edu.school).forEach((edu, index) => {
      if (this.yPos + 12 > this.pageHeight - this.margins.bottom) return

      // School and date
      this.addText(edu.school, this.margins.left, this.yPos, {
        fontSize: 10,
        fontStyle: 'bold',
        color: '#374151',
        font: 'times'
      })
      
      this.addText(edu.date, this.pageWidth - this.margins.right, this.yPos, {
        fontSize: 9,
        color: '#6b7280',
        align: 'right',
        font: 'times'
      })
      this.yPos += 4

      // Degree
      this.addText(edu.degree, this.margins.left, this.yPos, {
        fontSize: 9,
        font: 'times'
      })
      this.yPos += 3

      // GPA
      if (edu.gpa) {
        this.addText(`GPA: ${edu.gpa}`, this.margins.left, this.yPos, {
          fontSize: 8,
          color: '#6b7280',
          font: 'times'
        })
        this.yPos += 3
      }
      this.yPos += 2
    })
  }

  private generateClassicSkills() {
    if (this.data.skills.languages) {
      this.addText('Programming Languages: ', this.margins.left, this.yPos, {
        fontSize: 9,
        fontStyle: 'bold',
        color: '#4b5563',
        font: 'times'
      })
      this.addText(this.data.skills.languages, this.margins.left + 35, this.yPos, {
        fontSize: 9,
        font: 'times'
      })
      this.yPos += 4
    }

    if (this.data.skills.frameworks) {
      this.addText('Frameworks & Libraries: ', this.margins.left, this.yPos, {
        fontSize: 9,
        fontStyle: 'bold',
        color: '#4b5563',
        font: 'times'
      })
      this.addText(this.data.skills.frameworks, this.margins.left + 40, this.yPos, {
        fontSize: 9,
        font: 'times'
      })
      this.yPos += 4
    }

    if (this.data.skills.tools) {
      this.addText('Tools & Platforms: ', this.margins.left, this.yPos, {
        fontSize: 9,
        fontStyle: 'bold',
        color: '#4b5563',
        font: 'times'
      })
      this.addText(this.data.skills.tools, this.margins.left + 32, this.yPos, {
        fontSize: 9,
        font: 'times'
      })
      this.yPos += 4
    }
  }

  private generateClassicProjects() {
    this.data.projects.filter(proj => proj.name).slice(0, 2).forEach((project, index) => {
      if (this.yPos + 12 > this.pageHeight - this.margins.bottom) return

      // Project name
      this.addText(project.name, this.margins.left, this.yPos, {
        fontSize: 9,
        fontStyle: 'bold',
        color: '#374151',
        font: 'times'
      })
      this.yPos += 4

      // Description (truncated)
      if (project.description) {
        const desc = project.description.length > 120 ? 
          project.description.substring(0, 120) + '...' : 
          project.description
        
        const height = this.addText(desc, this.margins.left, this.yPos, {
          fontSize: 8,
          maxWidth: this.contentWidth,
          font: 'times'
        })
        this.yPos += height + 2
      }

      // Technologies
      if (project.technologies) {
        this.addText(`Technologies: ${project.technologies}`, this.margins.left, this.yPos, {
          fontSize: 8,
          color: '#6b7280',
          font: 'times'
        })
        this.yPos += 4
      }
    })
  }

  private generateClassicCertifications() {
    this.data.certifications.filter(cert => cert.name).slice(0, 3).forEach((cert, index) => {
      if (this.yPos + 8 > this.pageHeight - this.margins.bottom) return

      let certText = cert.name
      if (cert.issuer) certText += ` - ${cert.issuer}`

      this.addText(certText, this.margins.left, this.yPos, {
        fontSize: 9,
        font: 'times'
      })
      
      if (cert.date) {
        this.addText(cert.date, this.pageWidth - this.margins.right, this.yPos, {
          fontSize: 8,
          color: '#6b7280',
          align: 'right',
          font: 'times'
        })
      }
      this.yPos += 4
    })
  }

  // Modern Template implementations
  private generateModernHeader() {
    // Colored header background
    this.setFillColor(this.template.colors.primary)
    this.doc.rect(0, 0, this.pageWidth, 30, 'F')
    
    // Name in white on colored background
    this.addText(this.data.personalInfo.name || 'Your Name', this.margins.left, 18, {
      fontSize: 16,
      fontStyle: 'bold',
      color: '#ffffff'
    })
    
    // Title in white
    this.addText(this.data.personalInfo.title || 'Your Professional Title', this.margins.left, 25, {
      fontSize: 11,
      color: '#ffffff'
    })
    
    this.yPos = 38
    
    // Contact info in modern layout
    const contactY = this.yPos
    this.addText(this.data.personalInfo.email || '', this.margins.left, contactY, {
      fontSize: 9,
      color: this.template.colors.primary
    })
    
    this.addText(this.data.personalInfo.phone || '', this.pageWidth / 2, contactY, {
      fontSize: 9,
      color: this.template.colors.primary
    })
    
    this.addText(this.data.personalInfo.location || '', this.pageWidth - this.margins.right - 30, contactY, {
      fontSize: 9,
      color: this.template.colors.primary
    })
    
    this.yPos += 8
  }

  private generateModernTwoColumnLayout() {
    const leftColumnWidth = 75
    const rightColumnX = leftColumnWidth + 15
    const rightColumnWidth = this.contentWidth - leftColumnWidth - 15

    // Left column
    let leftY = this.yPos

    // Summary
    if (this.data.personalInfo.summary) {
      this.addModernSectionTitle('PROFILE', this.margins.left, leftY, this.template.colors.primary)
      leftY += 6
      
      const summaryHeight = this.addText(this.data.personalInfo.summary, this.margins.left, leftY, {
        fontSize: 8,
        maxWidth: leftColumnWidth
      })
      leftY += summaryHeight + 8
    }

    // Skills
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addModernSectionTitle('SKILLS', this.margins.left, leftY, this.template.colors.primary)
      leftY += 6

      if (this.data.skills.languages) {
        this.addText('Languages', this.margins.left, leftY, {
          fontSize: 8,
          fontStyle: 'bold'
        })
        leftY += 3
        const langHeight = this.addText(this.data.skills.languages, this.margins.left, leftY, {
          fontSize: 7,
          maxWidth: leftColumnWidth
        })
        leftY += langHeight + 3
      }

      if (this.data.skills.frameworks) {
        this.addText('Frameworks', this.margins.left, leftY, {
          fontSize: 8,
          fontStyle: 'bold'
        })
        leftY += 3
        const fwHeight = this.addText(this.data.skills.frameworks, this.margins.left, leftY, {
          fontSize: 7,
          maxWidth: leftColumnWidth
        })
        leftY += fwHeight + 3
      }

      if (this.data.skills.tools) {
        this.addText('Tools', this.margins.left, leftY, {
          fontSize: 8,
          fontStyle: 'bold'
        })
        leftY += 3
        const toolsHeight = this.addText(this.data.skills.tools, this.margins.left, leftY, {
          fontSize: 7,
          maxWidth: leftColumnWidth
        })
        leftY += toolsHeight + 3
      }
    }

    // Right column - Experience and Education
    let rightY = this.yPos

    // Experience
    if (this.data.experience.some(exp => exp.jobTitle)) {
      this.addModernSectionTitle('EXPERIENCE', rightColumnX, rightY, this.template.colors.primary)
      rightY += 6

      this.data.experience.filter(exp => exp.jobTitle).forEach((exp, index) => {
        if (rightY + 15 > this.pageHeight - this.margins.bottom) return

        this.addText(exp.jobTitle, rightColumnX, rightY, {
          fontSize: 10,
          fontStyle: 'bold'
        })
        
        this.addText(exp.date, this.pageWidth - this.margins.right, rightY, {
          fontSize: 8,
          align: 'right'
        })
        rightY += 4

        this.addText(exp.company, rightColumnX, rightY, {
          fontSize: 9,
          fontStyle: 'italic',
          color: this.template.colors.secondary
        })
        rightY += 3

        if (exp.responsibilities) {
          const maxLines = Math.floor((this.pageHeight - this.margins.bottom - rightY) / 2.8)
          let respText = exp.responsibilities
          
          if (maxLines < 4) {
            respText = respText.substring(0, 150) + '...'
          }
          
          const respHeight = this.addText(respText, rightColumnX, rightY, {
            fontSize: 8,
            maxWidth: rightColumnWidth
          })
          rightY += Math.min(respHeight, maxLines * 2.8) + 5
        }
      })
    }

    // Education in right column
    if (this.data.education.some(edu => edu.school) && rightY + 20 < this.pageHeight - this.margins.bottom) {
      this.addModernSectionTitle('EDUCATION', rightColumnX, rightY, this.template.colors.primary)
      rightY += 6

      this.data.education.filter(edu => edu.school).forEach((edu, index) => {
        if (rightY + 10 > this.pageHeight - this.margins.bottom) return

        this.addText(edu.school, rightColumnX, rightY, {
          fontSize: 9,
          fontStyle: 'bold'
        })
        
        this.addText(edu.date, this.pageWidth - this.margins.right, rightY, {
          fontSize: 8,
          align: 'right'
        })
        rightY += 3

        this.addText(edu.degree, rightColumnX, rightY, {
          fontSize: 8
        })
        rightY += 5
      })
    }

    this.yPos = Math.max(leftY, rightY)
  }

  private addModernSectionTitle(title: string, x: number, y: number, color: string) {
    this.addText(title, x, y, {
      fontSize: 10,
      fontStyle: 'bold',
      color: color
    })
    
    // Add colored line
    this.setFillColor(this.template.colors.accent)
    this.doc.rect(x, y + 1, 20, 0.5, 'F')
  }

  // Minimal Template implementations
  private generateMinimalHeader() {
    // Ultra-clean minimal header
    this.addText(this.data.personalInfo.name || 'Your Name', this.margins.left, this.yPos, {
      fontSize: 16,
      fontStyle: 'bold',
      color: '#000000'
    })
    this.yPos += 6

    this.addText(this.data.personalInfo.title || 'Your Professional Title', this.margins.left, this.yPos, {
      fontSize: 10,
      color: '#333333'
    })
    this.yPos += 5

    // Contact info in minimal style
    const contactInfo = [
      this.data.personalInfo.email,
      this.data.personalInfo.phone,
      this.data.personalInfo.location
    ].filter(Boolean).join(' | ')

    this.addText(contactInfo, this.margins.left, this.yPos, {
      fontSize: 9,
      color: '#666666'
    })
    this.yPos += 8
  }

  private generateMinimalContent() {
    // All sections in minimal black and white style
    
    // Summary
    if (this.data.personalInfo.summary) {
      this.addMinimalSection('SUMMARY', () => {
        const height = this.addText(this.data.personalInfo.summary, this.margins.left, this.yPos, {
          fontSize: 9,
          maxWidth: this.contentWidth,
          color: '#000000'
        })
        this.yPos += height + 3
      })
    }
    
    // Experience
    if (this.data.experience.some(exp => exp.jobTitle)) {
      this.addMinimalSection('EXPERIENCE', () => {
        this.data.experience.filter(exp => exp.jobTitle).forEach((exp, index) => {
          if (this.yPos + 12 > this.pageHeight - this.margins.bottom) return

          this.addText(exp.jobTitle, this.margins.left, this.yPos, {
            fontSize: 10,
            fontStyle: 'bold',
            color: '#000000'
          })
          
          this.addText(exp.date, this.pageWidth - this.margins.right, this.yPos, {
            fontSize: 9,
            align: 'right',
            color: '#666666'
          })
          this.yPos += 4

          this.addText(exp.company, this.margins.left, this.yPos, {
            fontSize: 9,
            color: '#333333'
          })
          this.yPos += 3

          if (exp.responsibilities) {
            const respHeight = this.addText(exp.responsibilities, this.margins.left, this.yPos, {
              fontSize: 8,
              maxWidth: this.contentWidth,
              color: '#000000'
            })
            this.yPos += respHeight + 4
          }
        })
      })
    }
    
    // Continue with other sections...
    this.generateMinimalEducationAndSkills()
  }

  private addMinimalSection(title: string, contentGenerator: () => void) {
    if (this.yPos + 15 > this.pageHeight - this.margins.bottom) return

    this.addText(title, this.margins.left, this.yPos, {
      fontSize: 11,
      fontStyle: 'bold',
      color: '#000000'
    })
    this.yPos += 6

    contentGenerator()
    this.yPos += 3
  }

  private generateMinimalEducationAndSkills() {
    // Education
    if (this.data.education.some(edu => edu.school)) {
      this.addMinimalSection('EDUCATION', () => {
        this.data.education.filter(edu => edu.school).forEach((edu, index) => {
          if (this.yPos + 8 > this.pageHeight - this.margins.bottom) return

          this.addText(edu.school, this.margins.left, this.yPos, {
            fontSize: 9,
            fontStyle: 'bold'
          })
          
          this.addText(edu.date, this.pageWidth - this.margins.right, this.yPos, {
            fontSize: 8,
            align: 'right'
          })
          this.yPos += 3

          this.addText(edu.degree, this.margins.left, this.yPos, {
            fontSize: 8
          })
          this.yPos += 4
        })
      })
    }

    // Skills
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addMinimalSection('SKILLS', () => {
        const skillsText = [
          this.data.skills.languages && `Languages: ${this.data.skills.languages}`,
          this.data.skills.frameworks && `Frameworks: ${this.data.skills.frameworks}`,
          this.data.skills.tools && `Tools: ${this.data.skills.tools}`
        ].filter(Boolean).join(' • ')

        const height = this.addText(skillsText, this.margins.left, this.yPos, {
          fontSize: 8,
          maxWidth: this.contentWidth
        })
        this.yPos += height
      })
    }
  }

  // Main generation method
  generatePDF(): jsPDF {
    switch (this.template.id) {
      case 'classic':
        return this.generateClassicPDF()
      case 'modern':
        return this.generateModernPDF()
      case 'creative':
        return this.generateModernPDF() // Use modern layout with creative colors
      case 'minimal':
        return this.generateMinimalPDF()
      case 'executive':
        return this.generateClassicPDF() // Use classic layout with executive styling
      case 'tech':
        return this.generateModernPDF() // Use modern layout with tech colors
      case 'photo':
        return this.generateClassicPDF() // Use classic layout (photo handling would need image processing)
      default:
        return this.generateClassicPDF()
    }
  }

  // Public method to download the PDF
  downloadPDF(filename?: string) {
    const pdf = this.generatePDF()
    const name = filename || `${this.data.personalInfo.name || 'Resume'}_${this.template.name.replace(/\s+/g, '_')}.pdf`
    pdf.save(name)
  }
}

// Factory function for easy use
export function generateResumePDF(template: Template, data: ResumeData, filename?: string) {
  const generator = new PDFGenerator(template, data)
  generator.downloadPDF(filename)
}
