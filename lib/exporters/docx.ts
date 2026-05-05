/**
 * ATS Resume Exporter - DOCX Generator
 * 
 * Generates ATS-friendly DOCX resumes.
 * Uses a simple XML-based approach for DOCX generation that doesn't require external libraries.
 */

import type { ResumeData } from './types'

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Parse responsibilities/descriptions into bullet points
 */
function parseResponsibilities(text: string): string[] {
  if (!text) return []
  
  const lines = text.split(/[\n\r]+|(?:^|\s)[•\-\*]\s|(?:^|\s)\d+\.\s/)
    .map(line => line.trim())
    .filter(line => line.length > 0)

  return lines.length > 0 ? lines : [text.trim()]
}

/**
 * Create a paragraph element
 */
function createParagraph(text: string, style?: string, bold?: boolean): string {
  const pStyle = style ? `<w:pStyle w:val="${style}"/>` : ''
  const boldTag = bold ? '<w:b/>' : ''
  
  return `
    <w:p>
      <w:pPr>${pStyle}</w:pPr>
      <w:r>
        <w:rPr>${boldTag}</w:rPr>
        <w:t>${escapeXml(text)}</w:t>
      </w:r>
    </w:p>`
}

/**
 * Create a heading paragraph
 */
function createHeading(text: string, level: number = 1): string {
  const size = level === 1 ? '48' : level === 2 ? '28' : '24'
  
  return `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading${level}"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="${size}"/>
          <w:szCs w:val="${size}"/>
        </w:rPr>
        <w:t>${escapeXml(text)}</w:t>
      </w:r>
    </w:p>`
}

/**
 * Create a bullet point paragraph
 */
function createBulletPoint(text: string): string {
  return `
    <w:p>
      <w:pPr>
        <w:numPr>
          <w:ilvl w:val="0"/>
          <w:numId w:val="1"/>
        </w:numPr>
      </w:pPr>
      <w:r>
        <w:t>${escapeXml(text)}</w:t>
      </w:r>
    </w:p>`
}

/**
 * Create a horizontal line
 */
function createHorizontalLine(): string {
  return `
    <w:p>
      <w:pPr>
        <w:pBdr>
          <w:bottom w:val="single" w:sz="6" w:space="1" w:color="000000"/>
        </w:pBdr>
      </w:pPr>
    </w:p>`
}

/**
 * Create styled text with multiple parts
 */
function createStyledParagraph(parts: Array<{ text: string; bold?: boolean; italic?: boolean }>): string {
  const runs = parts.map(part => {
    const boldTag = part.bold ? '<w:b/>' : ''
    const italicTag = part.italic ? '<w:i/>' : ''
    return `
      <w:r>
        <w:rPr>${boldTag}${italicTag}</w:rPr>
        <w:t xml:space="preserve">${escapeXml(part.text)}</w:t>
      </w:r>`
  }).join('')

  return `<w:p>${runs}</w:p>`
}

/**
 * Generate the document.xml content
 */
function generateDocumentXml(data: ResumeData): string {
  const { personalInfo, links, education, experience, skills, projects, certifications, references } = data
  
  const content: string[] = []

  // Header - Name (large and bold)
  content.push(`
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="56"/>
          <w:szCs w:val="56"/>
        </w:rPr>
        <w:t>${escapeXml(personalInfo.name || 'Your Name')}</w:t>
      </w:r>
    </w:p>`)

  // Title
  if (personalInfo.title) {
    content.push(`
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:i/>
            <w:sz w:val="24"/>
          </w:rPr>
          <w:t>${escapeXml(personalInfo.title)}</w:t>
        </w:r>
      </w:p>`)
  }

  // Contact info
  const contactParts: string[] = []
  if (personalInfo.email) contactParts.push(personalInfo.email)
  if (personalInfo.phone) contactParts.push(personalInfo.phone)
  if (personalInfo.location) contactParts.push(personalInfo.location)
  
  if (contactParts.length > 0) {
    content.push(`
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:sz w:val="20"/>
          </w:rPr>
          <w:t>${escapeXml(contactParts.join('  |  '))}</w:t>
        </w:r>
      </w:p>`)
  }

  // Links
  const validLinks = links.filter(link => link.name && link.url)
  if (validLinks.length > 0) {
    const linksText = validLinks.map(link => `${link.name}: ${link.url}`).join('  |  ')
    content.push(`
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:sz w:val="18"/>
            <w:color w:val="0563C1"/>
          </w:rPr>
          <w:t>${escapeXml(linksText)}</w:t>
        </w:r>
      </w:p>`)
  }

  content.push(createHorizontalLine())

  // Summary
  if (personalInfo.summary?.trim()) {
    content.push(createHeading('SUMMARY', 2))
    content.push(createParagraph(personalInfo.summary))
    content.push('<w:p/>')
  }

  // Technical Skills
  const hasSkills = skills.languages?.trim() || skills.frameworks?.trim() || skills.tools?.trim()
  if (hasSkills) {
    content.push(createHeading('TECHNICAL SKILLS', 2))
    
    if (skills.languages?.trim()) {
      content.push(createStyledParagraph([
        { text: 'Programming Languages: ', bold: true },
        { text: skills.languages }
      ]))
    }
    if (skills.frameworks?.trim()) {
      content.push(createStyledParagraph([
        { text: 'Frameworks & Libraries: ', bold: true },
        { text: skills.frameworks }
      ]))
    }
    if (skills.tools?.trim()) {
      content.push(createStyledParagraph([
        { text: 'Tools & Platforms: ', bold: true },
        { text: skills.tools }
      ]))
    }
    content.push('<w:p/>')
  }

  // Experience
  const validExperience = experience.filter(exp => exp.jobTitle && exp.company)
  if (validExperience.length > 0) {
    content.push(createHeading('PROFESSIONAL EXPERIENCE', 2))
    
    validExperience.forEach(exp => {
      // Job title and date on same conceptual line
      content.push(createStyledParagraph([
        { text: exp.jobTitle, bold: true },
        { text: exp.date ? `  |  ${exp.date}` : '' }
      ]))
      
      // Company and location
      const companyLine = exp.location ? `${exp.company}  |  ${exp.location}` : exp.company
      content.push(createStyledParagraph([
        { text: companyLine, italic: true }
      ]))
      
      // Responsibilities
      if (exp.responsibilities) {
        const responsibilities = parseResponsibilities(exp.responsibilities)
        responsibilities.forEach(resp => {
          content.push(createBulletPoint(resp))
        })
      }
      content.push('<w:p/>')
    })
  }

  // Projects
  const validProjects = projects.filter(proj => proj.name)
  if (validProjects.length > 0) {
    content.push(createHeading('PROJECTS', 2))
    
    validProjects.forEach(proj => {
      content.push(createStyledParagraph([
        { text: proj.name, bold: true },
        { text: proj.link ? `  |  ${proj.link}` : '' }
      ]))
      
      if (proj.technologies) {
        content.push(createStyledParagraph([
          { text: proj.technologies, italic: true }
        ]))
      }
      
      if (proj.description) {
        const descLines = parseResponsibilities(proj.description)
        descLines.forEach(line => {
          content.push(createBulletPoint(line))
        })
      }
      content.push('<w:p/>')
    })
  }

  // Education
  const validEducation = education.filter(edu => edu.school && edu.degree)
  if (validEducation.length > 0) {
    content.push(createHeading('EDUCATION', 2))
    
    validEducation.forEach(edu => {
      content.push(createStyledParagraph([
        { text: edu.school, bold: true },
        { text: edu.date ? `  |  ${edu.date}` : '' }
      ]))
      
      content.push(createParagraph(edu.degree))
      
      if (edu.gpa) {
        content.push(createParagraph(`GPA: ${edu.gpa}`))
      }
      if (edu.honors) {
        content.push(createStyledParagraph([
          { text: edu.honors, italic: true }
        ]))
      }
      content.push('<w:p/>')
    })
  }

  // Certifications
  const validCertifications = certifications.filter(cert => cert.name)
  if (validCertifications.length > 0) {
    content.push(createHeading('CERTIFICATIONS', 2))
    
    validCertifications.forEach(cert => {
      const certParts: Array<{ text: string; bold?: boolean }> = [
        { text: cert.name, bold: true }
      ]
      if (cert.issuer) {
        certParts.push({ text: ` - ${cert.issuer}` })
      }
      if (cert.date) {
        certParts.push({ text: ` (${cert.date})` })
      }
      content.push(createBulletPoint(
        cert.issuer 
          ? `${cert.name} - ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}`
          : `${cert.name}${cert.date ? ` (${cert.date})` : ''}`
      ))
    })
    content.push('<w:p/>')
  }

  // References
  const validReferences = references.filter(ref => ref.name)
  if (validReferences.length > 0) {
    content.push(createHeading('REFERENCES', 2))
    
    validReferences.forEach(ref => {
      content.push(createParagraph(ref.name, undefined, true))
      
      if (ref.title || ref.company) {
        const titleLine = ref.company 
          ? `${ref.title} at ${ref.company}`
          : ref.title
        content.push(createStyledParagraph([
          { text: titleLine, italic: true }
        ]))
      }
      
      const contactInfo: string[] = []
      if (ref.email) contactInfo.push(ref.email)
      if (ref.phone) contactInfo.push(ref.phone)
      
      if (contactInfo.length > 0) {
        content.push(createParagraph(contactInfo.join('  |  ')))
      }
      content.push('<w:p/>')
    })
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${content.join('\n')}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`
}

/**
 * Generate the numbering.xml for bullet points
 */
function generateNumberingXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:ind w:left="720" w:hanging="360"/>
      </w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
</w:numbering>`
}

/**
 * Generate styles.xml
 */
function generateStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="240" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="Heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="200" w:after="100"/>
      <w:pBdr>
        <w:bottom w:val="single" w:sz="4" w:space="1" w:color="000000"/>
      </w:pBdr>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="26"/>
      <w:szCs w:val="26"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
    </w:rPr>
  </w:style>
</w:styles>`
}

/**
 * Generate [Content_Types].xml
 */
function generateContentTypesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>`
}

/**
 * Generate _rels/.rels
 */
function generateRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
}

/**
 * Generate word/_rels/document.xml.rels
 */
function generateDocumentRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`
}

/**
 * Create a DOCX file as a blob using JSZip-like approach
 * Since JSZip isn't available, we'll use a simpler approach with Blob
 */
async function createDocxBlob(data: ResumeData): Promise<Blob> {
  // For proper DOCX generation, we need a ZIP library
  // Since we want to avoid additional dependencies, we'll dynamically import JSZip
  // or fall back to a simpler text-based approach
  
  try {
    // Try to dynamically import JSZip if available
    const JSZip = (await import('jszip')).default
    
    const zip = new JSZip()
    
    // Add content types
    zip.file('[Content_Types].xml', generateContentTypesXml())
    
    // Add relationships
    zip.folder('_rels')?.file('.rels', generateRelsXml())
    
    // Add word folder contents
    const wordFolder = zip.folder('word')
    wordFolder?.file('document.xml', generateDocumentXml(data))
    wordFolder?.file('styles.xml', generateStylesXml())
    wordFolder?.file('numbering.xml', generateNumberingXml())
    
    // Add word relationships
    wordFolder?.folder('_rels')?.file('document.xml.rels', generateDocumentRelsXml())
    
    // Generate the DOCX file
    return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  } catch {
    // If JSZip is not available, provide instructions
    throw new Error('DOCX export requires the jszip package. Please run: npm install jszip')
  }
}

/**
 * Download DOCX file
 */
export async function downloadResumeDocx(data: ResumeData, filename?: string): Promise<void> {
  const name = filename || generateDocxFilename(data)
  
  try {
    const blob = await createDocxBlob(data)
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    // Re-throw with more helpful message
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to generate DOCX file')
  }
}

/**
 * Generate filename for DOCX export
 */
function generateDocxFilename(data: ResumeData): string {
  const name = data.personalInfo.name || 'Resume'
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_')
  const date = new Date().toISOString().split('T')[0]
  return `${cleanName}_Resume_${date}.docx`
}

/**
 * Check if DOCX export is available
 */
export async function isDocxExportAvailable(): Promise<boolean> {
  try {
    await import('jszip')
    return true
  } catch {
    return false
  }
}
