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
    <div className="rounded-lg bg-panel p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-text">Vista previa de la firma</h3>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant={deviceSize === "desktop" ? "default" : "outline"}
            size="icon"
            className={`h-8 w-8 ${deviceSize === "desktop" ? "bg-rose text-white" : "border-coolgray-300 text-charcoal"}`}
            onClick={() => setDeviceSize("desktop")}
            title="Vista de escritorio"
          >
            <Monitor size={16} />
          </Button>
          <Button
            variant={deviceSize === "tablet" ? "default" : "outline"}
            size="icon"
            className={`h-8 w-8 ${deviceSize === "tablet" ? "bg-rose text-white" : "border-coolgray-300 text-charcoal"}`}
            onClick={() => setDeviceSize("tablet")}
            title="Vista de tablet"
          >
            <Tablet size={16} />
          </Button>
          <Button
            variant={deviceSize === "mobile" ? "default" : "outline"}
            size="icon"
            className={`h-8 w-8 ${deviceSize === "mobile" ? "bg-rose text-white" : "border-coolgray-300 text-charcoal"}`}
            onClick={() => setDeviceSize("mobile")}
            title="Vista de móvil"
          >
            <Smartphone size={16} />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDarkMode(!darkMode)}
          className="border-neutral text-text hover:bg-neutral/20 flex items-center gap-1"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          {darkMode ? "Modo Claro" : "Modo Oscuro"}
        </Button>
      </div>

      <Card
        className={`overflow-hidden ${getDeviceWidth()} mx-auto border border-coolgray-200 ${darkMode ? "bg-charcoal-900" : "bg-white"}`}
      >
        <CardContent className={`p-6`}>
          <SignaturePreview data={data} darkMode={darkMode} />
        </CardContent>
      </Card>
    </div>
  )
}
