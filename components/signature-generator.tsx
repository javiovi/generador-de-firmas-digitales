"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Palette,
  ImageIcon,
  LinkIcon,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
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
import { useLanguage } from "@/lib/i18n/language-context"

// Importar los componentes
import SignaturePreviewWrapper from "@/components/signature-preview-wrapper"
import ExportToImage from "@/components/export-to-image"
import EmailClientGuides from "@/components/email-client-guides"
import CollaborationFeatures from "@/components/collaboration-features"
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
  logoSize: number // en px
  photoSize: number // en px
}

// Componente personalizado para el icono de X (anteriormente Twitter)
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
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

// Helper para obtener la URL del icono, usando SVG en vista previa y PNG en exportación
function icon(name: string, mode: 'preview' | 'export' = 'export') {
  if (mode === 'preview') {
    return `/icons/${name}.svg`;
  }
  return `/icons/${name}.png`;
}

// Nueva función asíncrona para exportar HTML con iconos PNG
async function generateHtmlCodeWithPngIcons(
  signatureData: SignatureData,
  isResponsive: boolean,
  darkMode = false, // Siempre será false en la exportación
  inlineStyles = true,
  exportOnlyTable = true
) {
  let html = generateHtmlCode(signatureData, isResponsive, false, inlineStyles, exportOnlyTable)

  // Generar HTML para los iconos sociales
  let socialHtml = ''
  for (const [network, data] of Object.entries(signatureData.socialLinks)) {
    if (data.enabled) {
      socialHtml += `<a href="${data.url}" target="_blank" style="text-decoration:none;background:white;display:inline-block;margin-right:8px;"><img src="${icon(network, 'export')}" width="14.4" height="14.4" style="vertical-align:middle;display:inline-block;background:white;" alt="${network}" /></a>`
    }
  }

  // Reemplazar los placeholders en el HTML
  html = html.replace(/\{\{icono_direccion\}\}/g, `<img src="${icon('address', 'export')}" width="14.4" height="14.4" style="vertical-align:middle;display:inline-block;margin-right:4px;background:white;" alt="Dirección" />`)
  html = html.replace(/\{\{icono_telefono\}\}/g, `<img src="${icon('phone', 'export')}" width="14.4" height="14.4" style="vertical-align:middle;display:inline-block;margin-right:4px;background:white;" alt="Teléfono" />`)
  html = html.replace(/\{\{icono_mail\}\}/g, `<img src="${icon('mail', 'export')}" width="14.4" height="14.4" style="vertical-align:middle;display:inline-block;margin-right:4px;background:white;" alt="Email" />`)
  html = html.replace(/\{\{icono_web\}\}/g, `<img src="${icon('web', 'export')}" width="14.4" height="14.4" style="vertical-align:middle;display:inline-block;margin-right:4px;background:white;" alt="Web" />`)
  html = html.replace(/\{\{iconos_sociales\}\}/g, socialHtml)

  // Ajustar tamaño mínimo de logo/foto y centrar verticalmente
  html = html.replace(/class="signature-logo" style="([^"]*)"/g, (match, styles) => {
    let newStyles = styles
    if (!/vertical-align:middle/.test(newStyles)) newStyles += ' vertical-align:middle;'
    if (!/text-align:center/.test(newStyles)) newStyles += ' text-align:center;'
    return `class="signature-logo" style="${newStyles}"`
  })
  html = html.replace(/<img ([^>]*?)class="signature-profile-image"([^>]*)>/g, (match, before, after) => {
    // Forzar tamaño mínimo 80px
    let newTag = match.replace(/width="(\d+)"/, 'width="80"').replace(/height="(\d+)"/, 'height="80"')
    if (!/style="[^"]*vertical-align:middle/.test(newTag)) {
      newTag = newTag.replace(/style="/, 'style="vertical-align:middle;')
    }
    return newTag
  })
  html = html.replace(/<img ([^>]*?)alt="Logo Preview"([^>]*)>/g, (match) => {
    // Forzar tamaño mínimo 80px
    let newTag = match.replace(/width="(\d+)"/, 'width="80"').replace(/height="(\d+)"/, 'height="80"')
    if (!/style="[^"]*vertical-align:middle/.test(newTag)) {
      newTag = newTag.replace(/style="/, 'style="vertical-align:middle;')
    }
    return newTag
  })

  // Reemplazar todos los colores de texto grises por negro
  html = html.replace(/#e5e7eb/g, "#000000")
  html = html.replace(/#9ca3af/g, "#000000")
  html = html.replace(/#666666/g, "#000000")
  html = html.replace(/#333333/g, "#000000")

  return html
}

// Pega aquí la función generateHtmlCode fuera del componente
const generateHtmlCode = (
  signatureData: SignatureData,
  isResponsive: boolean,
  darkMode = false, // Siempre será false en la exportación
  inlineStyles = true,
  exportOnlyTable = true
) => {
    const template = getTemplateById(signatureData.templateId)

    // Forzar colores en modo claro
    const textColor = "#000000" // Siempre negro
    const mutedTextColor = "#000000" // Siempre negro
    const bgColor = "#ffffff" // Siempre blanco
    const borderColor = "#e5e7eb" // Gris claro para bordes

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
                    svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`
                    break
                  case "instagram":
                    svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`
                    break
                  case "youtube":
                    svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`
                    break
                  case "linkedin":
                    svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`
                    break
                  case "twitter":
                    // Icono de X actualizado
                    svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>`
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
  let tableContent = ""

    switch (template.id) {
      case TemplateType.CLASSIC:
      tableContent = `
  <table cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0; width: 400px; color-scheme: light;">
    <tr>
      <td class="signature-logo" style="padding-right: 10px; vertical-align: top; width: 110px; background: white;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 6px 0; text-align: center;">
            <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="${signatureData.logoSize}" style="width: ${signatureData.logoSize}px; max-width: ${signatureData.logoSize}px; display: block;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0; text-align: center;">
            <img src="${signatureData.photoUrl}" alt="${signatureData.name}" width="${signatureData.photoSize}" height="${signatureData.photoSize}" class="signature-profile-image" style="width: ${signatureData.photoSize}px; height: ${signatureData.photoSize}px; max-width: ${signatureData.photoSize}px; border-radius: 70px; border: 3px solid ${signatureData.primaryColor}; display: block;" />
            </td>
          </tr>
        </table>
      </td>
      <td class="signature-content" style="padding-left: 10px; border-left: 2px solid ${signatureData.primaryColor}; vertical-align: top; background: white;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0; width: 100%;">
          <tr>
            <td style="padding: 0 0 2px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 17px; font-weight: bold; color: ${textColor}; margin: 0; line-height:1.2;">${signatureData.name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 8px 0;">
              <div style="font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: ${signatureData.primaryColor}; margin: 0; line-height:1.2;">${signatureData.position}</div>
              <div style="border-bottom: 2px solid ${signatureData.primaryColor}; margin-top: 3px; width: 200px;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 4px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="18" style="vertical-align: middle; padding-right: 4px; background: white;">
                    <img src="${icon('address')}" width="16" height="16" style="vertical-align:middle;display:inline-block;margin-right:4px;" alt="Dirección">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor}; margin: 0; line-height:1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${signatureData.address}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 4px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="18" style="vertical-align: middle; padding-right: 4px; background: white;">
                    <img src="${icon('phone')}" width="16" height="16" style="vertical-align:middle;display:inline-block;margin-right:4px;" alt="Teléfono">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor}; margin: 0; line-height:1.2;">
                    <a href="tel:${signatureData.phone}" style="color: ${textColor}; text-decoration: none;">${signatureData.phone}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 4px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="18" style="vertical-align: middle; padding-right: 4px; background: white;">
                    <img src="${icon('mail')}" width="16" height="16" style="vertical-align:middle;display:inline-block;margin-right:4px;" alt="Email">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${textColor}; margin: 0; line-height:1.2;">
                    <a href="mailto:${signatureData.email}" style="color: ${textColor}; text-decoration: none;">${signatureData.email}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 8px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
                <tr>
                  <td width="18" style="vertical-align: middle; padding-right: 4px; background: white;">
                    <img src="${icon('web')}" width="16" height="16" style="vertical-align:middle;display:inline-block;margin-right:4px;" alt="Web">
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${signatureData.primaryColor}; margin: 0; line-height:1.2;">
                    <a href="https://${signatureData.website}" style="color: ${signatureData.primaryColor}; text-decoration: none;">${signatureData.website}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="signature-social-icons" style="padding-top: 2px; background: white;">
              ${socialHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
</table>`
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
${tableContent}
</body>
</html>`
        break

      case TemplateType.MODERN:
      tableContent = `
  <table cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0; width: 400px;">
    <tr>
      <td class="signature-logo" style="padding-right: 15px; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
          <tr>
            <td style="padding: 0 0 10px 0;">
            <img src="${signatureData.logoUrl}" alt="${signatureData.company}" width="${signatureData.logoSize}" style="width: ${signatureData.logoSize}px; max-width: ${signatureData.logoSize}px; display: block;">
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
      <img src="${signatureData.photoUrl}" alt="${signatureData.name}" width="${signatureData.photoSize}" height="${signatureData.photoSize}" class="signature-profile-image" style="width: ${signatureData.photoSize}px; height: ${signatureData.photoSize}px; max-width: ${signatureData.photoSize}px; border-radius: 60px; border: 2px solid ${signatureData.primaryColor}; display: block;">
      </td>
    </tr>
  </table>
`
  htmlContent = tableContent
        break

      case TemplateType.MINIMAL:
      tableContent = `
  <table cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0; width: 400px;">
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
                          svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`
                          break
                        case "instagram":
                          svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`
                          break
                        case "youtube":
                          svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`
                          break
                        case "linkedin":
                          svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`
                          break
                        case "twitter":
                          svgIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>`
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
`
  htmlContent = tableContent
        break

      case TemplateType.CORPORATE:
      tableContent = `
  <table cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0; ${template.showBorder ? `border: 1px solid ${signatureData.primaryColor};` : ""} width: 400px;">
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${signatureData.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
`
      htmlContent = tableContent
        break

      default:
      tableContent = `
<table cellpadding="0" cellspacing="0" border="0" class="signature-table" style="background: none; border-width: 0px; border: 0px; margin: 0; padding: 0;">
  ...firma default...
</table>`
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
${tableContent}
</body>
</html>`
    }

  // Si exportOnlyTable, solo devolver el bloque de la tabla
  if (exportOnlyTable) {
    return tableContent.trim()
  }
  return htmlContent.trim()
}

export default function SignatureGenerator() {
  const { t } = useLanguage()
  const [signatureData, setSignatureData] = useState<SignatureData>({
    ...getDefaultSignatureData(TemplateType.CLASSIC),
    logoSize: 150,
    photoSize: 140,
  })
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

      setSignatureData((prev) => {
        // Solo si parent es 'socialLinks' y child es una red social válida
        if (parent === "socialLinks" && child && prev.socialLinks && typeof prev.socialLinks === "object") {
          const socialLinks = { ...prev.socialLinks }
      if (subChild) {
            // socialLinks.facebook.url
            if (socialLinks[child as keyof typeof socialLinks]) {
              socialLinks[child as keyof typeof socialLinks] = {
                ...socialLinks[child as keyof typeof socialLinks],
              [subChild]: value,
              }
            }
      } else {
            // socialLinks.facebook
            if (socialLinks[child as keyof typeof socialLinks]) {
              socialLinks[child as keyof typeof socialLinks] = {
                ...socialLinks[child as keyof typeof socialLinks],
                url: value,
              }
            }
          }
          return {
          ...prev,
            socialLinks,
          }
        }
        // fallback
        return prev
      })
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
          title: t("imageUploadedSuccessfully"),
          description: t("imageUploadedAndSaved"),
        })
      } catch (error) {
        console.error("Error uploading file:", error)
        toast({
          title: t("imageUploadError"),
          description: t("imageUploadFailed"),
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

  const copyHtmlToClipboard = async () => {
    const html = await generateHtmlCodeWithPngIcons(signatureData, isResponsive, false, inlineStyles, true)
    await navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: t("codeCopied"),
      description: t("htmlCodeCopied"),
    })
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
        title: t("fileDownloaded"),
        description: t("htmlFileDownloaded"),
      })
    }
  }

  const handleSaveSignature = async () => {
    if (!signatureName) {
      toast({
        title: t("nameRequired"),
        description: t("enterSignatureName"),
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
          title: t("signatureUpdated"),
          description: t("signatureUpdatedSuccessfully"),
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
          title: t("signatureSaved"),
          description: t("signatureSavedSuccessfully"),
        })
      }

      setSaveDialogOpen(false)
      await loadSignatures()
    } catch (error) {
      console.error("Error saving signature:", error)
      toast({
        title: t("saveError"),
        description: t("saveSignatureFailed"),
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
          title: t("signatureLoaded"),
          description: t("signatureLoadedSuccessfully"),
        })
      }

      setLoadDialogOpen(false)
    } catch (error) {
      console.error("Error loading signature:", error)
      toast({
        title: t("loadError"),
        description: t("loadSignatureFailed"),
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
        title: t("signatureDeleted"),
        description: t("signatureDeletedSuccessfully"),
      })
    } catch (error) {
      console.error("Error deleting signature:", error)
      toast({
        title: t("deleteError"),
        description: t("deleteSignatureFailed"),
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
      title: t("newSignature"),
      description: t("newBlankSignature"),
    })
  }

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

  // Reemplaza la exportación/copia por la nueva función asíncrona
  type ExportHtmlOptions = { darkMode?: boolean; inlineStyles?: boolean; exportOnlyTable?: boolean }
  async function exportSignatureHtml(options: ExportHtmlOptions = {}) {
    const { inlineStyles = true, exportOnlyTable = true } = options
    // Siempre exportar en modo claro
    return await generateHtmlCodeWithPngIcons(signatureData, isResponsive, false, inlineStyles, exportOnlyTable)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">
              {currentSignatureId ? `${t("editing")}: ${signatureName}` : t("newSignature")}
            </h2>
            {currentSignatureId && <span className="text-sm text-muted-foreground">{signatureTitle}</span>}
          </div>
          <div className="flex gap-2">
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Save size={16} />
                  {t("save")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("save")}</DialogTitle>
                  <DialogDescription>{t("enterNameAndTitle")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="signatureName">{t("name")} *</Label>
                    <Input
                      id="signatureName"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder={t("corporateSignature")}
                      className="border-neutral bg-white focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signatureTitle">{t("titleOptional")}</Label>
                    <Input
                      id="signatureTitle"
                      value={signatureTitle}
                      onChange={(e) => setSignatureTitle(e.target.value)}
                      placeholder={t("officialCommunications")}
                      className="border-neutral bg-white focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="border-neutral text-text hover:bg-neutral/20"
                    onClick={() => setSaveDialogOpen(false)}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-white hover:bg-primary/90"
                    onClick={handleSaveSignature}
                  >
                    {currentSignatureId ? t("update") : t("save")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <List size={16} />
                  {t("load")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("loadSignature")}</DialogTitle>
                  <DialogDescription>{t("selectSavedSignature")}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : signatures.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">{t("noSavedSignatures")}</div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {signatures.map((signature) => (
                        <div
                          key={signature.id}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
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
                                  <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
                                  <AlertDialogDescription>{t("actionCannotBeUndone")}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteSignature(signature.id)}>
                                    {t("delete")}
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
                  <Button
                    variant="outline"
                    className="border-neutral text-text hover:bg-neutral/20"
                    onClick={() => setLoadDialogOpen(false)}
                  >
                    {t("close")}
                  </Button>
                  <Button onClick={handleNewSignature} className="flex items-center gap-1">
                    <Plus size={16} />
                    {t("newSignature")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="template" className="text-sm">
              <div className="flex items-center gap-1">
                <Palette size={16} />
                <span>{t("template")}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="editor" className="text-sm">
              <div className="flex items-center gap-1">
                <Edit size={16} />
                <span>{t("editor")}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="code" className="text-sm">
              <div className="flex items-center gap-1">
                <Download size={16} />
                <span>{t("export")}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="text-sm">
              <div className="flex items-center gap-1">
                <LinkIcon size={16} />
                <span>{t("collaboration")}</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{t("selectTemplate")}</CardTitle>
                <CardDescription>{t("chooseDesignThatSuitsYou")}</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateSelector
                  templates={TEMPLATES}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleTemplateChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-6" id="editor">
            {/* Stepper visual mejorado */}
            <ol className="flex items-center mb-6 space-x-4 text-sm font-medium stepper-wizard">
              <li className="step-active">{t("step1Wizard")}</li>
              <li>{t("step2Wizard")}</li>
              <li>{t("step3Wizard")}</li>
              <li>{t("step4Wizard")}</li>
            </ol>
            <style jsx>{`
              .stepper-wizard {
                counter-reset: step;
              }
              .stepper-wizard li {
                position: relative;
                padding-left: 2.5rem;
                color: #888;
                transition: color 0.2s;
              }
              .stepper-wizard li:before {
                counter-increment: step;
                content: counter(step);
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                background: #e5e7eb;
                color: #333;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 1rem;
                border: 2px solid #d1d5db;
                transition: background 0.2s, color 0.2s, border 0.2s;
              }
              .stepper-wizard li.step-active {
                color: #4F46E5;
                font-weight: bold;
              }
              .stepper-wizard li.step-active:before {
                background: #4F46E5;
                color: #fff;
                border-color: #4F46E5;
              }
            `}</style>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{`Paso 1 · ${t("newSignature")}`}</CardTitle>
                <CardDescription>Completa tus datos básicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="form-group">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                        <User size={16} /> {t("fullName")}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={signatureData.name}
                        onChange={handleInputChange}
                        className="mt-1.5 border-neutral bg-white focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="position" className="flex items-center gap-2 text-sm font-medium">
                        <User size={16} /> {t("position")}
                      </Label>
                      <Input
                        id="position"
                        name="position"
                        value={signatureData.position}
                        onChange={handleInputChange}
                        className="mt-1.5 border-neutral bg-white focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="company" className="flex items-center gap-2 text-sm font-medium">
                        <Building size={16} /> {t("company")}
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        value={signatureData.company}
                        onChange={handleInputChange}
                        className="mt-1.5 border-neutral bg-white focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
                        <MapPin size={16} /> {t("address")}
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={signatureData.address}
                        onChange={handleInputChange}
                        className="mt-1.5 border-neutral bg-white focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="form-group">
                      <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                        <Phone size={16} /> {t("phone")}
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={signatureData.phone}
                        onChange={handleInputChange}
                        className="mt-1.5 border-neutral bg-white focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                        <Mail size={16} /> {t("email")}
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        value={signatureData.email}
                        onChange={handleInputChange}
                        className="mt-1.5 border-neutral bg-white focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="form-group">
                      <Label htmlFor="website" className="flex items-center gap-2 text-sm font-medium">
                        <Globe size={16} /> {t("website")}
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        value={signatureData.website}
                        onChange={handleInputChange}
                        className="mt-1.5 border-neutral bg-white focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{t("personalization")}</CardTitle>
                <CardDescription>{t("customizeVisualAspect")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="form-group">
                      <Label htmlFor="primaryColor" className="flex items-center gap-2 text-sm font-medium">
                        <Palette size={16} /> {t("primaryColor")}
                      </Label>
                      <div className="mt-1.5">
                        <ColorPicker color={signatureData.primaryColor} onChange={handleColorChange} />
                      </div>
                    </div>

                    <div className="form-group">
                      <Label htmlFor="logoUpload" className="flex items-center gap-2 text-sm font-medium">
                        <ImageIcon size={16} /> {t("companyLogo")}
                      </Label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Input
                          id="logoUpload"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          onChange={(e) => handleFileUpload(e, "logoUrl")}
                          disabled={isUploading}
                          className="mt-1.5 border-neutral bg-white focus:border-primary focus:ring-primary"
                        />
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t("acceptedFormatsLogo")}</p>
                      {signatureData.logoUrl && signatureData.logoUrl.startsWith("http") && (
                        <div className="mt-3 p-2 border rounded-md bg-gray-50">
                          <img
                            src={signatureData.logoUrl || "/placeholder.svg"}
                            alt="Logo Preview"
                            className="h-16 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="form-group">
                      <Label htmlFor="photoUpload" className="flex items-center gap-2 text-sm font-medium">
                        <User size={16} /> {t("profilePhoto")}
                      </Label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Input
                          id="photoUpload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "photoUrl")}
                          disabled={isUploading}
                          className="mt-1.5 border-neutral bg-white focus:border-primary focus:ring-primary"
                        />
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                      {signatureData.photoUrl && signatureData.photoUrl.startsWith("http") && (
                        <div className="mt-3 flex justify-center">
                          <div
                            className="w-24 h-24 rounded-full overflow-hidden border-4"
                            style={{ borderColor: signatureData.primaryColor }}
                          >
                            <img
                              src={signatureData.photoUrl || "/placeholder.svg"}
                              alt="Photo Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <Label className="flex items-center gap-2 text-sm font-medium mb-3">
                        <LinkIcon size={16} /> {t("socialNetworks")}
                      </Label>
                      <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="facebook-enabled"
                            checked={signatureData.socialLinks.facebook.enabled}
                            onCheckedChange={() => handleSocialToggle("facebook")}
                          />
                          <Label htmlFor="facebook-enabled" className="flex items-center gap-2 cursor-pointer">
                            <Facebook size={16} className="text-blue-600" /> Facebook
                          </Label>
                        </div>
                        {signatureData.socialLinks.facebook.enabled && (
                          <Input
                            id="facebook"
                            name="socialLinks.facebook.url"
                            value={signatureData.socialLinks.facebook.url}
                            onChange={handleInputChange}
                            className="mt-1 border-neutral bg-white focus:border-primary focus:ring-primary"
                            placeholder="https://facebook.com/tuempresa"
                          />
                        )}

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="instagram-enabled"
                            checked={signatureData.socialLinks.instagram.enabled}
                            onCheckedChange={() => handleSocialToggle("instagram")}
                          />
                          <Label htmlFor="instagram-enabled" className="flex items-center gap-2 cursor-pointer">
                            <Instagram size={16} className="text-pink-600" /> Instagram
                          </Label>
                        </div>
                        {signatureData.socialLinks.instagram.enabled && (
                          <Input
                            id="instagram"
                            name="socialLinks.instagram.url"
                            value={signatureData.socialLinks.instagram.url}
                            onChange={handleInputChange}
                            className="mt-1 border-neutral bg-white focus:border-primary focus:ring-primary"
                            placeholder="https://instagram.com/tuempresa"
                          />
                        )}

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="linkedin-enabled"
                            checked={signatureData.socialLinks.linkedin.enabled}
                            onCheckedChange={() => handleSocialToggle("linkedin")}
                          />
                          <Label htmlFor="linkedin-enabled" className="flex items-center gap-2 cursor-pointer">
                            <Linkedin size={16} className="text-blue-700" /> LinkedIn
                          </Label>
                        </div>
                        {signatureData.socialLinks.linkedin.enabled && (
                          <Input
                            id="linkedin"
                            name="socialLinks.linkedin.url"
                            value={signatureData.socialLinks.linkedin.url}
                            onChange={handleInputChange}
                            className="mt-1 border-neutral bg-white focus:border-primary focus:ring-primary"
                            placeholder="https://linkedin.com/in/tunombre"
                          />
                        )}

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="twitter-enabled"
                            checked={signatureData.socialLinks.twitter.enabled}
                            onCheckedChange={() => handleSocialToggle("twitter")}
                          />
                          <Label htmlFor="twitter-enabled" className="flex items-center gap-2 cursor-pointer">
                            <XIcon size={16} /> X (Twitter)
                          </Label>
                        </div>
                        {signatureData.socialLinks.twitter.enabled && (
                          <Input
                            id="twitter"
                            name="socialLinks.twitter.url"
                            value={signatureData.socialLinks.twitter.url}
                            onChange={handleInputChange}
                            className="mt-1 border-neutral bg-white focus:border-primary focus:ring-primary"
                            placeholder="https://x.com/tuempresa"
                          />
                        )}

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="youtube-enabled"
                            checked={signatureData.socialLinks.youtube.enabled}
                            onCheckedChange={() => handleSocialToggle("youtube")}
                          />
                          <Label htmlFor="youtube-enabled" className="flex items-center gap-2 cursor-pointer">
                            <Youtube size={16} className="text-red-600" /> YouTube
                          </Label>
                        </div>
                        {signatureData.socialLinks.youtube.enabled && (
                          <Input
                            id="youtube"
                            name="socialLinks.youtube.url"
                            value={signatureData.socialLinks.youtube.url}
                            onChange={handleInputChange}
                            className="mt-1 border-neutral bg-white focus:border-primary focus:ring-primary"
                            placeholder="https://youtube.com/c/tuempresa"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="space-y-6">
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <Tabs value={exportTab} onValueChange={setExportTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="html">{t("htmlCode")}</TabsTrigger>
                    <TabsTrigger value="image">{t("image")}</TabsTrigger>
                    <TabsTrigger value="preview">{t("preview")}</TabsTrigger>
                    <TabsTrigger value="guides">{t("guides")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="html" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">{t("htmlCode")}</h2>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center space-x-2 mr-2">
                          <Switch id="responsive-mode" checked={isResponsive} onCheckedChange={setIsResponsive} />
                          <Label htmlFor="responsive-mode">{t("responsive")}</Label>
                        </div>
                        <div className="flex items-center space-x-2 mr-2">
                          <Switch
                            id="inline-styles"
                            checked={inlineStyles}
                            onCheckedChange={(checked) => {
                              setInlineStyles(checked)
                              if (htmlCodeRef.current) {
                                htmlCodeRef.current.value = generateHtmlCode(signatureData, isResponsive, checked, true)
                              }
                            }}
                          />
                          <Label htmlFor="inline-styles">{t("inlineStyles")}</Label>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (htmlCodeRef.current) {
                              htmlCodeRef.current.value = generateHtmlCode(signatureData, isResponsive, inlineStyles, true)
                            }
                          }}
                          className="flex items-center gap-1 border-neutral text-text hover:bg-neutral/20"
                        >
                          <Sun size={16} />
                          {t("lightMode")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (htmlCodeRef.current) {
                              htmlCodeRef.current.value = generateHtmlCode(signatureData, isResponsive, true, true)
                            }
                          }}
                          className="flex items-center gap-1 border-neutral text-text hover:bg-neutral/20"
                        >
                          <Moon size={16} />
                          {t("darkMode")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyHtmlToClipboard}
                          className="flex items-center gap-1 border-neutral text-text hover:bg-neutral/20"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          {copied ? t("copied") : t("copy")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadHtmlFile}
                          className="flex items-center gap-1 border-neutral text-text hover:bg-neutral/20"
                        >
                          <Download size={16} />
                          {t("download")}
                        </Button>
                      </div>
                    </div>
                    <textarea
                      ref={htmlCodeRef}
                      className="w-full h-[400px] p-4 font-mono text-sm border rounded-md"
                      readOnly
                      value={generateHtmlCode(signatureData, isResponsive, inlineStyles, true)}
                    />
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">{t("exportAsImage")}</h2>
                    <p className="text-sm text-muted-foreground mb-4">{t("exportSignatureAsImage")}</p>
                    <ExportToImage signatureData={signatureData} />
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    <EmailClientPreview signatureData={signatureData} htmlCode={generateHtmlCode(signatureData, isResponsive, inlineStyles, true)} />
                  </TabsContent>

                  <TabsContent value="guides" className="space-y-4">
                    <EmailClientGuides htmlCode={generateHtmlCode(signatureData, isResponsive, inlineStyles, true)} />
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
              htmlCode={generateHtmlCode(signatureData, isResponsive, inlineStyles, true)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <h2 className="text-xl font-semibold mb-4">{t("preview")}</h2>
          <div className="preview-container mb-6">
            <SignaturePreviewWrapper data={signatureData} />
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">{t("instructions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>{t("quickInstruction1")}</li>
                <li>{t("quickInstruction2")}</li>
                <li>{t("quickInstruction3")}</li>
                <li>{t("quickInstruction4")}</li>
                <li>{t("quickInstruction5")}</li>
              </ol>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-sm mb-2">{t("quickTip")}</h4>
                <p className="text-xs text-muted-foreground">{t("quickTipText")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
