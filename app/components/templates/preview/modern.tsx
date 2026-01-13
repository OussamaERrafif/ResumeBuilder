"use client"

import type { TemplatePreviewProps } from "./types"

// ============================================================================
// TEMPLATE 4: Modern Developer / Anubhav Singh (LaTeX lines 557-739)
// Detailed subheadings, skills with alignment (~~~~~~), projects inline
// ============================================================================
export function ModernTemplate({ data }: TemplatePreviewProps) {
    return (
        <div className="p-6 font-sans text-sm bg-white text-black">
            {/* Header - Left aligned with portfolio links */}
            <div className="mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {data.personalInfo.name || "Your Name"}
                        </h1>
                        {data.links.filter(l => l.url).slice(0, 1).map((link, i) => (
                            <p key={i} className="text-sm text-gray-600">Portfolio: {link.name || link.url}</p>
                        ))}
                        {data.links.filter(l => l.url).slice(1, 2).map((link, i) => (
                            <p key={i} className="text-sm text-gray-600">Github: {link.name || link.url}</p>
                        ))}
                    </div>
                    <div className="text-right text-sm text-gray-600">
                        {data.personalInfo.email && <p>Email: {data.personalInfo.email}</p>}
                        {data.personalInfo.phone && <p>Mobile: {data.personalInfo.phone}</p>}
                    </div>
                </div>
            </div>

            {/* Education with tilde spacing */}
            {data.education.some(e => e.school) && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold uppercase mb-2 pb-1 border-b border-black">
                        Education
                    </h2>
                    {data.education.filter(e => e.school).map((edu, i) => (
                        <div key={i} className="mb-2">
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm">{edu.school}</span>
                                <span className="text-sm text-gray-600">{edu.date}</span>
                            </div>
                            <p className="text-sm italic text-gray-600">{edu.degree}{edu.gpa && `; GPA: ${edu.gpa}`}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills Summary with aligned labels */}
            {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold uppercase mb-2 pb-1 border-b border-black">
                        Skills Summary
                    </h2>
                    <div className="space-y-1">
                        {data.skills.languages && (
                            <div className="flex items-start">
                                <span className="text-sm font-semibold w-28 flex-shrink-0">Languages</span>
                                <span className="text-sm text-gray-400 w-8">·····</span>
                                <span className="text-sm">{data.skills.languages}</span>
                            </div>
                        )}
                        {data.skills.frameworks && (
                            <div className="flex items-start">
                                <span className="text-sm font-semibold w-28 flex-shrink-0">Frameworks</span>
                                <span className="text-sm text-gray-400 w-8">·····</span>
                                <span className="text-sm">{data.skills.frameworks}</span>
                            </div>
                        )}
                        {data.skills.tools && (
                            <div className="flex items-start">
                                <span className="text-sm font-semibold w-28 flex-shrink-0">Tools</span>
                                <span className="text-sm text-gray-400 w-8">·····</span>
                                <span className="text-sm">{data.skills.tools}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Experience with resumeSubheading style */}
            {data.experience.some(e => e.jobTitle) && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold uppercase mb-2 pb-1 border-b border-black">
                        Experience
                    </h2>
                    {data.experience.filter(e => e.jobTitle).map((exp, i) => (
                        <div key={i} className="mb-3">
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm">{exp.company}</span>
                                <span className="text-sm text-gray-600">{exp.date}</span>
                            </div>
                            <p className="text-sm italic text-gray-600">{exp.jobTitle}</p>
                            {exp.responsibilities && (
                                <ul className="ml-4 mt-1 space-y-0.5">
                                    {exp.responsibilities.split('\n').filter(r => r.trim()).map((resp, j) => (
                                        <li key={j} className="text-sm flex items-start">
                                            <span className="mr-2">◦</span>
                                            <span>{resp.replace(/^[•\-◦]\s*/, '')}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Projects with inline tech */}
            {data.projects.some(p => p.name) && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold uppercase mb-2 pb-1 border-b border-black">
                        Projects
                    </h2>
                    {data.projects.filter(p => p.name).map((proj, i) => (
                        <div key={i} className="mb-2">
                            <p className="text-sm">
                                <span className="font-semibold">{proj.name}</span>
                                {proj.technologies && (
                                    <span className="text-gray-600"> ({proj.technologies})</span>
                                )}
                                {proj.description && (
                                    <span className="text-gray-700">: {proj.description}</span>
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Certifications as Honors */}
            {data.certifications.some(c => c.name) && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold uppercase mb-2 pb-1 border-b border-black">
                        Honors and Awards
                    </h2>
                    {data.certifications.filter(c => c.name).map((cert, i) => (
                        <p key={i} className="text-sm flex items-start mb-1">
                            <span className="mr-2">•</span>
                            <span>{cert.name}{cert.date && ` - ${cert.date}`}</span>
                        </p>
                    ))}
                </div>
            )}
        </div>
    )
}
