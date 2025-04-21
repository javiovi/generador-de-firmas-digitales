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
  Twitter,
  Copy,
  Download,
  Check,
  Save,
  List,
  Plus,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react"
import SignaturePreview from "@/components/signature-preview"
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

export default function SignatureGenerator() {
  const [signatureData, setSignatureData] = useState<SignatureData>(getDefaultSignatureData(TemplateType.CLASSIC))
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")
  const htmlCodeRef = useRef<HTMLTextAreaElement>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [signatureName, setSignatureName] = useState("")
  const [signatureTitle, setSignatureTitle] = useState("")
  const [currentSignatureId, setCurrentSignatureId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(TemplateType.CLASSIC)

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

  // Generar el código HTML para la firma según la plantilla seleccionada
  const generateHtmlCode = () => {
    const template = getTemplateById(signatureData.templateId)

    // Filtrar redes sociales habilitadas
    const enabledSocialNetworks = Object.entries(signatureData.socialLinks)
      .filter(([_, data]) => data.enabled)
      .map(([network, data]) => ({ network, url: data.url }))

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
                    let iconUrl = ""
                    switch (network) {
                      case "facebook":
                        iconUrl = "https://cdn-icons-png.flaticon.com/512/733/733547.png"
                        break
                      case "instagram":
                        iconUrl = "https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                        break
                      case "youtube":
                        iconUrl = "https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
                        break
                      case "linkedin":
                        iconUrl = "https://cdn-icons-png.flaticon.com/512/3536/3536505.png"
                        break
                      case "twitter":
                        iconUrl = "https://cdn-icons-png.flaticon.com/512/733/733579.png"
                        break
                    }
                    return `
                    <td style="padding-right: 10px;">
                      <a href="${url}" target="_blank" style="text-decoration: none;">
                        <img src="${iconUrl}" width="24" height="24" alt="${network}" style="border: none; display: block; outline: none;">
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
  <title>Email Signature</title>
</head>
<body>
  <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
    <tr>
      <td style="padding-right: 15px; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 10px 0; text-align: center;">
              <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="150" style="width: 150px; max-width: 150px; display: block;">
            </td>
          </tr>
          <tr>
            <td style="padding: 0; text-align: center;">
              <img src="${signatureData.photoUrl}" alt="${signatureData.name}" width="150" height="150" style="width: 150px; height: 150px; max-width: 150px; border-radius: 75px; display: block;">
            </td>
          </tr>
        </table>
      </td>
      <td style="padding-left: 15px; border-left: 3px solid ${signatureData.primaryColor}; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 5px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #333; margin: 0;">${signatureData.name}</div>
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
              <div style="font-family: Arial, sans-serif; font-size: 12px; color: #333; margin: 0;">${signatureData.address}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/134/134937.png" width="16" height="16" alt="Phone" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: #333;">
                    <a href="tel:${signatureData.phone}" style="color: #333; text-decoration: none;">${signatureData.phone}</a>
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
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" width="16" height="16" alt="Email" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: #333;">
                    <a href="mailto:${signatureData.email}" style="color: #333; text-decoration: none;">${signatureData.email}</a>
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
                    <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="16" height="16" alt="Website" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor};">
                    <a href="https://${signatureData.website}" style="color: ${signatureData.primaryColor}; text-decoration: none;">${signatureData.website}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${socialHtml}
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
  <title>Email Signature</title>
</head>
<body>
  <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
    <tr>
      <td style="padding-right: 15px; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 10px 0;">
              <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="120" style="width: 120px; max-width: 120px; display: block;">
            </td>
          </tr>
        </table>
      </td>
      <td style="padding: 0 15px; border-left: 2px solid ${signatureData.primaryColor}; border-right: 2px solid ${signatureData.primaryColor}; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 5px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #333; margin: 0;">${signatureData.name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: ${signatureData.primaryColor}; margin: 0;">${signatureData.position}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 12px; color: #333; margin: 0;">${signatureData.address}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/134/134937.png" width="16" height="16" alt="Phone" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: #333;">
                    <a href="tel:${signatureData.phone}" style="color: #333; text-decoration: none;">${signatureData.phone}</a>
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
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" width="16" height="16" alt="Email" style="border  width="16" height="16" alt="Email" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: #333;">
                    <a href="mailto:${signatureData.email}" style="color: #333; text-decoration: none;">${signatureData.email}</a>
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
                    <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="16" height="16" alt="Website" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor};">
                    <a href="https://${signatureData.website}" style="color: ${signatureData.primaryColor}; text-decoration: none;">${signatureData.website}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${socialHtml}
        </table>
      </td>
      <td style="padding-left: 15px; vertical-align: top;">
        <img src="${signatureData.photoUrl}" alt="${signatureData.name}" width="120" height="120" style="width: 120px; height: 120px; max-width: 120px; border-radius: 60px; border: 2px solid ${signatureData.primaryColor}; display: block;">
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
  <title>Email Signature</title>
</head>
<body>
  <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
    <tr>
      <td style="padding-right: 15px; vertical-align: top;">
        <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="100" style="width: 100px; max-width: 100px; display: block;">
      </td>
      <td style="vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 5px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #333; margin: 0;">${signatureData.name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 10px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor}; margin: 0;">${signatureData.position}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: #333; padding-right: 10px;">
                    <a href="tel:${signatureData.phone}" style="color: #333; text-decoration: none;">${signatureData.phone}</a>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: #333; padding-right: 10px;">
                    <a href="mailto:${signatureData.email}" style="color: #333; text-decoration: none;">${signatureData.email}</a>
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor};">
                    <a href="https://${signatureData.website}" style="color: ${signatureData.primaryColor}; text-decoration: none;">${signatureData.website}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${
            enabledSocialNetworks.length > 0
              ? `
          <tr>
            <td style="padding: 5px 0 0 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  ${enabledSocialNetworks
                    .map(({ network, url }) => {
                      let iconUrl = ""
                      switch (network) {
                        case "facebook":
                          iconUrl = "https://cdn-icons-png.flaticon.com/512/733/733547.png"
                          break
                        case "instagram":
                          iconUrl = "https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                          break
                        case "youtube":
                          iconUrl = "https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
                          break
                        case "linkedin":
                          iconUrl = "https://cdn-icons-png.flaticon.com/512/3536/3536505.png"
                          break
                        case "twitter":
                          iconUrl = "https://cdn-icons-png.flaticon.com/512/733/733579.png"
                          break
                      }
                      return `
                      <td style="padding-right: 8px;">
                        <a href="${url}" target="_blank" style="text-decoration: none;">
                          <img src="${iconUrl}" width="18" height="18" alt="${network}" style="border: none; display: block; outline: none;">
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
  <title>Email Signature</title>
</head>
<body>
  <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0; ${template.showBorder ? `border: 1px solid ${signatureData.primaryColor};` : ""} width: 500px;">
    <tr>
      <td style="padding: 10px; text-align: center; background-color: ${signatureData.primaryColor}; color: white;" colspan="2">
        <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="180" style="width: 180px; max-width: 180px; display: inline-block;">
      </td>
    </tr>
    <tr>
      <td style="padding: 15px; vertical-align: top; width: 150px;">
        <img src="${signatureData.photoUrl}" alt="${signatureData.name}" width="150" height="150" style="width: 150px; height: 150px; max-width: 150px; display: block;">
      </td>
      <td style="padding: 15px; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0; width: 100%;">
          <tr>
            <td style="padding: 0 0 5px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #333; margin: 0;">${signatureData.name}</div>
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
              <div style="font-family: Arial, sans-serif; font-size: 12px; color: #333; margin: 0;">${signatureData.company}</div>
              <div style="font-family: Arial, sans-serif; font-size: 12px; color: #333; margin: 0;">${signatureData.address}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/134/134937.png" width="16" height="16" alt="Phone" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: #333;">
                    <a href="tel:${signatureData.phone}" style="color: #333; text-decoration: none;">${signatureData.phone}</a>
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
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" width="16" height="16" alt="Email" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: #333;">
                    <a href="mailto:${signatureData.email}" style="color: #333; text-decoration: none;">${signatureData.email}</a>
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
                    <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="16" height="16" alt="Website" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor};">
                    <a href="https://${signatureData.website}" style="color: ${signatureData.primaryColor}; text-decoration: none;">${signatureData.website}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${socialHtml}
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
  <title>Email Signature</title>
</head>
<body>
  <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
    <tr>
      <td style="padding-right: 15px; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 10px 0; text-align: center;">
              <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="150" style="width: 150px; max-width: 150px; display: block;">
            </td>
          </tr>
          <tr>
            <td style="padding: 0; text-align: center;">
              <img src="${signatureData.photoUrl}" alt="${signatureData.name}" width="150" height="150" style="width: 150px; height: 150px; max-width: 150px; border-radius: 75px; display: block;">
            </td>
          </tr>
        </table>
      </td>
      <td style="padding-left: 15px; border-left: 3px solid ${signatureData.primaryColor}; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 5px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #333; margin: 0;">${signatureData.name}</div>
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
              <div style="font-family: Arial, sans-serif; font-size: 12px; color: #333; margin: 0;">${signatureData.address}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 5px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="20" style="vertical-align: top; padding-right: 5px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/134/134937.png" width="16" height="16" alt="Phone" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: #333;">
                    <a href="tel:${signatureData.phone}" style="color: #333; text-decoration: none;">${signatureData.phone}</a>
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
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" width="16" height="16" alt="Email" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: #333;">
                    <a href="mailto:${signatureData.email}" style="color: #333; text-decoration: none;">${signatureData.email}</a>
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
                    <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="16" height="16" alt="Website" style="border: none; display: block; outline: none;">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor};">
                    <a href="https://${signatureData.website}" style="color: ${signatureData.primaryColor}; text-decoration: none;">${signatureData.website}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${socialHtml}
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="template">Plantilla</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="code">Código HTML</TabsTrigger>
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
                          <Twitter size={16} /> Twitter
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
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "logoUrl")}
                          disabled={isUploading}
                        />
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
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

          <TabsContent value="code">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Código HTML</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyHtmlToClipboard}
                      className="flex items-center gap-1"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadHtmlFile} className="flex items-center gap-1">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Vista Previa</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <SignaturePreview data={signatureData} />
            </CardContent>
          </Card>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Instrucciones</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Selecciona una plantilla que se ajuste a tus necesidades</li>
              <li>Personaliza tu firma con tus datos e imágenes</li>
              <li>Activa o desactiva las redes sociales que desees mostrar</li>
              <li>Ajusta los colores según tus preferencias</li>
              <li>Guarda tu firma para usarla más tarde</li>
              <li>Ve a la pestaña "Código HTML" para obtener el código</li>
              <li>Copia el código o descarga el archivo HTML</li>
              <li>
                Pega el código en la configuración de firma de tu cliente de correo (Gmail, Outlook, Thunderbird, etc.)
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
