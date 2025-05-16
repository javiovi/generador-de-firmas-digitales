"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { setDemoUser } from "@/lib/demo-auth"
import Cookies from "js-cookie"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Usuario de prueba para demostración
      if (email === "demo@example.com" && password === "demo123456") {
        // Establecer cookie para el usuario de demostración
        setDemoUser()

        // También establecer una cookie de modo demo para la página principal
        Cookies.set("demo_mode", "true", { expires: 1 })

        toast({
          title: "Inicio de sesión exitoso",
          description: "Has iniciado sesión con la cuenta de demostración",
        })

        // Usar setTimeout para asegurar que las cookies se establezcan antes de la redirección
        setTimeout(() => {
          window.location.href = "/"
        }, 100)

        return
      }

      const supabase = createBrowserSupabaseClient()

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente",
      })

      // Usar window.location.href en lugar de router.push para forzar una recarga completa
      window.location.href = "/"
    } catch (error: any) {
      console.error("Error de inicio de sesión:", error)
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "No se pudo iniciar sesión. Verifica tus credenciales.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail("demo@example.com")
    setPassword("demo123456")
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-rose-100">
      <div className="mb-8 flex justify-center">
        {!imageError ? (
          <Image
            src="/images/identymail-logo.png"
            alt="Identymail"
            width={220}
            height={70}
            priority
            className="h-auto w-auto"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-16 flex items-center justify-center">
            <h2 className="text-2xl font-bold text-rose-500">Identymail</h2>
          </div>
        )}
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="pt-6 px-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/reset-password" className="text-sm text-rose-500 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-rose-500 text-white hover:bg-rose-600" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
                onClick={handleDemoLogin}
              >
                Usar cuenta de demostración
              </Button>
            </div>

            <div className="text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-sky-500 hover:underline">
                Regístrate
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
