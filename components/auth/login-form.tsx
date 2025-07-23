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

  // Detectar mensajes de error/info de la URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const message = urlParams.get("message")
      const messageType = urlParams.get("message_type")
      const error = urlParams.get("error")
      const errorDescription = urlParams.get("error_description")

      if (message === "email_link_expired") {
        toast({
          title: "Enlace expirado",
          description: "El enlace de confirmación ha expirado. Tu cuenta fue creada correctamente, puedes iniciar sesión normalmente.",
          variant: messageType === "warning" ? "default" : "destructive",
        })
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } else if (error) {
        toast({
          title: "Error de autenticación",
          description: errorDescription || "Ocurrió un error durante la autenticación",
          variant: "destructive",
        })
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [])

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

    try {
      setIsLoading(true)
      const supabase = createBrowserSupabaseClient()

      // Intentar login con Supabase primero
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Si falla, intentar con credenciales locales como fallback
        if (email === "admin@rubrica.com" && password === "admin123") {
          localStorage.setItem("isLoggedIn", "true")
          console.log("isLoggedIn guardado en localStorage")
          toast({
            title: t("successLogin"),
            description: t("successLoginMessage"),
          })
          setLoginSuccess(true)
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 500)
          return
        } else {
          throw error
        }
      }

      // Login exitoso con Supabase
      if (data?.user) {
        localStorage.setItem("isLoggedIn", "true")
        toast({
          title: t("successLogin"),
          description: t("successLoginMessage"),
        })
        setLoginSuccess(true)
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 500)
      }

    } catch (error: any) {
      console.error("Error de login:", error)
      
      let errorMessage = "Usuario o contraseña incorrectos."
      
      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email o contraseña incorrectos."
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Por favor, confirma tu email antes de iniciar sesión."
        } else if (error.message.includes("fetch")) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet e intenta de nuevo."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: t("errorLogin"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      const supabase = createBrowserSupabaseClient();
      
      // Determinar la URL correcta para la redirección
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://www.rubrica.ar' 
        : window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { 
          redirectTo: `${baseUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error("Error al iniciar sesión con Google:", error);
        throw error;
      }
      
      // El usuario será redirigido automáticamente
    } catch (error: any) {
      console.error("Error completo de Google Auth:", error);
      toast({ 
        title: t("errorLogin"), 
        description: error.message || "Error al iniciar sesión con Google. Verifica tu conexión e intenta de nuevo.", 
        variant: "destructive" 
      });
      setIsLoading(false)
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
