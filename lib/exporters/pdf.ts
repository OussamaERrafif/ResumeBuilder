import { jsPDF } from 'jspdf'
import type { ResumeData, ATSTemplateConfig } from './types'

// ─── Constants ────────────────────────────────────────────────────────────────

const A4_W = 210
const A4_H = 297

// Line height multiplier: fontSize (pt) × LH_FACTOR = line height in mm
// 1pt = 0.352778mm; ×0.5 ≈ 1.42 ratio — comfortable reading
const LH = 0.5

function lh(size: number) { return size * LH }

function hex2rgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : { r: 0, g: 0, b: 0 }
}

type TextOpts = {
  size?: number
  weight?: 'normal' | 'bold'
  style?: 'normal' | 'italic'
  color?: string
  align?: 'left' | 'center' | 'right'
  maxW?: number
}

// ─── Generator ────────────────────────────────────────────────────────────────

export class ATSPDFGenerator {
  private doc: jsPDF
  private cfg: ATSTemplateConfig
  private data: ResumeData

  // Layout bounds (derived from template spacing)
  private ml: number
  private mr: number
  private mt: number
  private mb: number
  private cw: number  // usable content width

  // Mutable render state
  private y = 0
  private pageNum = 1

  // Optional hook called after every automatic page break (used for sidebar redraw)
  private onPageBreak: (() => void) | null = null

  constructor(cfg: ATSTemplateConfig, data: ResumeData) {
    this.cfg = cfg
    this.data = data
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true,
    })

    const s = cfg.spacing
    this.ml = s.marginLeft
    this.mr = s.marginRight
    this.mt = s.marginTop
    this.mb = s.marginBottom
    this.cw = A4_W - this.ml - this.mr
    this.y = this.mt

    this.doc.setFont(cfg.font, 'normal')
  }

  // ─── Color helpers ─────────────────────────────────────────────────────────

  private setTextColor(hex: string) {
    const c = hex2rgb(hex)
    this.doc.setTextColor(c.r, c.g, c.b)
  }

  private setFillColor(hex: string) {
    const c = hex2rgb(hex)
    this.doc.setFillColor(c.r, c.g, c.b)
  }

  private setDrawColor(hex: string) {
    const c = hex2rgb(hex)
    this.doc.setDrawColor(c.r, c.g, c.b)
  }

  // ─── Font helpers ──────────────────────────────────────────────────────────

  private setFont(weight: 'normal' | 'bold' = 'normal', style: 'normal' | 'italic' = 'normal') {
    const v =
      weight === 'bold' && style === 'italic' ? 'bolditalic' :
      weight === 'bold' ? 'bold' :
      style === 'italic' ? 'italic' : 'normal'
    this.doc.setFont(this.cfg.font, v)
  }

  // ─── Core text primitive ───────────────────────────────────────────────────

  /**
   * Renders `str` at the given (x, atY). Splits on maxW; wraps to next line.
   * Does NOT update this.y. Does NOT add pages.
   * Returns total height consumed (line count × line height).
   */
  private text(str: string, x: number, atY: number, opts: TextOpts = {}): number {
    if (!str?.trim()) return 0

    const size  = opts.size   ?? 9
    const color = opts.color  ?? this.cfg.colors.text
    const align = opts.align  ?? 'left'
    const maxW  = opts.maxW   ?? (A4_W - x - this.mr)

    this.doc.setFontSize(size)
    this.setFont(opts.weight ?? 'normal', opts.style ?? 'normal')
    this.setTextColor(color)

    const lineH = lh(size)
    const lines: string[] = this.doc.splitTextToSize(str, maxW)
    let cy = atY

    for (const line of lines) {
      const tx =
        align === 'center' ? A4_W / 2 :
        align === 'right'  ? A4_W - this.mr : x
      this.doc.text(line, tx, cy, { align })
      cy += lineH
    }

    return lines.length * lineH
  }

  // ─── Stateful print helpers ────────────────────────────────────────────────

  /**
   * Renders each line of `str` at this.y, checking page breaks before each line.
   * Advances this.y. Returns total height.
   */
  private print(str: string, x: number, opts: TextOpts = {}): number {
    if (!str?.trim()) return 0

    const size  = opts.size   ?? 9
    const maxW  = opts.maxW   ?? (A4_W - x - this.mr)
    const color = opts.color  ?? this.cfg.colors.text
    const align = opts.align  ?? 'left'
    const lineH = lh(size)

    this.doc.setFontSize(size)
    this.setFont(opts.weight ?? 'normal', opts.style ?? 'normal')
    this.setTextColor(color)

    const lines: string[] = this.doc.splitTextToSize(str, maxW)
    let total = 0

    for (const line of lines) {
      this.needsSpace(lineH)
      const tx =
        align === 'center' ? A4_W / 2 :
        align === 'right'  ? A4_W - this.mr : x
      this.doc.text(line, tx, this.y, { align })
      this.y  += lineH
      total   += lineH
    }

    return total
  }

  /** Advance this.y by mm. */
  private gap(mm: number) { this.y += mm }

  // ─── Two-column row helper ─────────────────────────────────────────────────

  /**
   * Renders left text at x and right text right-aligned, on the same baseline.
   * Advances this.y by the taller of the two.
   */
  private row(
    left: string,
    right: string,
    x: number,
    leftOpts: TextOpts = {},
    rightOpts: TextOpts = {},
  ) {
    const rightReserve = 44
    const leftMaxW = leftOpts.maxW ?? (this.cw - rightReserve - 3)

    this.needsSpace(lh(leftOpts.size ?? 9))

    const hl = this.text(left,  x,            this.y, { maxW: leftMaxW,     ...leftOpts })
    const hr = this.text(right, A4_W - this.mr, this.y, { align: 'right', maxW: rightReserve, ...rightOpts })
    this.y += Math.max(hl, hr)
  }

  // ─── Bullet body renderer ──────────────────────────────────────────────────

  /**
   * Renders a block of text treating lines starting with - * or • as bullets.
   * Bullets are indented 4.5mm with a • prefix. Each line checks for page breaks.
   */
  private printBody(raw: string, x: number, maxW: number, size = 9, color?: string) {
    if (!raw?.trim()) return

    const c      = color ?? this.cfg.colors.text
    const indent = 4.5
    const lineH  = lh(size)

    for (const rawLine of raw.split('\n')) {
      const t = rawLine.trim()
      if (!t) continue

      const isBullet = /^[-*•]\s/.test(t)
      const content  = isBullet ? t.replace(/^[-*•]\s+/, '') : t
      const cx = isBullet ? x + indent : x
      const cw = isBullet ? maxW - indent : maxW

      this.doc.setFontSize(size)
      this.setFont('normal', 'normal')
      const sublines: string[] = this.doc.splitTextToSize(content, cw)

      for (let i = 0; i < sublines.length; i++) {
        this.needsSpace(lineH)
        this.setTextColor(c)

        if (isBullet && i === 0) {
          this.doc.setFontSize(size)
          this.doc.text('•', x, this.y)
        }

        this.doc.setFontSize(size)
        this.setFont('normal', 'normal')
        this.setTextColor(c)
        this.doc.text(sublines[i], cx, this.y)
        this.y += lineH
      }
      this.y += 0.8
    }
  }

  // ─── Page management ───────────────────────────────────────────────────────

  private addPage() {
    this.doc.addPage()
    this.pageNum++
    this.y = this.mt > 0 ? this.mt : 18
    this.onPageBreak?.()
  }

  /** Adds a page if less than `mm` remains before the bottom margin. */
  private needsSpace(mm: number) {
    if (this.y + mm > A4_H - this.mb) this.addPage()
  }

  // ─── Line drawing ──────────────────────────────────────────────────────────

  private hline(opts: { y?: number; color?: string; x0?: number; x1?: number; width?: number } = {}) {
    const y = opts.y ?? this.y
    this.setDrawColor(opts.color ?? this.cfg.colors.primary)
    this.doc.setLineWidth(opts.width ?? 0.3)
    this.doc.line(opts.x0 ?? this.ml, y, opts.x1 ?? A4_W - this.mr, y)
  }

  // ─── Section header variants ───────────────────────────────────────────────

  private headerClassic(title: string) {
    this.needsSpace(16)
    this.gap(4)
    this.print(title.toUpperCase(), this.ml, {
      size: 11, weight: 'bold', color: this.cfg.colors.primary,
    })
    this.gap(1)
    this.hline({ color: this.cfg.colors.primary })
    this.gap(5)
  }

  private headerCreative(title: string) {
    this.needsSpace(16)
    this.gap(5)
    this.print(title.toUpperCase(), this.ml, {
      size: 11, weight: 'bold', color: this.cfg.colors.primary,
    })
    this.gap(1.5)
    // Short accent bar under the title
    this.setFillColor(this.cfg.colors.primary)
    this.doc.rect(this.ml, this.y, 38, 0.6, 'F')
    this.gap(5)
  }

  private headerMinimal(title: string) {
    this.needsSpace(16)
    this.gap(5)
    this.print(title.toUpperCase(), this.ml, {
      size: 12, weight: 'bold', color: '#000000',
    })
    this.gap(1)
    this.hline({ color: '#000000', width: 0.4 })
    this.gap(5)
  }

  private headerModern(title: string) {
    this.needsSpace(16)
    this.gap(4)
    this.print(title.toUpperCase(), this.ml, {
      size: 11, weight: 'bold', color: this.cfg.colors.primary,
    })
    this.gap(1)
    this.hline({ color: this.cfg.colors.primary, width: 0.35 })
    this.gap(5)
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  public generate(): jsPDF {
    switch (this.cfg.id) {
      case 'ats-classic':  this.renderClassic();  break
      case 'ats-creative': this.renderCreative(); break
      case 'ats-minimal':  this.renderMinimal();  break
      case 'ats-modern':   this.renderModern();   break
      case 'ats-photo':    this.renderPhoto();    break
      default:             this.renderClassic()
    }
    return this.doc
  }

  public download(filename: string) { this.generate().save(filename) }

  public getPageCount() { return this.pageNum }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 1 — Classic
  // Centered header · pipe-separated contact · full-width underlined sections
  // ═══════════════════════════════════════════════════════════════════════════

  private renderClassic() {
    const { colors } = this.cfg
    const pi = this.data.personalInfo

    // Name
    this.print((pi.name || 'Your Name').toUpperCase(), A4_W / 2, {
      size: 20, weight: 'bold', color: colors.primary,
      align: 'center', maxW: this.cw,
    })
    this.gap(2.5)

    // Professional title
    if (pi.title) {
      this.print(pi.title, A4_W / 2, {
        size: 10, style: 'italic', color: colors.secondary,
        align: 'center', maxW: this.cw,
      })
      this.gap(2)
    }

    // Contact row
    const contact = [
      pi.phone, pi.email, pi.location,
      ...this.data.links.filter(l => l.url).slice(0, 2).map(l => l.name || l.url),
    ].filter(Boolean)

    if (contact.length) {
      this.print(contact.join('  |  '), A4_W / 2, {
        size: 8.5, color: colors.secondary, align: 'center', maxW: this.cw,
      })
      this.gap(2)
    }

    // Summary
    if (pi.summary) {
      this.headerClassic('Professional Summary')
      this.print(pi.summary, this.ml, { size: 9, maxW: this.cw })
      this.gap(2)
    }

    // Technical Skills
    const { skills } = this.data
    const skillRows = [
      skills.languages  && { label: 'Programming Languages', value: skills.languages },
      skills.frameworks && { label: 'Frameworks & Libraries', value: skills.frameworks },
      skills.tools      && { label: 'Tools & Platforms',      value: skills.tools },
    ].filter(Boolean) as { label: string; value: string }[]

    if (skillRows.length) {
      this.headerClassic('Technical Skills')
      for (const { label, value } of skillRows) {
        this.needsSpace(8)
        // Measure label width so value starts inline
        this.doc.setFontSize(9)
        this.setFont('bold')
        const labelPx = this.doc.getTextWidth(label + ': ')
        this.text(label + ': ', this.ml, this.y, { size: 9, weight: 'bold' })
        const h = this.text(value, this.ml + labelPx, this.y, {
          size: 9, maxW: this.cw - labelPx,
        })
        this.y += Math.max(lh(9), h) + 1.5
      }
      this.gap(2)
    }

    // Experience
    const exps = this.data.experience.filter(e => e.jobTitle)
    if (exps.length) {
      this.headerClassic('Professional Experience')
      for (const exp of exps.slice(0, 6)) {
        this.needsSpace(18)
        this.row(exp.jobTitle, exp.date, this.ml,
          { size: 10, weight: 'bold' },
          { size: 8.5, color: colors.muted },
        )
        this.gap(0.5)
        if (exp.company) {
          this.print(exp.company, this.ml, { size: 9, style: 'italic', color: colors.secondary })
          this.gap(1)
        }
        if (exp.responsibilities) this.printBody(exp.responsibilities, this.ml, this.cw)
        this.gap(3.5)
      }
    }

    // Projects
    const projs = this.data.projects.filter(p => p.name)
    if (projs.length) {
      this.headerClassic('Projects')
      for (const proj of projs.slice(0, 5)) {
        this.needsSpace(14)
        this.row(proj.name, proj.technologies || '', this.ml,
          { size: 10, weight: 'bold' },
          { size: 8, style: 'italic', color: colors.secondary },
        )
        this.gap(0.5)
        if (proj.description) this.printBody(proj.description, this.ml, this.cw)
        this.gap(2.5)
      }
    }

    // Education
    const edus = this.data.education.filter(e => e.school)
    if (edus.length) {
      this.headerClassic('Education')
      for (const edu of edus) {
        this.needsSpace(12)
        this.row(edu.school, edu.date, this.ml,
          { size: 10, weight: 'bold' },
          { size: 8.5, color: colors.muted },
        )
        this.gap(0.5)
        const deg = [edu.degree, edu.gpa ? `GPA: ${edu.gpa}` : '', edu.honors].filter(Boolean).join('  ·  ')
        this.print(deg, this.ml, { size: 9, style: 'italic', color: colors.secondary })
        this.gap(3)
      }
    }

    // Certifications
    const certs = this.data.certifications.filter(c => c.name)
    if (certs.length) {
      this.headerClassic('Certifications')
      for (const cert of certs) {
        this.needsSpace(8)
        const str = [cert.name, cert.issuer, cert.date].filter(Boolean).join('  —  ')
        this.print('• ' + str, this.ml, { size: 9, maxW: this.cw })
        this.gap(2)
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 2 — Creative
  // Left-aligned name in accent colour · short accent bar under each header
  // ═══════════════════════════════════════════════════════════════════════════

  private renderCreative() {
    const { colors } = this.cfg
    const pi = this.data.personalInfo

    // Name
    this.print(pi.name || 'Your Name', this.ml, {
      size: 22, weight: 'bold', color: colors.primary, maxW: this.cw,
    })
    this.gap(2.5)

    // Professional title
    if (pi.title) {
      this.print(pi.title, this.ml, {
        size: 11, style: 'italic', color: colors.secondary, maxW: this.cw,
      })
      this.gap(2)
    }

    // Contact row
    const contact = [
      pi.email    && `✉  ${pi.email}`,
      pi.phone    && `✆  ${pi.phone}`,
      pi.location && `⌖  ${pi.location}`,
      ...this.data.links.filter(l => l.url).slice(0, 2).map(l => l.name || l.url),
    ].filter(Boolean).join('    ')

    this.print(contact, this.ml, { size: 8.5, color: colors.secondary, maxW: this.cw })
    this.gap(4)

    // Full-width accent divider
    this.setFillColor(colors.primary)
    this.doc.rect(this.ml, this.y, this.cw, 0.8, 'F')
    this.gap(5)

    // Summary (no section header — displayed as a bio block)
    if (pi.summary) {
      this.print(pi.summary, this.ml, { size: 9, maxW: this.cw })
      this.gap(5)
    }

    // Skills — 3-column grid
    const { skills } = this.data
    const allSkills = [
      ...(skills.languages?.split(',')  ?? []),
      ...(skills.frameworks?.split(',') ?? []),
      ...(skills.tools?.split(',')      ?? []),
    ].map(s => s.trim()).filter(Boolean).slice(0, 18)

    if (allSkills.length) {
      this.headerCreative('Skills')
      const cols = 3
      const colW = this.cw / cols
      let col    = 0

      for (const skill of allSkills) {
        this.text('•  ' + skill, this.ml + col * colW, this.y, { size: 8.5, maxW: colW - 3 })
        col++
        if (col >= cols) { col = 0; this.y += lh(8.5) + 1 }
      }
      if (col > 0) this.y += lh(8.5) + 1
      this.gap(3)
    }

    // Experience
    const exps = this.data.experience.filter(e => e.jobTitle)
    if (exps.length) {
      this.headerCreative('Experience')
      for (const exp of exps.slice(0, 5)) {
        this.needsSpace(18)
        this.row(
          exp.company ? `${exp.jobTitle}  —  ${exp.company}` : exp.jobTitle,
          exp.date,
          this.ml,
          { size: 10, weight: 'bold' },
          { size: 8.5, color: colors.muted },
        )
        this.gap(1)
        if (exp.responsibilities) this.printBody(exp.responsibilities, this.ml, this.cw, 9)
        this.gap(3.5)
      }
    }

    // Education
    const edus = this.data.education.filter(e => e.school)
    if (edus.length) {
      this.headerCreative('Education')
      for (const edu of edus) {
        this.needsSpace(12)
        this.print(edu.degree || edu.school, this.ml, { size: 9.5, weight: 'bold' })
        this.gap(0.5)
        this.print(`${edu.school}  ·  ${edu.date}`, this.ml, { size: 8.5, color: colors.secondary })
        this.gap(3)
      }
    }

    // Projects
    const projs = this.data.projects.filter(p => p.name)
    if (projs.length) {
      this.headerCreative('Projects')
      for (const proj of projs.slice(0, 4)) {
        this.needsSpace(12)
        const header = proj.technologies ? `${proj.name}  (${proj.technologies})` : proj.name
        this.print(header, this.ml, { size: 9.5, weight: 'bold' })
        this.gap(0.5)
        if (proj.description) this.print(proj.description, this.ml, { size: 8.5, maxW: this.cw })
        this.gap(3)
      }
    }

    // Awards & Certifications
    const certs = this.data.certifications.filter(c => c.name)
    if (certs.length) {
      this.headerCreative('Awards & Certifications')
      for (const cert of certs.slice(0, 5)) {
        this.needsSpace(8)
        this.row(cert.name, cert.date || '', this.ml,
          { size: 9, weight: 'bold' },
          { size: 8, color: colors.muted },
        )
        if (cert.issuer) {
          this.gap(0.5)
          this.print(cert.issuer, this.ml, { size: 8.5, color: colors.secondary })
        }
        this.gap(2.5)
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 3 — Minimal
  // Centered header · thin top rule · tabular education & skills
  // ═══════════════════════════════════════════════════════════════════════════

  private renderMinimal() {
    const pi = this.data.personalInfo

    // Name centred
    this.print((pi.name || 'Your Name').toUpperCase(), A4_W / 2, {
      size: 22, weight: 'bold', color: '#000000', align: 'center', maxW: this.cw,
    })
    this.gap(3)

    if (pi.title) {
      this.print(pi.title, A4_W / 2, {
        size: 10, color: '#444444', align: 'center', maxW: this.cw,
      })
      this.gap(2)
    }

    const contact = [
      pi.email, pi.phone, pi.location,
      ...this.data.links.filter(l => l.url).slice(0, 2).map(l => l.name || l.url),
    ].filter(Boolean)

    if (contact.length) {
      this.print(contact.join('  |  '), A4_W / 2, {
        size: 8.5, color: '#333333', align: 'center', maxW: this.cw,
      })
      this.gap(3)
    }

    // Horizontal rule below contact
    this.hline({ color: '#000000', width: 0.5 })
    this.gap(6)

    // Summary
    if (pi.summary) {
      this.headerMinimal('Summary')
      this.print(pi.summary, this.ml, { size: 9, maxW: this.cw })
      this.gap(2)
    }

    // Experience
    const exps = this.data.experience.filter(e => e.jobTitle)
    if (exps.length) {
      this.headerMinimal('Work Experience')
      for (const exp of exps.slice(0, 5)) {
        this.needsSpace(20)
        this.row(exp.jobTitle, exp.date, this.ml,
          { size: 10, weight: 'bold' },
          { size: 8.5, color: '#555555' },
        )
        this.gap(0.5)
        if (exp.company) {
          this.print(exp.company, this.ml, { size: 9, style: 'italic', color: '#444444' })
          this.gap(1)
        }
        if (exp.responsibilities) this.printBody(exp.responsibilities, this.ml, this.cw, 9, '#333333')
        this.gap(4)
      }
    }

    // Projects
    const projs = this.data.projects.filter(p => p.name)
    if (projs.length) {
      this.headerMinimal('Projects')
      for (const proj of projs.slice(0, 5)) {
        this.needsSpace(15)
        const header = proj.technologies ? `${proj.name}  ·  ${proj.technologies}` : proj.name
        this.print(header, this.ml, { size: 10, weight: 'bold' })
        this.gap(1)
        if (proj.description) this.printBody(proj.description, this.ml, this.cw, 9, '#333333')
        this.gap(3)
      }
    }

    // Education — tabular (date | degree — school)
    const edus = this.data.education.filter(e => e.school)
    if (edus.length) {
      this.headerMinimal('Education')
      const dateW = 28
      const restX = this.ml + dateW + 4
      const restW = this.cw - dateW - 4

      for (const edu of edus) {
        this.needsSpace(10)
        this.text(edu.date, this.ml, this.y, { size: 8.5, color: '#555555', maxW: dateW })
        const degStr = `${edu.degree}  —  ${edu.school}${edu.gpa ? `  (GPA: ${edu.gpa})` : ''}`
        const h = this.text(degStr, restX, this.y, { size: 9, maxW: restW })
        this.y += Math.max(lh(8.5), h) + 2.5
      }
      this.gap(2)
    }

    // Skills — tabular
    const { skills } = this.data
    if (skills.languages || skills.frameworks || skills.tools) {
      this.headerMinimal('Skills')
      const labelW = 32
      const valueX = this.ml + labelW + 4
      const valueW = this.cw - labelW - 4

      for (const [label, value] of [
        ['Languages',  skills.languages],
        ['Frameworks', skills.frameworks],
        ['Tools',      skills.tools],
      ] as [string, string | undefined][]) {
        if (!value) continue
        this.needsSpace(8)
        this.text(label, this.ml, this.y, { size: 9, weight: 'bold', maxW: labelW })
        const h = this.text(value, valueX, this.y, { size: 9, maxW: valueW })
        this.y += Math.max(lh(9), h) + 2
      }
      this.gap(2)
    }

    // Certifications
    const certs = this.data.certifications.filter(c => c.name)
    if (certs.length) {
      this.headerMinimal('Certifications')
      for (const cert of certs) {
        this.needsSpace(8)
        const str = [cert.name, cert.issuer, cert.date].filter(Boolean).join('  —  ')
        this.print('–  ' + str, this.ml, { size: 9, maxW: this.cw })
        this.gap(2)
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 4 — Modern
  // Left-aligned header · education first · aligned skill columns
  // ═══════════════════════════════════════════════════════════════════════════

  private renderModern() {
    const { colors } = this.cfg
    const pi = this.data.personalInfo

    // Name — left; contact block — right
    this.text(pi.name || 'Your Name', this.ml, this.y, {
      size: 20, weight: 'bold', maxW: this.cw * 0.55,
    })

    // Right-side contact items stacked
    const contactItems = [
      pi.email, pi.phone, pi.location,
      ...this.data.links.filter(l => l.url).slice(0, 2).map(l => l.name || l.url),
    ].filter(Boolean)

    let ry = this.y
    for (const item of contactItems) {
      this.text(item, A4_W - this.mr, ry, {
        size: 8.5, color: colors.secondary, align: 'right', maxW: this.cw * 0.4,
      })
      ry += lh(8.5)
    }

    this.y = Math.max(this.y + lh(20), ry) + 2.5

    if (pi.title) {
      this.print(pi.title, this.ml, { size: 10, style: 'italic', color: colors.secondary })
      this.gap(1)
    }
    this.gap(2)
    this.hline({ color: colors.primary, width: 0.5 })
    this.gap(5)

    // Summary
    if (pi.summary) {
      this.headerModern('Summary')
      this.print(pi.summary, this.ml, { size: 9, maxW: this.cw })
      this.gap(2)
    }

    // Education first (common for modern/developer resumes)
    const edus = this.data.education.filter(e => e.school)
    if (edus.length) {
      this.headerModern('Education')
      for (const edu of edus) {
        this.needsSpace(14)
        this.row(edu.school, edu.date, this.ml,
          { size: 10, weight: 'bold' },
          { size: 8.5, color: colors.muted },
        )
        this.gap(0.5)
        const deg = [edu.degree, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join('  ·  ')
        this.print(deg, this.ml, { size: 9, style: 'italic', color: colors.secondary })
        this.gap(3)
      }
    }

    // Skills — aligned columns
    const { skills } = this.data
    if (skills.languages || skills.frameworks || skills.tools) {
      this.headerModern('Technical Skills')
      const labelW = 38
      const valueX = this.ml + labelW + 5
      const valueW = this.cw - labelW - 5

      for (const [label, value] of [
        ['Languages',       skills.languages],
        ['Frameworks',      skills.frameworks],
        ['Developer Tools', skills.tools],
      ] as [string, string | undefined][]) {
        if (!value) continue
        this.needsSpace(8)
        this.text(label + ':', this.ml, this.y, { size: 9, weight: 'bold', maxW: labelW })
        const h = this.text(value, valueX, this.y, { size: 9, maxW: valueW })
        this.y += Math.max(lh(9), h) + 2
      }
      this.gap(2)
    }

    // Experience
    const exps = this.data.experience.filter(e => e.jobTitle)
    if (exps.length) {
      this.headerModern('Experience')
      for (const exp of exps.slice(0, 5)) {
        this.needsSpace(22)
        this.row(exp.company, exp.date, this.ml,
          { size: 10, weight: 'bold' },
          { size: 8.5, color: colors.muted },
        )
        this.gap(0.5)
        this.print(exp.jobTitle, this.ml, { size: 9, style: 'italic', color: colors.secondary })
        this.gap(1)
        if (exp.responsibilities) this.printBody(exp.responsibilities, this.ml, this.cw)
        this.gap(3.5)
      }
    }

    // Projects
    const projs = this.data.projects.filter(p => p.name)
    if (projs.length) {
      this.headerModern('Projects')
      for (const proj of projs.slice(0, 5)) {
        this.needsSpace(12)
        const techStr = proj.technologies ? `  |  ${proj.technologies}` : ''
        this.print(proj.name + techStr, this.ml, { size: 9.5, weight: 'bold', maxW: this.cw })
        this.gap(0.5)
        if (proj.description) this.printBody(proj.description, this.ml, this.cw, 9)
        this.gap(2.5)
      }
    }

    // Honors & Awards
    const certs = this.data.certifications.filter(c => c.name)
    if (certs.length) {
      this.headerModern('Honors & Awards')
      for (const cert of certs) {
        this.needsSpace(8)
        const str = [cert.name, cert.issuer, cert.date].filter(Boolean).join('  —  ')
        this.print('• ' + str, this.ml, { size: 9, maxW: this.cw })
        this.gap(2)
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE 5 — Photo / Sidebar
  // 32% dark-navy sidebar (name, contact, skills) · 68% white main content
  // ═══════════════════════════════════════════════════════════════════════════

  private renderPhoto() {
    const { colors } = this.cfg
    const pi = this.data.personalInfo

    const SIDE_W  = 67          // sidebar width in mm
    const SIDE_ML = 8           // sidebar inner margin
    const SIDE_CW = SIDE_W - SIDE_ML * 2
    const MAIN_X  = SIDE_W + 10
    const MAIN_W  = A4_W - MAIN_X - 15  // 15mm right margin
    const NAVY    = colors.primary       // '#304263'

    // ── Draw sidebar background on every new page ──────────────────────────
    const drawBg = () => {
      this.setFillColor(NAVY)
      this.doc.rect(0, 0, SIDE_W, A4_H, 'F')
    }

    drawBg()
    // Hook so automatic page-breaks inside printBody also redraw the sidebar
    this.onPageBreak = drawBg

    // ── Sidebar rendering ──────────────────────────────────────────────────

    let sy = 16

    // Profile photo
    if (pi.profileImage) {
      try {
        const sz = 42
        const ix = (SIDE_W - sz) / 2
        // White ring border behind image
        const wh = hex2rgb('#ffffff')
        this.doc.setFillColor(wh.r, wh.g, wh.b)
        this.doc.circle(ix + sz / 2, sy + sz / 2, sz / 2 + 2, 'F')
        this.doc.addImage(pi.profileImage, 'JPEG', ix, sy, sz, sz)
        sy += sz + 10
      } catch {
        // Skip on error — don't fail the entire export
      }
    }

    // Name split across two lines (First / LAST)
    const nameParts = (pi.name || 'Your Name').split(' ')
    const firstName = nameParts[0] ?? ''
    const lastName  = nameParts.slice(1).join(' ')

    this.text(firstName, SIDE_ML, sy, { size: 13, color: '#ffffff', maxW: SIDE_CW })
    sy += lh(13) + 1
    this.text(lastName.toUpperCase(), SIDE_ML, sy, {
      size: 13, weight: 'bold', color: '#ffffff', maxW: SIDE_CW,
    })
    sy += lh(13)

    if (pi.title) {
      sy += 3
      this.text(pi.title, SIDE_ML, sy, {
        size: 9, style: 'italic', color: '#b0c4de', maxW: SIDE_CW,
      })
      sy += lh(9) + 2
    }
    sy += 6

    // ── Sidebar section helpers ─────────────────────────────────────────────
    const sideHeader = (title: string) => {
      this.setDrawColor('#5a7ea8')
      this.doc.setLineWidth(0.5)
      this.doc.line(SIDE_ML, sy, SIDE_W - SIDE_ML, sy)
      sy += 3
      this.text(title.toUpperCase(), SIDE_ML, sy, {
        size: 9, weight: 'bold', color: '#ffffff', maxW: SIDE_CW,
      })
      sy += lh(9) + 3
    }

    const sidePrint = (str: string, sz = 8.5) => {
      if (!str?.trim()) return
      this.doc.setFontSize(sz)
      this.setFont('normal', 'normal')
      const lines: string[] = this.doc.splitTextToSize(str, SIDE_CW)
      for (const line of lines) {
        this.text(line, SIDE_ML, sy, { size: sz, color: '#c8d8ec', maxW: SIDE_CW })
        sy += lh(sz) + 0.5
      }
    }

    // Profile summary (truncated for sidebar)
    if (pi.summary) {
      sideHeader('Profile')
      sidePrint(pi.summary.substring(0, 280))
      sy += 4
    }

    // Contact details
    sideHeader('Contact')
    if (pi.phone)    { sidePrint(pi.phone);    sy += 1 }
    if (pi.email)    { sidePrint(pi.email);    sy += 1 }
    if (pi.location) { sidePrint(pi.location); sy += 1 }
    for (const link of this.data.links.slice(0, 3)) {
      if (link.url) sidePrint(link.url.replace(/^https?:\/\//, ''))
    }
    sy += 5

    // Skills in sidebar
    const { skills } = this.data
    const sideSkills = [
      ...(skills.languages?.split(',')  ?? []),
      ...(skills.frameworks?.split(',') ?? []),
      ...(skills.tools?.split(',')      ?? []),
    ].map(s => s.trim()).filter(Boolean).slice(0, 12)

    if (sideSkills.length) {
      sideHeader('Skills')
      for (const skill of sideSkills) sidePrint('•  ' + skill)
    }

    // ── Main content column ────────────────────────────────────────────────
    this.y = 18

    // Use this.addPage() so onPageBreak (drawBg) fires for sidebar continuity
    const mainBreak = (needed = 20) => {
      if (this.y + needed > A4_H - this.mb) this.addPage()
    }

    const mainHeader = (title: string) => {
      mainBreak(16)
      this.gap(3)
      this.text(title.toUpperCase(), MAIN_X, this.y, {
        size: 11, weight: 'bold', color: NAVY, maxW: MAIN_W,
      })
      this.y += lh(11) + 1
      this.hline({ color: colors.secondary, x0: MAIN_X, x1: MAIN_X + MAIN_W, width: 0.4 })
      this.gap(5)
    }

    // Experience
    const exps = this.data.experience.filter(e => e.jobTitle)
    if (exps.length) {
      mainHeader('Experience')
      for (const exp of exps.slice(0, 5)) {
        mainBreak(22)
        // Use actual text height — job titles can wrap on narrow columns
        const jobH = this.text(exp.jobTitle, MAIN_X, this.y, {
          size: 10.5, weight: 'bold', color: NAVY, maxW: MAIN_W,
        })
        this.y += jobH + 0.5
        const metaH = this.text(
          [exp.company, exp.date].filter(Boolean).join('  ·  '),
          MAIN_X, this.y,
          { size: 8.5, color: colors.secondary, maxW: MAIN_W },
        )
        this.y += metaH + 1.5
        if (exp.responsibilities) this.printBody(exp.responsibilities, MAIN_X, MAIN_W)
        this.gap(4)
      }
    }

    // Projects
    const projs = this.data.projects.filter(p => p.name)
    if (projs.length) {
      mainHeader('Projects')
      for (const proj of projs.slice(0, 4)) {
        mainBreak(14)
        const techStr = proj.technologies ? `  ·  ${proj.technologies}` : ''
        // Title can wrap when technologies string is long
        const titleH = this.text(proj.name + techStr, MAIN_X, this.y, {
          size: 10, weight: 'bold', color: NAVY, maxW: MAIN_W,
        })
        this.y += titleH + 1
        // Use printBody so descriptions page-break line-by-line instead of overflowing
        if (proj.description) {
          this.printBody(proj.description, MAIN_X, MAIN_W)
        }
        this.gap(3)
      }
    }

    // Education
    const edus = this.data.education.filter(e => e.school)
    if (edus.length) {
      mainHeader('Education')
      for (const edu of edus) {
        mainBreak(14)
        const schoolH = this.text(edu.school, MAIN_X, this.y, {
          size: 10, weight: 'bold', color: NAVY, maxW: MAIN_W,
        })
        this.y += schoolH + 0.5
        const degStr = [
          edu.degree, edu.date, edu.gpa ? `GPA: ${edu.gpa}` : '',
        ].filter(Boolean).join('  ·  ')
        const degH = this.text(degStr, MAIN_X, this.y, { size: 9, color: colors.secondary, maxW: MAIN_W })
        this.y += degH + 4
      }
    }

    // Certifications
    const certs = this.data.certifications.filter(c => c.name)
    if (certs.length) {
      mainHeader('Certifications')
      for (const cert of certs) {
        mainBreak(8)
        const str = [cert.name, cert.issuer, cert.date].filter(Boolean).join('  —  ')
        // Use print() so long cert lines page-break correctly
        this.print('• ' + str, MAIN_X, { size: 9, maxW: MAIN_W })
        this.gap(2)
      }
    }
  }
}

// ─── Standalone download helper ───────────────────────────────────────────────

export const downloadATSResumePDF = (
  template: ATSTemplateConfig,
  data: ResumeData,
  filename: string,
): void => {
  new ATSPDFGenerator(template, data).download(filename)
}
