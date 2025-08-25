import { jsPDF } from 'jspdf'
import { SIMPLIFIED_TEMPLATES, type TemplateConfig } from './template-configs'

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

export class SimplePDFGenerator {
  private doc: jsPDF
  private config: TemplateConfig
  private data: ResumeData
  private yPos: number = 15
  private pageWidth: number = 210
  private pageHeight: number = 297
  private margins = { left: 15, right: 15, top: 15, bottom: 20 }
  private contentWidth: number

  constructor(templateId: string, data: ResumeData) {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.config = SIMPLIFIED_TEMPLATES.find(t => t.id === templateId) || SIMPLIFIED_TEMPLATES[0]
    this.data = data
    this.contentWidth = this.pageWidth - this.margins.left - this.margins.right
  }

  // Utility methods
  private setColor(color: string) {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    this.doc.setTextColor(r, g, b)
  }

  private setFillColor(color: string) {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    this.doc.setFillColor(r, g, b)
  }

  private addText(text: string, x: number, y: number, options: {
    size?: number
    bold?: boolean
    italic?: boolean
    color?: string
    align?: 'left' | 'center' | 'right'
    maxWidth?: number
  } = {}) {
    // Set font
    const style = options.bold ? 'bold' : options.italic ? 'italic' : 'normal'
    this.doc.setFont(this.config.fonts.primary, style)
    
    // Set size
    this.doc.setFontSize(options.size || 10)
    
    // Set color
    if (options.color) {
      this.setColor(options.color)
    } else {
      this.setColor(this.config.colors.text)
    }

    // Add text
    if (options.maxWidth && text) {
      const lines = this.doc.splitTextToSize(text, options.maxWidth)
      this.doc.text(lines, x, y, { align: options.align })
      return Array.isArray(lines) ? lines.length * (options.size || 10) * 0.35 : (options.size || 10) * 0.35
    } else {
      this.doc.text(text, x, y, { align: options.align })
      return (options.size || 10) * 0.35
    }
  }

  // Main generation methods
  generate(): jsPDF {
    this.generateHeader()
    
    switch (this.config.layout) {
      case 'single-column':
        this.generateSingleColumn()
        break
      case 'two-column':
        this.generateTwoColumn()
        break
      case 'header-focus':
        this.generateHeaderFocus()
        break
    }
    
    return this.doc
  }

  private generateHeader() {
    const startY = this.yPos

    if (this.config.features.coloredHeader) {
      // Colored background
      this.setFillColor(this.config.colors.primary)
      this.doc.rect(0, 0, this.pageWidth, this.config.spacing.headerHeight, 'F')
      
      // White text on colored background
      this.addText(this.data.personalInfo.name || 'Your Name', this.margins.left, 18, {
        size: 18,
        bold: true,
        color: '#ffffff'
      })
      
      this.addText(this.data.personalInfo.title || 'Your Title', this.margins.left, 26, {
        size: 12,
        color: '#ffffff'
      })
      
      this.yPos = this.config.spacing.headerHeight + 8
    } else {
      // Standard header
      this.addText(this.data.personalInfo.name || 'Your Name', this.pageWidth / 2, this.yPos, {
        size: 20,
        bold: true,
        color: this.config.colors.primary,
        align: 'center'
      })
      this.yPos += 8

      this.addText(this.data.personalInfo.title || 'Your Title', this.pageWidth / 2, this.yPos, {
        size: 12,
        color: this.config.colors.secondary,
        align: 'center'
      })
      this.yPos += 6
    }

    // Contact info
    const contact = [
      this.data.personalInfo.email,
      this.data.personalInfo.phone,
      this.data.personalInfo.location
    ].filter(Boolean).join(' • ')

    this.addText(contact, this.pageWidth / 2, this.yPos, {
      size: 9,
      color: this.config.colors.secondary,
      align: 'center'
    })
    this.yPos += 8
  }

  private generateSingleColumn() {
    // Summary
    if (this.data.personalInfo.summary) {
      this.addSection('PROFESSIONAL SUMMARY')
      const height = this.addText(this.data.personalInfo.summary, this.margins.left, this.yPos, {
        size: 10,
        maxWidth: this.contentWidth
      })
      this.yPos += height + this.config.spacing.sectionSpacing
    }

    // Experience
    if (this.data.experience.some(exp => exp.jobTitle)) {
      this.addSection('EXPERIENCE')
      this.data.experience.filter(exp => exp.jobTitle).slice(0, 3).forEach(exp => {
        this.addExperienceItem(exp)
      })
    }

    // Education
    if (this.data.education.some(edu => edu.school)) {
      this.addSection('EDUCATION')
      this.data.education.filter(edu => edu.school).forEach(edu => {
        this.addEducationItem(edu)
      })
    }

    // Skills
    this.addSkillsSection()

    // Projects (if space allows)
    if (this.yPos < this.pageHeight - 60 && this.data.projects.some(proj => proj.name)) {
      this.addSection('PROJECTS')
      this.data.projects.filter(proj => proj.name).slice(0, 2).forEach(proj => {
        this.addProjectItem(proj)
      })
    }
  }

  private generateTwoColumn() {
    const leftWidth = 65
    const rightX = leftWidth + 20
    const rightWidth = this.contentWidth - leftWidth - 20

    // Left column
    let leftY = this.yPos
    
    // Summary in left column
    if (this.data.personalInfo.summary) {
      this.addText('PROFILE', this.margins.left, leftY, {
        size: 11,
        bold: true,
        color: this.config.colors.primary
      })
      leftY += 5
      
      if (this.config.features.sectionLines) {
        this.setFillColor(this.config.colors.accent)
        this.doc.rect(this.margins.left, leftY, 20, 0.5, 'F')
      }
      leftY += 4

      const summaryHeight = this.addText(this.data.personalInfo.summary, this.margins.left, leftY, {
        size: 9,
        maxWidth: leftWidth
      })
      leftY += summaryHeight + 8
    }

    // Skills in left column
    this.addText('SKILLS', this.margins.left, leftY, {
      size: 11,
      bold: true,
      color: this.config.colors.primary
    })
    leftY += 5

    if (this.config.features.sectionLines) {
      this.setFillColor(this.config.colors.accent)
      this.doc.rect(this.margins.left, leftY, 20, 0.5, 'F')
    }
    leftY += 4

    const skillsData = [
      { label: 'Languages', value: this.data.skills.languages },
      { label: 'Frameworks', value: this.data.skills.frameworks },
      { label: 'Tools', value: this.data.skills.tools }
    ]
    
    skillsData.forEach((skill: { label: string; value: string }) => {
      if (skill.value) {
        this.addText(`${skill.label}:`, this.margins.left, leftY, {
          size: 8,
          bold: true
        })
        leftY += 3
        const height = this.addText(skill.value, this.margins.left, leftY, {
          size: 8,
          maxWidth: leftWidth
        })
        leftY += height + 3
      }
    })

    // Right column - Experience
    let rightY = this.yPos

    this.addText('EXPERIENCE', rightX, rightY, {
      size: 11,
      bold: true,
      color: this.config.colors.primary
    })
    rightY += 5

    if (this.config.features.sectionLines) {
      this.setFillColor(this.config.colors.accent)
      this.doc.rect(rightX, rightY, 25, 0.5, 'F')
    }
    rightY += 4

    this.data.experience.filter(exp => exp.jobTitle).slice(0, 2).forEach(exp => {
      // Job title and date
      this.addText(exp.jobTitle, rightX, rightY, {
        size: 10,
        bold: true
      })
      
      this.addText(exp.date, this.pageWidth - this.margins.right, rightY, {
        size: 8,
        color: this.config.colors.secondary,
        align: 'right'
      })
      rightY += 4

      // Company
      this.addText(exp.company, rightX, rightY, {
        size: 9,
        italic: true,
        color: this.config.colors.secondary
      })
      rightY += 3

      // Responsibilities (truncated)
      if (exp.responsibilities) {
        const truncated = exp.responsibilities.length > 200 ? 
          exp.responsibilities.substring(0, 200) + '...' : 
          exp.responsibilities
        
        const height = this.addText(truncated, rightX, rightY, {
          size: 8,
          maxWidth: rightWidth
        })
        rightY += height + 6
      }
    })

    // Education in right column
    if (rightY < this.pageHeight - 40) {
      this.addText('EDUCATION', rightX, rightY, {
        size: 11,
        bold: true,
        color: this.config.colors.primary
      })
      rightY += 5

      if (this.config.features.sectionLines) {
        this.setFillColor(this.config.colors.accent)
        this.doc.rect(rightX, rightY, 25, 0.5, 'F')
      }
      rightY += 4

      this.data.education.filter(edu => edu.school).forEach(edu => {
        this.addText(edu.school, rightX, rightY, {
          size: 9,
          bold: true
        })
        
        this.addText(edu.date, this.pageWidth - this.margins.right, rightY, {
          size: 8,
          color: this.config.colors.secondary,
          align: 'right'
        })
        rightY += 3

        this.addText(edu.degree, rightX, rightY, {
          size: 8
        })
        rightY += 5
      })
    }

    this.yPos = Math.max(leftY, rightY)
  }

  private generateHeaderFocus() {
    // Similar to single column but with larger header space
    this.generateSingleColumn()
  }

  private addSection(title: string) {
    if (this.yPos > this.pageHeight - 30) return // Skip if no space

    this.addText(title, this.margins.left, this.yPos, {
      size: 11,
      bold: true,
      color: this.config.colors.primary
    })
    this.yPos += 4

    if (this.config.features.sectionLines) {
      this.setFillColor(this.config.colors.accent)
      this.doc.rect(this.margins.left, this.yPos, 30, 0.5, 'F')
    }
    this.yPos += this.config.spacing.sectionSpacing
  }

  private addExperienceItem(exp: any) {
    if (this.yPos > this.pageHeight - 25) return

    // Job title and date
    this.addText(exp.jobTitle, this.margins.left, this.yPos, {
      size: 10,
      bold: true
    })
    
    this.addText(exp.date, this.pageWidth - this.margins.right, this.yPos, {
      size: 9,
      color: this.config.colors.secondary,
      align: 'right'
    })
    this.yPos += 4

    // Company
    this.addText(exp.company, this.margins.left, this.yPos, {
      size: 9,
      italic: true,
      color: this.config.colors.secondary
    })
    this.yPos += 3

    // Responsibilities (truncated for space)
    if (exp.responsibilities) {
      const truncated = exp.responsibilities.length > 180 ? 
        exp.responsibilities.substring(0, 180) + '...' : 
        exp.responsibilities
      
      const height = this.addText(truncated, this.margins.left, this.yPos, {
        size: 9,
        maxWidth: this.contentWidth
      })
      this.yPos += height + this.config.spacing.itemSpacing
    }
  }

  private addEducationItem(edu: any) {
    if (this.yPos > this.pageHeight - 15) return

    this.addText(edu.school, this.margins.left, this.yPos, {
      size: 10,
      bold: true
    })
    
    this.addText(edu.date, this.pageWidth - this.margins.right, this.yPos, {
      size: 9,
      color: this.config.colors.secondary,
      align: 'right'
    })
    this.yPos += 3

    this.addText(edu.degree, this.margins.left, this.yPos, {
      size: 9
    })
    this.yPos += this.config.spacing.itemSpacing + 2
  }

  private addProjectItem(proj: any) {
    if (this.yPos > this.pageHeight - 20) return

    this.addText(proj.name, this.margins.left, this.yPos, {
      size: 10,
      bold: true
    })
    this.yPos += 3

    if (proj.description) {
      const truncated = proj.description.length > 120 ? 
        proj.description.substring(0, 120) + '...' : 
        proj.description
      
      const height = this.addText(truncated, this.margins.left, this.yPos, {
        size: 8,
        maxWidth: this.contentWidth
      })
      this.yPos += height + 2
    }

    if (proj.technologies) {
      this.addText(`Tech: ${proj.technologies}`, this.margins.left, this.yPos, {
        size: 8,
        color: this.config.colors.secondary
      })
      this.yPos += this.config.spacing.itemSpacing + 2
    }
  }

  private addSkillsSection() {
    if (this.yPos > this.pageHeight - 30) return

    this.addSection('SKILLS')

    const skills = [
      this.data.skills.languages && `Languages: ${this.data.skills.languages}`,
      this.data.skills.frameworks && `Frameworks: ${this.data.skills.frameworks}`,
      this.data.skills.tools && `Tools: ${this.data.skills.tools}`
    ].filter(Boolean)

    skills.forEach(skill => {
      if (skill) {
        const height = this.addText(skill, this.margins.left, this.yPos, {
          size: 9,
          maxWidth: this.contentWidth
        })
        this.yPos += height + 2
      }
    })
    this.yPos += this.config.spacing.sectionSpacing
  }

  download(filename?: string) {
    const pdf = this.generate()
    const name = filename || `${this.data.personalInfo.name || 'Resume'}_${this.config.name}.pdf`
    pdf.save(name)
  }
}

// Simple factory function
export function downloadResumePDF(templateId: string, data: ResumeData, filename?: string) {
  const generator = new SimplePDFGenerator(templateId, data)
  generator.download(filename)
}
