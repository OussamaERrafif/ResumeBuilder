"use client"

import type { TemplatePreviewProps } from "./types"

// ============================================================================
// TEMPLATE 3: Minimal Clean / Jitin Nair (LaTeX lines 338-556)
// Clean black/white, fontawesome icons, dash bullets (--), tabularx
// ============================================================================
export function MinimalTemplate({ data }: TemplatePreviewProps) {
    return (
        <div className="p-8 font-sans text-sm bg-white text-black">
            {/* Centered Header */}
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold mb-2">
                    {data.personalInfo.name || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center items-center gap-x-3 text-sm text-gray-700">
                    {data.links.filter(l => l.url).slice(0, 1).map((link, i) => (
                        <span key={i}>📁 {link.name || 'GitHub'}</span>
                    ))}
                    {data.links.filter(l => l.url).slice(1, 2).map((link, i) => (
                        <span key={i}>💼 {link.name || 'LinkedIn'}</span>
                    ))}
                    {data.personalInfo.email && <span>✉ {data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>📱 {data.personalInfo.phone}</span>}
                </div>
            </div>

            {/* Summary */}
            {data.personalInfo.summary && (
                <div className="mb-4">
                    <h2 className="text-base font-bold uppercase mb-1 border-b border-black pb-0.5">
                        Summary
                    </h2>
                    <p className="text-sm leading-relaxed">{data.personalInfo.summary}</p>
                </div>
            )}

            {/* Work Experience with dash bullets */}
            {data.experience.some(e => e.jobTitle) && (
                <div className="mb-4">
                    <h2 className="text-base font-bold uppercase mb-1 border-b border-black pb-0.5">
                        Work Experience
                    </h2>
                    {data.experience.filter(e => e.jobTitle).map((exp, i) => (
                        <div key={i} className="mb-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-sm">{exp.jobTitle}</span>
                                <span className="text-sm">{exp.date}</span>
                            </div>
                            {exp.responsibilities && (
                                <div className="ml-4 mt-1">
                                    {exp.responsibilities.split('\n').filter(r => r.trim()).map((resp, j) => (
                                        <p key={j} className="text-sm flex items-start">
                                            <span className="mr-2 text-gray-600">–</span>
                                            <span>{resp.replace(/^[•\-]\s*/, '')}</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Projects */}
            {data.projects.some(p => p.name) && (
                <div className="mb-4">
                    <h2 className="text-base font-bold uppercase mb-1 border-b border-black pb-0.5">
                        Projects
                    </h2>
                    {data.projects.filter(p => p.name).map((proj, i) => (
                        <div key={i} className="mb-2">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-sm">{proj.name}</span>
                                {proj.link && <span className="text-xs text-blue-600">Link</span>}
                            </div>
                            {proj.description && (
                                <p className="text-sm text-gray-700">{proj.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Education - Tabular style */}
            {data.education.some(e => e.school) && (
                <div className="mb-4">
                    <h2 className="text-base font-bold uppercase mb-1 border-b border-black pb-0.5">
                        Education
                    </h2>
                    {data.education.filter(e => e.school).map((edu, i) => (
                        <div key={i} className="flex justify-between items-start mb-1">
                            <div>
                                <span className="text-sm">{edu.date}</span>
                                <span className="text-sm ml-4">{edu.degree} at <strong>{edu.school}</strong></span>
                                {edu.gpa && <span className="text-sm text-gray-600 ml-2">(GPA: {edu.gpa})</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills - Tabular */}
            {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
                <div className="mb-4">
                    <h2 className="text-base font-bold uppercase mb-1 border-b border-black pb-0.5">
                        Skills
                    </h2>
                    <div className="space-y-1">
                        {data.skills.languages && (
                            <div className="flex">
                                <span className="text-sm font-medium w-24">Languages</span>
                                <span className="text-sm">{data.skills.languages}</span>
                            </div>
                        )}
                        {data.skills.frameworks && (
                            <div className="flex">
                                <span className="text-sm font-medium w-24">Frameworks</span>
                                <span className="text-sm">{data.skills.frameworks}</span>
                            </div>
                        )}
                        {data.skills.tools && (
                            <div className="flex">
                                <span className="text-sm font-medium w-24">Tools</span>
                                <span className="text-sm">{data.skills.tools}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer with date */}
            <div className="text-center mt-6 pt-2 border-t border-gray-300">
                <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    )
}
