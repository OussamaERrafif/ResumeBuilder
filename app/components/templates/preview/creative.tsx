"use client"

import type { TemplatePreviewProps } from "./types"

// ============================================================================
// TEMPLATE 2: Creative MaltaCV (LaTeX lines 131-337)
// Colorful flame/orange accents, bio section, multicolumn skills
// ============================================================================
export function CreativeTemplate({ data, template }: TemplatePreviewProps) {
    const flameColor = template.colors.primary // #e85d04

    return (
        <div className="p-6 font-sans text-sm bg-white text-gray-900">
            {/* Header with Name and Tagline */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold" style={{ color: flameColor }}>
                    {data.personalInfo.name || "Your Name"}
                </h1>
                <p className="text-base italic text-gray-600 mt-1">
                    {data.personalInfo.title || "Your Professional Title"}
                </p>
            </div>

            {/* Personal Info row */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {data.personalInfo.email && <span>✉ {data.personalInfo.email}</span>}
                {data.personalInfo.phone && <span>📞 {data.personalInfo.phone}</span>}
                {data.links.filter(l => l.url).slice(0, 2).map((link, i) => (
                    <span key={i}>🔗 {link.name || link.url}</span>
                ))}
            </div>

            {/* Bio Section */}
            {data.personalInfo.summary && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: flameColor + '10' }}>
                    <p className="text-sm leading-relaxed">{data.personalInfo.summary}</p>
                </div>
            )}

            {/* Skills - Multi-column grid */}
            {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
                <div className="mb-4">
                    <h2
                        className="text-sm font-bold uppercase tracking-wide mb-2 pb-1 border-b-2"
                        style={{ borderColor: flameColor, color: flameColor }}
                    >
                        Skills
                    </h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {[
                            ...(data.skills.languages?.split(',') || []),
                            ...(data.skills.frameworks?.split(',') || []),
                            ...(data.skills.tools?.split(',') || [])
                        ].filter(s => s.trim()).map((skill, i) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-1 rounded text-center"
                                style={{ backgroundColor: flameColor + '15', color: flameColor }}
                            >
                                {skill.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Education - Two column */}
            {data.education.some(e => e.school) && (
                <div className="mb-4">
                    <h2
                        className="text-sm font-bold uppercase tracking-wide mb-2 pb-1 border-b-2"
                        style={{ borderColor: flameColor, color: flameColor }}
                    >
                        Education
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.education.filter(e => e.school).map((edu, i) => (
                            <div key={i}>
                                <p className="font-semibold text-sm">{edu.degree}</p>
                                <p className="text-sm text-gray-600">{edu.school}</p>
                                <p className="text-xs text-gray-500">{edu.date}</p>
                                {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Experience */}
            {data.experience.some(e => e.jobTitle) && (
                <div className="mb-4">
                    <h2
                        className="text-sm font-bold uppercase tracking-wide mb-2 pb-1 border-b-2"
                        style={{ borderColor: flameColor, color: flameColor }}
                    >
                        Experience
                    </h2>
                    {data.experience.filter(e => e.jobTitle).map((exp, i) => (
                        <div key={i} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <span className="font-semibold text-sm">{exp.jobTitle}</span>
                                    <span className="text-sm text-gray-600"> at {exp.company}</span>
                                </div>
                                <span className="text-xs text-gray-500">{exp.date}</span>
                            </div>
                            {exp.responsibilities && (
                                <ul className="ml-4 mt-1 space-y-0.5">
                                    {exp.responsibilities.split('\n').filter(r => r.trim()).slice(0, 3).map((resp, j) => (
                                        <li key={j} className="text-sm flex items-start">
                                            <span className="mr-2" style={{ color: flameColor }}>•</span>
                                            <span>{resp.replace(/^[•\-]\s*/, '')}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Projects as Other Activities */}
            {data.projects.some(p => p.name) && (
                <div className="mb-4">
                    <h3
                        className="text-xs font-bold uppercase tracking-wide mb-2"
                        style={{ color: flameColor }}
                    >
                        Projects & Activities
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {data.projects.filter(p => p.name).map((proj, i) => (
                            <div key={i} className="text-xs">
                                <span className="font-medium">{proj.name}</span>
                                {proj.technologies && (
                                    <span className="text-gray-500 block">{proj.technologies}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications as Awards */}
            {data.certifications.some(c => c.name) && (
                <div className="mb-4">
                    <h2
                        className="text-sm font-bold uppercase tracking-wide mb-2 pb-1 border-b-2"
                        style={{ borderColor: flameColor, color: flameColor }}
                    >
                        Awards & Certifications
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {data.certifications.filter(c => c.name).map((cert, i) => (
                            <div key={i} className="text-xs">
                                <span className="font-medium">{cert.name}</span>
                                {cert.issuer && <span className="text-gray-500 block">{cert.issuer}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
