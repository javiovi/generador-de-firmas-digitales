"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { TemplateConfig } from "@/lib/templates"
import { TemplateType } from "@/lib/templates"

interface TemplateSelectorProps {
  templates: TemplateConfig[]
  selectedTemplate: TemplateType
  onSelectTemplate: (templateId: TemplateType) => void
}

export default function TemplateSelector({ templates, selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  return (
    <RadioGroup
      value={selectedTemplate}
      onValueChange={(value) => onSelectTemplate(value as TemplateType)}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {templates.map((template) => (
        <div key={template.id}>
          <RadioGroupItem value={template.id} id={`template-${template.id}`} className="peer sr-only" />
          <Label
            htmlFor={`template-${template.id}`}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="mb-3 w-full">
              <div className="text-lg font-semibold">{template.name}</div>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
            <div className="w-full h-32 border rounded-md overflow-hidden flex items-center justify-center bg-background">
              <TemplatePreview templateId={template.id} />
            </div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

function TemplatePreview({ templateId }: { templateId: TemplateType }) {
  // Renderizar una vista previa simplificada de cada plantilla
  switch (templateId) {
    case TemplateType.CLASSIC:
      return (
        <div className="w-full h-full p-2 flex">
          <div className="w-1/3 flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 mb-2"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
          <div className="w-2/3 pl-2 border-l-2 border-red-500">
            <div className="h-3 w-3/4 bg-gray-800 mb-1"></div>
            <div className="h-2 w-1/2 bg-red-500 mb-3"></div>
            <div className="h-2 w-full bg-gray-200 mb-1"></div>
            <div className="h-2 w-full bg-gray-200 mb-1"></div>
            <div className="h-2 w-full bg-gray-200 mb-1"></div>
            <div className="flex mt-2">
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-1"></div>
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-1"></div>
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-1"></div>
            </div>
          </div>
        </div>
      )
    case TemplateType.MODERN:
      return (
        <div className="w-full h-full p-2 flex">
          <div className="w-1/4 flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200"></div>
          </div>
          <div className="w-1/2 px-2 border-l-2 border-r-2 border-blue-500">
            <div className="h-3 w-3/4 bg-gray-800 mb-1"></div>
            <div className="h-2 w-1/2 bg-blue-500 mb-2"></div>
            <div className="h-2 w-full bg-gray-200 mb-1"></div>
            <div className="h-2 w-full bg-gray-200 mb-1"></div>
            <div className="flex mt-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
            </div>
          </div>
          <div className="w-1/4 flex items-center justify-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-blue-500"></div>
          </div>
        </div>
      )
    case TemplateType.MINIMAL:
      return (
        <div className="w-full h-full p-2 flex">
          <div className="w-1/4 flex items-center justify-center">
            <div className="w-10 h-10 bg-gray-200"></div>
          </div>
          <div className="w-3/4">
            <div className="h-3 w-1/2 bg-gray-800 mb-1"></div>
            <div className="h-2 w-1/3 bg-gray-500 mb-2"></div>
            <div className="flex mt-2">
              <div className="h-2 w-1/4 bg-gray-200 mr-1"></div>
              <div className="h-2 w-1/4 bg-gray-200 mr-1"></div>
              <div className="h-2 w-1/4 bg-gray-200"></div>
            </div>
            <div className="flex mt-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
            </div>
          </div>
        </div>
      )
    case TemplateType.CORPORATE:
      return (
        <div className="w-full h-full p-2 flex flex-col border border-indigo-500">
          <div className="w-full h-8 bg-indigo-500 flex items-center justify-center mb-2">
            <div className="w-16 h-4 bg-white"></div>
          </div>
          <div className="flex flex-1">
            <div className="w-1/3 flex items-center justify-center">
              <div className="w-10 h-10 bg-gray-200"></div>
            </div>
            <div className="w-2/3">
              <div className="h-3 w-3/4 bg-gray-800 mb-1"></div>
              <div className="h-2 w-1/4 bg-indigo-500 mb-1"></div>
              <div className="h-2 w-full bg-gray-200 mb-1"></div>
              <div className="h-2 w-full bg-gray-200 mb-1"></div>
              <div className="flex mt-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
              </div>
            </div>
          </div>
        </div>
      )
    default:
      return <div className="text-center text-sm text-muted-foreground">Vista previa no disponible</div>
  }
}
