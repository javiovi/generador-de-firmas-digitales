"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { setAuthSession } from "@/lib/auth-helper"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const router = useRouter()
  const { t, changeLanguage, language } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: t("errorLogin"),
        description: t("errorLoginMessage"),
        variant: "destructive",
      })
      return
    }

    // Validación local
    if (email === "admin@rubrica.com" && password === "admin123") {
      localStorage.setItem("isLoggedIn", "true")
      console.log("isLoggedIn guardado en localStorage")
      toast({
        title: t("successLogin"),
        description: t("successLoginMessage"),
      })
      setTimeout(() => {
        window.location.href = "/"
      }, 500)
      return
    } else {
      toast({
        title: t("errorLogin"),
        description: "Usuario o contraseña incorrectos.",
        variant: "destructive",
      })
      return
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleGoogleLogin = async () => {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) {
      console.error("Error al iniciar sesión con Google:", error);
      toast({ title: t("errorLogin"), description: "Error al iniciar sesión con Google.", variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-rose-100">
      <div className="flex justify-center">
        <Image
          src="/images/rubrica-logo.png"
          alt="Rubrica Logo"
          width={320}
          height={200}
          priority
          className="h-30 w-auto"
        />
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="pt-6 px-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link href="/reset-password" className="text-sm text-rose-500 hover:underline">
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-rose-500 text-white hover:bg-rose-600"
              disabled={isLoading || loginSuccess}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("loggingIn")}
                </>
              ) : loginSuccess ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("redirecting")}
                </>
              ) : (
                t("login")
              )}
            </Button>

            <Button type="button" variant="outline" className="w-full mt-2" onClick={handleGoogleLogin} disabled={isLoading}>
              {t("loginWithGoogle")}
            </Button>
         

            <div className="text-center text-sm">
              {t("noAccount")}{" "}
              <Link href="/register" className="text-sky-500 hover:underline">
                {t("signUp")}
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
