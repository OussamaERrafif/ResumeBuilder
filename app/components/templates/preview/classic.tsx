"use client"

import type { TemplatePreviewProps } from "./types"

// ============================================================================
// TEMPLATE 1: Classic Professional (LaTeX lines 1-130)
// Roboto sans-serif, centered header, pipe separators, titlerule sections
// ============================================================================
export function ClassicTemplate({ data }: TemplatePreviewProps) {
    return (
        <div className="p-8 font-sans text-sm leading-relaxed bg-white text-black">
            {/* Header - Centered with pipe separators */}
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold tracking-wide text-gray-900">
                    {data.personalInfo.name || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center items-center gap-x-2 text-sm text-gray-600 mt-2">
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo.phone && data.personalInfo.email && <span className="text-gray-400">|</span>}
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.email && data.links.length > 0 && <span className="text-gray-400">|</span>}
                    {data.links.filter(l => l.url).slice(0, 2).map((link, i, arr) => (
                        <span key={i}>
                            {link.name || link.url}
                            {i < arr.length - 1 && <span className="text-gray-400 ml-2">|</span>}
                        </span>
                    ))}
                </div>
            </div>

            {/* Summary Section */}
            {data.personalInfo.summary && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wide mb-1 pb-1 border-b border-gray-800">
                        Summary
                    </h2>
                    <p className="text-sm leading-relaxed">{data.personalInfo.summary}</p>
                </div>
            )}

            {/* Technical Skills */}
            {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wide mb-1 pb-1 border-b border-gray-800">
                        Technical Skills
                    </h2>
                    <div className="space-y-1">
                        {data.skills.languages && (
                            <p className="text-sm">
                                <span className="font-semibold">Programming Languages: </span>
                                {data.skills.languages}
                            </p>
                        )}
                        {data.skills.frameworks && (
                            <p className="text-sm">
                                <span className="font-semibold">Frameworks & Libraries: </span>
                                {data.skills.frameworks}
                            </p>
                        )}
                        {data.skills.tools && (
                            <p className="text-sm">
                                <span className="font-semibold">Tools & Platforms: </span>
                                {data.skills.tools}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Projects Section */}
            {data.projects.some(p => p.name) && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wide mb-1 pb-1 border-b border-gray-800">
                        Projects
                    </h2>
                    {data.projects.filter(p => p.name).map((proj, i) => (
                        <div key={i} className="mb-3">
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm">{proj.name}</span>
                                {proj.technologies && (
                                    <span className="text-xs text-gray-600 italic">{proj.technologies}</span>
                                )}
                            </div>
                            {proj.description && (
                                <ul className="ml-4 mt-1">
                                    <li className="text-sm flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{proj.description}</span>
                                    </li>
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Experience Section */}
            {data.experience.some(e => e.jobTitle) && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wide mb-1 pb-1 border-b border-gray-800">
                        Experience
                    </h2>
                    {data.experience.filter(e => e.jobTitle).map((exp, i) => (
                        <div key={i} className="mb-3">
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm">{exp.jobTitle}</span>
                                <span className="text-sm text-gray-600">{exp.date}</span>
                            </div>
                            <p className="text-sm italic text-gray-600">{exp.company}</p>
                            {exp.responsibilities && (
                                <ul className="ml-4 mt-1">
                                    {exp.responsibilities.split('\n').filter(r => r.trim()).map((resp, j) => (
                                        <li key={j} className="text-sm flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>{resp.replace(/^[•\-]\s*/, '')}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Education Section */}
            {data.education.some(e => e.school) && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wide mb-1 pb-1 border-b border-gray-800">
                        Education
                    </h2>
                    {data.education.filter(e => e.school).map((edu, i) => (
                        <div key={i} className="mb-2">
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm">{edu.school}</span>
                                <span className="text-sm text-gray-600">{edu.date}</span>
                            </div>
                            <p className="text-sm italic">{edu.degree}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Certifications Section */}
            {data.certifications.some(c => c.name) && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wide mb-1 pb-1 border-b border-gray-800">
                        Certifications
                    </h2>
                    <ul className="ml-4">
                        {data.certifications.filter(c => c.name).map((cert, i) => (
                            <li key={i} className="text-sm flex items-start">
                                <span className="mr-2">•</span>
                                <span>{cert.name}{cert.issuer && ` - ${cert.issuer}`}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
