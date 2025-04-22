"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle, XCircle, Check, Info } from "lucide-react"
import type { SignatureData } from "@/components/signature-generator"

interface CompatibilityCheckerProps {
  signatureData: SignatureData
  htmlCode: string
}

interface ClientIssue {
  name: string
  compatibility: "high" | "medium" | "low"
  issues: string[]
}

export default function CompatibilityChecker({ signatureData, htmlCode }: CompatibilityCheckerProps) {
  const [showReport, setShowReport] = useState(false)

  // Analiza el código HTML en busca de posibles problemas de compatibilidad
  const analyzeCompatibility = (): ClientIssue[] => {
    const clients: ClientIssue[] = [
      {
        name: "Gmail",
        compatibility: "high",
        issues: [],
      },
      {
        name: "Outlook",
        compatibility: "medium",
        issues: [],
      },
      {
        name: "Apple Mail",
        compatibility: "high",
        issues: [],
      },
      {
        name: "Thunderbird",
        compatibility: "high",
        issues: [],
      },
      {
        name: "Outlook Web",
        compatibility: "medium",
        issues: [],
      },
    ]

    // Comprobar si hay media queries (potencialmente problemáticas en algunos clientes)
    if (htmlCode.includes("@media")) {
      clients
        .find((c) => c.name === "Outlook")!
        .issues.push("Media queries no son compatibles con Outlook de escritorio.")
      clients.find((c) => c.name === "Outlook Web")!.issues.push("Media queries pueden tener compatibilidad limitada.")
    }

    // Comprobar si hay SVG (no compatible con Outlook)
    if (htmlCode.includes("<svg")) {
      clients
        .find((c) => c.name === "Outlook")!
        .issues.push("Las imágenes SVG no son compatibles. Usa PNG o JPG como alternativa.")
      clients.find((c) => c.name === "Outlook")!.compatibility = "low"
    }

    // Comprobar el uso de border-radius (problemas en Outlook)
    if (htmlCode.includes("border-radius")) {
      clients
        .find((c) => c.name === "Outlook")!
        .issues.push("La propiedad border-radius puede no visualizarse correctamente.")
    }

    // Comprobar si hay recursos externos (Outlook bloquea por defecto)
    if (htmlCode.includes("cdn-icons-png.flaticon.com")) {
      clients.find((c) => c.name === "Outlook")!.issues.push("Las imágenes externas pueden ser bloqueadas por defecto.")
      clients.find((c) => c.name === "Gmail")!.issues.push("Las imágenes externas pueden ser bloqueadas por defecto.")
    }

    // Comprobar si hay imágenes sin dimensiones explícitas
    if (htmlCode.match(/<img[^>]*(?!width|height)[^>]*>/)) {
      clients
        .find((c) => c.name === "Outlook")!
        .issues.push("Todas las imágenes deben tener dimensiones explícitas (width y height).")
    }

    // Actualizar niveles de compatibilidad basados en la cantidad de problemas
    clients.forEach((client) => {
      if (client.issues.length > 2) {
        client.compatibility = "low"
      } else if (client.issues.length > 0) {
        client.compatibility = "medium"
      }
    })

    return clients
  }

  const clientIssues = analyzeCompatibility()

  const getCompatibilityIcon = (level: string) => {
    switch (level) {
      case "high":
        return <CheckCircle2 className="text-green-500" />
      case "medium":
        return <AlertTriangle className="text-amber-500" />
      case "low":
        return <XCircle className="text-red-500" />
      default:
        return <Info />
    }
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setShowReport(!showReport)}
        className="w-full flex items-center justify-center gap-2"
      >
        <Info size={16} />
        {showReport ? "Ocultar informe de compatibilidad" : "Verificar compatibilidad con clientes de correo"}
      </Button>

      {showReport && (
        <Card>
          <CardHeader>
            <CardTitle>Informe de compatibilidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <Info className="h-4 w-4" /> Información general
              </AlertTitle>
              <AlertDescription>
                <p className="mt-2">
                  Ningún cliente de correo electrónico soporta HTML/CSS completo. Tu firma ha sido generada con las
                  mejores prácticas para maximizar la compatibilidad, pero pueden existir diferencias de visualización
                  entre clientes.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                  <li>El código está optimizado con CSS inline para mayor compatibilidad</li>
                  <li>
                    Se utilizan tablas HTML para la estructura, lo que funciona mejor en clientes de correo antiguos
                  </li>
                  <li>Las media queries ayudan con la responsividad pero no funcionan en todos los clientes</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-medium">Compatibilidad con clientes principales:</h3>

              <div className="space-y-3">
                {clientIssues.map((client, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCompatibilityIcon(client.compatibility)}
                        <span className="font-medium">{client.name}</span>
                      </div>
                      <div className="text-sm">
                        Compatibilidad:{" "}
                        <span
                          className={`font-medium ${
                            client.compatibility === "high"
                              ? "text-green-500"
                              : client.compatibility === "medium"
                                ? "text-amber-500"
                                : "text-red-500"
                          }`}
                        >
                          {client.compatibility === "high"
                            ? "Alta"
                            : client.compatibility === "medium"
                              ? "Media"
                              : "Baja"}
                        </span>
                      </div>
                    </div>

                    {client.issues.length > 0 ? (
                      <div className="text-sm mt-2">
                        <p className="text-muted-foreground mb-1">Posibles problemas:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {client.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-sm text-green-500 mt-1">
                        <Check size={14} /> Sin problemas detectados
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                <h4 className="font-medium text-blue-800 mb-1">Consejos para máxima compatibilidad:</h4>
                <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                  <li>Usa imágenes alojadas en servidores confiables</li>
                  <li>Evita diseños complejos con muchas columnas anidadas</li>
                  <li>Prueba tu firma en diferentes clientes de correo antes de usarla definitivamente</li>
                  <li>Considera versiones alternativas para clientes problemáticos como Outlook</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
