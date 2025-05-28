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
import ReCAPTCHA from "react-google-recaptcha"
import { useLanguage } from "@/lib/i18n/language-context"

const RECAPTCHA_SITE_KEY = "6LcnOk0rAAAAAE5ZNLcPB8hMjJ7BY0CwlDr9IGWG"

export default function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const router = useRouter()
  const { t, changeLanguage, language } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    if (!recaptchaToken) {
      toast({ title: "Error", description: "Completa el reCAPTCHA", variant: "destructive" })
      return
    }

    try {
      setIsLoading(true)
      const supabase = createBrowserSupabaseClient()

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: "Registro exitoso",
        description: "Se ha enviado un correo de confirmación a tu dirección de email",
      })

      router.push("/login")
    } catch (error: any) {
      console.error("Error de registro:", error)
      toast({
        title: "Error de registro",
        description: error.message || "No se pudo completar el registro",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-panel p-6 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text">{t("registerTitle")}</h2>
        <p className="mt-2 text-gray-600">{t("registerSubtitle")}</p>
      </div>
      <Card>
        <CardContent className="pt-6">
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

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={token => setRecaptchaToken(token || "")}
            />

            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("registering")}
                </>
              ) : (
                t("register")
              )}
            </Button>

            <div className="text-center text-sm">
              {t("alreadyAccount")} {" "}
              <Link href="/login" className="text-accent hover:underline">
                {t("login")}
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
        </CardContent>
      </Card>
    </div>
  )
}
