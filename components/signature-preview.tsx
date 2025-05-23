"use client"

import { MapPin, Phone, Mail, Globe } from "lucide-react"
import type { SignatureData } from "@/components/signature-generator"

interface SignaturePreviewProps {
  data: SignatureData
  darkMode?: boolean
}

export default function SignaturePreview({ data, darkMode = false }: SignaturePreviewProps) {
  const textColor = "#000000"
  const mutedTextColor = "#000000"

  // Filtrar redes sociales habilitadas
  const enabledSocialNetworks = Object.entries(data.socialLinks)
    .filter(([_, data]) => data.enabled)
    .map(([network, data]) => ({ network, url: data.url }))

  return (
    <div className="flex">
      <div className="mr-4">
        <div className="mb-2">
          <img src={data.logoUrl || "/placeholder.svg"} alt={data.company} className="w-[150px] h-auto" />
        </div>
        <div>
          <div
            className="w-[140px] h-[140px] rounded-full overflow-hidden border-4"
            style={{ borderColor: data.primaryColor }}
          >
            <img src={data.photoUrl || "/placeholder.svg"} alt={data.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
      <div className="border-l-4" style={{ borderColor: data.primaryColor, paddingLeft: "1rem" }}>
        <div className="mb-1">
          <div className="text-lg font-bold" style={{ color: textColor }}>
            {data.name}
          </div>
        </div>
        <div className="mb-3">
          <div className="text-sm font-semibold" style={{ color: data.primaryColor }}>
            {data.position}
          </div>
          <div className="mt-1 border-b-2 w-12" style={{ borderColor: data.primaryColor }}></div>
        </div>
        <div className="mb-2 flex items-start">
          <MapPin size={16} className="mr-1 mt-0.5 flex-shrink-0" style={{ color: textColor }} />
          <span className="text-xs" style={{ color: textColor }}>
            {data.address}
          </span>
        </div>
        <div className="mb-1 flex items-center">
          <Phone size={16} className="mr-1 flex-shrink-0" style={{ color: textColor }} />
          <a href={`tel:${data.phone}`} className="text-xs" style={{ color: textColor }}>
            {data.phone}
          </a>
        </div>
        <div className="mb-1 flex items-center">
          <Mail size={16} className="mr-1 flex-shrink-0" style={{ color: textColor }} />
          <a href={`mailto:${data.email}`} className="text-xs" style={{ color: textColor }}>
            {data.email}
          </a>
        </div>
        <div className="mb-3 flex items-center">
          <Globe size={16} className="mr-1 flex-shrink-0" style={{ color: data.primaryColor }} />
          <a
            href={`https://${data.website}`}
            className="text-xs"
            style={{ color: data.primaryColor }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.website}
          </a>
        </div>
        {enabledSocialNetworks.length > 0 && (
          <div className="flex space-x-2">
            {enabledSocialNetworks.map(({ network, url }) => {
              let Icon
              switch (network) {
                case "facebook":
                  return (
                    <a
                      key={network}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs"
                      style={{ color: data.primaryColor }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                  )
                case "instagram":
                  return (
                    <a
                      key={network}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs"
                      style={{ color: data.primaryColor }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                  )
                case "youtube":
                  return (
                    <a
                      key={network}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs"
                      style={{ color: data.primaryColor }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                      </svg>
                    </a>
                  )
                case "linkedin":
                  return (
                    <a
                      key={network}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs"
                      style={{ color: data.primaryColor }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  )
                case "twitter":
                  return (
                    <a
                      key={network}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs"
                      style={{ color: data.primaryColor }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </a>
                  )
                default:
                  return null
              }
            })}
          </div>
        )}
      </div>
    </div>
  )
}
