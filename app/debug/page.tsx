"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SafeImage from "@/components/ui/safe-image"

export default function DebugPage() {
  const [imageUrl, setImageUrl] = useState("/images/identy-logo-transparente.png")
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [envInfo, setEnvInfo] = useState<Record<string, string>>({})

  useEffect(() => {
    // Recopilar información del entorno
    setEnvInfo({
      "Next.js Environment": process.env.NODE_ENV || "unknown",
      "Window Location": typeof window !== "undefined" ? window.location.href : "unknown",
      "User Agent": typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    })
  }, [])

  const testImageUrl = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch(imageUrl, { method: "HEAD" })
      if (response.ok) {
        setTestResult(`✅ Imagen accesible (status: ${response.status})`)
      } else {
        setTestResult(`❌ Error al acceder a la imagen (status: ${response.status})`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Página de Diagnóstico</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Entorno</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-2">
              {Object.entries(envInfo).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2">
                  <dt className="font-medium">{key}:</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prueba de Carga de Imágenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="image-url">URL de la imagen</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Ingresa la URL de la imagen para probar"
                />
              </div>

              <Button onClick={testImageUrl} disabled={isLoading}>
                {isLoading ? "Probando..." : "Probar URL"}
              </Button>

              {testResult && (
                <div className="p-3 bg-gray-100 rounded-md">
                  <p>{testResult}</p>
                </div>
              )}

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Vista previa de la imagen:</h3>
                <div className="border rounded-md p-4 flex justify-center">
                  <SafeImage
                    src={imageUrl}
                    alt="Imagen de prueba"
                    width={200}
                    height={200}
                    className="max-h-[200px] w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
