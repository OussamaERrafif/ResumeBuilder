import html2canvas from 'html2canvas'
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

export class ExactHTMLGenerator {
  private template: Template
  private data: ResumeData

  constructor(template: Template, data: ResumeData) {
    this.template = template
    this.data = data
  }

  /**
   * Create temporary DOM element with EXACT HTML structure
   */
  private createTemplateHTML(): HTMLElement {
    const container = document.createElement('div')
    container.style.cssText = `
      width: 600px;
      min-height: 800px;
      padding: 30px;
      background: white;
      font-family: system-ui, -apple-system, sans-serif;
      box-sizing: border-box;
      position: absolute;
      left: -9999px;
      top: 0;
    `

    container.innerHTML = this.generateTemplateHTML()
    return container
  }

  /**
   * Generate HTML that EXACTLY matches React templates
   */
  private generateTemplateHTML(): string {
    switch (this.template.id) {
      case 'classic':
        return this.generateExactClassicHTML()
      case 'modern':
        return this.generateExactModernHTML()
      case 'creative':
        return this.generateExactModernHTML() // Use modern for creative
      case 'minimal':
        return this.generateExactMinimalHTML()
      case 'executive':
        return this.generateExactClassicHTML() // Use classic for executive
      case 'tech':
        return this.generateExactModernHTML() // Use modern for tech
      case 'photo':
        return this.generateExactModernHTML() // Use modern for photo
      default:
        return this.generateExactClassicHTML()
    }
  }

  /**
   * EXACT Classic Template - pixel perfect match to ClassicTemplate React component
   */
  private generateExactClassicHTML(): string {
    const { personalInfo, links, education, experience, skills, projects, certifications } = this.data

    // Tailwind to CSS conversions - More compact spacing
    const spacing = {
      'space-y-6': 'display: flex; flex-direction: column; gap: 12px',
      'pb-6': 'padding-bottom: 12px',
      'mb-2': 'margin-bottom: 4px',
      'mb-3': 'margin-bottom: 6px',
      'mb-4': 'margin-bottom: 8px',
      'mb-5': 'margin-bottom: 10px',
      'pb-1': 'padding-bottom: 2px',
      'mt-2': 'margin-top: 4px',
      'mt-1': 'margin-top: 2px',
      'ml-2': 'margin-left: 4px'
    }

    return `
      <div style="${spacing['space-y-6']}; font-family: Georgia, serif; font-size: 14px; line-height: 1.625; color: #000; background: #fff;">
        <!-- Header - Exact match -->
        <div style="${spacing['pb-6']}; border-bottom: 2px solid #1f2937;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            ${personalInfo.profileImage ? `
              <div style="width: 60px; height: 60px; border-radius: 50%; overflow: hidden; border: 2px solid #4b5563; flex-shrink: 0;">
                <img src="${personalInfo.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            ` : ''}
            <div style="text-align: center; flex: 1;">
              <h1 style="font-size: 18px; font-weight: bold; ${spacing['mb-2']}; letter-spacing: 0.025em; color: #374151; margin: 0 0 4px 0;">
                ${personalInfo.name || 'Your Name'}
              </h1>
              <p style="font-size: 13px; ${spacing['mb-3']}; color: #374151; margin: 0 0 6px 0;">
                ${personalInfo.title || 'Your Professional Title'}
              </p>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 11px; color: #4b5563;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
                  ${personalInfo.phone ? `<span style="display: none;">•</span><span>${personalInfo.phone}</span>` : ''}
                  ${personalInfo.location ? `<span style="display: none;">•</span><span>${personalInfo.location}</span>` : ''}
                </div>
              </div>
              ${links.some(link => link.name && link.url) ? `
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; font-size: 10px; ${spacing['mt-2']}; color: #4b5563; margin-top: 4px;">
                  ${links.filter(link => link.name && link.url).map(link => `<span>${link.name}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        ${personalInfo.summary ? `
          <!-- Professional Summary - Exact match -->
          <div>
            <h2 style="font-weight: bold; font-size: 13px; ${spacing['mb-3']}; ${spacing['pb-1']}; border-bottom: 1px solid #4b5563; color: #374151; margin: 0 0 6px 0; padding-bottom: 2px;">
              PROFESSIONAL SUMMARY
            </h2>
            <p style="font-size: 11px; line-height: 1.4; color: #000; margin: 0;">
              ${personalInfo.summary}
            </p>
          </div>
        ` : ''}

        ${experience.some(exp => exp.jobTitle) ? `
          <!-- Professional Experience - Exact match -->
          <div>
            <h2 style="font-weight: bold; font-size: 16px; ${spacing['mb-4']}; ${spacing['pb-1']}; border-bottom: 1px solid #4b5563; color: #374151; margin: 0 0 16px 0; padding-bottom: 4px;">
              PROFESSIONAL EXPERIENCE
            </h2>
            ${experience.filter(exp => exp.jobTitle).map(exp => `
              <div style="${spacing['mb-5']}; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                  <h3 style="font-weight: 600; font-size: 14px; color: #374151; margin: 0;">
                    ${exp.jobTitle}
                  </h3>
                  <span style="font-size: 14px; font-weight: 500; color: #4b5563;">
                    ${exp.date}
                  </span>
                </div>
                <p style="font-size: 14px; font-weight: 500; ${spacing['mb-2']}; color: #4b5563; margin: 0 0 8px 0;">
                  ${exp.company}
                </p>
                ${exp.responsibilities ? `
                  <p style="font-size: 14px; line-height: 1.625; color: #000; margin: 0;">
                    ${exp.responsibilities}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${education.some(edu => edu.school) ? `
          <!-- Education - Exact match -->
          <div>
            <h2 style="font-weight: bold; font-size: 16px; ${spacing['mb-4']}; ${spacing['pb-1']}; border-bottom: 1px solid #4b5563; color: #374151; margin: 0 0 16px 0; padding-bottom: 4px;">
              EDUCATION
            </h2>
            ${education.filter(edu => edu.school).map(edu => `
              <div style="${spacing['mb-3']}; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h3 style="font-weight: 600; font-size: 14px; color: #374151; margin: 0;">
                      ${edu.school}
                    </h3>
                    <p style="font-size: 14px; color: #000; margin: 0;">
                      ${edu.degree}
                    </p>
                  </div>
                  <span style="font-size: 14px; color: #4b5563;">
                    ${edu.date}
                  </span>
                </div>
                ${edu.gpa ? `
                  <p style="font-size: 14px; ${spacing['mt-1']}; color: #4b5563; margin: 4px 0 0 0;">
                    GPA: ${edu.gpa}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(skills.languages || skills.frameworks || skills.tools) ? `
          <!-- Core Competencies - Exact match -->
          <div>
            <h2 style="font-weight: bold; font-size: 16px; ${spacing['mb-4']}; ${spacing['pb-1']}; border-bottom: 1px solid #4b5563; color: #374151; margin: 0 0 16px 0; padding-bottom: 4px;">
              CORE COMPETENCIES
            </h2>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${skills.languages ? `
                <div>
                  <span style="font-weight: 500; font-size: 14px; color: #374151;">Programming Languages: </span>
                  <span style="font-size: 14px; color: #000;">${skills.languages}</span>
                </div>
              ` : ''}
              ${skills.frameworks ? `
                <div>
                  <span style="font-weight: 500; font-size: 14px; color: #374151;">Frameworks & Libraries: </span>
                  <span style="font-size: 14px; color: #000;">${skills.frameworks}</span>
                </div>
              ` : ''}
              ${skills.tools ? `
                <div>
                  <span style="font-weight: 500; font-size: 14px; color: #374151;">Tools & Platforms: </span>
                  <span style="font-size: 14px; color: #000;">${skills.tools}</span>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        ${projects.some(project => project.name) ? `
          <!-- Key Projects - Exact match -->
          <div>
            <h2 style="font-weight: bold; font-size: 16px; ${spacing['mb-4']}; ${spacing['pb-1']}; border-bottom: 1px solid #4b5563; color: #374151; margin: 0 0 16px 0; padding-bottom: 4px;">
              KEY PROJECTS
            </h2>
            ${projects.filter(project => project.name).map(project => `
              <div style="${spacing['mb-4']}; margin-bottom: 16px;">
                <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #374151; margin: 0 0 4px 0;">
                  ${project.name}
                </h3>
                ${project.description ? `
                  <p style="font-size: 14px; line-height: 1.625; margin-bottom: 4px; color: #000; margin: 0 0 4px 0;">
                    ${project.description}
                  </p>
                ` : ''}
                ${project.technologies ? `
                  <p style="font-size: 14px; color: #4b5563; margin: 0;">
                    <span style="font-weight: 500;">Technologies:</span> ${project.technologies}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${certifications.some(cert => cert.name) ? `
          <!-- Professional Certifications - Exact match -->
          <div>
            <h2 style="font-weight: bold; font-size: 16px; ${spacing['mb-4']}; ${spacing['pb-1']}; border-bottom: 1px solid #4b5563; color: #374151; margin: 0 0 16px 0; padding-bottom: 4px;">
              PROFESSIONAL CERTIFICATIONS
            </h2>
            ${certifications.filter(cert => cert.name).map(cert => `
              <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <span style="font-size: 14px; font-weight: 500; color: #374151;">${cert.name}</span>
                    ${cert.issuer ? `<span style="font-size: 14px; ${spacing['ml-2']}; color: #000; margin-left: 8px;"> - ${cert.issuer}</span>` : ''}
                  </div>
                  ${cert.date ? `<span style="font-size: 14px; color: #4b5563;">${cert.date}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `
  }

  /**
   * EXACT Modern Template - pixel perfect match to ModernTemplate React component  
   */
  private generateExactModernHTML(): string {
    const { personalInfo, links, education, experience, skills, projects, certifications } = this.data
    const colors = this.template.colors

    return `
      <div style="display: flex; flex-direction: column; gap: 12px; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; color: ${colors.text}; background: ${colors.background};">
        <!-- Header - Exact match -->
        <div style="padding-bottom: 12px;">
          <div style="padding: 12px; border-radius: 4px; background: ${colors.background}; border-left: 2px solid ${colors.accent}; box-shadow: 0 1px 2px rgba(59, 130, 246, 0.15); display: flex; flex-direction: column; align-items: center; gap: 12px;">
            ${personalInfo.profileImage ? `
              <div style="width: 60px; height: 60px; border-radius: 50%; overflow: hidden; border: 2px solid ${colors.primary}; flex-shrink: 0;">
                <img src="${personalInfo.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            ` : ''}
            <div style="flex: 1; text-align: center;">
              <h1 style="font-size: 18px; font-weight: bold; margin: 0 0 4px 0; color: ${colors.primary};">
                ${personalInfo.name || 'Your Name'}
              </h1>
              <p style="font-size: 13px; margin: 0 0 6px 0; color: ${colors.secondary};">
                ${personalInfo.title || 'Your Professional Title'}
              </p>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; font-size: 10px; color: ${colors.muted};">
                ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
                ${personalInfo.phone ? `<span>${personalInfo.phone}</span>` : ''}
                ${personalInfo.location ? `<span>${personalInfo.location}</span>` : ''}
              </div>
              ${links.some(link => link.name && link.url) ? `
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; font-size: 10px; margin-top: 6px;">
                  ${links.filter(link => link.name && link.url).map(link => `
                    <span style="padding: 2px 6px; border-radius: 9999px; font-size: 9px; font-weight: 500; background: ${colors.accent}20; color: ${colors.primary};">
                      ${link.name}
                    </span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        ${personalInfo.summary ? `
          <!-- Professional Summary - Exact match -->
          <div>
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 12px 0; display: flex; align-items: center; color: ${colors.primary};">
              <div style="width: 4px; height: 24px; border-radius: 2px; margin-right: 12px; background: ${colors.accent};"></div>
              Professional Summary
            </h2>
            <div style="padding: 16px; border-radius: 8px; background: ${colors.background}; border: 1px solid ${colors.accent}30; box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);">
              <p style="font-size: 14px; line-height: 1.625; color: ${colors.text}; margin: 0;">
                ${personalInfo.summary}
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Two Column Layout - Exact match -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
          <!-- Main Content -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${experience.some(exp => exp.jobTitle) ? `
              <!-- Professional Experience - Exact match -->
              <div>
                <h2 style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0; display: flex; align-items: center; color: ${colors.primary};">
                  <div style="width: 2px; height: 16px; border-radius: 1px; margin-right: 6px; background: ${colors.accent};"></div>
                  Professional Experience
                </h2>
                ${experience.filter(exp => exp.jobTitle).map(exp => `
                  <div style="margin-bottom: 10px; padding: 8px; border-radius: 4px; border-left: 2px solid ${colors.accent}; border: 1px solid ${colors.accent}20; background: ${colors.background}; box-shadow: 0 1px 1px rgba(59, 130, 246, 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                      <div>
                        <h3 style="font-weight: bold; font-size: 11px; color: ${colors.primary}; margin: 0;">
                          ${exp.jobTitle}
                        </h3>
                        <p style="font-size: 10px; font-weight: 600; color: ${colors.accent}; margin: 0;">
                          ${exp.company}
                        </p>
                      </div>
                      <span style="font-size: 9px; padding: 1px 6px; border-radius: 9999px; font-weight: 500; background: ${colors.primary}15; color: ${colors.primary};">
                        ${exp.date}
                      </span>
                    </div>
                    ${exp.responsibilities ? `
                      <p style="font-size: 10px; line-height: 1.3; color: ${colors.text}; margin: 0;">
                        ${exp.responsibilities}
                      </p>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${projects.some(project => project.name) ? `
              <!-- Key Projects - Exact match -->
              <div>
                <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 16px 0; display: flex; align-items: center; color: ${colors.primary};">
                  <div style="width: 4px; height: 24px; border-radius: 2px; margin-right: 12px; background: ${colors.accent};"></div>
                  Key Projects
                </h2>
                ${projects.filter(project => project.name).map(project => `
                  <div style="margin-bottom: 16px; padding: 16px; border-radius: 8px; background: ${colors.background}; border: 1px solid ${colors.accent}20; box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);">
                    <h3 style="font-weight: bold; font-size: 14px; margin: 0 0 8px 0; color: ${colors.primary};">
                      ${project.name}
                    </h3>
                    ${project.description ? `
                      <p style="font-size: 14px; line-height: 1.625; margin: 0 0 8px 0; color: ${colors.text};">
                        ${project.description}
                      </p>
                    ` : ''}
                    ${project.technologies ? `
                      <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                        ${project.technologies.split(',').map(tech => `
                          <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: ${colors.accent}20; color: ${colors.primary};">
                            ${tech.trim()}
                          </span>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Sidebar - Exact match -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            ${(skills.languages || skills.frameworks || skills.tools) ? `
              <!-- Core Competencies -->
              <div style="padding: 16px; border-radius: 8px; background: ${colors.background}; border: 1px solid ${colors.accent}20; box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);">
                <h2 style="font-size: 16px; font-weight: bold; color: ${colors.primary}; margin: 0 0 16px 0;">
                  Skills
                </h2>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  ${skills.languages ? `
                    <div>
                      <h3 style="font-size: 12px; font-weight: bold; color: ${colors.secondary}; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em;">
                        Programming Languages
                      </h3>
                      <p style="font-size: 12px; color: ${colors.text}; margin: 0; line-height: 1.5;">
                        ${skills.languages}
                      </p>
                    </div>
                  ` : ''}
                  ${skills.frameworks ? `
                    <div>
                      <h3 style="font-size: 12px; font-weight: bold; color: ${colors.secondary}; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em;">
                        Frameworks & Libraries
                      </h3>
                      <p style="font-size: 12px; color: ${colors.text}; margin: 0; line-height: 1.5;">
                        ${skills.frameworks}
                      </p>
                    </div>
                  ` : ''}
                  ${skills.tools ? `
                    <div>
                      <h3 style="font-size: 12px; font-weight: bold; color: ${colors.secondary}; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em;">
                        Tools & Platforms
                      </h3>
                      <p style="font-size: 12px; color: ${colors.text}; margin: 0; line-height: 1.5;">
                        ${skills.tools}
                      </p>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}

            ${education.some(edu => edu.school) ? `
              <!-- Education -->
              <div style="padding: 16px; border-radius: 8px; background: ${colors.background}; border: 1px solid ${colors.accent}20;">
                <h2 style="font-size: 16px; font-weight: bold; color: ${colors.primary}; margin: 0 0 16px 0;">
                  Education
                </h2>
                ${education.filter(edu => edu.school).map(edu => `
                  <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                      <h3 style="font-size: 13px; font-weight: bold; color: ${colors.text}; margin: 0; flex: 1;">
                        ${edu.school}
                      </h3>
                      <span style="font-size: 11px; color: ${colors.text}; background: ${colors.accent}20; padding: 2px 6px; border-radius: 3px; white-space: nowrap;">
                        ${edu.date}
                      </span>
                    </div>
                    <p style="font-size: 12px; color: ${colors.text}; margin: 0;">
                      ${edu.degree}
                    </p>
                    ${edu.gpa ? `
                      <p style="font-size: 11px; color: ${colors.text}; margin: 4px 0 0 0;">
                        GPA: ${edu.gpa}
                      </p>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${certifications.some(cert => cert.name) ? `
              <!-- Certifications -->
              <div style="padding: 16px; border-radius: 8px; background: ${colors.background}; border: 1px solid ${colors.accent}20;">
                <h2 style="font-size: 16px; font-weight: bold; color: ${colors.primary}; margin: 0 0 16px 0;">
                  Certifications
                </h2>
                ${certifications.filter(cert => cert.name).map(cert => `
                  <div style="margin-bottom: 12px; padding: 8px; border-radius: 4px; background: ${colors.accent}10;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <div style="flex: 1;">
                        <h3 style="font-size: 12px; font-weight: bold; color: ${colors.text}; margin: 0;">
                          ${cert.name}
                        </h3>
                        <p style="font-size: 11px; color: ${colors.secondary}; margin: 2px 0 0 0;">
                          ${cert.issuer}
                        </p>
                      </div>
                      <span style="font-size: 10px; color: ${colors.text}; white-space: nowrap;">
                        ${cert.date}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `
  }

  /**
   * EXACT Minimal Template - matches MinimalTemplate exactly
   */
  private generateExactMinimalHTML(): string {
    const { personalInfo, education, experience, skills, projects, certifications } = this.data

    return `
      <div style="display: flex; flex-direction: column; gap: 14px; font-family: system-ui, -apple-system, sans-serif; font-weight: 300; font-size: 10px; line-height: 1.3; color: #000; background: #fff; max-width: 450px; margin: 0 auto;">
        <!-- Header - Exact match -->
        <div style="text-align: center; padding-bottom: 14px; border-bottom: 1px solid #d1d5db;">
          ${personalInfo.profileImage ? `
            <div style="width: 60px; height: 60px; border-radius: 50%; overflow: hidden; border: 2px solid #000; margin: 0 auto 8px;">
              <img src="${personalInfo.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          ` : ''}
          <h1 style="font-size: 22px; font-weight: 300; letter-spacing: 0.08em; margin: 0 0 6px 0; color: #000;">
            ${personalInfo.name || 'Your Name'}
          </h1>
          <p style="font-size: 13px; font-weight: 300; color: #4b5563; margin: 0 0 8px 0;">
            ${personalInfo.title || 'Your Professional Title'}
          </p>
          <div style="display: flex; justify-content: center; gap: 16px; font-size: 10px; color: #6b7280;">
            ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
            ${personalInfo.phone ? `<span>${personalInfo.phone}</span>` : ''}
            ${personalInfo.location ? `<span>${personalInfo.location}</span>` : ''}
          </div>
        </div>

        ${personalInfo.summary ? `
          <!-- Professional Summary - Exact match -->
          <div style="text-align: center;">
            <p style="font-size: 14px; line-height: 1.6; font-weight: 300; max-width: 500px; margin: 0 auto; color: #000;">
              ${personalInfo.summary}
            </p>
          </div>
        ` : ''}

        ${experience.some(exp => exp.jobTitle) ? `
          <!-- Professional Experience - Exact match -->
          <div>
            <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 0.025em; text-align: center; color: #000; margin: 0 0 24px 0;">
              PROFESSIONAL EXPERIENCE
            </h2>
            ${experience.filter(exp => exp.jobTitle).map(exp => `
              <div style="margin-bottom: 32px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                  <h3 style="font-size: 15px; font-weight: 500; color: #000; margin: 0;">
                    ${exp.jobTitle}
                  </h3>
                  <span style="font-size: 13px; font-weight: 300; color: #6b7280;">
                    ${exp.date}
                  </span>
                </div>
                <p style="font-size: 14px; font-weight: 300; color: #4b5563; margin: 0 0 12px 0;">
                  ${exp.company}
                </p>
                ${exp.responsibilities ? `
                  <p style="font-size: 14px; line-height: 1.6; font-weight: 300; color: #000; margin: 0;">
                    ${exp.responsibilities}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(skills.languages || skills.frameworks || skills.tools) ? `
          <!-- Core Competencies - Exact match -->
          <div>
            <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 0.025em; text-align: center; color: #000; margin: 0 0 24px 0;">
              CORE COMPETENCIES
            </h2>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${skills.languages ? `
                <div style="text-align: center;">
                  <h3 style="font-size: 13px; font-weight: 500; color: #000; margin: 0 0 8px 0; letter-spacing: 0.025em;">
                    PROGRAMMING LANGUAGES
                  </h3>
                  <p style="font-size: 14px; font-weight: 300; color: #6b7280; margin: 0;">
                    ${skills.languages}
                  </p>
                </div>
              ` : ''}
              ${skills.frameworks ? `
                <div style="text-align: center;">
                  <h3 style="font-size: 13px; font-weight: 500; color: #000; margin: 0 0 8px 0; letter-spacing: 0.025em;">
                    FRAMEWORKS & LIBRARIES
                  </h3>
                  <p style="font-size: 14px; font-weight: 300; color: #6b7280; margin: 0;">
                    ${skills.frameworks}
                  </p>
                </div>
              ` : ''}
              ${skills.tools ? `
                <div style="text-align: center;">
                  <h3 style="font-size: 13px; font-weight: 500; color: #000; margin: 0 0 8px 0; letter-spacing: 0.025em;">
                    TOOLS & PLATFORMS
                  </h3>
                  <p style="font-size: 14px; font-weight: 300; color: #6b7280; margin: 0;">
                    ${skills.tools}
                  </p>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        ${projects.some(project => project.name) ? `
          <!-- Key Projects - Exact match -->
          <div>
            <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 0.025em; text-align: center; color: #000; margin: 0 0 24px 0;">
              KEY PROJECTS
            </h2>
            ${projects.filter(project => project.name).map(project => `
              <div style="margin-bottom: 24px;">
                <h3 style="font-size: 14px; font-weight: 500; color: #000; margin: 0 0 8px 0;">
                  ${project.name}
                </h3>
                ${project.description ? `
                  <p style="font-size: 14px; line-height: 1.6; font-weight: 300; color: #000; margin: 0 0 8px 0;">
                    ${project.description}
                  </p>
                ` : ''}
                ${project.technologies ? `
                  <p style="font-size: 14px; font-weight: 300; color: #6b7280; margin: 0;">
                    ${project.technologies}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${education.some(edu => edu.school) ? `
          <!-- Education - Exact match -->
          <div>
            <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 0.025em; text-align: center; color: #000; margin: 0 0 24px 0;">
              EDUCATION
            </h2>
            ${education.filter(edu => edu.school).map(edu => `
              <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <h3 style="font-size: 14px; font-weight: 500; color: #000; margin: 0;">
                    ${edu.school}
                  </h3>
                  <span style="font-size: 13px; font-weight: 300; color: #6b7280;">
                    ${edu.date}
                  </span>
                </div>
                <p style="font-size: 14px; font-weight: 300; color: #000; margin: 4px 0;">
                  ${edu.degree}
                </p>
                ${edu.gpa ? `
                  <p style="font-size: 14px; font-weight: 300; color: #6b7280; margin: 0;">
                    GPA: ${edu.gpa}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${certifications.some(cert => cert.name) ? `
          <!-- Professional Certifications - Exact match -->
          <div>
            <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 0.025em; text-align: center; color: #000; margin: 0 0 24px 0;">
              PROFESSIONAL CERTIFICATIONS
            </h2>
            ${certifications.filter(cert => cert.name).map(cert => `
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <span style="font-size: 14px; font-weight: 500; color: #000;">
                    ${cert.name} - ${cert.issuer}
                  </span>
                  <span style="font-size: 13px; font-weight: 300; color: #4b5563;">
                    ${cert.date}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `
  }

  /**
   * Convert HTML to PDF with exact dimensions
   */
  async generatePDF(): Promise<jsPDF> {
    const container = this.createTemplateHTML()
    document.body.appendChild(container)

    try {
      // Convert HTML to canvas with high quality
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 600,
        height: 800,
        scrollX: 0,
        scrollY: 0,
        removeContainer: true
      })

      // Create PDF with exact A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

      // Handle multi-page if needed
      if (imgHeight > 297) {
        let position = 297
        while (position < imgHeight) {
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight)
          position += 297
        }
      }

      return pdf
    } finally {
      document.body.removeChild(container)
    }
  }

  /**
   * Download PDF with proper filename
   */
  async downloadPDF(filename?: string): Promise<void> {
    const pdf = await this.generatePDF()
    const name = filename || `${this.data.personalInfo.name || 'Resume'}_${this.template.name.replace(/\s+/g, '_')}.pdf`
    pdf.save(name)
  }
}

/**
 * Factory function using the exact HTML generator
 */
export async function downloadExactResumePDF(template: Template, data: ResumeData, filename?: string): Promise<void> {
  const generator = new ExactHTMLGenerator(template, data)
  await generator.downloadPDF(filename)
}
