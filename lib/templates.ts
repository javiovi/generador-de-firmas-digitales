import type { SignatureData } from "@/components/signature-generator"

// Tipos de plantillas disponibles
export enum TemplateType {
  CLASSIC = "classic",
  MODERN = "modern",
  MINIMAL = "minimal",
  CORPORATE = "corporate",
}

// Posiciones para las imágenes
export enum ImagePosition {
  LEFT = "left",
  RIGHT = "right",
  TOP = "top",
  BOTTOM = "bottom",
}

// Interfaz para la configuración de plantillas
export interface TemplateConfig {
  id: TemplateType
  name: string
  description: string
  logoPosition: ImagePosition
  photoPosition: ImagePosition
  showCompanyName: boolean
  showDivider: boolean
  showBorder: boolean
  roundedPhoto: boolean
  compactSocial: boolean
}

// Definición de plantillas predefinidas
export const TEMPLATES: TemplateConfig[] = [
  {
    id: TemplateType.CLASSIC,
    name: "Clásica",
    description: "Diseño tradicional con logo y foto a la izquierda",
    logoPosition: ImagePosition.LEFT,
    photoPosition: ImagePosition.LEFT,
    showCompanyName: true,
    showDivider: true,
    showBorder: false,
    roundedPhoto: true,
    compactSocial: false,
  },
  {
    id: TemplateType.MODERN,
    name: "Moderna",
    description: "Diseño contemporáneo con foto a la derecha",
    logoPosition: ImagePosition.LEFT,
    photoPosition: ImagePosition.RIGHT,
    showCompanyName: true,
    showDivider: true,
    showBorder: false,
    roundedPhoto: true,
    compactSocial: true,
  },
  {
    id: TemplateType.MINIMAL,
    name: "Minimalista",
    description: "Diseño limpio y sencillo sin foto",
    logoPosition: ImagePosition.LEFT,
    photoPosition: ImagePosition.LEFT,
    showCompanyName: false,
    showDivider: false,
    showBorder: false,
    roundedPhoto: false,
    compactSocial: true,
  },
  {
    id: TemplateType.CORPORATE,
    name: "Corporativa",
    description: "Diseño profesional con logo en la parte superior",
    logoPosition: ImagePosition.TOP,
    photoPosition: ImagePosition.LEFT,
    showCompanyName: true,
    showDivider: true,
    showBorder: true,
    roundedPhoto: false,
    compactSocial: false,
  },
]

// Función para obtener una plantilla por ID
export function getTemplateById(id: TemplateType): TemplateConfig {
  return TEMPLATES.find((template) => template.id === id) || TEMPLATES[0]
}

// Función para generar datos de firma por defecto según la plantilla
export function getDefaultSignatureData(templateId: TemplateType): SignatureData {
  const baseData = {
    name: "Victoria Viliguer",
    position: "GERENTE CANAL MAYORISTA",
    company: "ACCESANIGA",
    address: "Paraguay 1334 (2000) Rosario, Santa Fe, Argentina",
    phone: "(341) 153 549188",
    email: "vviliguer@accesaniga.com.ar",
    website: "accesaniga.com.ar",
    logoUrl: "/placeholder.svg?height=150&width=150",
    photoUrl: "/placeholder.svg?height=200&width=200",
    primaryColor: "#d32f2f",
    socialLinks: {
      facebook: { url: "https://facebook.com", enabled: true },
      instagram: { url: "https://instagram.com", enabled: true },
      youtube: { url: "https://youtube.com", enabled: true },
      linkedin: { url: "https://linkedin.com", enabled: true },
      twitter: { url: "https://twitter.com", enabled: false },
    },
    templateId: templateId,
    templateConfig: {},
  }

  // Personalización específica por plantilla
  switch (templateId) {
    case TemplateType.MODERN:
      return {
        ...baseData,
        primaryColor: "#0288d1",
        templateConfig: {
          customSpacing: "compact",
        },
      }
    case TemplateType.MINIMAL:
      return {
        ...baseData,
        primaryColor: "#616161",
        templateConfig: {
          showPhoto: false,
        },
      }
    case TemplateType.CORPORATE:
      return {
        ...baseData,
        primaryColor: "#303f9f",
        templateConfig: {
          showBorder: true,
        },
      }
    default:
      return baseData
  }
}
