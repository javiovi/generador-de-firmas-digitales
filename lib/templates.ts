import type { SignatureData } from "@/components/signature-generator"

export enum TemplateType {
  CLASSIC = "classic",
  MODERN = "modern",
  MINIMAL = "minimal",
  CORPORATE = "corporate",
}

export interface TemplateConfig {
  id: TemplateType
  name: string
  description: string
  showBorder?: boolean
  imageUrl?: string
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: TemplateType.CLASSIC,
    name: "Clásica",
    description: "Diseño tradicional con foto y logo",
  },
  {
    id: TemplateType.MODERN,
    name: "Moderna",
    description: "Diseño contemporáneo con bordes laterales",
  },
  {
    id: TemplateType.MINIMAL,
    name: "Minimalista",
    description: "Diseño simple y limpio",
  },
  {
    id: TemplateType.CORPORATE,
    name: "Corporativa",
    description: "Diseño formal para empresas",
    showBorder: true,
  },
]

export function getTemplateById(id: TemplateType): TemplateConfig {
  return TEMPLATES.find((template) => template.id === id) || TEMPLATES[0]
}

export function getDefaultSignatureData(templateId: TemplateType): SignatureData {
  return {
    name: "Juan Pérez",
    position: "Director de Marketing",
    company: "Empresa Innovadora S.A.",
    address: "Av. Principal 123, Ciudad Empresarial",
    phone: "+34 612 345 678",
    email: "juan.perez@empresa.com",
    website: "www.empresa-innovadora.com",
    logoUrl: "https://placehold.co/200x100/4F46E5/FFFFFF?text=LOGO",
    photoUrl: "https://placehold.co/300x300/4F46E5/FFFFFF?text=FOTO",
    primaryColor: "#4F46E5",
    socialLinks: {
      facebook: {
        url: "https://facebook.com/empresa",
        enabled: true,
      },
      instagram: {
        url: "https://instagram.com/empresa",
        enabled: true,
      },
      youtube: {
        url: "https://youtube.com/empresa",
        enabled: false,
      },
      linkedin: {
        url: "https://linkedin.com/in/juanperez",
        enabled: true,
      },
      twitter: {
        url: "https://x.com/empresa",
        enabled: false,
      },
    },
    templateId: templateId,
    templateConfig: {},
  }
}
