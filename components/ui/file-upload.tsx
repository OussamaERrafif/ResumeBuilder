"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  label: string
  accept?: string
  onFileSelect: (file: File | null) => void
  preview?: string | null
  className?: string
  disabled?: boolean
}

export function FileUpload({ label, accept = "image/*", onFileSelect, preview, className, disabled }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File | null) => {
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    handleFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>

      {preview ? (
        <div className="relative">
          <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!disabled ? handleClick : undefined}
        >
          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          handleFileSelect(file)
        }}
        disabled={disabled}
      />
    </div>
  )
}
