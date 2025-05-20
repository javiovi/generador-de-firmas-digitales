"use client"

import { useState, useRef, useEffect } from "react"
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
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Función para verificar que todas las imágenes estén cargadas
  const checkImagesLoaded = () => {
    if (!signatureRef.current) return false
    const images = signatureRef.current.getElementsByTagName('img')
    let loaded = true
    for (let i = 0; i < images.length; i++) {
      if (!images[i].complete) {
        loaded = false
        break
      }
    }
    return loaded
  }

  // Efecto para monitorear la carga de imágenes
  useEffect(() => {
    if (!signatureRef.current) return

    const images = signatureRef.current.getElementsByTagName('img')
    let loadedCount = 0
    const totalImages = images.length

    const handleImageLoad = () => {
      loadedCount++
      if (loadedCount === totalImages) {
        setImagesLoaded(true)
      }
    }

    for (let i = 0; i < totalImages; i++) {
      if (images[i].complete) {
        loadedCount++
      } else {
        images[i].addEventListener('load', handleImageLoad)
        images[i].addEventListener('error', handleImageLoad) // También manejamos errores
      }
    }

    if (loadedCount === totalImages) {
      setImagesLoaded(true)
    }

    return () => {
      for (let i = 0; i < totalImages; i++) {
        images[i].removeEventListener('load', handleImageLoad)
        images[i].removeEventListener('error', handleImageLoad)
      }
    }
  }, [signatureData]) // Se ejecuta cuando cambian los datos de la firma

  const handleExport = async (format: "png" | "jpeg") => {
    if (!signatureRef.current || !imagesLoaded) {
      toast({
        title: "Error al exportar",
        description: "Espera a que todas las imágenes se carguen completamente.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      // Hacer visible temporalmente el contenedor
      const container = signatureRef.current.parentElement
      if (container) {
        container.style.display = 'block'
        container.style.position = 'absolute'
        container.style.left = '-9999px'
        container.style.top = '-9999px'
      }

      // Configuración para mejor calidad
      const canvas = await html2canvas(signatureRef.current, {
        scale: 2, // Mayor escala para mejor calidad
        useCORS: true, // Permitir imágenes de otros dominios
        backgroundColor: "#ffffff", // Fondo blanco
        logging: false,
        allowTaint: true, // Permitir imágenes de otros dominios
        imageTimeout: 15000, // Timeout más largo para cargar imágenes
      })

      // Ocultar el contenedor nuevamente
      if (container) {
        container.style.display = 'none'
        container.style.position = 'static'
        container.style.left = 'auto'
        container.style.top = 'auto'
      }

      // Convertir a imagen con mejor calidad
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
          disabled={isExporting || !imagesLoaded}
          className="flex items-center gap-1"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon size={16} />}
          {isExporting ? "Exportando..." : "Exportar como PNG"}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExport("jpeg")}
          disabled={isExporting || !imagesLoaded}
          className="flex items-center gap-1"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download size={16} />}
          {isExporting ? "Exportando..." : "Exportar como JPG"}
        </Button>
      </div>

      {/* Contenedor para renderizar la firma para exportación */}
      <div style={{ display: 'none' }}>
        <div ref={signatureRef} className="bg-white p-4 inline-block">
          <SignaturePreview data={signatureData} />
        </div>
      </div>

      {!imagesLoaded && (
        <p className="text-sm text-muted-foreground">
          Cargando imágenes...
        </p>
      )}
    </div>
  )
}
