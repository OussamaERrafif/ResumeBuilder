"use client"

// Re-export types
export type { ResumeData, TemplatePreviewProps } from "./types"

// Re-export individual templates
export { ClassicTemplate } from "./classic"
export { CreativeTemplate } from "./creative"
export { MinimalTemplate } from "./minimal"
export { ModernTemplate } from "./modern"
export { PhotoTemplate } from "./photo"

// Import for dispatcher
import type { TemplatePreviewProps } from "./types"
import { ClassicTemplate } from "./classic"
import { CreativeTemplate } from "./creative"
import { MinimalTemplate } from "./minimal"
import { ModernTemplate } from "./modern"
import { PhotoTemplate } from "./photo"

// ============================================================================
// Template Preview Dispatcher
// ============================================================================
export function TemplatePreview({ data, template }: TemplatePreviewProps) {
    switch (template.id) {
        case "classic":
            return <ClassicTemplate data={data} template={template} />
        case "creative":
            return <CreativeTemplate data={data} template={template} />
        case "minimal":
            return <MinimalTemplate data={data} template={template} />
        case "modern":
            return <ModernTemplate data={data} template={template} />
        case "photo":
            return <PhotoTemplate data={data} template={template} />
        default:
            return <ClassicTemplate data={data} template={template} />
    }
}
