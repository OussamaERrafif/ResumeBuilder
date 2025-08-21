import { marked } from 'marked'

/**
 * Simple markdown renderer for resume content
 * Supports bullet points, bold text, and basic formatting
 */
export function renderMarkdown(text: string): string {
  if (!text) return ''

  // Pre-process text to ensure bullet points are properly formatted
  let processedText = text
    // Convert • bullets to markdown
    .replace(/^\s*•\s*/gm, '* ')
    // Convert - bullets to markdown (if not already a list)
    .replace(/^\s*-\s*(?!-)/gm, '* ')
    // Ensure proper line breaks for bullets
    .replace(/\n\*/g, '\n* ')

  // Configure marked for simple rendering
  marked.setOptions({
    breaks: true,
    gfm: true,
  })

  // Convert markdown to HTML
  const html = marked(processedText) as string

  return html
}

/**
 * Convert plain text with bullet points to markdown
 * Handles various bullet point formats: *, -, •
 */
export function textToMarkdown(text: string): string {
  if (!text) return ''

  return text
    // Convert • bullets to markdown
    .replace(/^\s*•\s*/gm, '* ')
    // Convert - bullets to markdown (if not already)
    .replace(/^\s*-\s*(?!-)/gm, '* ')
    // Ensure proper line breaks for bullets
    .replace(/\n\*/g, '\n* ')
    .trim()
}

/**
 * Extract plain text from markdown (for PDF generation)
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return ''

  return markdown
    // Remove bold markdown
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Remove italic markdown  
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Convert markdown bullets to •
    .replace(/^\s*\*\s*/gm, '• ')
    .replace(/^\s*-\s*/gm, '• ')
    .trim()
}

/**
 * Check if text contains markdown formatting
 */
export function hasMarkdownFormatting(text: string): boolean {
  if (!text) return false
  
  return /(\*\*|__|^\s*[\*\-]\s)/m.test(text)
}
