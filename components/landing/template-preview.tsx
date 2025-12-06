interface TemplatePreviewProps {
  template: any
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  return (
    <div
      className="w-full h-full bg-white rounded-lg overflow-hidden shadow-inner"
      style={{ backgroundColor: template.colors.background }}
    >
      <div className="p-4 space-y-3">
        {/* Header - Name and Title */}
        <div className="text-center pb-2 border-b border-gray-100">
          <div 
            className="h-3.5 rounded-sm mb-1.5 w-2/3 mx-auto" 
            style={{ backgroundColor: template.colors.primary }} 
          />
          <div
            className="h-2 rounded-sm w-1/2 mx-auto opacity-70"
            style={{ backgroundColor: template.colors.secondary }}
          />
        </div>

        {/* Contact Info Row */}
        <div className="flex justify-center gap-3 py-1">
          <div className="flex items-center gap-1">
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: template.colors.accent || template.colors.primary }}
            />
            <div className="h-1 bg-gray-300 rounded-sm w-10" />
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: template.colors.accent || template.colors.primary }}
            />
            <div className="h-1 bg-gray-300 rounded-sm w-12" />
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: template.colors.accent || template.colors.primary }}
            />
            <div className="h-1 bg-gray-300 rounded-sm w-8" />
          </div>
        </div>

        {/* Summary Section */}
        <div className="space-y-1.5">
          <div 
            className="h-1.5 rounded-sm w-1/4" 
            style={{ backgroundColor: template.colors.primary }} 
          />
          <div className="space-y-0.5 pl-2">
            <div className="h-1 bg-gray-200 rounded-sm" />
            <div className="h-1 bg-gray-200 rounded-sm w-11/12" />
            <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
          </div>
        </div>

        {/* Experience Section */}
        <div className="space-y-1.5">
          <div 
            className="h-1.5 rounded-sm w-1/3" 
            style={{ backgroundColor: template.colors.primary }} 
          />
          <div className="pl-2 space-y-2">
            <div className="space-y-0.5">
              <div className="flex justify-between items-center">
                <div 
                  className="h-1 rounded-sm w-1/3" 
                  style={{ backgroundColor: template.colors.secondary, opacity: 0.8 }}
                />
                <div className="h-0.5 bg-gray-300 rounded-sm w-1/6" />
              </div>
              <div className="h-0.5 bg-gray-200 rounded-sm w-full" />
              <div className="h-0.5 bg-gray-200 rounded-sm w-5/6" />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-1.5">
          <div 
            className="h-1.5 rounded-sm w-1/5" 
            style={{ backgroundColor: template.colors.primary }} 
          />
          <div className="flex flex-wrap gap-1 pl-2">
            <div 
              className="h-2 rounded-full w-8 opacity-20"
              style={{ backgroundColor: template.colors.primary }}
            />
            <div 
              className="h-2 rounded-full w-10 opacity-20"
              style={{ backgroundColor: template.colors.primary }}
            />
            <div 
              className="h-2 rounded-full w-6 opacity-20"
              style={{ backgroundColor: template.colors.primary }}
            />
            <div 
              className="h-2 rounded-full w-9 opacity-20"
              style={{ backgroundColor: template.colors.primary }}
            />
          </div>
        </div>

        {/* Education Section */}
        <div className="space-y-1.5">
          <div 
            className="h-1.5 rounded-sm w-1/4" 
            style={{ backgroundColor: template.colors.primary }} 
          />
          <div className="pl-2 space-y-0.5">
            <div 
              className="h-1 rounded-sm w-2/5" 
              style={{ backgroundColor: template.colors.secondary, opacity: 0.7 }}
            />
            <div className="h-0.5 bg-gray-200 rounded-sm w-3/5" />
          </div>
        </div>
      </div>
    </div>
  )
}