"use client"

import type { Template } from "../types/templates"

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

interface TemplatePreviewProps {
  data: ResumeData
  template: Template
}

export function ClassicTemplate({ data, template }: TemplatePreviewProps) {
  return (
    <div className="space-y-6 font-serif text-sm leading-relaxed text-black bg-white">
      {/* Header */}
      <div className="pb-6 border-b-2 border-gray-800">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Profile Image */}
          {data.personalInfo.profileImage && (
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-600 flex-shrink-0">
              <img
                src={data.personalInfo.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Contact Info */}
          <div className={`text-center ${data.personalInfo.profileImage ? "md:text-left" : ""} flex-1`}>
            <h1 className="text-2xl font-bold mb-2 tracking-wide text-gray-800">
              {data.personalInfo.name || "Your Name"}
            </h1>
            <p className="text-base mb-3 text-gray-700">{data.personalInfo.title || "Your Professional Title"}</p>
            <div className="flex flex-col sm:flex-row sm:justify-center items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
              <span>{data.personalInfo.email}</span>
              <span className="hidden sm:inline">•</span>
              <span>{data.personalInfo.phone}</span>
              <span className="hidden sm:inline">•</span>
              <span>{data.personalInfo.location}</span>
            </div>
            {data.links.some((link) => link.name && link.url) && (
              <div className="flex flex-wrap justify-center md:justify-start space-x-4 text-sm mt-2 text-gray-600">
                {data.links
                  .filter((link) => link.name && link.url)
                  .map((link, index) => (
                    <span key={index}>{link.name}</span>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {data.personalInfo.summary && (
        <div>
          <h2 className="font-bold text-base mb-3 pb-1 border-b border-gray-600 text-gray-800">PROFESSIONAL SUMMARY</h2>
          <p className="text-sm leading-relaxed text-black">{data.personalInfo.summary}</p>
        </div>
      )}

      {/* Professional Experience */}
      {data.experience.some((exp) => exp.jobTitle) && (
        <div>
          <h2 className="font-bold text-base mb-4 pb-1 border-b border-gray-600 text-gray-800">
            PROFESSIONAL EXPERIENCE
          </h2>
          {data.experience
            .filter((exp) => exp.jobTitle)
            .map((exp, index) => (
              <div key={index} className="mb-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-sm text-gray-800">{exp.jobTitle}</h3>
                  <span className="text-sm font-medium text-gray-600">{exp.date}</span>
                </div>
                <p className="text-sm font-medium mb-2 text-gray-600">{exp.company}</p>
                {exp.responsibilities && <p className="text-sm leading-relaxed text-black">{exp.responsibilities}</p>}
              </div>
            ))}
        </div>
      )}

      {/* Education */}
      {data.education.some((edu) => edu.school) && (
        <div>
          <h2 className="font-bold text-base mb-4 pb-1 border-b border-gray-600 text-gray-800">EDUCATION</h2>
          {data.education
            .filter((edu) => edu.school)
            .map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-800">{edu.school}</h3>
                    <p className="text-sm text-black">{edu.degree}</p>
                  </div>
                  <span className="text-sm text-gray-600">{edu.date}</span>
                </div>
                {edu.gpa && <p className="text-sm mt-1 text-gray-600">GPA: {edu.gpa}</p>}
              </div>
            ))}
        </div>
      )}

      {/* Core Competencies */}
      {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
        <div>
          <h2 className="font-bold text-base mb-4 pb-1 border-b border-gray-600 text-gray-800">CORE COMPETENCIES</h2>
          <div className="space-y-2">
            {data.skills.languages && (
              <div>
                <span className="font-medium text-sm text-gray-700">Programming Languages: </span>
                <span className="text-sm text-black">{data.skills.languages}</span>
              </div>
            )}
            {data.skills.frameworks && (
              <div>
                <span className="font-medium text-sm text-gray-700">Frameworks & Libraries: </span>
                <span className="text-sm text-black">{data.skills.frameworks}</span>
              </div>
            )}
            {data.skills.tools && (
              <div>
                <span className="font-medium text-sm text-gray-700">Tools & Platforms: </span>
                <span className="text-sm text-black">{data.skills.tools}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Projects */}
      {data.projects.some((project) => project.name) && (
        <div>
          <h2 className="font-bold text-base mb-4 pb-1 border-b border-gray-600 text-gray-800">KEY PROJECTS</h2>
          {data.projects
            .filter((project) => project.name)
            .map((project, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-semibold text-sm mb-1 text-gray-800">{project.name}</h3>
                {project.description && (
                  <p className="text-sm leading-relaxed mb-1 text-black">{project.description}</p>
                )}
                {project.technologies && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Technologies:</span> {project.technologies}
                  </p>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications.some((cert) => cert.name) && (
        <div>
          <h2 className="font-bold text-base mb-4 pb-1 border-b border-gray-600 text-gray-800">
            PROFESSIONAL CERTIFICATIONS
          </h2>
          {data.certifications
            .filter((cert) => cert.name)
            .map((cert, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{cert.name}</span>
                    {cert.issuer && <span className="text-sm ml-2 text-black">- {cert.issuer}</span>}
                  </div>
                  {cert.date && <span className="text-sm text-gray-600">{cert.date}</span>}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export function ModernTemplate({ data, template }: TemplatePreviewProps) {
  return (
    <div
      className="space-y-6 font-sans text-sm"
      style={{ color: template.colors.text, backgroundColor: template.colors.background }}
    >
      {/* Header */}
      <div className="pb-6">
        <div
          className="p-6 rounded-lg flex flex-col sm:flex-row items-center sm:items-start gap-6"
          style={{
            backgroundColor: template.colors.background,
            borderLeft: `4px solid ${template.colors.accent}`,
            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.15)",
          }}
        >
          {data.personalInfo.profileImage && (
            <div
              className="w-24 h-24 rounded-full overflow-hidden border-3 flex-shrink-0"
              style={{ borderColor: template.colors.primary }}
            >
              <img
                src={data.personalInfo.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold mb-2" style={{ color: template.colors.primary }}>
              {data.personalInfo.name || "Your Name"}
            </h1>
            <p className="text-lg mb-3" style={{ color: template.colors.secondary }}>
              {data.personalInfo.title || "Your Professional Title"}
            </p>
            <div
              className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm"
              style={{ color: template.colors.muted }}
            >
              <span>{data.personalInfo.email}</span>
              <span>{data.personalInfo.phone}</span>
              <span>{data.personalInfo.location}</span>
            </div>
            {data.links.some((link) => link.name && link.url) && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm mt-3">
                {data.links
                  .filter((link) => link.name && link.url)
                  .map((link, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: template.colors.accent + "20",
                        color: template.colors.primary,
                      }}
                    >
                      {link.name}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {data.personalInfo.summary && (
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center" style={{ color: template.colors.primary }}>
            <div className="w-1 h-6 rounded mr-3" style={{ backgroundColor: template.colors.accent }}></div>
            Professional Summary
          </h2>
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: template.colors.background,
              border: `1px solid ${template.colors.accent}30`,
              boxShadow: "0 1px 3px rgba(59, 130, 246, 0.1)",
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: template.colors.text }}>
              {data.personalInfo.summary}
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Experience */}
          {data.experience.some((exp) => exp.jobTitle) && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center" style={{ color: template.colors.primary }}>
                <div className="w-1 h-6 rounded mr-3" style={{ backgroundColor: template.colors.accent }}></div>
                Professional Experience
              </h2>
              {data.experience
                .filter((exp) => exp.jobTitle)
                .map((exp, index) => (
                  <div
                    key={index}
                    className="mb-5 p-4 rounded-lg border-l-4"
                    style={{
                      backgroundColor: template.colors.background,
                      borderLeftColor: template.colors.accent,
                      border: `1px solid ${template.colors.accent}20`,
                      boxShadow: "0 1px 3px rgba(59, 130, 246, 0.1)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-base" style={{ color: template.colors.primary }}>
                          {exp.jobTitle}
                        </h3>
                        <p className="text-sm font-semibold" style={{ color: template.colors.accent }}>
                          {exp.company}
                        </p>
                      </div>
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: template.colors.primary + "15",
                          color: template.colors.primary,
                        }}
                      >
                        {exp.date}
                      </span>
                    </div>
                    {exp.responsibilities && (
                      <p className="text-sm leading-relaxed" style={{ color: template.colors.text }}>
                        {exp.responsibilities}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Key Projects */}
          {data.projects.some((project) => project.name) && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center" style={{ color: template.colors.primary }}>
                <div className="w-1 h-6 rounded mr-3" style={{ backgroundColor: template.colors.accent }}></div>
                Key Projects
              </h2>
              {data.projects
                .filter((project) => project.name)
                .map((project, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 rounded-lg"
                    style={{
                      backgroundColor: template.colors.background,
                      border: `1px solid ${template.colors.accent}20`,
                      boxShadow: "0 1px 3px rgba(59, 130, 246, 0.1)",
                    }}
                  >
                    <h3 className="font-bold text-sm mb-2" style={{ color: template.colors.primary }}>
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm leading-relaxed mb-2" style={{ color: template.colors.text }}>
                        {project.description}
                      </p>
                    )}
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.split(",").map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: template.colors.accent + "20",
                              color: template.colors.primary,
                            }}
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Core Competencies */}
          {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: template.colors.background,
                border: `1px solid ${template.colors.accent}20`,
                boxShadow: "0 1px 3px rgba(59, 130, 246, 0.1)",
              }}
            >
              <h2 className="text-base font-bold mb-3" style={{ color: template.colors.primary }}>
                Core Competencies
              </h2>
              <div className="space-y-3">
                {data.skills.languages && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1" style={{ color: template.colors.secondary }}>
                      PROGRAMMING LANGUAGES
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {data.skills.languages.split(",").map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: template.colors.primary + "15",
                            color: template.colors.primary,
                          }}
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills.frameworks && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1" style={{ color: template.colors.secondary }}>
                      FRAMEWORKS & LIBRARIES
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {data.skills.frameworks.split(",").map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: template.colors.primary + "15",
                            color: template.colors.primary,
                          }}
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills.tools && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1" style={{ color: template.colors.secondary }}>
                      TOOLS & PLATFORMS
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {data.skills.tools.split(",").map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: template.colors.primary + "15",
                            color: template.colors.primary,
                          }}
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.some((edu) => edu.school) && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: template.colors.background,
                border: `1px solid ${template.colors.accent}20`,
                boxShadow: "0 1px 3px rgba(59, 130, 246, 0.1)",
              }}
            >
              <h2 className="text-base font-bold mb-3" style={{ color: template.colors.primary }}>
                Education
              </h2>
              {data.education
                .filter((edu) => edu.school)
                .map((edu, index) => (
                  <div key={index} className="mb-3">
                    <h3 className="font-semibold text-sm" style={{ color: template.colors.primary }}>
                      {edu.school}
                    </h3>
                    <p className="text-sm" style={{ color: template.colors.text }}>
                      {edu.degree}
                    </p>
                    <p className="text-xs" style={{ color: template.colors.muted }}>
                      {edu.date}
                    </p>
                    {edu.gpa && (
                      <p className="text-xs" style={{ color: template.colors.muted }}>
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Certifications */}
          {data.certifications.some((cert) => cert.name) && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: template.colors.background,
                border: `1px solid ${template.colors.accent}20`,
                boxShadow: "0 1px 3px rgba(59, 130, 246, 0.1)",
              }}
            >
              <h2 className="text-base font-bold mb-3" style={{ color: template.colors.primary }}>
                Certifications
              </h2>
              {data.certifications
                .filter((cert) => cert.name)
                .map((cert, index) => (
                  <div key={index} className="mb-3">
                    <p className="text-sm font-semibold" style={{ color: template.colors.primary }}>
                      {cert.name}
                    </p>
                    <p className="text-xs" style={{ color: template.colors.accent }}>
                      {cert.issuer}
                    </p>
                    <p className="text-xs" style={{ color: template.colors.muted }}>
                      {cert.date}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function CreativeTemplate({ data, template }: TemplatePreviewProps) {
  return (
    <div
      className="space-y-6 font-sans text-sm"
      style={{ color: template.colors.text, backgroundColor: template.colors.background }}
    >
      {/* Header */}
      <div className="relative">
        <div
          className="p-6 rounded-xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6"
          style={{
            backgroundColor: template.colors.background,
            border: `2px solid ${template.colors.accent}40`,
            boxShadow: "0 4px 20px rgba(124, 58, 237, 0.15)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{
              backgroundColor: template.colors.accent,
              transform: "translate(25%, -25%)",
            }}
          ></div>
          {data.personalInfo.profileImage && (
            <div
              className="w-24 h-24 rounded-full overflow-hidden border-3 flex-shrink-0 relative z-10"
              style={{ borderColor: template.colors.primary }}
            >
              <img
                src={data.personalInfo.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="relative z-10 flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold mb-2" style={{ color: template.colors.primary }}>
              {data.personalInfo.name || "Your Name"}
            </h1>
            <p className="text-lg mb-4" style={{ color: template.colors.secondary }}>
              {data.personalInfo.title || "Your Professional Title"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center justify-center sm:justify-start">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: template.colors.accent }}></div>
                <span style={{ color: template.colors.text }}>{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: template.colors.accent }}></div>
                <span style={{ color: template.colors.text }}>{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: template.colors.accent }}></div>
                <span style={{ color: template.colors.text }}>{data.personalInfo.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {data.personalInfo.summary && (
        <div
          className="relative p-5 rounded-xl border-l-4"
          style={{
            borderColor: template.colors.accent,
            backgroundColor: template.colors.accent + "10",
            boxShadow: "0 2px 10px rgba(124, 58, 237, 0.1)",
          }}
        >
          <div
            className="absolute -left-2 top-6 w-4 h-4 rounded-full"
            style={{ backgroundColor: template.colors.accent }}
          ></div>
          <h2 className="font-bold text-base mb-3" style={{ color: template.colors.primary }}>
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: template.colors.text }}>
            {data.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Professional Experience */}
      {data.experience.some((exp) => exp.jobTitle) && (
        <div>
          <h2 className="font-bold text-lg mb-4 text-center" style={{ color: template.colors.primary }}>
            Professional Experience
          </h2>
          <div className="relative">
            <div
              className="absolute left-6 top-0 bottom-0 w-0.5"
              style={{ backgroundColor: template.colors.accent }}
            ></div>
            {data.experience
              .filter((exp) => exp.jobTitle)
              .map((exp, index) => (
                <div key={index} className="relative pl-12 pb-6">
                  <div
                    className="absolute left-4 w-4 h-4 rounded-full border-2 border-white"
                    style={{
                      backgroundColor: template.colors.accent,
                      top: "0.5rem",
                    }}
                  ></div>
                  <div
                    className="p-4 rounded-lg shadow-md"
                    style={{
                      backgroundColor: template.colors.background,
                      border: `1px solid ${template.colors.accent}20`,
                      boxShadow: "0 2px 10px rgba(124, 58, 237, 0.1)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: template.colors.primary }}>
                          {exp.jobTitle}
                        </h3>
                        <p className="text-sm font-semibold" style={{ color: template.colors.accent }}>
                          {exp.company}
                        </p>
                      </div>
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: template.colors.secondary + "20",
                          color: template.colors.secondary,
                        }}
                      >
                        {exp.date}
                      </span>
                    </div>
                    {exp.responsibilities && (
                      <p className="text-sm leading-relaxed" style={{ color: template.colors.text }}>
                        {exp.responsibilities}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Core Competencies */}
      {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.skills.languages && (
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: template.colors.primary + "10" }}>
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: template.colors.primary }}
              >
                L
              </div>
              <h3 className="font-bold text-xs mb-2" style={{ color: template.colors.primary }}>
                PROGRAMMING LANGUAGES
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: template.colors.text }}>
                {data.skills.languages}
              </p>
            </div>
          )}
          {data.skills.frameworks && (
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: template.colors.accent + "10" }}>
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: template.colors.accent }}
              >
                F
              </div>
              <h3 className="font-bold text-xs mb-2" style={{ color: template.colors.accent }}>
                FRAMEWORKS & LIBRARIES
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: template.colors.text }}>
                {data.skills.frameworks}
              </p>
            </div>
          )}
          {data.skills.tools && (
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: template.colors.secondary + "10" }}>
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: template.colors.secondary }}
              >
                T
              </div>
              <h3 className="font-bold text-xs mb-2" style={{ color: template.colors.secondary }}>
                TOOLS & PLATFORMS
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: template.colors.text }}>
                {data.skills.tools}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Key Projects */}
      {data.projects.some((project) => project.name) && (
        <div>
          <h2 className="font-bold text-lg mb-4 text-center" style={{ color: template.colors.primary }}>
            Key Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.projects
              .filter((project) => project.name)
              .map((project, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border-2 transition-all hover:shadow-lg"
                  style={{
                    borderColor: template.colors.accent + "30",
                    backgroundColor: template.colors.background,
                    boxShadow: "0 2px 10px rgba(124, 58, 237, 0.1)",
                  }}
                >
                  <h3 className="font-bold text-sm mb-2" style={{ color: template.colors.primary }}>
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm leading-relaxed mb-3" style={{ color: template.colors.text }}>
                      {project.description}
                    </p>
                  )}
                  {project.technologies && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.split(",").map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: template.colors.accent,
                            color: "white",
                          }}
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Education and Certifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {data.education.some((edu) => edu.school) && (
          <div>
            <h2 className="font-bold text-base mb-3" style={{ color: template.colors.primary }}>
              Education
            </h2>
            {data.education
              .filter((edu) => edu.school)
              .map((edu, index) => (
                <div
                  key={index}
                  className="mb-3 p-3 rounded-lg"
                  style={{ backgroundColor: template.colors.primary + "10" }}
                >
                  <h3 className="font-semibold text-sm" style={{ color: template.colors.primary }}>
                    {edu.school}
                  </h3>
                  <p className="text-sm" style={{ color: template.colors.text }}>
                    {edu.degree}
                  </p>
                  <p className="text-xs" style={{ color: template.colors.muted }}>
                    {edu.date}
                  </p>
                  {edu.gpa && (
                    <p className="text-xs" style={{ color: template.colors.muted }}>
                      GPA: {edu.gpa}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}

        {data.certifications.some((cert) => cert.name) && (
          <div>
            <h2 className="font-bold text-base mb-3" style={{ color: template.colors.primary }}>
              Professional Certifications
            </h2>
            {data.certifications
              .filter((cert) => cert.name)
              .map((cert, index) => (
                <div
                  key={index}
                  className="mb-3 p-3 rounded-lg"
                  style={{ backgroundColor: template.colors.accent + "10" }}
                >
                  <p className="text-sm font-semibold" style={{ color: template.colors.primary }}>
                    {cert.name}
                  </p>
                  <p className="text-xs" style={{ color: template.colors.accent }}>
                    {cert.issuer}
                  </p>
                  <p className="text-xs" style={{ color: template.colors.muted }}>
                    {cert.date}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function MinimalTemplate({ data, template }: TemplatePreviewProps) {
  return (
    <div className="space-y-8 font-light text-sm max-w-2xl mx-auto leading-relaxed text-black bg-white">
      {/* Header */}
      <div className="text-center pb-8 border-b border-gray-300">
        {data.personalInfo.profileImage && (
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-black mx-auto mb-4">
            <img
              src={data.personalInfo.profileImage || "/placeholder.svg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-light tracking-wide mb-3 text-black">{data.personalInfo.name || "Your Name"}</h1>
        <p className="text-lg mb-4 font-light text-gray-700">{data.personalInfo.title || "Your Professional Title"}</p>
        <div className="flex justify-center space-x-8 text-sm text-gray-600">
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
        </div>
      </div>

      {/* Professional Summary */}
      {data.personalInfo.summary && (
        <div className="text-center">
          <p className="text-sm leading-relaxed font-light max-w-lg mx-auto text-black">{data.personalInfo.summary}</p>
        </div>
      )}

      {/* Professional Experience */}
      {data.experience.some((exp) => exp.jobTitle) && (
        <div>
          <h2 className="text-base font-medium mb-6 tracking-wide text-center text-black">PROFESSIONAL EXPERIENCE</h2>
          {data.experience
            .filter((exp) => exp.jobTitle)
            .map((exp, index) => (
              <div key={index} className="mb-8">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-base font-medium text-black">{exp.jobTitle}</h3>
                  <span className="text-sm font-light text-gray-600">{exp.date}</span>
                </div>
                <p className="text-sm mb-3 font-light text-gray-700">{exp.company}</p>
                {exp.responsibilities && (
                  <p className="text-sm leading-relaxed font-light text-black">{exp.responsibilities}</p>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Core Competencies */}
      {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
        <div>
          <h2 className="text-base font-medium mb-6 tracking-wide text-center text-black">CORE COMPETENCIES</h2>
          <div className="space-y-4">
            {data.skills.languages && (
              <div className="flex justify-center">
                <div className="text-center max-w-md">
                  <span className="text-sm font-medium block mb-2 text-gray-700">Programming Languages</span>
                  <span className="text-sm font-light text-black">{data.skills.languages}</span>
                </div>
              </div>
            )}
            {data.skills.frameworks && (
              <div className="flex justify-center">
                <div className="text-center max-w-md">
                  <span className="text-sm font-medium block mb-2 text-gray-700">Frameworks & Libraries</span>
                  <span className="text-sm font-light text-black">{data.skills.frameworks}</span>
                </div>
              </div>
            )}
            {data.skills.tools && (
              <div className="flex justify-center">
                <div className="text-center max-w-md">
                  <span className="text-sm font-medium block mb-2 text-gray-700">Tools & Platforms</span>
                  <span className="text-sm font-light text-black">{data.skills.tools}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Projects */}
      {data.projects.some((project) => project.name) && (
        <div>
          <h2 className="text-base font-medium mb-6 tracking-wide text-center text-black">KEY PROJECTS</h2>
          {data.projects
            .filter((project) => project.name)
            .map((project, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-sm font-medium mb-2 text-black">{project.name}</h3>
                {project.description && (
                  <p className="text-sm leading-relaxed mb-2 font-light text-black">{project.description}</p>
                )}
                {project.technologies && <p className="text-sm font-light text-gray-600">{project.technologies}</p>}
              </div>
            ))}
        </div>
      )}

      {/* Education */}
      {data.education.some((edu) => edu.school) && (
        <div>
          <h2 className="text-base font-medium mb-6 tracking-wide text-center text-black">EDUCATION</h2>
          {data.education
            .filter((edu) => edu.school)
            .map((edu, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-medium text-black">{edu.school}</h3>
                  <span className="text-sm font-light text-gray-600">{edu.date}</span>
                </div>
                <p className="text-sm font-light text-black">{edu.degree}</p>
                {edu.gpa && <p className="text-sm font-light text-gray-600">GPA: {edu.gpa}</p>}
              </div>
            ))}
        </div>
      )}

      {/* Professional Certifications */}
      {data.certifications.some((cert) => cert.name) && (
        <div>
          <h2 className="text-base font-medium mb-6 tracking-wide text-center text-black">
            PROFESSIONAL CERTIFICATIONS
          </h2>
          {data.certifications
            .filter((cert) => cert.name)
            .map((cert, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-black">{cert.name}</span>
                  <span className="text-sm font-light text-gray-600">{cert.date}</span>
                </div>
                <p className="text-sm font-light text-gray-700">{cert.issuer}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export function ExecutiveTemplate({ data, template }: TemplatePreviewProps) {
  return (
    <div
      className="space-y-8 font-serif text-sm"
      style={{ color: template.colors.text, backgroundColor: template.colors.background }}
    >
      {/* Header */}
      <div className="text-center pb-8 border-b-2" style={{ borderColor: template.colors.primary }}>
        {data.personalInfo.profileImage && (
          <div
            className="w-28 h-28 rounded-full overflow-hidden border-3 mx-auto mb-4"
            style={{ borderColor: template.colors.accent }}
          >
            <img
              src={data.personalInfo.profileImage || "/placeholder.svg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold mb-3 tracking-wide" style={{ color: template.colors.primary }}>
          {data.personalInfo.name || "Your Name"}
        </h1>
        <p className="text-xl font-medium mb-4" style={{ color: template.colors.secondary }}>
          {data.personalInfo.title || "Your Professional Title"}
        </p>
        <div className="flex justify-center space-x-8 text-sm font-medium">
          <span style={{ color: template.colors.text }}>{data.personalInfo.email}</span>
          <span style={{ color: template.colors.muted }}>•</span>
          <span style={{ color: template.colors.text }}>{data.personalInfo.phone}</span>
          <span style={{ color: template.colors.muted }}>•</span>
          <span style={{ color: template.colors.text }}>{data.personalInfo.location}</span>
        </div>
      </div>

      {/* Executive Summary */}
      {data.personalInfo.summary && (
        <div
          className="p-6 rounded-lg border-l-4"
          style={{
            borderColor: template.colors.accent,
            backgroundColor: template.colors.background,
            boxShadow: "0 4px 12px rgba(5, 150, 105, 0.15)",
          }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: template.colors.primary }}>
            EXECUTIVE SUMMARY
          </h2>
          <p className="text-sm leading-relaxed font-medium" style={{ color: template.colors.text }}>
            {data.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Professional Experience */}
      {data.experience.some((exp) => exp.jobTitle) && (
        <div>
          <h2
            className="text-xl font-bold mb-6 pb-2 border-b"
            style={{
              color: template.colors.primary,
              borderColor: template.colors.primary,
            }}
          >
            PROFESSIONAL EXPERIENCE
          </h2>
          {data.experience
            .filter((exp) => exp.jobTitle)
            .map((exp, index) => (
              <div
                key={index}
                className="mb-8 p-5 rounded-lg border"
                style={{
                  borderColor: template.colors.muted + "30",
                  backgroundColor: template.colors.background,
                  boxShadow: "0 2px 8px rgba(5, 150, 105, 0.1)",
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: template.colors.primary }}>
                      {exp.jobTitle}
                    </h3>
                    <p className="text-base font-semibold" style={{ color: template.colors.accent }}>
                      {exp.company}
                    </p>
                  </div>
                  <span
                    className="text-sm font-medium px-3 py-1 rounded"
                    style={{
                      backgroundColor: template.colors.primary + "20",
                      color: template.colors.primary,
                    }}
                  >
                    {exp.date}
                  </span>
                </div>
                {exp.responsibilities && (
                  <div className="pl-4 border-l-2" style={{ borderColor: template.colors.accent }}>
                    <p className="text-sm leading-relaxed" style={{ color: template.colors.text }}>
                      {exp.responsibilities}
                    </p>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Core Competencies */}
      {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: template.colors.background,
            border: `1px solid ${template.colors.muted}30`,
            boxShadow: "0 2px 8px rgba(5, 150, 105, 0.1)",
          }}
        >
          <h2 className="text-xl font-bold mb-6" style={{ color: template.colors.primary }}>
            CORE COMPETENCIES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {data.skills.languages && (
              <div>
                <h3 className="text-sm font-bold mb-3" style={{ color: template.colors.accent }}>
                  TECHNICAL LANGUAGES
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: template.colors.text }}>
                  {data.skills.languages}
                </p>
              </div>
            )}
            {data.skills.frameworks && (
              <div>
                <h3 className="text-sm font-bold mb-3" style={{ color: template.colors.accent }}>
                  FRAMEWORKS & LIBRARIES
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: template.colors.text }}>
                  {data.skills.frameworks}
                </p>
              </div>
            )}
            {data.skills.tools && (
              <div>
                <h3 className="text-sm font-bold mb-3" style={{ color: template.colors.accent }}>
                  TOOLS & PLATFORMS
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: template.colors.text }}>
                  {data.skills.tools}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Projects & Initiatives */}
      {data.projects.some((project) => project.name) && (
        <div>
          <h2
            className="text-xl font-bold mb-6 pb-2 border-b"
            style={{
              color: template.colors.primary,
              borderColor: template.colors.primary,
            }}
          >
            KEY PROJECTS & INITIATIVES
          </h2>
          {data.projects
            .filter((project) => project.name)
            .map((project, index) => (
              <div
                key={index}
                className="mb-6 p-4 border-l-4"
                style={{
                  borderColor: template.colors.accent,
                  backgroundColor: template.colors.accent + "10",
                  boxShadow: "0 2px 8px rgba(5, 150, 105, 0.1)",
                }}
              >
                <h3 className="text-base font-bold mb-2" style={{ color: template.colors.primary }}>
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm leading-relaxed mb-2" style={{ color: template.colors.text }}>
                    {project.description}
                  </p>
                )}
                {project.technologies && (
                  <p className="text-sm font-medium" style={{ color: template.colors.accent }}>
                    <span className="font-bold">Technologies:</span> {project.technologies}
                  </p>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Education & Certifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {data.education.some((edu) => edu.school) && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: template.colors.primary }}>
              EDUCATION
            </h2>
            {data.education
              .filter((edu) => edu.school)
              .map((edu, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border rounded"
                  style={{
                    borderColor: template.colors.muted + "30",
                    backgroundColor: template.colors.background,
                    boxShadow: "0 1px 4px rgba(5, 150, 105, 0.1)",
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold" style={{ color: template.colors.primary }}>
                        {edu.school}
                      </h3>
                      <p className="text-sm" style={{ color: template.colors.text }}>
                        {edu.degree}
                      </p>
                      {edu.gpa && (
                        <p className="text-sm" style={{ color: template.colors.muted }}>
                          GPA: {edu.gpa}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium" style={{ color: template.colors.muted }}>
                      {edu.date}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {data.certifications.some((cert) => cert.name) && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: template.colors.primary }}>
              PROFESSIONAL CERTIFICATIONS
            </h2>
            {data.certifications
              .filter((cert) => cert.name)
              .map((cert, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border rounded"
                  style={{
                    borderColor: template.colors.muted + "30",
                    backgroundColor: template.colors.background,
                    boxShadow: "0 1px 4px rgba(5, 150, 105, 0.1)",
                  }}
                >
                  <h3 className="text-base font-bold" style={{ color: template.colors.primary }}>
                    {cert.name}
                  </h3>
                  <p className="text-sm" style={{ color: template.colors.accent }}>
                    {cert.issuer}
                  </p>
                  <p className="text-sm" style={{ color: template.colors.muted }}>
                    {cert.date}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function PhotoTemplate({ data, template }: TemplatePreviewProps) {
  return (
    <div
      className="space-y-6 font-sans text-sm"
      style={{ color: template.colors.text, backgroundColor: template.colors.background }}
    >
      {/* Header with prominent photo */}
      <div className="relative">
        <div
          className="p-8 rounded-xl"
          style={{
            backgroundColor: template.colors.background,
            border: `1px solid ${template.colors.accent}30`,
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.1)",
          }}
        >
          <div className="flex flex-col items-center text-center mb-6">
            {/* Large Profile Image - Required */}
            <div
              className="w-32 h-32 rounded-full overflow-hidden border-4 mb-6"
              style={{ borderColor: template.colors.primary }}
            >
              <img
                src={data.personalInfo.profileImage || "/placeholder.svg?height=128&width=128&text=Photo+Required"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="text-3xl font-bold mb-2" style={{ color: template.colors.primary }}>
              {data.personalInfo.name || "Your Name"}
            </h1>
            <p className="text-xl mb-4" style={{ color: template.colors.secondary }}>
              {data.personalInfo.title || "Your Professional Title"}
            </p>

            {/* Contact Info in elegant layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: template.colors.accent }}></div>
                <span>{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: template.colors.accent }}></div>
                <span>{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: template.colors.accent }}></div>
                <span>{data.personalInfo.location}</span>
              </div>
            </div>

            {/* Professional Links */}
            {data.links.some((link) => link.name && link.url) && (
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                {data.links
                  .filter((link) => link.name && link.url)
                  .map((link, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: template.colors.accent + "20",
                        color: template.colors.primary,
                        border: `1px solid ${template.colors.accent}30`,
                      }}
                    >
                      {link.name}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {data.personalInfo.summary && (
        <div
          className="p-6 rounded-lg text-center"
          style={{
            backgroundColor: template.colors.background,
            border: `1px solid ${template.colors.accent}20`,
            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
          }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: template.colors.primary }}>
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed max-w-3xl mx-auto" style={{ color: template.colors.text }}>
            {data.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Experience & Projects */}
        <div className="space-y-6">
          {/* Professional Experience */}
          {data.experience.some((exp) => exp.jobTitle) && (
            <div>
              <h2 className="text-lg font-bold mb-4 text-center" style={{ color: template.colors.primary }}>
                Professional Experience
              </h2>
              {data.experience
                .filter((exp) => exp.jobTitle)
                .map((exp, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 rounded-lg"
                    style={{
                      backgroundColor: template.colors.background,
                      border: `1px solid ${template.colors.accent}20`,
                      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
                    }}
                  >
                    <div className="text-center mb-3">
                      <h3 className="font-bold text-base" style={{ color: template.colors.primary }}>
                        {exp.jobTitle}
                      </h3>
                      <p className="text-sm font-semibold" style={{ color: template.colors.accent }}>
                        {exp.company}
                      </p>
                      <p className="text-xs" style={{ color: template.colors.muted }}>
                        {exp.date}
                      </p>
                    </div>
                    {exp.responsibilities && (
                      <p className="text-sm leading-relaxed text-center" style={{ color: template.colors.text }}>
                        {exp.responsibilities}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Key Projects */}
          {data.projects.some((project) => project.name) && (
            <div>
              <h2 className="text-lg font-bold mb-4 text-center" style={{ color: template.colors.primary }}>
                Key Projects
              </h2>
              {data.projects
                .filter((project) => project.name)
                .map((project, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 rounded-lg text-center"
                    style={{
                      backgroundColor: template.colors.background,
                      border: `1px solid ${template.colors.accent}20`,
                      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
                    }}
                  >
                    <h3 className="font-bold text-sm mb-2" style={{ color: template.colors.primary }}>
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm leading-relaxed mb-2" style={{ color: template.colors.text }}>
                        {project.description}
                      </p>
                    )}
                    {project.technologies && (
                      <div className="flex flex-wrap justify-center gap-1">
                        {project.technologies.split(",").map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: template.colors.accent + "20",
                              color: template.colors.primary,
                            }}
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Right Column - Skills, Education, Certifications */}
        <div className="space-y-6">
          {/* Core Competencies */}
          {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: template.colors.background,
                border: `1px solid ${template.colors.accent}20`,
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
              }}
            >
              <h2 className="text-base font-bold mb-3 text-center" style={{ color: template.colors.primary }}>
                Core Competencies
              </h2>
              <div className="space-y-3">
                {data.skills.languages && (
                  <div className="text-center">
                    <h4 className="text-xs font-semibold mb-1" style={{ color: template.colors.secondary }}>
                      PROGRAMMING LANGUAGES
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: template.colors.text }}>
                      {data.skills.languages}
                    </p>
                  </div>
                )}
                {data.skills.frameworks && (
                  <div className="text-center">
                    <h4 className="text-xs font-semibold mb-1" style={{ color: template.colors.secondary }}>
                      FRAMEWORKS & LIBRARIES
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: template.colors.text }}>
                      {data.skills.frameworks}
                    </p>
                  </div>
                )}
                {data.skills.tools && (
                  <div className="text-center">
                    <h4 className="text-xs font-semibold mb-1" style={{ color: template.colors.secondary }}>
                      TOOLS & PLATFORMS
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: template.colors.text }}>
                      {data.skills.tools}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.some((edu) => edu.school) && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: template.colors.background,
                border: `1px solid ${template.colors.accent}20`,
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
              }}
            >
              <h2 className="text-base font-bold mb-3 text-center" style={{ color: template.colors.primary }}>
                Education
              </h2>
              {data.education
                .filter((edu) => edu.school)
                .map((edu, index) => (
                  <div key={index} className="mb-3 text-center">
                    <h3 className="font-semibold text-sm" style={{ color: template.colors.primary }}>
                      {edu.school}
                    </h3>
                    <p className="text-sm" style={{ color: template.colors.text }}>
                      {edu.degree}
                    </p>
                    <p className="text-xs" style={{ color: template.colors.muted }}>
                      {edu.date}
                    </p>
                    {edu.gpa && (
                      <p className="text-xs" style={{ color: template.colors.muted }}>
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Certifications */}
          {data.certifications.some((cert) => cert.name) && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: template.colors.background,
                border: `1px solid ${template.colors.accent}20`,
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
              }}
            >
              <h2 className="text-base font-bold mb-3 text-center" style={{ color: template.colors.primary }}>
                Certifications
              </h2>
              {data.certifications
                .filter((cert) => cert.name)
                .map((cert, index) => (
                  <div key={index} className="mb-3 text-center">
                    <p className="text-sm font-semibold" style={{ color: template.colors.primary }}>
                      {cert.name}
                    </p>
                    <p className="text-xs" style={{ color: template.colors.accent }}>
                      {cert.issuer}
                    </p>
                    <p className="text-xs" style={{ color: template.colors.muted }}>
                      {cert.date}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Generic preview dispatcher – keeps the same props as the individual templates
export function TemplatePreview({ data, template }: TemplatePreviewProps) {
  switch (template.id) {
    case "modern":
      return <ModernTemplate data={data} template={template} />
    case "creative":
      return <CreativeTemplate data={data} template={template} />
    case "minimal":
      return <MinimalTemplate data={data} template={template} />
    case "executive":
      return <ExecutiveTemplate data={data} template={template} />
    case "tech":
      return <ModernTemplate data={data} template={template} />
    case "photo":
      return <PhotoTemplate data={data} template={template} />
    default:
      return <ClassicTemplate data={data} template={template} />
  }
}
