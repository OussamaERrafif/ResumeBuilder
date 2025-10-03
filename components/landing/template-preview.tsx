interface TemplatePreviewProps {
  template: any
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  return (
    <div
      className="w-full h-full bg-white rounded-lg overflow-hidden"
      style={{ backgroundColor: template.colors.background }}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="text-center">
          <div className="h-3 bg-gray-800 rounded mb-1" style={{ backgroundColor: template.colors.primary }} />
          <div
            className="h-2 bg-gray-600 rounded w-3/4 mx-auto"
            style={{ backgroundColor: template.colors.secondary }}
          />
        </div>

        {/* Contact Info */}
        <div className="flex justify-center space-x-2">
          <div className="h-1 bg-gray-400 rounded w-8" />
          <div className="h-1 bg-gray-400 rounded w-8" />
          <div className="h-1 bg-gray-400 rounded w-8" />
        </div>

        {/* Sections */}
        <div className="space-y-2">
          <div className="h-1.5 bg-gray-700 rounded w-1/3" style={{ backgroundColor: template.colors.primary }} />
          <div className="space-y-1">
            <div className="h-1 bg-gray-300 rounded" />
            <div className="h-1 bg-gray-300 rounded w-5/6" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-1.5 bg-gray-700 rounded w-1/4" style={{ backgroundColor: template.colors.primary }} />
          <div className="space-y-1">
            <div className="h-1 bg-gray-300 rounded w-4/5" />
            <div className="h-1 bg-gray-300 rounded w-3/4" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-1.5 bg-gray-700 rounded w-1/3" style={{ backgroundColor: template.colors.primary }} />
          <div className="space-y-1">
            <div className="h-1 bg-gray-300 rounded" />
            <div className="h-1 bg-gray-300 rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  )
}