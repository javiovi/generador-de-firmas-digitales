"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Smartphone, Tablet, Monitor } from "lucide-react"
import SignaturePreview from "@/components/signature-preview"
import type { SignatureData } from "@/components/signature-generator"

interface SignaturePreviewWrapperProps {
  data: SignatureData
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
          <SignaturePreview data={data} darkMode={darkMode} />
        </CardContent>
      </Card>
    </div>
  )
}
