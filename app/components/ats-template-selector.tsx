'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Check, 
  FileText, 
  Download, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronDown,
  FileCode,
  FileType
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { 
  getAllATSTemplates, 
  getATSTemplate,
  getATSSuggestions,
  validateForATS,
  exportResumePDF,
  downloadResumeLatex,
  downloadResumeMarkdown,
  downloadResumeDocx,
  type ATSTemplateId,
  type ATSTemplateConfig,
  type ResumeData
} from '@/lib/ats-resume-exporter'
import { toast } from '@/hooks/use-toast'

// ============================================================================
// Types
// ============================================================================

interface ATSTemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  selectedTemplate: ATSTemplateId
  onTemplateSelect: (templateId: ATSTemplateId) => void
  resumeData: ResumeData
  onExport?: () => void
}

// ============================================================================
// Template Card Component
// ============================================================================

interface TemplateCardProps {
  template: ATSTemplateConfig
  isSelected: boolean
  onClick: () => void
}

function TemplateCard({ template, isSelected, onClick }: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200
        ${isSelected 
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 rounded-full bg-primary p-1">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {/* Template preview */}
      <div className="mb-3 rounded-lg bg-white p-3 shadow-sm border">
        <TemplatePreview template={template} />
      </div>

      {/* Template info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{template.name}</h3>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {template.category}
          </Badge>
          {template.features.showBullets && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              bullets
            </Badge>
          )}
          {template.features.compactMode && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              compact
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Template Preview Component
// ============================================================================

function TemplatePreview({ template }: { template: ATSTemplateConfig }) {
  const { colors, features, fonts } = template
  
  return (
    <div 
      className="text-[6px] leading-tight"
      style={{ 
        fontFamily: template.font === 'times' ? 'serif' : 'sans-serif',
        color: colors.text
      }}
    >
      {/* Header */}
      <div className={features.centeredHeader ? 'text-center' : ''}>
        <div 
          style={{ 
            fontSize: '10px', 
            fontWeight: fonts.name.weight,
            color: colors.primary 
          }}
        >
          John Doe
        </div>
        <div style={{ fontSize: '7px', color: colors.secondary }}>
          Software Engineer
        </div>
        <div style={{ fontSize: '5px', color: colors.muted }} className="mt-0.5">
          email@example.com • (555) 123-4567
        </div>
      </div>
      
      {features.showLines && (
        <div 
          className="my-1.5 border-t" 
          style={{ borderColor: colors.accent }}
        />
      )}

      {/* Experience section */}
      <div className="mt-1.5">
        <div 
          style={{ 
            fontWeight: 'bold', 
            color: colors.primary,
            fontSize: '7px'
          }}
        >
          EXPERIENCE
        </div>
        {features.showLines && (
          <div 
            className="mb-1 border-t" 
            style={{ borderColor: colors.accent, width: '40%' }}
          />
        )}
        <div className="ml-0">
          <div style={{ fontWeight: 'bold', fontSize: '6px' }}>Senior Developer</div>
          <div style={{ color: colors.muted, fontSize: '5px' }}>Tech Corp • 2020-Present</div>
          {features.showBullets ? (
            <div style={{ fontSize: '5px' }}>• Led development team...</div>
          ) : (
            <div style={{ fontSize: '5px' }}>Led development team...</div>
          )}
        </div>
      </div>

      {/* Skills section */}
      <div className="mt-1.5">
        <div 
          style={{ 
            fontWeight: 'bold', 
            color: colors.primary,
            fontSize: '7px'
          }}
        >
          SKILLS
        </div>
        <div style={{ fontSize: '5px', color: colors.muted }}>
          JavaScript, React, Node.js, Python
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Resume Validation Panel
// ============================================================================

function ValidationPanel({ resumeData }: { resumeData: ResumeData }) {
  const validation = validateForATS(resumeData)
  const suggestions = getATSSuggestions(resumeData)

  return (
    <div className="space-y-4">
      {/* Resume Quality Header */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-4 border border-primary/20">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-foreground">Resume Quality Check</h4>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Optimization suggestions for your resume
        </p>
      </div>

      {/* Validation Messages */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((error, index) => (
            <div 
              key={`error-${index}`}
              className="flex items-start gap-2 text-sm p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
          {validation.warnings.map((warning, index) => (
            <div 
              key={`warning-${index}`}
              className="flex items-start gap-2 text-sm p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400"
            >
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-foreground">Optimization Tips</h5>
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <div 
              key={index}
              className="flex items-start gap-2 text-xs p-2 rounded-lg bg-muted/50"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main ATS Template Selector Component
// ============================================================================

export function ATSTemplateSelector({
  isOpen,
  onClose,
  selectedTemplate,
  onTemplateSelect,
  resumeData,
  onExport
}: ATSTemplateSelectorProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string>('')
  const templates = getAllATSTemplates()

  const handleExportPDF = async () => {
    setIsExporting(true)
    setExportFormat('pdf')
    
    try {
      const result = await exportResumePDF(selectedTemplate, resumeData)
      
      if (result.success) {
        toast({
          title: 'Success! 🎉',
          description: `Your ATS-friendly resume has been downloaded (${result.pages} page${result.pages > 1 ? 's' : ''})`,
        })
        onExport?.()
        onClose()
      } else {
        toast({
          title: 'Export Failed',
          description: result.error || 'Failed to generate PDF. Please try again.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Export Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
      setExportFormat('')
    }
  }

  const handleExportLatex = async () => {
    setIsExporting(true)
    setExportFormat('latex')
    
    try {
      downloadResumeLatex(resumeData)
      toast({
        title: 'Success! 🎉',
        description: 'Your resume has been exported as LaTeX (.tex)',
      })
      onExport?.()
    } catch (error) {
      toast({
        title: 'Export Error',
        description: 'Failed to export LaTeX file. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
      setExportFormat('')
    }
  }

  const handleExportMarkdown = async () => {
    setIsExporting(true)
    setExportFormat('markdown')
    
    try {
      downloadResumeMarkdown(resumeData)
      toast({
        title: 'Success! 🎉',
        description: 'Your resume has been exported as Markdown (.md)',
      })
      onExport?.()
    } catch (error) {
      toast({
        title: 'Export Error',
        description: 'Failed to export Markdown file. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
      setExportFormat('')
    }
  }

  const handleExportDocx = async () => {
    setIsExporting(true)
    setExportFormat('docx')
    
    try {
      await downloadResumeDocx(resumeData)
      toast({
        title: 'Success! 🎉',
        description: 'Your resume has been exported as Word document (.docx)',
      })
      onExport?.()
    } catch (error) {
      toast({
        title: 'Export Error',
        description: error instanceof Error ? error.message : 'Failed to export DOCX file. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
      setExportFormat('')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="w-full max-w-5xl max-h-[90vh] bg-background rounded-2xl shadow-2xl border overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-muted/30">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                ATS-Friendly Templates
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Choose a template optimized for Applicant Tracking Systems
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Templates Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onClick={() => onTemplateSelect(template.id)}
                  />
                ))}
              </div>
            </div>

            {/* Right Panel - Validation */}
            <div className="w-80 border-l bg-muted/20 p-6 overflow-y-auto hidden lg:block">
              <ValidationPanel resumeData={resumeData} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Selected: </span>
                <span className="font-medium text-foreground">
                  {getATSTemplate(selectedTemplate).name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {/* Main PDF Download Button */}
              <Button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="min-w-[140px]"
              >
                {isExporting && exportFormat === 'pdf' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                  </motion.div>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting && exportFormat === 'pdf' ? 'Generating...' : 'Download PDF'}
              </Button>

              {/* Additional Export Formats Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isExporting}>
                    <FileType className="h-4 w-4 mr-2" />
                    More Formats
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Export Formats</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleExportLatex}
                    disabled={isExporting}
                  >
                    <FileCode className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>LaTeX (.tex)</span>
                      <span className="text-xs text-muted-foreground">For academic/professional typesetting</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleExportMarkdown}
                    disabled={isExporting}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Markdown (.md)</span>
                      <span className="text-xs text-muted-foreground">Plain text with formatting</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleExportDocx}
                    disabled={isExporting}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Word (.docx)</span>
                      <span className="text-xs text-muted-foreground">Microsoft Word document</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ATSTemplateSelector
