"use client"

import type { Template } from "@/app/types/templates"

export interface ResumeData {
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

export interface TemplatePreviewProps {
    data: ResumeData
    template: Template
}
