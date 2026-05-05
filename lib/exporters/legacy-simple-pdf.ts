import { jsPDF } from 'jspdf'
import { SIMPLIFIED_TEMPLATES, type TemplateConfig } from '@/lib/template-configs'

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
    const style = options.bold ? 'bold' : options.italic ? 'italic' : 'normal'
    this.doc.setFont(this.config.fonts.primary, style)
    this.doc.setFontSize(options.size || 10)

    if (options.color) {
      this.setColor(options.color)
    } else {
      this.setColor(this.config.colors.text)
    }

    if (options.maxWidth && text) {
      const lines = this.doc.splitTextToSize(text, options.maxWidth)
      this.doc.text(lines, x, y, { align: options.align })
      return Array.isArray(lines) ? lines.length * (options.size || 10) * 0.35 : (options.size || 10) * 0.35
    } else {
      this.doc.text(text, x, y, { align: options.align })
      return (options.size || 10) * 0.35
    }
  }

  // Main generation - routes to correct template
  generate(): jsPDF {
    switch (this.config.id) {
      case 'classic':
        this.generateClassic()
        break
      case 'creative':
        this.generateCreative()
        break
      case 'minimal':
        this.generateMinimal()
        break
      case 'modern':
        this.generateModern()
        break
      case 'photo':
        this.generatePhoto()
        break
      default:
        this.generateClassic()
    }
    return this.doc
  }

  // ============================================================================
  // TEMPLATE 1: Classic (LaTeX lines 1-130)
  // Centered header, pipe separators, titlerule sections, bullet points
  // ============================================================================
  private generateClassic() {
    // Centered Name
    this.addText((this.data.personalInfo.name || 'Your Name').toUpperCase(), this.pageWidth / 2, this.yPos, {
      size: 20,
      bold: true,
      color: this.config.colors.primary,
      align: 'center'
    })
    this.yPos += 7

    // Contact with pipe separators
    const contact = [
      this.data.personalInfo.phone,
      this.data.personalInfo.email,
      ...this.data.links.filter(l => l.url).slice(0, 2).map(l => l.name || l.url)
    ].filter(Boolean).join(' | ')

    this.addText(contact, this.pageWidth / 2, this.yPos, {
      size: 9,
      color: this.config.colors.secondary,
      align: 'center'
    })
    this.yPos += 6

    // Summary
    if (this.data.personalInfo.summary) {
      this.addSectionTitle('SUMMARY')
      const h = this.addText(this.data.personalInfo.summary, this.margins.left, this.yPos, {
        size: 9,
        maxWidth: this.contentWidth
      })
      this.yPos += h + 5
    }

    // Technical Skills
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addSectionTitle('TECHNICAL SKILLS')
      if (this.data.skills.languages) {
        this.addText(`Programming Languages: ${this.data.skills.languages}`, this.margins.left, this.yPos, { size: 9, bold: true })
        this.yPos += 4
      }
      if (this.data.skills.frameworks) {
        this.addText(`Frameworks & Libraries: ${this.data.skills.frameworks}`, this.margins.left, this.yPos, { size: 9, bold: true })
        this.yPos += 4
      }
      if (this.data.skills.tools) {
        this.addText(`Tools & Platforms: ${this.data.skills.tools}`, this.margins.left, this.yPos, { size: 9, bold: true })
        this.yPos += 4
      }
      this.yPos += 2
    }

    // Projects
    if (this.data.projects.some(p => p.name)) {
      this.addSectionTitle('PROJECTS')
      this.data.projects.filter(p => p.name).slice(0, 3).forEach(proj => {
        this.addText(proj.name, this.margins.left, this.yPos, { size: 10, bold: true })
        if (proj.technologies) {
          this.addText(proj.technologies, this.pageWidth - this.margins.right, this.yPos, {
            size: 8, italic: true, color: this.config.colors.secondary, align: 'right'
          })
        }
        this.yPos += 4
        if (proj.description) {
          this.addText(`• ${proj.description}`, this.margins.left + 3, this.yPos, { size: 8, maxWidth: this.contentWidth - 6 })
          this.yPos += 5
        }
      })
    }

    // Experience
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addSectionTitle('EXPERIENCE')
      this.data.experience.filter(e => e.jobTitle).slice(0, 3).forEach(exp => {
        this.addExperienceClassic(exp)
      })
    }

    // Education
    if (this.data.education.some(e => e.school)) {
      this.addSectionTitle('EDUCATION')
      this.data.education.filter(e => e.school).forEach(edu => {
        this.addText(edu.school, this.margins.left, this.yPos, { size: 10, bold: true })
        this.addText(edu.date, this.pageWidth - this.margins.right, this.yPos, {
          size: 9, color: this.config.colors.secondary, align: 'right'
        })
        this.yPos += 4
        this.addText(edu.degree, this.margins.left, this.yPos, { size: 9, italic: true })
        this.yPos += 5
      })
    }

    // Certifications
    if (this.data.certifications.some(c => c.name)) {
      this.addSectionTitle('CERTIFICATIONS')
      this.data.certifications.filter(c => c.name).forEach(cert => {
        this.addText(`• ${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`, this.margins.left, this.yPos, { size: 9 })
        this.yPos += 4
      })
    }
  }

  private addExperienceClassic(exp: any) {
    this.addText(exp.jobTitle, this.margins.left, this.yPos, { size: 10, bold: true })
    this.addText(exp.date, this.pageWidth - this.margins.right, this.yPos, {
      size: 9, color: this.config.colors.secondary, align: 'right'
    })
    this.yPos += 4
    this.addText(exp.company, this.margins.left, this.yPos, { size: 9, italic: true, color: this.config.colors.secondary })
    this.yPos += 4
    if (exp.responsibilities) {
      const lines = exp.responsibilities.split('\n').filter((r: string) => r.trim()).slice(0, 3)
      lines.forEach((line: string) => {
        const h = this.addText(`• ${line.replace(/^[•\-]\s*/, '')}`, this.margins.left + 3, this.yPos, {
          size: 8, maxWidth: this.contentWidth - 6
        })
        this.yPos += h + 2
      })
    }
    this.yPos += 2
  }

  // ============================================================================
  // TEMPLATE 2: Creative/MaltaCV (LaTeX lines 131-337)
  // Colorful flame accent, bio section, multicolumn skills grid
  // ============================================================================
  private generateCreative() {
    const flame = this.config.colors.primary // #e85d04

    // Name with color
    this.addText(this.data.personalInfo.name || 'Your Name', this.margins.left, this.yPos, {
      size: 22, bold: true, color: flame
    })
    this.yPos += 7

    // Tagline/Title
    this.addText(this.data.personalInfo.title || 'Professional Title', this.margins.left, this.yPos, {
      size: 11, italic: true, color: this.config.colors.secondary
    })
    this.yPos += 6

    // Contact row with icons (simulated)
    const contactParts = [
      this.data.personalInfo.email && `✉ ${this.data.personalInfo.email}`,
      this.data.personalInfo.phone && `📞 ${this.data.personalInfo.phone}`,
      ...this.data.links.filter(l => l.url).slice(0, 2).map(l => `🔗 ${l.name || l.url}`)
    ].filter(Boolean).join('   ')
    this.addText(contactParts, this.margins.left, this.yPos, { size: 8, color: this.config.colors.secondary })
    this.yPos += 6

    // Bio section with colored background (represented by line)
    if (this.data.personalInfo.summary) {
      this.setFillColor(flame)
      this.doc.rect(this.margins.left, this.yPos, this.contentWidth, 0.5, 'F')
      this.yPos += 4
      const h = this.addText(this.data.personalInfo.summary, this.margins.left, this.yPos, {
        size: 9, maxWidth: this.contentWidth
      })
      this.yPos += h + 4
    }

    // Skills section header with flame color
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addCreativeSectionTitle('SKILLS', flame)
      const allSkills = [
        ...(this.data.skills.languages?.split(',') || []),
        ...(this.data.skills.frameworks?.split(',') || []),
        ...(this.data.skills.tools?.split(',') || [])
      ].filter(s => s.trim()).slice(0, 10)

      // Grid layout (5 columns)
      let col = 0
      const colWidth = this.contentWidth / 5
      allSkills.forEach(skill => {
        const x = this.margins.left + (col * colWidth)
        this.addText(skill.trim(), x, this.yPos, { size: 8 })
        col++
        if (col >= 5) {
          col = 0
          this.yPos += 4
        }
      })
      if (col > 0) this.yPos += 4
      this.yPos += 3
    }

    // Education (two column simulated)
    if (this.data.education.some(e => e.school)) {
      this.addCreativeSectionTitle('EDUCATION', flame)
      this.data.education.filter(e => e.school).forEach(edu => {
        this.addText(edu.degree, this.margins.left, this.yPos, { size: 9, bold: true })
        this.yPos += 3
        this.addText(`${edu.school} | ${edu.date}`, this.margins.left, this.yPos, {
          size: 8, color: this.config.colors.secondary
        })
        this.yPos += 5
      })
    }

    // Experience
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addCreativeSectionTitle('EXPERIENCE', flame)
      this.data.experience.filter(e => e.jobTitle).slice(0, 3).forEach(exp => {
        this.addText(`${exp.jobTitle} at ${exp.company}`, this.margins.left, this.yPos, { size: 9, bold: true })
        this.addText(exp.date, this.pageWidth - this.margins.right, this.yPos, {
          size: 8, align: 'right', color: this.config.colors.secondary
        })
        this.yPos += 4
        if (exp.responsibilities) {
          const lines = exp.responsibilities.split('\n').filter((r: string) => r.trim()).slice(0, 2)
          lines.forEach((line: string) => {
            this.addText(`• ${line.replace(/^[•\-]\s*/, '')}`, this.margins.left + 3, this.yPos, { size: 8 })
            this.yPos += 3
          })
        }
        this.yPos += 3
      })
    }

    // Awards/Certifications
    if (this.data.certifications.some(c => c.name)) {
      this.addCreativeSectionTitle('AWARDS', flame)
      this.data.certifications.filter(c => c.name).slice(0, 3).forEach(cert => {
        this.addText(cert.name, this.margins.left, this.yPos, { size: 8, bold: true })
        if (cert.issuer) {
          this.addText(cert.issuer, this.margins.left + 50, this.yPos, { size: 8, color: this.config.colors.secondary })
        }
        this.yPos += 4
      })
    }
  }

  private addCreativeSectionTitle(title: string, color: string) {
    this.addText(title, this.margins.left, this.yPos, { size: 11, bold: true, color })
    this.yPos += 3
    this.setFillColor(color)
    this.doc.rect(this.margins.left, this.yPos, 30, 0.5, 'F')
    this.yPos += 5
  }

  // ============================================================================
  // TEMPLATE 3: Minimal/Jitin Nair (LaTeX lines 338-556)
  // Clean black/white, dash bullets (--), centered header with icons
  // ============================================================================
  private generateMinimal() {
    // Centered name
    this.addText(this.data.personalInfo.name || 'Your Name', this.pageWidth / 2, this.yPos, {
      size: 22, bold: true, align: 'center'
    })
    this.yPos += 8

    // Contact with icons
    const contact = [
      this.data.links.filter(l => l.url).slice(0, 1).map(l => `📁 ${l.name || 'GitHub'}`),
      this.data.links.filter(l => l.url).slice(1, 2).map(l => `💼 ${l.name || 'LinkedIn'}`),
      this.data.personalInfo.email && `✉ ${this.data.personalInfo.email}`,
      this.data.personalInfo.phone && `📱 ${this.data.personalInfo.phone}`
    ].flat().filter(Boolean).join('  |  ')
    this.addText(contact, this.pageWidth / 2, this.yPos, { size: 8, align: 'center', color: '#333333' })
    this.yPos += 8

    // Summary
    if (this.data.personalInfo.summary) {
      this.addMinimalSectionTitle('Summary')
      const h = this.addText(this.data.personalInfo.summary, this.margins.left, this.yPos, {
        size: 9, maxWidth: this.contentWidth
      })
      this.yPos += h + 4
    }

    // Work Experience with dash bullets
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addMinimalSectionTitle('Work Experience')
      this.data.experience.filter(e => e.jobTitle).slice(0, 3).forEach(exp => {
        this.addText(exp.jobTitle, this.margins.left, this.yPos, { size: 10, bold: true })
        this.addText(exp.date, this.pageWidth - this.margins.right, this.yPos, { size: 9, align: 'right' })
        this.yPos += 4
        if (exp.responsibilities) {
          const lines = exp.responsibilities.split('\n').filter((r: string) => r.trim()).slice(0, 3)
          lines.forEach((line: string) => {
            this.addText(`– ${line.replace(/^[•\-]\s*/, '')}`, this.margins.left + 4, this.yPos, {
              size: 8, maxWidth: this.contentWidth - 8
            })
            this.yPos += 4
          })
        }
        this.yPos += 2
      })
    }

    // Projects
    if (this.data.projects.some(p => p.name)) {
      this.addMinimalSectionTitle('Projects')
      this.data.projects.filter(p => p.name).slice(0, 3).forEach(proj => {
        this.addText(proj.name, this.margins.left, this.yPos, { size: 10, bold: true })
        if (proj.link) {
          this.addText('Link', this.pageWidth - this.margins.right, this.yPos, {
            size: 8, color: '#0066cc', align: 'right'
          })
        }
        this.yPos += 3
        if (proj.description) {
          const h = this.addText(proj.description, this.margins.left, this.yPos, {
            size: 8, maxWidth: this.contentWidth, color: '#333333'
          })
          this.yPos += h + 2
        }
      })
      this.yPos += 2
    }

    // Education (tabular style)
    if (this.data.education.some(e => e.school)) {
      this.addMinimalSectionTitle('Education')
      this.data.education.filter(e => e.school).forEach(edu => {
        this.addText(edu.date, this.margins.left, this.yPos, { size: 9 })
        this.addText(`${edu.degree} at ${edu.school}`, this.margins.left + 30, this.yPos, { size: 9 })
        if (edu.gpa) {
          this.addText(`(GPA: ${edu.gpa})`, this.pageWidth - this.margins.right, this.yPos, {
            size: 8, align: 'right', color: '#666666'
          })
        }
        this.yPos += 4
      })
      this.yPos += 2
    }

    // Skills (tabular)
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addMinimalSectionTitle('Skills')
      if (this.data.skills.languages) {
        this.addText('Languages', this.margins.left, this.yPos, { size: 9, bold: true })
        this.addText(this.data.skills.languages, this.margins.left + 25, this.yPos, { size: 9 })
        this.yPos += 4
      }
      if (this.data.skills.frameworks) {
        this.addText('Frameworks', this.margins.left, this.yPos, { size: 9, bold: true })
        this.addText(this.data.skills.frameworks, this.margins.left + 25, this.yPos, { size: 9 })
        this.yPos += 4
      }
      if (this.data.skills.tools) {
        this.addText('Tools', this.margins.left, this.yPos, { size: 9, bold: true })
        this.addText(this.data.skills.tools, this.margins.left + 25, this.yPos, { size: 9 })
        this.yPos += 4
      }
    }

    // Footer with date
    this.addText(`Last updated: ${new Date().toLocaleDateString()}`, this.pageWidth / 2, this.pageHeight - 15, {
      size: 7, align: 'center', color: '#888888'
    })
  }

  private addMinimalSectionTitle(title: string) {
    this.addText(title.toUpperCase(), this.margins.left, this.yPos, { size: 12, bold: true })
    this.yPos += 3
    this.setFillColor('#000000')
    this.doc.rect(this.margins.left, this.yPos, this.contentWidth, 0.3, 'F')
    this.yPos += 5
  }

  // ============================================================================
  // TEMPLATE 4: Modern/Anubhav Singh (LaTeX lines 557-739)
  // Left-aligned header, skills with dotted alignment, circle bullets
  // ============================================================================
  private generateModern() {
    // Left-aligned header with links
    this.addText(this.data.personalInfo.name || 'Your Name', this.margins.left, this.yPos, {
      size: 20, bold: true
    })
    this.addText(`Email: ${this.data.personalInfo.email || ''}`, this.pageWidth - this.margins.right, this.yPos, {
      size: 8, align: 'right', color: this.config.colors.secondary
    })
    this.yPos += 5

    if (this.data.links.length > 0) {
      this.addText(`Portfolio: ${this.data.links[0]?.name || this.data.links[0]?.url || ''}`, this.margins.left, this.yPos, {
        size: 8, color: this.config.colors.secondary
      })
      this.addText(`Mobile: ${this.data.personalInfo.phone || ''}`, this.pageWidth - this.margins.right, this.yPos, {
        size: 8, align: 'right', color: this.config.colors.secondary
      })
      this.yPos += 4
    }
    if (this.data.links.length > 1) {
      this.addText(`Github: ${this.data.links[1]?.name || this.data.links[1]?.url || ''}`, this.margins.left, this.yPos, {
        size: 8, color: this.config.colors.secondary
      })
      this.yPos += 4
    }
    this.yPos += 3

    // Education
    if (this.data.education.some(e => e.school)) {
      this.addModernSectionTitle('Education')
      this.data.education.filter(e => e.school).forEach(edu => {
        this.addText(edu.school, this.margins.left, this.yPos, { size: 10, bold: true })
        this.addText(edu.date, this.pageWidth - this.margins.right, this.yPos, {
          size: 9, align: 'right', color: this.config.colors.secondary
        })
        this.yPos += 4
        this.addText(`${edu.degree}${edu.gpa ? `; GPA: ${edu.gpa}` : ''}`, this.margins.left, this.yPos, {
          size: 9, italic: true, color: this.config.colors.secondary
        })
        this.yPos += 5
      })
    }

    // Skills Summary with dotted leaders
    if (this.data.skills.languages || this.data.skills.frameworks || this.data.skills.tools) {
      this.addModernSectionTitle('Skills Summary')
      const skills = [
        { label: 'Languages', value: this.data.skills.languages },
        { label: 'Frameworks', value: this.data.skills.frameworks },
        { label: 'Tools', value: this.data.skills.tools }
      ]
      skills.forEach(skill => {
        if (skill.value) {
          this.addText(skill.label, this.margins.left, this.yPos, { size: 9, bold: true })
          this.addText('·····', this.margins.left + 25, this.yPos, { size: 9, color: '#cccccc' })
          this.addText(skill.value, this.margins.left + 35, this.yPos, { size: 9 })
          this.yPos += 4
        }
      })
      this.yPos += 2
    }

    // Experience with circle bullets
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addModernSectionTitle('Experience')
      this.data.experience.filter(e => e.jobTitle).slice(0, 3).forEach(exp => {
        this.addText(exp.company, this.margins.left, this.yPos, { size: 10, bold: true })
        this.addText(exp.date, this.pageWidth - this.margins.right, this.yPos, {
          size: 9, align: 'right', color: this.config.colors.secondary
        })
        this.yPos += 4
        this.addText(exp.jobTitle, this.margins.left, this.yPos, { size: 9, italic: true })
        this.yPos += 4
        if (exp.responsibilities) {
          const lines = exp.responsibilities.split('\n').filter((r: string) => r.trim()).slice(0, 3)
          lines.forEach((line: string) => {
            this.addText(`○ ${line.replace(/^[•\-○]\s*/, '')}`, this.margins.left + 4, this.yPos, {
              size: 8, maxWidth: this.contentWidth - 8
            })
            this.yPos += 4
          })
        }
        this.yPos += 2
      })
    }

    // Projects with inline tech
    if (this.data.projects.some(p => p.name)) {
      this.addModernSectionTitle('Projects')
      this.data.projects.filter(p => p.name).slice(0, 4).forEach(proj => {
        const text = `${proj.name}${proj.technologies ? ` (${proj.technologies})` : ''}${proj.description ? `: ${proj.description}` : ''}`
        const h = this.addText(text, this.margins.left, this.yPos, { size: 8, maxWidth: this.contentWidth })
        this.yPos += h + 2
      })
      this.yPos += 2
    }

    // Honors
    if (this.data.certifications.some(c => c.name)) {
      this.addModernSectionTitle('Honors and Awards')
      this.data.certifications.filter(c => c.name).forEach(cert => {
        this.addText(`• ${cert.name}${cert.date ? ` - ${cert.date}` : ''}`, this.margins.left, this.yPos, { size: 8 })
        this.yPos += 4
      })
    }
  }

  private addModernSectionTitle(title: string) {
    this.addText(title.toUpperCase(), this.margins.left, this.yPos, { size: 11, bold: true })
    this.yPos += 3
    this.setFillColor(this.config.colors.primary)
    this.doc.rect(this.margins.left, this.yPos, this.contentWidth, 0.3, 'F')
    this.yPos += 5
  }

  // ============================================================================
  // TEMPLATE 5: Photo/LuxSleek (LaTeX lines 740-933)
  // Two-column: 33% dark navy sidebar, 67% white main content
  // ============================================================================
  private generatePhoto() {
    const sidebarWidth = this.pageWidth * 0.33
    const mainX = sidebarWidth + 8
    const mainWidth = this.pageWidth - mainX - this.margins.right
    const navy = this.config.colors.sidebar || '#304263'

    // Draw sidebar background
    this.setFillColor(navy)
    this.doc.rect(0, 0, sidebarWidth, this.pageHeight, 'F')

    // Sidebar content
    let sideY = 20

    // Name in sidebar (white text)
    const nameParts = (this.data.personalInfo.name || 'First Last').split(' ')
    this.addText(nameParts[0] || 'First', 10, sideY, { size: 14, color: '#ffffff' })
    this.addText((nameParts.slice(1).join(' ') || 'Last').toUpperCase(), 10, sideY + 5, {
      size: 14, bold: true, color: '#ffffff'
    })
    sideY += 15

    // Profile section
    if (this.data.personalInfo.summary) {
      this.addSidebarHeader('Profile', sideY, sidebarWidth)
      sideY += 6
      const h = this.addText(this.data.personalInfo.summary.substring(0, 200), 10, sideY, {
        size: 7, color: '#e0e0e0', maxWidth: sidebarWidth - 20
      })
      sideY += h + 6
    }

    // Contact details
    this.addSidebarHeader('Contact Details', sideY, sidebarWidth)
    sideY += 6
    if (this.data.personalInfo.email) {
      this.addText(`✉ ${this.data.personalInfo.email}`, 10, sideY, { size: 7, color: '#e0e0e0' })
      sideY += 4
    }
    if (this.data.personalInfo.phone) {
      this.addText(`📞 ${this.data.personalInfo.phone}`, 10, sideY, { size: 7, color: '#e0e0e0' })
      sideY += 4
    }
    if (this.data.links.length > 0) {
      this.addText(`🌐 ${this.data.links[0]?.name || this.data.links[0]?.url}`, 10, sideY, { size: 7, color: '#e0e0e0' })
      sideY += 4
    }
    if (this.data.personalInfo.location) {
      this.addText(`📍 ${this.data.personalInfo.location}`, 10, sideY, { size: 7, color: '#e0e0e0' })
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
        this.addText(`◆ ${skill.trim()}`, 10, sideY, { size: 7, color: '#e0e0e0' })
        sideY += 4
      })
    }

    // Main content (right side)
    let mainY = 20

    // Experience
    if (this.data.experience.some(e => e.jobTitle)) {
      this.addPhotoSectionTitle('Experience', mainX, mainY, mainWidth)
      mainY += 7
      this.data.experience.filter(e => e.jobTitle).slice(0, 4).forEach(exp => {
        this.addText(exp.jobTitle.toUpperCase(), mainX, mainY, { size: 9, bold: true, color: '#1f2937' })
        this.addText(exp.date, mainX + mainWidth, mainY, { size: 7, bold: true, color: '#666666', align: 'right' })
        mainY += 4
        this.addText(`at ${exp.company}`, mainX, mainY, { size: 8, italic: true, color: '#666666' })
        mainY += 4
        if (exp.responsibilities) {
          const line = exp.responsibilities.split('\n')[0]?.replace(/^[•\-]\s*/, '') || ''
          this.addText(`◆ ${line.substring(0, 100)}`, mainX, mainY, { size: 7, color: '#666666' })
          mainY += 5
        }
        mainY += 2
      })
    }

    // Education
    if (this.data.education.some(e => e.school)) {
      this.addPhotoSectionTitle('Education', mainX, mainY, mainWidth)
      mainY += 7
      this.data.education.filter(e => e.school).forEach(edu => {
        this.addText(edu.degree.toUpperCase(), mainX, mainY, { size: 9, bold: true, color: '#1f2937' })
        this.addText(edu.date, mainX + mainWidth, mainY, { size: 7, bold: true, color: '#666666', align: 'right' })
        mainY += 4
        this.addText(`${edu.school}`, mainX, mainY, { size: 8, italic: true, color: '#666666' })
        mainY += 5
      })
    }

    // Projects
    if (this.data.projects.some(p => p.name)) {
      this.addPhotoSectionTitle('Projects', mainX, mainY, mainWidth)
      mainY += 7
      this.data.projects.filter(p => p.name).slice(0, 3).forEach(proj => {
        this.addText(proj.name.toUpperCase(), mainX, mainY, { size: 9, bold: true, color: '#1f2937' })
        mainY += 4
        if (proj.description) {
          this.addText(`◆ ${proj.description.substring(0, 80)}`, mainX, mainY, { size: 7, color: '#666666' })
          mainY += 5
        }
      })
    }

    // Certifications
    if (this.data.certifications.some(c => c.name)) {
      this.addPhotoSectionTitle('Certifications', mainX, mainY, mainWidth)
      mainY += 7
      this.data.certifications.filter(c => c.name).forEach(cert => {
        this.addText(`◆ ${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`, mainX, mainY, { size: 8 })
        mainY += 4
      })
    }
  }

  private addSidebarHeader(title: string, y: number, width: number) {
    this.addText(title.toUpperCase(), 10, y, { size: 8, bold: true, color: '#ffffff' })
    this.setFillColor('#ffffff')
    this.doc.setDrawColor(255, 255, 255)
    this.doc.line(10, y + 2, width - 10, y + 2)
  }

  private addPhotoSectionTitle(title: string, x: number, y: number, width: number) {
    const navy = this.config.colors.sidebar || '#304263'
    this.addText(title.toUpperCase(), x, y, { size: 11, bold: true, color: navy })
    this.setFillColor(navy)
    this.doc.rect(x, y + 2, width, 0.5, 'F')
  }

  // Helper for titlerule sections
  private addSectionTitle(title: string) {
    if (this.yPos > this.pageHeight - 30) return
    this.addText(title, this.margins.left, this.yPos, {
      size: 11,
      bold: true,
      color: this.config.colors.primary
    })
    this.yPos += 3
    this.setFillColor(this.config.colors.primary)
    this.doc.rect(this.margins.left, this.yPos, this.contentWidth, 0.3, 'F')
    this.yPos += 5
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
