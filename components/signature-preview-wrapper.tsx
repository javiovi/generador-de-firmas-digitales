"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Smartphone, Tablet, Monitor } from "lucide-react"
import SignaturePreview from "@/components/signature-preview"
import type { SignatureData } from "@/components/signature-generator"
// Importar los iconos de Lucide React si no están ya importados
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react"

interface SignaturePreviewWrapperProps {
  data: SignatureData
}

// Asegurarse de que el icono de X (Twitter) esté definido correctamente
function XIcon({ size = 16, className = "" }) {
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
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

export default function SignaturePreviewWrapper({ data }: SignaturePreviewWrapperProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [deviceSize, setDeviceSize] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const getDeviceWidth = () => {
    switch (deviceSize) {
      case "mobile":
        return "max-w-[320px]"
      case "tablet":
        return "max-w-[600px]"
      default:
        return "w-full"
    }
  }

  const enabledSocialNetworks = data.socialNetworks
    ? Object.keys(data.socialNetworks).filter((key) => data.socialNetworks?.[key])
    : []

  const renderSocialIcons = () => {
    return (
      // Asegurarse de que los iconos sociales se rendericen correctamente
      enabledSocialNetworks.map((network) => {
        let Icon
        switch (network) {
          case "facebook":
            Icon = Facebook
            break
          case "instagram":
            Icon = Instagram
            break
          case "youtube":
            Icon = Youtube
            break
          case "linkedin":
            Icon = Linkedin
            break
          case "twitter":
            Icon = XIcon
            break
          default:
            return null
        }
        return (
          <a key={network} href="#" className="mr-2 text-primary hover:text-primary/80" aria-label={network}>
            <Icon size={16} />
          </a>
        )
      })
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant={deviceSize === "desktop" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDeviceSize("desktop")}
            title="Vista de escritorio"
          >
            <Monitor size={16} />
          </Button>
          <Button
            variant={deviceSize === "tablet" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDeviceSize("tablet")}
            title="Vista de tablet"
          >
            <Tablet size={16} />
          </Button>
          <Button
            variant={deviceSize === "mobile" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDeviceSize("mobile")}
            title="Vista de móvil"
          >
            <Smartphone size={16} />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-1">
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          {darkMode ? "Modo Claro" : "Modo Oscuro"}
        </Button>
      </div>

      <Card className={`overflow-hidden ${getDeviceWidth()} mx-auto`}>
        <CardContent className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <SignaturePreview data={data} darkMode={darkMode} renderSocialIcons={renderSocialIcons} />
        </CardContent>
      </Card>
    </div>
  )
}
