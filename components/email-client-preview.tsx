"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import type { SignatureData } from "@/components/signature-generator"

interface EmailClientPreviewProps {
  signatureData: SignatureData
  htmlCode: string
}

export default function EmailClientPreview({ signatureData, htmlCode }: EmailClientPreviewProps) {
  const [activeClient, setActiveClient] = useState("gmail")

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Vista previa en clientes de correo</h2>
        <Tabs value={activeClient} onValueChange={setActiveClient}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="gmail">Gmail</TabsTrigger>
            <TabsTrigger value="outlook">Outlook</TabsTrigger>
            <TabsTrigger value="thunderbird">Thunderbird</TabsTrigger>
          </TabsList>

          <TabsContent value="gmail" className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <div className="bg-[#f2f2f2] p-3 border-b flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-4 text-sm font-medium text-gray-700">Nuevo mensaje - Gmail</div>
              </div>
              <div className="p-4 bg-white">
                <div className="border-b pb-3 mb-3">
                  <div className="flex items-center mb-2">
                    <div className="w-20 text-sm text-gray-600">Para:</div>
                    <div className="flex-1 text-sm">destinatario@ejemplo.com</div>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-20 text-sm text-gray-600">Asunto:</div>
                    <div className="flex-1 text-sm">Asunto del correo</div>
                  </div>
                </div>
                <div className="min-h-[200px] text-sm mb-3">
                  <p className="mb-4">Hola,</p>
                  <p className="mb-4">Este es un ejemplo de cómo se vería tu firma en Gmail.</p>
                  <p className="mb-4">Saludos cordiales,</p>
                </div>
                <div className="border-t pt-3">
                  <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Nota:</strong> Gmail puede eliminar algunos estilos CSS y modificar la estructura HTML. Esta
                vista previa es aproximada.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="outlook" className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <div className="bg-[#0078d4] p-3 border-b flex items-center">
                <div className="text-sm font-medium text-white">Mensaje - Outlook</div>
              </div>
              <div className="p-4 bg-white">
                <div className="border-b pb-3 mb-3">
                  <div className="flex items-center mb-2">
                    <div className="w-20 text-sm text-gray-600">Para:</div>
                    <div className="flex-1 text-sm">destinatario@ejemplo.com</div>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-20 text-sm text-gray-600">Cc:</div>
                    <div className="flex-1 text-sm"></div>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-20 text-sm text-gray-600">Asunto:</div>
                    <div className="flex-1 text-sm">Asunto del correo</div>
                  </div>
                </div>
                <div className="min-h-[200px] text-sm mb-3">
                  <p className="mb-4">Hola,</p>
                  <p className="mb-4">Este es un ejemplo de cómo se vería tu firma en Outlook.</p>
                  <p className="mb-4">Saludos cordiales,</p>
                </div>
                <div className="border-t pt-3">
                  <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Nota:</strong> Outlook tiene limitaciones significativas con CSS. Las etiquetas style y media
                queries no son soportadas. Esta vista previa es aproximada.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="thunderbird" className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <div className="bg-[#eeeeee] p-3 border-b flex items-center">
                <div className="text-sm font-medium text-gray-700">Redactar: (sin asunto) - Thunderbird</div>
              </div>
              <div className="p-4 bg-white">
                <div className="border-b pb-3 mb-3">
                  <div className="flex items-center mb-2">
                    <div className="w-20 text-sm text-gray-600">De:</div>
                    <div className="flex-1 text-sm">{signatureData.email}</div>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-20 text-sm text-gray-600">Para:</div>
                    <div className="flex-1 text-sm">destinatario@ejemplo.com</div>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-20 text-sm text-gray-600">Asunto:</div>
                    <div className="flex-1 text-sm">Asunto del correo</div>
                  </div>
                </div>
                <div className="min-h-[200px] text-sm mb-3">
                  <p className="mb-4">Hola,</p>
                  <p className="mb-4">Este es un ejemplo de cómo se vería tu firma en Thunderbird.</p>
                  <p className="mb-4">Saludos cordiales,</p>
                </div>
                <div className="border-t pt-3">
                  <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Nota:</strong> Thunderbird tiene mejor soporte para HTML y CSS que otros clientes, pero aún así
                puede haber diferencias. Esta vista previa es aproximada.
              </p>
              <p className="mt-2">
                <strong>Consejo:</strong> Para Thunderbird, es recomendable usar la opción "Usar HTML" en la
                configuración de firma y pegar directamente el código HTML.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
