"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { checkAuthClient } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Cookies from "js-cookie"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isDemoUser, setIsDemoUser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si es un usuario de demostración
        const demoUser = Cookies.get("demo_user") === "true"
        setIsDemoUser(demoUser)

        if (demoUser) {
          setUser({ email: "demo@example.com" })
          setIsLoading(false)
          return
        }

        const { user } = await checkAuthClient()
        setUser(user)
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Suscribirse a cambios de autenticación
    const supabase = createBrowserSupabaseClient()
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        setIsDemoUser(false)
      } else if (!Cookies.get("demo_user")) {
        setUser(null)
        setIsDemoUser(false)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      if (isDemoUser) {
        // Eliminar la cookie de demostración
        Cookies.remove("demo_user")
        setIsDemoUser(false)
        setUser(null)

        toast({
          title: "Sesión cerrada",
          description: "Has cerrado la sesión de demostración correctamente",
        })

        router.push("/login")
        return
      }

      const supabase = createBrowserSupabaseClient()
      await supabase.auth.signOut()

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })

      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Generador de Firmas
            </Link>
          </div>

          <div className="flex items-center">
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User size={18} />
                    <span className="hidden md:inline">{isDemoUser ? "Usuario Demo" : user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button>Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
