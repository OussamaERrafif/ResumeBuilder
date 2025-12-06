/**
 * ATS Resume Exporter - LaTeX Generator
 * 
 * Generates ATS-friendly LaTeX resumes using a clean, professional template.
 * The output is designed to be directly compilable with pdflatex.
 */

import type { ResumeData } from './types'

/**
 * Escape special LaTeX characters
 */
function escapeLatex(text: string): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
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
 * Generate LaTeX document for resume
 */
export function generateResumeLatex(data: ResumeData): string {
  const { personalInfo, links, education, experience, skills, projects, certifications, references } = data

  // Build sections
  const sections: string[] = []

  // Summary section
  if (personalInfo.summary?.trim()) {
    sections.push(`
\\section*{Summary}
${escapeLatex(personalInfo.summary)}
`)
  }

  // Technical Skills section
  const skillEntries: string[] = []
  if (skills.languages?.trim()) {
    skillEntries.push(`  \\resumeItem{\\textbf{Programming Languages}: ${escapeLatex(skills.languages)}}`)
  }
  if (skills.frameworks?.trim()) {
    skillEntries.push(`  \\resumeItem{\\textbf{Frameworks \\& Libraries}: ${escapeLatex(skills.frameworks)}}`)
  }
  if (skills.tools?.trim()) {
    skillEntries.push(`  \\resumeItem{\\textbf{Tools \\& Platforms}: ${escapeLatex(skills.tools)}}`)
  }

  if (skillEntries.length > 0) {
    sections.push(`
\\section{Technical Skills}
\\resumeSubHeadingList
${skillEntries.join('\n')}
\\resumeSubHeadingListEnd
`)
  }

  // Experience section
  const validExperience = experience.filter(exp => exp.jobTitle && exp.company)
  if (validExperience.length > 0) {
    const expEntries = validExperience.map(exp => {
      const responsibilities = parseResponsibilities(exp.responsibilities)
      const bulletPoints = responsibilities.map(resp => 
        `          \\resumeItem{\\textbullet\\ ${escapeLatex(resp)}}`
      ).join('\n')

      return `  \\resumeSubheading
      {${escapeLatex(exp.jobTitle)}}{${escapeLatex(exp.date || '')}}
      {${escapeLatex(exp.company)}}{${escapeLatex(exp.location || '')}}
      \\resumeSubHeadingList
${bulletPoints}
      \\resumeSubHeadingListEnd`
    }).join('\n')

    sections.push(`
\\section{Experience}
\\resumeSubHeadingList
${expEntries}
\\resumeSubHeadingListEnd
`)
  }

  // Projects section
  const validProjects = projects.filter(proj => proj.name)
  if (validProjects.length > 0) {
    const projEntries = validProjects.map(proj => {
      const descLines = proj.description ? parseResponsibilities(proj.description) : []
      const bulletPoints = descLines.map(line => 
        `          \\resumeItem{\\textbullet\\ ${escapeLatex(line)}}`
      ).join('\n')

      return `  \\resumeSubheading
      {${escapeLatex(proj.name)}}{${escapeLatex(proj.link || '')}}
      {Personal Project}{${escapeLatex(proj.technologies || '')}}
      \\resumeSubHeadingList
${bulletPoints}
      \\resumeSubHeadingListEnd`
    }).join('\n')

    sections.push(`
\\section{Projects}
\\resumeSubHeadingList
${projEntries}
\\resumeSubHeadingListEnd
`)
  }

  // Education section
  const validEducation = education.filter(edu => edu.school && edu.degree)
  if (validEducation.length > 0) {
    const eduEntries = validEducation.map(edu => {
      let gpaLine = ''
      if (edu.gpa) {
        gpaLine = `\n      GPA: ${escapeLatex(edu.gpa)}`
      }
      return `  \\resumeSubheading
      {${escapeLatex(edu.school)}}{${escapeLatex(edu.location || '')}}
      {${escapeLatex(edu.degree)}}{${escapeLatex(edu.date || '')}}${gpaLine}`
    }).join('\n')

    sections.push(`
\\section{Education}
\\resumeSubHeadingList
${eduEntries}
\\resumeSubHeadingListEnd
`)
  }

  // Certifications section
  const validCertifications = certifications.filter(cert => cert.name)
  if (validCertifications.length > 0) {
    const certEntries = validCertifications.map(cert => {
      const certLine = cert.issuer 
        ? `${escapeLatex(cert.name)} - ${escapeLatex(cert.issuer)}`
        : escapeLatex(cert.name)
      const datePart = cert.date ? ` (${escapeLatex(cert.date)})` : ''
      return `  \\resumeItem{\\textbullet\\ ${certLine}${datePart}}`
    }).join('\n')

    sections.push(`
\\section{Certifications}
\\resumeSubHeadingList
${certEntries}
\\resumeSubHeadingListEnd
`)
  }

  // References section
  const validReferences = references.filter(ref => ref.name)
  if (validReferences.length > 0) {
    const refEntries = validReferences.map(ref => {
      const lines: string[] = [`\\textbf{${escapeLatex(ref.name)}}`]
      if (ref.title || ref.company) {
        const titleLine = ref.company 
          ? `${escapeLatex(ref.title)} at ${escapeLatex(ref.company)}`
          : escapeLatex(ref.title)
        lines.push(titleLine)
      }
      if (ref.email) lines.push(escapeLatex(ref.email))
      if (ref.phone) lines.push(escapeLatex(ref.phone))
      return `  \\resumeItem{${lines.join(' $|$ ')}}`
    }).join('\n')

    sections.push(`
\\section{References}
\\resumeSubHeadingList
${refEntries}
\\resumeSubHeadingListEnd
`)
  }

  // Build contact line for header
  const contactParts: string[] = []
  if (personalInfo.phone) contactParts.push(escapeLatex(personalInfo.phone))
  if (personalInfo.email) {
    contactParts.push(`\\href{mailto:${escapeLatex(personalInfo.email)}}{${escapeLatex(personalInfo.email)}}`)
  }
  
  // Add links
  const validLinks = links.filter(link => link.name && link.url)
  validLinks.forEach(link => {
    contactParts.push(`\\href{${escapeLatex(link.url)}}{${escapeLatex(link.name)}}`)
  })

  const contactLine = contactParts.join(' $|$ ')

  // Generate full LaTeX document
  return `\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

% Font options
\\usepackage[sfdefault]{roboto}  % Sans-serif font

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting
\\titleformat{\\section}{\\Large\\bfseries\\scshape\\raggedright}{}{0em}{}[\\titlerule]

% Ensure PDF is machine readable
\\pdfgentounicode=1

% Custom commands
\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeSubheading}[4]{
\\vspace{-1pt}\\item
  \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{#3} & \\textit{#4} \\\\
  \\end{tabular*}\\vspace{-7pt}
}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingList}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}

\\begin{document}

\\begin{center}
  \\textbf{\\Huge ${escapeLatex(personalInfo.name || 'Your Name')}} \\\\
  ${personalInfo.title ? `\\textit{${escapeLatex(personalInfo.title)}} \\\\` : ''}
  \\small ${contactLine}
\\end{center}
${sections.join('\n')}

\\end{document}
`
}

/**
 * Download LaTeX file
 */
export function downloadResumeLatex(data: ResumeData, filename?: string): void {
  const latex = generateResumeLatex(data)
  const name = filename || generateLatexFilename(data)
  
  const blob = new Blob([latex], { type: 'text/x-latex;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename for LaTeX export
 */
function generateLatexFilename(data: ResumeData): string {
  const name = data.personalInfo.name || 'Resume'
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_')
  const date = new Date().toISOString().split('T')[0]
  return `${cleanName}_Resume_${date}.tex`
}
