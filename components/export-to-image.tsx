"use client"

import { useState, useRef } from "react"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Download, ImageIcon, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import SignaturePreview from "@/components/signature-preview"
import type { SignatureData } from "@/components/signature-generator"

interface ExportToImageProps {
  signatureData: SignatureData
}

export default function ExportToImage({ signatureData }: ExportToImageProps) {
  const [isExporting, setIsExporting] = useState(false)
  const signatureRef = useRef<HTMLDivElement>(null)

  const handleExport = async (format: "png" | "jpeg") => {
    if (!signatureRef.current) return

    setIsExporting(true)
    try {
      // Configuración para mejor calidad
      const canvas = await html2canvas(signatureRef.current, {
        scale: 2, // Mayor escala para mejor calidad
        useCORS: true, // Permitir imágenes de otros dominios
        backgroundColor: "#ffffff", // Fondo blanco
        logging: false,
      })

      // Convertir a imagen
      const image = canvas.toDataURL(`image/${format}`, format === "jpeg" ? 0.95 : undefined)

      // Crear enlace de descarga
      const link = document.createElement("a")
      link.href = image
      link.download = `firma-email.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Imagen exportada",
        description: `La firma ha sido exportada como ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Error exporting image:", error)
      toast({
        title: "Error al exportar",
        description: "No se pudo exportar la firma como imagen. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => handleExport("png")}
          disabled={isExporting}
          className="flex items-center gap-1"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon size={16} />}
          Exportar como PNG
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExport("jpeg")}
          disabled={isExporting}
          className="flex items-center gap-1"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download size={16} />}
          Exportar como JPG
        </Button>
      </div>

      {/* Contenedor oculto para renderizar la firma para exportación */}
      <div className="hidden">
        <div ref={signatureRef} className="bg-white p-4 inline-block">
          <SignaturePreview data={signatureData} />
        </div>
      </div>
    </div>
  )
}
