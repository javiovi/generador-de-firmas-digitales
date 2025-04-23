"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Copy,
  Download,
  Check,
  Save,
  List,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Sun,
  Moon,
} from "lucide-react"
import ColorPicker from "@/components/color-picker"
import { useSignatures } from "@/hooks/use-signatures"
import { uploadFile } from "@/lib/upload-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import type { SignatureRecord } from "@/lib/supabase"
import { TemplateType, TEMPLATES, getTemplateById, getDefaultSignatureData } from "@/lib/templates"
import TemplateSelector from "@/components/template-selector"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

// Importar los nuevos componentes
import SignaturePreviewWrapper from "@/components/signature-preview-wrapper"
import ExportToImage from "@/components/export-to-image"
import EmailClientGuides from "@/components/email-client-guides"
import CollaborationFeatures from "@/components/collaboration-features"
// Importar el nuevo componente EmailClientPreview
// Añadir esta línea junto con las otras importaciones:

import EmailClientPreview from "@/components/email-client-preview"

export type SocialLink = {
  url: string
  enabled: boolean
}

export type SignatureData = {
  name: string
  position: string
  company: string
  address: string
  phone: string
  email: string
  website: string
  logoUrl: string
  photoUrl: string
  primaryColor: string
  socialLinks: {
    facebook: SocialLink
    instagram: SocialLink
    youtube: SocialLink
    linkedin: SocialLink
    twitter: SocialLink
  }
  templateId: TemplateType
  templateConfig: Record<string, any>
}

// Componente personalizado para el icono de X (anteriormente Twitter)
// Reemplazar la función XIcon actual con esta versión mejorada:

function XIcon({ size = 24, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 4l16 16" />
      <path d="M4 20L15 9l5 5L9 15z" />
    </svg>
  )
}

export default function SignatureGenerator() {
  const [signatureData, setSignatureData] = useState<SignatureData>(getDefaultSignatureData(TemplateType.CLASSIC))
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")
  const [exportTab, setExportTab] = useState("html")
  const htmlCodeRef = useRef<HTMLTextAreaElement>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [signatureName, setSignatureName] = useState("")
  const [signatureTitle, setSignatureTitle] = useState("")
  const [currentSignatureId, setCurrentSignatureId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(TemplateType.CLASSIC)
  const [isResponsive, setIsResponsive] = useState(true)
  const [inlineStyles, setInlineStyles] = useState(true)

  const {
    isLoading,
    error,
    signatures,
    loadSignatures,
    saveSignature,
    loadSignature,
    updateSignature,
    deleteSignature,
  } = useSignatures()

  useEffect(() => {
    loadSignatures()
  }, [loadSignatures])

  // Actualizar la plantilla seleccionada
  const handleTemplateChange = (templateId: TemplateType) => {
    setSelectedTemplate(templateId)

    // Mantener los datos actuales pero actualizar la configuración de la plantilla
    setSignatureData((prev) => ({
      ...prev,
      templateId: templateId,
      // Podemos añadir configuraciones específicas por plantilla aquí
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child, subChild] = name.split(".")

      if (subChild) {
        // Para campos anidados como socialLinks.facebook.url
        setSignatureData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof SignatureData],
            [child]: {
              ...prev[parent as keyof SignatureData][child],
              [subChild]: value,
            },
          },
        }))
      } else {
        // Para campos como socialLinks.facebook
        setSignatureData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof SignatureData],
            [child]: value,
          },
        }))
      }
    } else {
      setSignatureData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSocialToggle = (network: keyof SignatureData["socialLinks"]) => {
    setSignatureData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [network]: {
          ...prev.socialLinks[network],
          enabled: !prev.socialLinks[network].enabled,
        },
      },
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "photoUrl") => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsUploading(true)

        // Subir el archivo a Vercel Blob
        const url = await uploadFile(file, field === "logoUrl" ? "logos" : "photos")

        // Actualizar el estado con la URL del archivo
        setSignatureData((prev) => ({
          ...prev,
          [field]: url,
        }))

        toast({
          title: "Imagen subida correctamente",
          description: "La imagen se ha subido y guardado en el servidor.",
        })
      } catch (error) {
        console.error("Error uploading file:", error)
        toast({
          title: "Error al subir la imagen",
          description: "No se pudo subir la imagen. Inténtalo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleColorChange = (color: string) => {
    setSignatureData((prev) => ({
      ...prev,
      primaryColor: color,
    }))
  }

  const copyHtmlToClipboard = () => {
    if (htmlCodeRef.current) {
      htmlCodeRef.current.select()
      document.execCommand("copy")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "Código copiado",
        description: "El código HTML ha sido copiado al portapapeles.",
      })
    }
  }

  const downloadHtmlFile = () => {
    if (htmlCodeRef.current) {
      const htmlContent = htmlCodeRef.current.value
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "firma-email.html"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Archivo descargado",
        description: "El archivo HTML ha sido descargado.",
      })
    }
  }

  const handleSaveSignature = async () => {
    if (!signatureName) {
      toast({
        title: "Nombre requerido",
        description: "Por favor, ingresa un nombre para la firma.",
        variant: "destructive",
      })
      return
    }

    try {
      if (currentSignatureId) {
        // Actualizar firma existente
        await updateSignature(
          currentSignatureId,
          signatureName,
          signatureTitle,
          signatureData,
          signatureData.logoUrl,
          signatureData.photoUrl,
        )

        toast({
          title: "Firma actualizada",
          description: "La firma ha sido actualizada correctamente.",
        })
      } else {
        // Crear nueva firma
        const signature = await saveSignature(
          signatureName,
          signatureTitle,
          signatureData,
          signatureData.logoUrl,
          signatureData.photoUrl,
        )

        if (signature) {
          setCurrentSignatureId(signature.id)
        }

        toast({
          title: "Firma guardada",
          description: "La firma ha sido guardada correctamente.",
        })
      }

      setSaveDialogOpen(false)
      await loadSignatures()
    } catch (error) {
      console.error("Error saving signature:", error)
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la firma. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleLoadSignature = async (signature: SignatureRecord) => {
    try {
      // Cargar la firma seleccionada
      const loadedSignature = await loadSignature(signature.id)

      if (loadedSignature) {
        // Asegurarse de que la firma cargada tenga la estructura correcta para socialLinks
        const signatureData = loadedSignature.signature_data

        // Verificar y corregir la estructura de socialLinks si es necesario
        if (typeof signatureData.socialLinks === "object") {
          // Si socialLinks es un objeto pero no tiene la estructura correcta
          Object.keys(signatureData.socialLinks).forEach((network) => {
            if (typeof signatureData.socialLinks[network] !== "object") {
              signatureData.socialLinks[network] = {
                url: signatureData.socialLinks[network],
                enabled: true,
              }
            }
          })

          // Asegurarse de que todas las redes sociales estén presentes
          if (!signatureData.socialLinks.twitter) {
            signatureData.socialLinks.twitter = { url: "https://twitter.com", enabled: false }
          }
        }

        // Si no tiene templateId, asignar la plantilla clásica por defecto
        if (!signatureData.templateId) {
          signatureData.templateId = TemplateType.CLASSIC
        }

        // Si no tiene templateConfig, inicializarlo como objeto vacío
        if (!signatureData.templateConfig) {
          signatureData.templateConfig = {}
        }

        setSignatureData(signatureData)
        setSelectedTemplate(signatureData.templateId)
        setSignatureName(loadedSignature.name)
        setSignatureTitle(loadedSignature.title || "")
        setCurrentSignatureId(loadedSignature.id)

        toast({
          title: "Firma cargada",
          description: "La firma ha sido cargada correctamente.",
        })
      }

      setLoadDialogOpen(false)
    } catch (error) {
      console.error("Error loading signature:", error)
      toast({
        title: "Error al cargar",
        description: "No se pudo cargar la firma. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSignature = async (id: string) => {
    try {
      await deleteSignature(id)

      if (currentSignatureId === id) {
        // Si la firma actual es la que se eliminó, resetear el estado
        setSignatureData(getDefaultSignatureData(TemplateType.CLASSIC))
        setSignatureName("")
        setSignatureTitle("")
        setCurrentSignatureId(null)
      }

      await loadSignatures()

      toast({
        title: "Firma eliminada",
        description: "La firma ha sido eliminada correctamente.",
      })
    } catch (error) {
      console.error("Error deleting signature:", error)
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la firma. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleNewSignature = () => {
    setSignatureData(getDefaultSignatureData(TemplateType.CLASSIC))
    setSelectedTemplate(TemplateType.CLASSIC)
    setSignatureName("")
    setSignatureTitle("")
    setCurrentSignatureId(null)

    toast({
      title: "Nueva firma",
      description: "Se ha creado una nueva firma en blanco.",
    })
  }

  // Ahora, vamos a modificar la función generateHtmlCode para corregir los problemas mencionados
  // Buscar la función generateHtmlCode y reemplazar el código HTML de la plantilla clásica:

  // Añadir esta función para calcular la rotación de tono para los iconos
  // Añadir esta función justo antes de la función generateHtmlCode:

  const getHueRotation = (hexColor: string): number => {
    // Convertir hex a RGB
    const r = Number.parseInt(hexColor.slice(1, 3), 16) / 255
    const g = Number.parseInt(hexColor.slice(3, 5), 16) / 255
    const b = Number.parseInt(hexColor.slice(5, 7), 16) / 255

    // Calcular HSL
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0

    if (max === min) {
      h = 0 // achromatic
    } else {
      const d = max - min
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h *= 60
    }

    // Devolver la rotación necesaria para llegar al tono deseado
    // Asumiendo que los iconos originales son azules (240 grados)
    return h - 240
  }

  // Generar el código HTML para la firma según la plantilla seleccionada
  const generateHtmlCode = (darkMode = false, inlineStyles = true) => {
    const template = getTemplateById(signatureData.templateId)

    // Colores adaptados al modo oscuro
    const textColor = darkMode ? "#e5e7eb" : "#333333"
    const mutedTextColor = darkMode ? "#9ca3af" : "#666666"
    const bgColor = darkMode ? "#1f2937" : "#ffffff"
    const borderColor = darkMode ? "#374151" : "#e5e7eb"

    // Filtrar redes sociales habilitadas
    const enabledSocialNetworks = Object.entries(signatureData.socialLinks)
      .filter(([_, data]) => data.enabled)
      .map(([network, data]) => ({ network, url: data.url }))

    // Estilos responsivos para el encabezado
    const responsiveStyles = isResponsive
      ? `
        @media screen and (max-width: 600px) {
          table.signature-table {
            width: 100% !important;
          }
          td.signature-photo, td.signature-logo {
            display: block !important;
            width: 100% !important;
            text-align: center !important;
          }
          td.signature-content {
            display: block !important;
            width: 100% !important;
            padding-left: 0 !important;
            padding-top: 15px !important;
            border-left: none !important;
            border-top: 3px solid ${signatureData.primaryColor} !important;
          }
          img.signature-profile-image {
            margin: 0 auto !important;
          }
          .signature-social-icons {
            text-align: center !important;
          }
        }
      `
      : ""

    // Generar HTML según la plantilla
    let socialHtml = ""
    if (enabledSocialNetworks.length > 0) {
      socialHtml = `
    <tr>
      <td style="padding: 10px 0 0 0;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            ${enabledSocialNetworks
              .map(({ network, url }) => {
                // Usar SVG para todos los iconos sociales
                let svgIcon = ""
                switch (network) {
                  case "facebook":
                    svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`
                    break
                  case "instagram":
                    svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`
                    break
                  case "youtube":
                    svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`
                    break
                  case "linkedin":
                    svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`
                    break
                  case "twitter":
                    // Icono de X mejorado
                    svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16" /><path d="M4 20L15 9l5 5L9 15z" /></svg>`
                    break
                }
                return `
                <td style="padding-right: 10px;">
                  <a href="${url}" target="_blank" style="text-decoration: none;">
                    <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: ${signatureData.primaryColor};">
                      ${svgIcon}
                    </div>
                  </a>
                </td>
              `
              })
              .join("")}
          </tr>
        </table>
      </td>
    </tr>
  `
    }

    // Generar HTML según la posición de las imágenes
    let htmlContent = ""

    switch (template.id) {
      case TemplateType.CLASSIC:
        htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Signature</title>
  <style>
    ${responsiveStyles}
  </style>
</head>
<body>
  <table cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0; width: 550px;">
    <tr>
      <td class="signature-logo" style="padding-right: 15px; vertical-align: top; width: 150px;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 10px 0; text-align: center;">
              <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="150" style="width: 150px; max-width: 150px; display: block;">
            </td>
          </tr>
          <tr>
            <td style="padding: 0; text-align: center;">
              <img src="${signatureData.photoUrl}" alt="${signatureData.name}" width="140" height="140" class="signature-profile-image" style="width: 140px; height: 140px; max-width: 140px; border-radius: 70px; border: 4px solid ${signatureData.primaryColor}; display: block;">
            </td>
          </tr>
        </table>
      </td>
      <td class="signature-content" style="padding-left: 15px; border-left: 3px solid ${signatureData.primaryColor}; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0; width: 100%;">
          <tr>
            <td style="padding: 0 0 5px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: ${textColor}; margin: 0;">${signatureData.name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 15px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: ${signatureData.primaryColor}; margin: 0;">${signatureData.position}</div>
              <div style="border-bottom: 2px solid ${signatureData.primaryColor}; margin-top: 5px;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor}; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${signatureData.address}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor};">
                    <a href="tel:${signatureData.phone}" style="color: ${textColor}; text-decoration: none;">${signatureData.phone}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor};">
                    <a href="mailto:${signatureData.email}" style="color: ${textColor}; text-decoration: none;">${signatureData.email}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor};">
                    <a href="https://${signatureData.website}" style="color: ${signatureData.primaryColor}; text-decoration: none;">${signatureData.website}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="signature-social-icons">
              ${socialHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
        break

      case TemplateType.MODERN:
        htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Signature</title>
  <style>
    ${responsiveStyles}
  </style>
</head>
<body>
  <table cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
    <tr>
      <td class="signature-logo" style="padding-right: 15px; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 10px 0;">
              <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="120" style="width: 120px; max-width: 120px; display: block;">
            </td>
          </tr>
        </table>
      </td>
      <td class="signature-content" style="padding: 0 15px; border-left: 2px solid ${signatureData.primaryColor}; border-right: 2px solid ${signatureData.primaryColor}; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 5px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: ${textColor}; margin: 0;">${signatureData.name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: ${signatureData.primaryColor}; margin: 0;">${signatureData.position}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor}; margin: 0;">
                    ${signatureData.address}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor};">
                    <a href="tel:${signatureData.phone}" style="color: ${textColor}; text-decoration: none;">${signatureData.phone}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor};">
                    <a href="mailto:${signatureData.email}" style="color: ${textColor}; text-decoration: none;">${signatureData.email}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor};">
                    <a href="https://${signatureData.website}" style="color: ${signatureData.primaryColor}; text-decoration: none;">${signatureData.website}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="signature-social-icons">
              ${socialHtml}
            </td>
          </tr>
        </table>
      </td>
      <td class="signature-photo" style="padding-left: 15px; vertical-align: top;">
        <img src="${signatureData.photoUrl}" alt="${signatureData.name}" width="120" height="120" class="signature-profile-image" style="width: 120px; height: 120px; max-width: 120px; border-radius: 60px; border: 2px solid ${signatureData.primaryColor}; display: block;">
      </td>
    </tr>
  </table>
</body>
</html>`
        break

      case TemplateType.MINIMAL:
        htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Signature</title>
  <style>
    ${responsiveStyles}
    @media screen and (max-width: 600px) {
      .minimal-contact {
        display: block !important;
        margin-bottom: 5px !important;
      }
    }
  </style>
</head>
<body>
  <table cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
    <tr>
      <td class="signature-logo" style="padding-right: 15px; vertical-align: top;">
        <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="100" style="width: 100px; max-width: 100px; display: block;">
      </td>
      <td class="signature-content" style="vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 5px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: ${textColor}; margin: 0;">${signatureData.name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor}; margin: 0;">${signatureData.position}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor}; margin: 0;">
                <span class="minimal-contact" style="display: inline-block; margin-right: 10px;">
                  <a href="tel:${signatureData.phone}" style="color: ${textColor}; text-decoration: none;">${signatureData.phone}</a>
                </span>
                <span class="minimal-contact" style="display: inline-block; margin-right: 10px;">
                  <a href="mailto:${signatureData.email}" style="color: ${textColor}; text-decoration: none;">${signatureData.email}</a>
                </span>
                <span class="minimal-contact" style="display: inline-block;">
                  <a href="https://${signatureData.website}" style="color: ${signatureData.primaryColor}; text-decoration: none;">${signatureData.website}</a>
                </span>
              </div>
            </td>
          </tr>
          ${
            enabledSocialNetworks.length > 0
              ? `
          <tr>
            <td class="signature-social-icons" style="padding: 5px 0 0 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  ${enabledSocialNetworks
                    .map(({ network, url }) => {
                      // Usar SVG para todos los iconos sociales
                      let svgIcon = ""
                      switch (network) {
                        case "facebook":
                          svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`
                          break
                        case "instagram":
                          svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`
                          break
                        case "youtube":
                          svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`
                          break
                        case "linkedin":
                          svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`
                          break
                        case "twitter":
                          svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16" /><path d="M4 20L15 9l5 5L9 15z" /></svg>`
                          break
                      }
                      return `
                      <td style="padding-right: 8px;">
                        <a href="${url}" target="_blank" style="text-decoration: none;">
                          <div style="width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
                            ${svgIcon}
                          </div>
                        </a>
                      </td>
                    `
                    })
                    .join("")}
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
        break

      case TemplateType.CORPORATE:
        htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Signature</title>
  <style>
    ${responsiveStyles}
    @media screen and (max-width: 600px) {
      .corporate-header {
        display: block !important;
        width: 100% !important;
      }
      .corporate-content {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <table cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0; ${template.showBorder ? `border: 1px solid ${signatureData.primaryColor};` : ""} width: 500px;">
    <tr>
      <td class="corporate-header" style="padding: 10px; text-align: center; background-color: ${signatureData.primaryColor}; color: white;" colspan="2">
        <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="180" style="width: 180px; max-width: 180px; display: inline-block;">
      </td>
    </tr>
    <tr>
      <td class="signature-photo corporate-content" style="padding: 15px; vertical-align: top; width: 150px;">
        <img src="${signatureData.photoUrl}" alt="${signatureData.name}" width="150" height="150" class="signature-profile-image" style="width: 150px; height: 150px; max-width: 150px; display: block;">
      </td>
      <td class="signature-content corporate-content" style="padding: 15px; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0; width: 100%;">
          <tr>
            <td style="padding: 0 0 5px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: ${textColor}; margin: 0;">${signatureData.name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 15px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: ${signatureData.primaryColor}; margin: 0;">${signatureData.position}</div>
              <div style="border-bottom: 2px solid ${signatureData.primaryColor}; margin-top: 5px; width: 50px;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor}; margin: 0;">${signatureData.company}</div>
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor}; margin: 0;">
                    ${signatureData.address}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor};">
                    <a href="tel:${signatureData.phone}" style="color: ${textColor}; text-decoration: none;">${signatureData.phone}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor};">
                    <a href="mailto:${signatureData.email}" style="color: ${textColor}; text-decoration: none;">${signatureData.email}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor};">
                    <a href="https://${signatureData.website}" style="color: ${signatureData.primaryColor}; text-decoration: none;">${signatureData.website}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="signature-social-icons">
              ${socialHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
        break

      default:
        htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Signature</title>
  <style>
    ${responsiveStyles}
  </style>
</head>
<body>
  <table cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
    <tr>
      <td class="signature-logo" style="padding-right: 15px; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 10px 0; text-align: center;">
              <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="150" style="width: 150px; max-width: 150px; display: block;">
            </td>
          </tr>
          <tr>
            <td style="padding: 0; text-align: center;">
              <img src="${signatureData.photoUrl}" alt="${signatureData.name}" width="150" height="150" class="signature-profile-image" style="width: 150px; height: 150px; max-width: 150px; border-radius: 75px; display: block;">
            </td>
          </tr>
        </table>
      </td>
      <td class="signature-content" style="padding-left: 15px; border-left: 3px solid ${signatureData.primaryColor}; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 5px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: ${textColor}; margin: 0;">${signatureData.name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 15px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: ${signatureData.primaryColor}; margin: 0;">${signatureData.position}</div>
              <div style="border-bottom: 2px solid ${signatureData.primaryColor}; margin-top: 5px;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor}; margin: 0;">${signatureData.address}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor};">
                    <a href="tel:${signatureData.phone}" style="color: ${textColor}; text-decoration: none;">${signatureData.phone}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor};">
                    <a href="mailto:${signatureData.email}" style="color: ${textColor}; text-decoration: none;">${signatureData.email}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor};">
                    <a href="https://${signatureData.website}" style="color: ${signatureData.primaryColor}; text-decoration: none;">${signatureData.website}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="signature-social-icons">
              ${socialHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    }

    return htmlContent
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {currentSignatureId ? `Editando: ${signatureName}` : "Nueva Firma"}
            </h2>
            {currentSignatureId && <span className="text-sm text-muted-foreground">{signatureTitle}</span>}
          </div>
          <div className="flex gap-2">
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Save size={16} />
                  Guardar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Guardar Firma</DialogTitle>
                  <DialogDescription>Ingresa un nombre y título opcional para tu firma.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="signatureName">Nombre de la Firma *</Label>
                    <Input
                      id="signatureName"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="Ej: Firma Corporativa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signatureTitle">Título/Descripción (opcional)</Label>
                    <Input
                      id="signatureTitle"
                      value={signatureTitle}
                      onChange={(e) => setSignatureTitle(e.target.value)}
                      placeholder="Ej: Para uso en comunicaciones oficiales"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveSignature}>{currentSignatureId ? "Actualizar" : "Guardar"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <List size={16} />
                  Cargar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Cargar Firma</DialogTitle>
                  <DialogDescription>Selecciona una firma guardada para cargarla.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : signatures.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No hay firmas guardadas.</div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {signatures.map((signature) => (
                        <div
                          key={signature.id}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleLoadSignature(signature)}
                        >
                          <div>
                            <h4 className="font-medium">{signature.name}</h4>
                            {signature.title && <p className="text-sm text-muted-foreground">{signature.title}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLoadSignature(signature)
                              }}
                            >
                              <Edit size={16} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                  <Trash2 size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente la firma.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteSignature(signature.id)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>
                    Cerrar
                  </Button>
                  <Button onClick={handleNewSignature} className="flex items-center gap-1">
                    <Plus size={16} />
                    Nueva Firma
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="template">Plantilla</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="code">Exportar</TabsTrigger>
            <TabsTrigger value="collaboration">Colaboración</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Selecciona una Plantilla</h2>
                <TemplateSelector
                  templates={TEMPLATES}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleTemplateChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Información Personal</h2>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input id="name" name="name" value={signatureData.name} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Cargo</Label>
                      <Input
                        id="position"
                        name="position"
                        value={signatureData.position}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input id="company" name="company" value={signatureData.company} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input id="address" name="address" value={signatureData.address} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Contacto</h2>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" name="phone" value={signatureData.phone} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" value={signatureData.email} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio Web</Label>
                      <Input id="website" name="website" value={signatureData.website} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Redes Sociales</h2>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="facebook-enabled"
                          checked={signatureData.socialLinks.facebook.enabled}
                          onCheckedChange={() => handleSocialToggle("facebook")}
                        />
                        <Label htmlFor="facebook-enabled" className="flex items-center gap-2">
                          <Facebook size={16} /> Facebook
                        </Label>
                      </div>
                      {signatureData.socialLinks.facebook.enabled && (
                        <Input
                          id="facebook"
                          name="socialLinks.facebook.url"
                          value={signatureData.socialLinks.facebook.url}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="instagram-enabled"
                          checked={signatureData.socialLinks.instagram.enabled}
                          onCheckedChange={() => handleSocialToggle("instagram")}
                        />
                        <Label htmlFor="instagram-enabled" className="flex items-center gap-2">
                          <Instagram size={16} /> Instagram
                        </Label>
                      </div>
                      {signatureData.socialLinks.instagram.enabled && (
                        <Input
                          id="instagram"
                          name="socialLinks.instagram.url"
                          value={signatureData.socialLinks.instagram.url}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="youtube-enabled"
                          checked={signatureData.socialLinks.youtube.enabled}
                          onCheckedChange={() => handleSocialToggle("youtube")}
                        />
                        <Label htmlFor="youtube-enabled" className="flex items-center gap-2">
                          <Youtube size={16} /> YouTube
                        </Label>
                      </div>
                      {signatureData.socialLinks.youtube.enabled && (
                        <Input
                          id="youtube"
                          name="socialLinks.youtube.url"
                          value={signatureData.socialLinks.youtube.url}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="linkedin-enabled"
                          checked={signatureData.socialLinks.linkedin.enabled}
                          onCheckedChange={() => handleSocialToggle("linkedin")}
                        />
                        <Label htmlFor="linkedin-enabled" className="flex items-center gap-2">
                          <Linkedin size={16} /> LinkedIn
                        </Label>
                      </div>
                      {signatureData.socialLinks.linkedin.enabled && (
                        <Input
                          id="linkedin"
                          name="socialLinks.linkedin.url"
                          value={signatureData.socialLinks.linkedin.url}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="twitter-enabled"
                          checked={signatureData.socialLinks.twitter.enabled}
                          onCheckedChange={() => handleSocialToggle("twitter")}
                        />
                        <Label htmlFor="twitter-enabled" className="flex items-center gap-2">
                          <XIcon size={16} /> X (Twitter)
                        </Label>
                      </div>
                      {signatureData.socialLinks.twitter.enabled && (
                        <Input
                          id="twitter"
                          name="socialLinks.twitter.url"
                          value={signatureData.socialLinks.twitter.url}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Personalización</h2>

                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Color Principal</Label>
                      <ColorPicker color={signatureData.primaryColor} onChange={handleColorChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logoUpload">Logo de la Empresa</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="logoUpload"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          onChange={(e) => handleFileUpload(e, "logoUrl")}
                          disabled={isUploading}
                        />
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                      <p className="text-xs text-muted-foreground">Formatos aceptados: PNG, JPG, SVG</p>
                      {signatureData.logoUrl && signatureData.logoUrl.startsWith("http") && (
                        <div className="mt-2">
                          <img
                            src={signatureData.logoUrl || "/placeholder.svg"}
                            alt="Logo Preview"
                            className="h-16 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photoUpload">Foto de Perfil</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="photoUpload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "photoUrl")}
                          disabled={isUploading}
                        />
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                      {signatureData.photoUrl && signatureData.photoUrl.startsWith("http") && (
                        <div className="mt-2">
                          <img
                            src={signatureData.photoUrl || "/placeholder.svg"}
                            alt="Photo Preview"
                            className="h-16 w-16 object-cover rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Tabs value={exportTab} onValueChange={setExportTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="html">Código HTML</TabsTrigger>
                    <TabsTrigger value="image">Imagen</TabsTrigger>
                    <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                    <TabsTrigger value="guides">Guías</TabsTrigger>
                  </TabsList>

                  <TabsContent value="html" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Código HTML</h2>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center space-x-2 mr-2">
                          <Switch id="responsive-mode" checked={isResponsive} onCheckedChange={setIsResponsive} />
                          <Label htmlFor="responsive-mode">Responsivo</Label>
                        </div>
                        <div className="flex items-center space-x-2 mr-2">
                          <Switch
                            id="inline-styles"
                            checked={inlineStyles}
                            onCheckedChange={(checked) => {
                              setInlineStyles(checked)
                              if (htmlCodeRef.current) {
                                htmlCodeRef.current.value = generateHtmlCode(false, checked)
                              }
                            }}
                          />
                          <Label htmlFor="inline-styles">Estilos Inline</Label>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (htmlCodeRef.current) {
                              htmlCodeRef.current.value = generateHtmlCode(false, inlineStyles)
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          <Sun size={16} />
                          Modo Claro
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (htmlCodeRef.current) {
                              htmlCodeRef.current.value = generateHtmlCode(true, inlineStyles)
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          <Moon size={16} />
                          Modo Oscuro
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyHtmlToClipboard}
                          className="flex items-center gap-1"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          {copied ? "Copiado" : "Copiar"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadHtmlFile}
                          className="flex items-center gap-1"
                        >
                          <Download size={16} />
                          Descargar
                        </Button>
                      </div>
                    </div>
                    <textarea
                      ref={htmlCodeRef}
                      className="w-full h-[400px] p-4 font-mono text-sm border rounded-md"
                      readOnly
                      value={generateHtmlCode()}
                    />
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Exportar como Imagen</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Exporta tu firma como imagen para usarla en clientes de correo que no soportan HTML o para
                      compartirla en redes sociales.
                    </p>
                    <ExportToImage signatureData={signatureData} />
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    <EmailClientPreview signatureData={signatureData} htmlCode={generateHtmlCode()} />
                  </TabsContent>

                  <TabsContent value="guides" className="space-y-4">
                    <EmailClientGuides htmlCode={generateHtmlCode()} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <CollaborationFeatures
              signatureData={signatureData}
              signatureId={currentSignatureId || undefined}
              signatureName={signatureName || "Firma sin nombre"}
              htmlCode={generateHtmlCode()}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Vista Previa</h2>
          <SignaturePreviewWrapper data={signatureData} />

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Instrucciones</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Selecciona una plantilla que se ajuste a tus necesidades</li>
              <li>Personaliza tu firma con tus datos e imágenes</li>
              <li>Activa o desactiva las redes sociales que desees mostrar</li>
              <li>Ajusta los colores según tus preferencias</li>
              <li>Guarda tu firma para usarla más tarde</li>
              <li>Ve a la pestaña "Exportar" para obtener el código HTML o imagen</li>
              <li>Sigue las guías para añadir tu firma a tu cliente de correo favorito</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
