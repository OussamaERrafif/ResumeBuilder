"use client"

import type { TemplatePreviewProps } from "./types"
import { DefaultAvatar } from "@/components/ui/default-avatar"

// ============================================================================
// TEMPLATE 5: LuxSleek Photo Sidebar (LaTeX lines 740-933)
// Two-column: 33% dark navy sidebar with photo, 67% white main content
// ============================================================================
export function PhotoTemplate({ data, template }: TemplatePreviewProps) {
    const sidebarColor = template.colors.primary // #304263 cvblue

    return (
        <div className="flex min-h-[600px] font-sans text-sm">
            {/* Left Sidebar - Dark Navy (33%) */}
            <div
                className="w-1/3 p-5 text-white flex-shrink-0"
                style={{ backgroundColor: sidebarColor }}
            >
                {/* Top accent bar */}
                <div className="h-1 w-full mb-4" style={{ backgroundColor: sidebarColor }}></div>

                {/* Name */}
                <h1 className="text-lg font-light mb-4">
                    {data.personalInfo.name?.split(' ')[0] || 'First'}{' '}
                    <span className="font-bold uppercase">
                        {data.personalInfo.name?.split(' ').slice(1).join(' ') || 'Last'}
                    </span>
                </h1>

                {/* Profile Photo */}
                <div className="flex justify-center mb-4">
                    {data.personalInfo.profileImage ? (
                        <img
                            src={data.personalInfo.profileImage}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-2 border-white/30"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                            <DefaultAvatar className="w-20 h-20" size={20} />
                        </div>
                    )}
                </div>

                {/* Profile/Summary */}
                {data.personalInfo.summary && (
                    <div className="mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-white/30">
                            Profile
                        </h3>
                        <p className="text-xs leading-relaxed opacity-90">{data.personalInfo.summary}</p>
                    </div>
                )}

                {/* Contact Details */}
                <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-white/30">
                        Contact Details
                    </h3>
                    <div className="space-y-1 text-xs opacity-90">
                        {data.personalInfo.email && <p>✉ {data.personalInfo.email}</p>}
                        {data.personalInfo.phone && <p>📞 {data.personalInfo.phone}</p>}
                        {data.links.filter(l => l.url).slice(0, 1).map((link, i) => (
                            <p key={i}>🌐 {link.name || link.url}</p>
                        ))}
                        {data.personalInfo.location && <p>📍 {data.personalInfo.location}</p>}
                    </div>
                </div>

                {/* Skills with diamond bullets */}
                {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
                    <div className="mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-white/30">
                            Skills
                        </h3>
                        <ul className="text-xs space-y-1 opacity-90">
                            {data.skills.languages?.split(',').slice(0, 3).map((skill, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="mr-2">◆</span>
                                    <span>{skill.trim()}</span>
                                </li>
                            ))}
                            {data.skills.frameworks?.split(',').slice(0, 2).map((skill, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="mr-2">◆</span>
                                    <span>{skill.trim()}</span>
                                </li>
                            ))}
                            {data.skills.tools?.split(',').slice(0, 2).map((skill, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="mr-2">◆</span>
                                    <span>{skill.trim()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Right Main Content (67%) */}
            <div className="w-2/3 p-6 bg-white text-gray-900">
                {/* Experience */}
                {data.experience.some(e => e.jobTitle) && (
                    <div className="mb-5">
                        <h2
                            className="text-base font-bold uppercase mb-3 pb-1 border-b-2"
                            style={{ color: sidebarColor, borderColor: sidebarColor }}
                        >
                            Experience
                        </h2>
                        {data.experience.filter(e => e.jobTitle).map((exp, i) => (
                            <div key={i} className="mb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-bold text-sm uppercase">{exp.jobTitle}</span>
                                        <span className="text-sm italic text-gray-600"> at {exp.company}</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">{exp.date}</span>
                                </div>
                                {exp.responsibilities && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        <span className="text-gray-400">◆ </span>
                                        {exp.responsibilities.split('\n')[0]?.replace(/^[•\-]\s*/, '')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Education */}
                {data.education.some(e => e.school) && (
                    <div className="mb-5">
                        <h2
                            className="text-base font-bold uppercase mb-3 pb-1 border-b-2"
                            style={{ color: sidebarColor, borderColor: sidebarColor }}
                        >
                            Education
                        </h2>
                        {data.education.filter(e => e.school).map((edu, i) => (
                            <div key={i} className="mb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-bold text-sm uppercase">{edu.degree}</span>
                                        <span className="text-sm italic text-gray-600"> - {edu.school}</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">{edu.date}</span>
                                </div>
                                {edu.gpa && (
                                    <p className="text-xs text-gray-600">
                                        <span className="text-gray-400">◆ </span>GPA: {edu.gpa}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Projects as Additional Education/Hobbies */}
                {data.projects.some(p => p.name) && (
                    <div className="mb-5">
                        <h2
                            className="text-base font-bold uppercase mb-3 pb-1 border-b-2"
                            style={{ color: sidebarColor, borderColor: sidebarColor }}
                        >
                            Projects
                        </h2>
                        {data.projects.filter(p => p.name).slice(0, 3).map((proj, i) => (
                            <div key={i} className="mb-2">
                                <span className="font-bold text-sm uppercase">{proj.name}</span>
                                {proj.description && (
                                    <p className="text-xs text-gray-600">
                                        <span className="text-gray-400">◆ </span>{proj.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Certifications */}
                {data.certifications.some(c => c.name) && (
                    <div className="mb-5">
                        <h2
                            className="text-base font-bold uppercase mb-3 pb-1 border-b-2"
                            style={{ color: sidebarColor, borderColor: sidebarColor }}
                        >
                            Certifications
                        </h2>
                        {data.certifications.filter(c => c.name).map((cert, i) => (
                            <p key={i} className="text-sm mb-1">
                                <span className="text-gray-400">◆ </span>
                                <span className="font-medium">{cert.name}</span>
                                {cert.issuer && <span className="text-gray-600 italic"> - {cert.issuer}</span>}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
