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

export class HTMLToPDFGenerator {
  private template: Template
  private data: ResumeData

  constructor(template: Template, data: ResumeData) {
    this.template = template
    this.data = data
  }

  /**
   * Create a temporary DOM element with the same HTML structure as the preview
   */
  private createTemplateHTML(): HTMLElement {
    const container = document.createElement('div')
    container.style.cssText = `
      width: 794px;
      min-height: 1123px;
      padding: 40px;
      background: white;
      font-family: system-ui, -apple-system, sans-serif;
      box-sizing: border-box;
      position: absolute;
      left: -9999px;
      top: 0;
    `

    // Add the template-specific styling and content
    container.innerHTML = this.generateTemplateHTML()
    
    return container
  }

  /**
   * Generate HTML that matches the React template components
   */
  private generateTemplateHTML(): string {
    switch (this.template.id) {
      case 'classic':
        return this.generateClassicHTML()
      case 'modern':
        return this.generateModernHTML()
      case 'creative':
        return this.generateCreativeHTML()
      case 'minimal':
        return this.generateMinimalHTML()
      case 'executive':
        return this.generateExecutiveHTML()
      case 'tech':
        return this.generateModernHTML() // Tech uses modern layout
      case 'photo':
        return this.generatePhotoHTML()
      default:
        return this.generateClassicHTML()
    }
  }

  /**
   * Generate Classic template HTML - matches ClassicTemplate component exactly
   */
  private generateClassicHTML(): string {
    const { personalInfo, links, education, experience, skills, projects, certifications } = this.data

    return `
      <div style="font-family: Georgia, serif; font-size: 14px; line-height: 1.6; color: #000; background: #fff;">
        <!-- Header -->
        <div style="padding-bottom: 24px; border-bottom: 2px solid #1f2937; margin-bottom: 24px;">
          <div style="display: flex; align-items: flex-start; gap: 24px;">
            ${personalInfo.profileImage ? `
              <div style="width: 96px; height: 96px; border-radius: 50%; overflow: hidden; border: 2px solid #4b5563; flex-shrink: 0;">
                <img src="${personalInfo.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            ` : ''}
            <div style="flex: 1;">
              <h1 style="font-size: 28px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0;">
                ${personalInfo.name || 'Your Name'}
              </h1>
              <p style="font-size: 18px; color: #4b5563; margin: 0 0 12px 0;">
                ${personalInfo.title || 'Your Professional Title'}
              </p>
              <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 14px; color: #6b7280;">
                ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
                ${personalInfo.phone ? `<span>${personalInfo.phone}</span>` : ''}
                ${personalInfo.location ? `<span>${personalInfo.location}</span>` : ''}
              </div>
              ${links.length > 0 ? `
                <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #6b7280;">
                  ${links.filter(link => link.name && link.url).map(link => 
                    `<span>${link.name}</span>`
                  ).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        ${personalInfo.summary ? `
          <!-- Professional Summary -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; font-weight: bold; color: #374151; margin: 0 0 12px 0; padding-bottom: 4px; border-bottom: 1px solid #6b7280;">
              PROFESSIONAL SUMMARY
            </h2>
            <p style="font-size: 14px; line-height: 1.6; color: #000; margin: 0;">
              ${personalInfo.summary}
            </p>
          </div>
        ` : ''}

        ${experience.some(exp => exp.jobTitle) ? `
          <!-- Professional Experience -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; font-weight: bold; color: #374151; margin: 0 0 16px 0; padding-bottom: 4px; border-bottom: 1px solid #6b7280;">
              PROFESSIONAL EXPERIENCE
            </h2>
            ${experience.filter(exp => exp.jobTitle).map(exp => `
              <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                  <h3 style="font-size: 15px; font-weight: bold; color: #1f2937; margin: 0;">
                    ${exp.jobTitle}
                  </h3>
                  <span style="font-size: 13px; color: #6b7280;">
                    ${exp.date}
                  </span>
                </div>
                <p style="font-size: 14px; font-weight: 500; color: #6b7280; margin: 0 0 8px 0;">
                  ${exp.company}
                </p>
                ${exp.responsibilities ? `
                  <p style="font-size: 14px; line-height: 1.6; color: #000; margin: 0;">
                    ${exp.responsibilities}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${education.some(edu => edu.school) ? `
          <!-- Education -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; font-weight: bold; color: #374151; margin: 0 0 16px 0; padding-bottom: 4px; border-bottom: 1px solid #6b7280;">
              EDUCATION
            </h2>
            ${education.filter(edu => edu.school).map(edu => `
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h3 style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0;">
                    ${edu.school}
                  </h3>
                  <span style="font-size: 13px; color: #6b7280;">
                    ${edu.date}
                  </span>
                </div>
                <p style="font-size: 13px; color: #000; margin: 4px 0;">
                  ${edu.degree}
                </p>
                ${edu.gpa ? `
                  <p style="font-size: 13px; color: #6b7280; margin: 4px 0 0 0;">
                    GPA: ${edu.gpa}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(skills.languages || skills.frameworks || skills.tools) ? `
          <!-- Core Competencies -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; font-weight: bold; color: #374151; margin: 0 0 16px 0; padding-bottom: 4px; border-bottom: 1px solid #6b7280;">
              CORE COMPETENCIES
            </h2>
            <div style="display: grid; gap: 8px;">
              ${skills.languages ? `
                <div>
                  <span style="font-size: 14px; font-weight: bold; color: #4b5563;">Programming Languages: </span>
                  <span style="font-size: 14px; color: #000;">${skills.languages}</span>
                </div>
              ` : ''}
              ${skills.frameworks ? `
                <div>
                  <span style="font-size: 14px; font-weight: bold; color: #4b5563;">Frameworks & Libraries: </span>
                  <span style="font-size: 14px; color: #000;">${skills.frameworks}</span>
                </div>
              ` : ''}
              ${skills.tools ? `
                <div>
                  <span style="font-size: 14px; font-weight: bold; color: #4b5563;">Tools & Platforms: </span>
                  <span style="font-size: 14px; color: #000;">${skills.tools}</span>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        ${projects.some(project => project.name) ? `
          <!-- Key Projects -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; font-weight: bold; color: #374151; margin: 0 0 16px 0; padding-bottom: 4px; border-bottom: 1px solid #6b7280;">
              KEY PROJECTS
            </h2>
            ${projects.filter(project => project.name).map(project => `
              <div style="margin-bottom: 16px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 4px 0;">
                  ${project.name}
                </h3>
                ${project.description ? `
                  <p style="font-size: 14px; line-height: 1.6; color: #000; margin: 0 0 4px 0;">
                    ${project.description}
                  </p>
                ` : ''}
                ${project.technologies ? `
                  <p style="font-size: 14px; color: #6b7280; margin: 0;">
                    <strong>Technologies:</strong> ${project.technologies}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${certifications.some(cert => cert.name) ? `
          <!-- Professional Certifications -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; font-weight: bold; color: #374151; margin: 0 0 16px 0; padding-bottom: 4px; border-bottom: 1px solid #6b7280;">
              PROFESSIONAL CERTIFICATIONS
            </h2>
            ${certifications.filter(cert => cert.name).map(cert => `
              <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-size: 14px; font-weight: 600; color: #1f2937;">
                    ${cert.name} - ${cert.issuer}
                  </span>
                  <span style="font-size: 13px; color: #6b7280;">
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
   * Generate Modern template HTML - matches ModernTemplate component
   */
  private generateModernHTML(): string {
    const { personalInfo, links, education, experience, skills, projects, certifications } = this.data
    const colors = this.template.colors

    return `
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: ${colors.text}; background: ${colors.background};">
        <!-- Header -->
        <div style="padding-bottom: 24px; margin-bottom: 24px;">
          <div style="padding: 24px; border-radius: 8px; background: ${colors.background}; border-left: 4px solid ${colors.accent}; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15); display: flex; align-items: flex-start; gap: 24px;">
            ${personalInfo.profileImage ? `
              <div style="width: 96px; height: 96px; border-radius: 50%; overflow: hidden; border: 2px solid ${colors.accent}; flex-shrink: 0;">
                <img src="${personalInfo.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            ` : ''}
            <div style="flex: 1;">
              <h1 style="font-size: 28px; font-weight: bold; color: ${colors.primary}; margin: 0 0 8px 0;">
                ${personalInfo.name || 'Your Name'}
              </h1>
              <p style="font-size: 18px; color: ${colors.secondary}; margin: 0 0 12px 0;">
                ${personalInfo.title || 'Your Professional Title'}
              </p>
              <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 14px; color: ${colors.text};">
                ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
                ${personalInfo.phone ? `<span>${personalInfo.phone}</span>` : ''}
                ${personalInfo.location ? `<span>${personalInfo.location}</span>` : ''}
              </div>
            </div>
          </div>
        </div>

        ${personalInfo.summary ? `
          <!-- Professional Summary -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 18px; font-weight: bold; color: ${colors.primary}; margin: 0 0 12px 0; display: flex; align-items: center;">
              <div style="width: 4px; height: 24px; background: ${colors.accent}; border-radius: 2px; margin-right: 12px;"></div>
              Professional Summary
            </h2>
            <div style="padding: 16px; border-radius: 8px; background: ${colors.background}; border: 1px solid ${colors.accent}30; box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);">
              <p style="font-size: 14px; line-height: 1.6; color: ${colors.text}; margin: 0;">
                ${personalInfo.summary}
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Two Column Layout -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Main Content -->
          <div style="display: grid; gap: 24px;">
            ${experience.some(exp => exp.jobTitle) ? `
              <!-- Professional Experience -->
              <div>
                <h2 style="font-size: 18px; font-weight: bold; color: ${colors.primary}; margin: 0 0 16px 0; display: flex; align-items: center;">
                  <div style="width: 4px; height: 24px; background: ${colors.accent}; border-radius: 2px; margin-right: 12px;"></div>
                  Professional Experience
                </h2>
                ${experience.filter(exp => exp.jobTitle).map(exp => `
                  <div style="margin-bottom: 20px; padding: 20px; border-radius: 8px; background: ${colors.background}; border: 1px solid ${colors.accent}20; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <h3 style="font-size: 16px; font-weight: bold; color: ${colors.primary}; margin: 0;">
                        ${exp.jobTitle}
                      </h3>
                      <span style="font-size: 13px; color: ${colors.text}; background: ${colors.accent}20; padding: 4px 8px; border-radius: 4px;">
                        ${exp.date}
                      </span>
                    </div>
                    <p style="font-size: 14px; color: ${colors.secondary}; margin: 0 0 12px 0; font-style: italic;">
                      ${exp.company}
                    </p>
                    ${exp.responsibilities ? `
                      <p style="font-size: 14px; line-height: 1.6; color: ${colors.text}; margin: 0;">
                        ${exp.responsibilities}
                      </p>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${projects.some(project => project.name) ? `
              <!-- Key Projects -->
              <div>
                <h2 style="font-size: 18px; font-weight: bold; color: ${colors.primary}; margin: 0 0 16px 0; display: flex; align-items: center;">
                  <div style="width: 4px; height: 24px; background: ${colors.accent}; border-radius: 2px; margin-right: 12px;"></div>
                  Key Projects
                </h2>
                ${projects.filter(project => project.name).map(project => `
                  <div style="margin-bottom: 16px; padding: 16px; border-radius: 8px; background: ${colors.background}; border: 1px solid ${colors.accent}20;">
                    <h3 style="font-size: 15px; font-weight: bold; color: ${colors.primary}; margin: 0 0 8px 0;">
                      ${project.name}
                    </h3>
                    ${project.description ? `
                      <p style="font-size: 14px; line-height: 1.6; color: ${colors.text}; margin: 0 0 8px 0;">
                        ${project.description}
                      </p>
                    ` : ''}
                    ${project.technologies ? `
                      <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                        ${project.technologies.split(',').map(tech => `
                          <span style="font-size: 12px; background: ${colors.accent}; color: white; padding: 2px 6px; border-radius: 4px;">
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

          <!-- Sidebar -->
          <div style="display: grid; gap: 24px;">
            ${(skills.languages || skills.frameworks || skills.tools) ? `
              <!-- Skills -->
              <div style="padding: 20px; border-radius: 8px; background: ${colors.background}; border: 1px solid ${colors.accent}30; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);">
                <h2 style="font-size: 16px; font-weight: bold; color: ${colors.primary}; margin: 0 0 16px 0;">
                  Skills
                </h2>
                <div style="display: grid; gap: 12px;">
                  ${skills.languages ? `
                    <div>
                      <h3 style="font-size: 13px; font-weight: bold; color: ${colors.secondary}; margin: 0 0 4px 0; text-transform: uppercase;">
                        Programming Languages
                      </h3>
                      <p style="font-size: 12px; color: ${colors.text}; margin: 0; line-height: 1.5;">
                        ${skills.languages}
                      </p>
                    </div>
                  ` : ''}
                  ${skills.frameworks ? `
                    <div>
                      <h3 style="font-size: 13px; font-weight: bold; color: ${colors.secondary}; margin: 0 0 4px 0; text-transform: uppercase;">
                        Frameworks & Libraries
                      </h3>
                      <p style="font-size: 12px; color: ${colors.text}; margin: 0; line-height: 1.5;">
                        ${skills.frameworks}
                      </p>
                    </div>
                  ` : ''}
                  ${skills.tools ? `
                    <div>
                      <h3 style="font-size: 13px; font-weight: bold; color: ${colors.secondary}; margin: 0 0 4px 0; text-transform: uppercase;">
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
              <div style="padding: 20px; border-radius: 8px; background: ${colors.background}; border: 1px solid ${colors.accent}30;">
                <h2 style="font-size: 16px; font-weight: bold; color: ${colors.primary}; margin: 0 0 16px 0;">
                  Education
                </h2>
                ${education.filter(edu => edu.school).map(edu => `
                  <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                      <h3 style="font-size: 13px; font-weight: bold; color: ${colors.text}; margin: 0;">
                        ${edu.school}
                      </h3>
                      <span style="font-size: 11px; color: ${colors.text}; background: ${colors.accent}20; padding: 2px 6px; border-radius: 3px;">
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
              <div style="padding: 20px; border-radius: 8px; background: ${colors.background}; border: 1px solid ${colors.accent}30;">
                <h2 style="font-size: 16px; font-weight: bold; color: ${colors.primary}; margin: 0 0 16px 0;">
                  Certifications
                </h2>
                ${certifications.filter(cert => cert.name).map(cert => `
                  <div style="margin-bottom: 12px; padding: 8px; border-radius: 4px; background: ${colors.accent}10;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <div>
                        <h3 style="font-size: 12px; font-weight: bold; color: ${colors.text}; margin: 0;">
                          ${cert.name}
                        </h3>
                        <p style="font-size: 11px; color: ${colors.secondary}; margin: 2px 0 0 0;">
                          ${cert.issuer}
                        </p>
                      </div>
                      <span style="font-size: 10px; color: ${colors.text};">
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
   * Generate Minimal template HTML - matches MinimalTemplate component
   */
  private generateMinimalHTML(): string {
    const { personalInfo, education, experience, skills, projects, certifications } = this.data

    return `
      <div style="font-family: system-ui, -apple-system, sans-serif; font-weight: 300; font-size: 14px; line-height: 1.6; color: #000; background: #fff; max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; padding-bottom: 32px; border-bottom: 1px solid #d1d5db; margin-bottom: 32px;">
          ${personalInfo.profileImage ? `
            <div style="width: 96px; height: 96px; border-radius: 50%; overflow: hidden; border: 2px solid #000; margin: 0 auto 16px;">
              <img src="${personalInfo.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          ` : ''}
          <h1 style="font-size: 32px; font-weight: 300; letter-spacing: 2px; margin: 0 0 12px 0; color: #000;">
            ${personalInfo.name || 'Your Name'}
          </h1>
          <p style="font-size: 18px; font-weight: 300; color: #4b5563; margin: 0 0 16px 0;">
            ${personalInfo.title || 'Your Professional Title'}
          </p>
          <div style="display: flex; justify-content: center; gap: 32px; font-size: 14px; color: #6b7280;">
            ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
            ${personalInfo.phone ? `<span>${personalInfo.phone}</span>` : ''}
            ${personalInfo.location ? `<span>${personalInfo.location}</span>` : ''}
          </div>
        </div>

        ${personalInfo.summary ? `
          <!-- Professional Summary -->
          <div style="text-align: center; margin-bottom: 32px;">
            <p style="font-size: 14px; line-height: 1.6; font-weight: 300; max-width: 500px; margin: 0 auto; color: #000;">
              ${personalInfo.summary}
            </p>
          </div>
        ` : ''}

        ${experience.some(exp => exp.jobTitle) ? `
          <!-- Professional Experience -->
          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 1px; text-align: center; color: #000; margin: 0 0 24px 0;">
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
          <!-- Core Competencies -->
          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 1px; text-align: center; color: #000; margin: 0 0 24px 0;">
              CORE COMPETENCIES
            </h2>
            <div style="display: grid; gap: 16px;">
              ${skills.languages ? `
                <div style="text-align: center;">
                  <h3 style="font-size: 13px; font-weight: 500; color: #000; margin: 0 0 8px 0; letter-spacing: 1px;">
                    PROGRAMMING LANGUAGES
                  </h3>
                  <p style="font-size: 14px; font-weight: 300; color: #6b7280; margin: 0;">
                    ${skills.languages}
                  </p>
                </div>
              ` : ''}
              ${skills.frameworks ? `
                <div style="text-align: center;">
                  <h3 style="font-size: 13px; font-weight: 500; color: #000; margin: 0 0 8px 0; letter-spacing: 1px;">
                    FRAMEWORKS & LIBRARIES
                  </h3>
                  <p style="font-size: 14px; font-weight: 300; color: #6b7280; margin: 0;">
                    ${skills.frameworks}
                  </p>
                </div>
              ` : ''}
              ${skills.tools ? `
                <div style="text-align: center;">
                  <h3 style="font-size: 13px; font-weight: 500; color: #000; margin: 0 0 8px 0; letter-spacing: 1px;">
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
          <!-- Key Projects -->
          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 1px; text-align: center; color: #000; margin: 0 0 24px 0;">
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
          <!-- Education -->
          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 1px; text-align: center; color: #000; margin: 0 0 24px 0;">
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
          <!-- Professional Certifications -->
          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 16px; font-weight: 500; letter-spacing: 1px; text-align: center; color: #000; margin: 0 0 24px 0;">
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
   * Generate Creative, Executive, and Photo template HTML (simplified versions)
   */
  private generateCreativeHTML(): string {
    // Use modern layout with creative styling
    return this.generateModernHTML()
  }

  private generateExecutiveHTML(): string {
    // Use classic layout with executive styling
    return this.generateClassicHTML()
  }

  private generatePhotoHTML(): string {
    // Use modern layout with photo emphasis
    return this.generateModernHTML()
  }

  /**
   * Convert HTML to PDF using html2canvas and jsPDF
   */
  async generatePDF(): Promise<jsPDF> {
    // Create temporary container
    const container = this.createTemplateHTML()
    document.body.appendChild(container)

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: 0
      })

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

      // If content is too tall, handle multi-page
      if (imgHeight > 297) { // A4 height
        let position = 297 // First page height
        
        while (position < imgHeight) {
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight)
          position += 297
        }
      }

      return pdf
    } finally {
      // Clean up
      document.body.removeChild(container)
    }
  }

  /**
   * Download the PDF
   */
  async downloadPDF(filename?: string): Promise<void> {
    const pdf = await this.generatePDF()
    const name = filename || `${this.data.personalInfo.name || 'Resume'}_${this.template.name.replace(/\s+/g, '_')}.pdf`
    pdf.save(name)
  }
}

/**
 * Factory function for easy use
 */
export async function downloadResumePDF(template: Template, data: ResumeData, filename?: string): Promise<void> {
  const generator = new HTMLToPDFGenerator(template, data)
  await generator.downloadPDF(filename)
}
