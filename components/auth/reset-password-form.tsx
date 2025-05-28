"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()
  const { t, changeLanguage, language } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Por favor, ingresa tu correo electrónico",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const supabase = createBrowserSupabaseClient()

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      })

      if (error) {
        throw error
      }

      setIsSubmitted(true)

      toast({
        title: "Correo enviado",
        description: "Se ha enviado un enlace de restablecimiento a tu correo electrónico",
      })
    } catch (error: any) {
      console.error("Error al restablecer contraseña:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el correo de restablecimiento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-text">{t("resetTitle")}</h2>
          <p className="mt-2 text-gray-600">{t("resetSubtitle")}</p>
        </div>
        {isSubmitted ? (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Correo Enviado</h3>
            <p className="text-gray-600">
              Hemos enviado un enlace de restablecimiento a <strong>{email}</strong>. Por favor, revisa tu bandeja de
              entrada.
            </p>
            <Button onClick={() => router.push("/login")} className="mt-4">
              Volver al Inicio de Sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("sending")}
                </>
              ) : (
                t("sendReset")
              )}
            </Button>

            <div className="text-center text-sm mt-2">
              <Link href="/login" className="text-accent hover:underline">
                {t("backToLogin")}
              </Link>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{t("Change Language")}:</span>
                <button
                  onClick={() => changeLanguage("es")}
                  className={`flex items-center gap-1 rounded px-2 py-1 ${language === "es" ? "bg-rose-100 text-rose-600" : "hover:bg-gray-100"}`}
                  type="button"
                >
                  🇪🇸 {t("spanish")}
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`flex items-center gap-1 rounded px-2 py-1 ${language === "en" ? "bg-rose-100 text-rose-600" : "hover:bg-gray-100"}`}
                  type="button"
                >
                  🇬🇧 {t("english")}
                </button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
