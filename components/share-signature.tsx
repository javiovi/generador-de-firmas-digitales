"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Share2, Copy, Check, Mail } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import type { SignatureData } from "@/components/signature-generator"

interface ShareSignatureProps {
  signatureData: SignatureData
  signatureId?: string
  signatureName: string
}

export default function ShareSignature({ signatureData, signatureId, signatureName }: ShareSignatureProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [shareTab, setShareTab] = useState("link")

  // Generar una URL para compartir (en una implementación real, esta sería una URL válida)
  const generateShareUrl = () => {
    if (!signatureId) {
      return `${window.location.origin}/shared/preview?demo=true`
    }
    return `${window.location.origin}/shared/signature/${signatureId}`
  }

  const shareUrl = generateShareUrl()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)

    toast({
      title: "Enlace copiado",
      description: "El enlace de la firma ha sido copiado al portapapeles",
    })
  }

  const sendInviteEmail = () => {
    if (!recipientEmail) {
      toast({
        title: "Correo requerido",
        description: "Por favor, ingresa un correo electrónico",
        variant: "destructive",
      })
      return
    }

    // Simulación de envío de correo (en una implementación real, se haría una llamada a la API)
    setTimeout(() => {
      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${recipientEmail}`,
      })
      setRecipientEmail("")
      setInviteMessage("")
      setIsDialogOpen(false)
    }, 1000)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <Share2 size={16} />
          Compartir Firma
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir firma</DialogTitle>
          <DialogDescription>
            Comparte tu firma "{signatureName || "Sin nombre"}" con tu equipo o colegas.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" value={shareTab} onValueChange={setShareTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Enlace</TabsTrigger>
            <TabsTrigger value="email">Correo</TabsTrigger>
            <TabsTrigger value="qrcode">Código QR</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Enlace
                </Label>
                <Input id="link" defaultValue={shareUrl} readOnly className="w-full" />
              </div>
              <Button size="sm" className="px-3" onClick={copyToClipboard}>
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Este enlace permite a cualquier persona con acceso ver esta firma y usarla como plantilla.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Correo del destinatario</Label>
              <Input
                id="recipient"
                placeholder="correo@ejemplo.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje (opcional)</Label>
              <Input
                id="message"
                placeholder="He creado una firma que te puede interesar..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
              />
            </div>
            <Button onClick={sendInviteEmail} className="w-full flex items-center gap-2">
              <Mail size={16} />
              Enviar invitación
            </Button>
          </TabsContent>

          <TabsContent value="qrcode" className="flex flex-col items-center justify-center space-y-4 mt-4">
            <div className="border border-border rounded-md p-3 bg-white">
              <QRCodeSVG value={shareUrl} size={200} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Escanea este código QR para acceder a la firma desde cualquier dispositivo.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
