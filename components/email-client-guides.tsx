"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface EmailClientGuidesProps {
  htmlCode: string
}

export default function EmailClientGuides({ htmlCode }: EmailClientGuidesProps) {
  const [copied, setCopied] = useState(false)

  const copyHtmlToClipboard = () => {
    navigator.clipboard.writeText(htmlCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Código copiado",
      description: "El código HTML ha sido copiado al portapapeles.",
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Guías de Exportación</h2>
        <Tabs defaultValue="gmail" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="gmail">Gmail</TabsTrigger>
            <TabsTrigger value="outlook">Outlook</TabsTrigger>
            <TabsTrigger value="apple">Apple Mail</TabsTrigger>
            <TabsTrigger value="thunderbird">Thunderbird</TabsTrigger>
          </TabsList>

          <TabsContent value="gmail" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Cómo añadir tu firma en Gmail:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Abre Gmail y haz clic en el icono de engranaje (⚙️) en la esquina superior derecha.</li>
                <li>Selecciona "Ver todos los ajustes".</li>
                <li>En la pestaña "General", desplázate hacia abajo hasta la sección "Firma".</li>
                <li>Haz clic en "Crear nueva" si no tienes una firma, o selecciona una existente para editarla.</li>
                <li>
                  <div className="flex items-center gap-2">
                    <span>Copia el código HTML de tu firma:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyHtmlToClipboard}
                      className="flex items-center gap-1 h-7 px-2"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                </li>
                <li>
                  En Gmail, haz clic en el botón "&lt;&gt;" (Insertar HTML) en la barra de herramientas del editor de
                  firma.
                </li>
                <li>Pega el código HTML y haz clic en "Insertar".</li>
                <li>Haz clic en "Guardar cambios" en la parte inferior de la página.</li>
              </ol>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                <p className="text-sm">
                  <strong>Nota:</strong> Gmail puede eliminar algunos estilos CSS. Si notas que tu firma no se ve
                  exactamente como en la vista previa, es posible que necesites ajustar algunos elementos manualmente.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="outlook" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Cómo añadir tu firma en Outlook:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Abre Outlook y haz clic en "Archivo" en la esquina superior izquierda.</li>
                <li>Selecciona "Opciones" y luego "Correo".</li>
                <li>Desplázate hacia abajo hasta la sección "Redactar mensajes" y haz clic en "Firmas...".</li>
                <li>Haz clic en "Nuevo" para crear una nueva firma o selecciona una existente para editarla.</li>
                <li>
                  <div className="flex items-center gap-2">
                    <span>Copia el código HTML de tu firma:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyHtmlToClipboard}
                      className="flex items-center gap-1 h-7 px-2"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                </li>
                <li>Guarda tu firma como archivo HTML: descarga el archivo HTML desde la pestaña "Código".</li>
                <li>
                  En Outlook, haz clic con el botón derecho en el editor de firma y selecciona "HTML" {"->"} "Editar
                  HTML".
                </li>
                <li>Pega el código HTML y haz clic en "Aceptar".</li>
                <li>Haz clic en "Guardar" y luego en "Aceptar".</li>
              </ol>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                <p className="text-sm">
                  <strong>Alternativa:</strong> Si el método anterior no funciona, puedes abrir un nuevo correo en
                  Outlook, hacer clic en "Firma" {"->"} "Firmas", y luego seguir los pasos anteriores.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="apple" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Cómo añadir tu firma en Apple Mail:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Abre la aplicación Mail en tu Mac.</li>
                <li>Haz clic en "Mail" en la barra de menú y selecciona "Preferencias...".</li>
                <li>Haz clic en la pestaña "Firmas".</li>
                <li>Selecciona la cuenta de correo a la que deseas añadir la firma.</li>
                <li>Haz clic en el botón "+" para crear una nueva firma.</li>
                <li>
                  <div className="flex items-center gap-2">
                    <span>Copia el código HTML de tu firma:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyHtmlToClipboard}
                      className="flex items-center gap-1 h-7 px-2"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                </li>
                <li>Abre un editor de texto como TextEdit y pega el código HTML.</li>
                <li>Guarda el archivo como HTML y ábrelo en Safari.</li>
                <li>Selecciona todo (Cmd+A) y cópialo (Cmd+C).</li>
                <li>Vuelve a Mail, selecciona la firma que creaste y pega (Cmd+V).</li>
                <li>Cierra la ventana de preferencias para guardar los cambios.</li>
              </ol>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                <p className="text-sm">
                  <strong>Nota:</strong> Apple Mail puede simplificar el HTML y eliminar algunos estilos.
                  Alternativamente, puedes exportar tu firma como imagen y añadirla como imagen en Apple Mail.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="thunderbird" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Cómo añadir tu firma en Thunderbird:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Abre Thunderbird y haz clic en "Herramientas" en la barra de menú y selecciona "Configuración de
                  cuenta".
                </li>
                <li>Selecciona la cuenta de correo a la que deseas añadir la firma.</li>
                <li>En el panel derecho, desplázate hacia abajo para encontrar la sección "Firma de texto".</li>
                <li>Marca la casilla "Usar HTML" para habilitar el formato HTML en tu firma.</li>
                <li>
                  <div className="flex items-center gap-2">
                    <span>Copia el código HTML de tu firma:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyHtmlToClipboard}
                      className="flex items-center gap-1 h-7 px-2"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                </li>
                <li>Pega el código HTML directamente en el cuadro de texto de la firma.</li>
                <li>Haz clic en "Aceptar" para guardar los cambios.</li>
              </ol>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                <p className="text-sm">
                  <strong>Nota:</strong> Thunderbird tiene buen soporte para HTML, pero algunas características CSS
                  avanzadas pueden no funcionar correctamente. Si notas algún problema con el diseño, considera
                  simplificar los estilos o usar una versión más básica de la firma.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
