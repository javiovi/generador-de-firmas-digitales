"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { checkAuthClient } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { LogOut, User, Menu, X } from "lucide-react"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/identy-logo-transparente.png"
                alt="Identymail Logo"
                width={180}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/10 text-rose-500">
                      <User size={16} />
                    </div>
                    <span className="hidden md:inline font-medium">{isDemoUser ? "Usuario Demo" : user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-rose-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-rose-500 hover:text-white hover:border-rose-500"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-rose-500 text-white hover:bg-rose-600">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {isLoading ? (
              <div className="h-8 w-full rounded bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <div className="space-y-3 p-3">
                <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/10 text-rose-500">
                    <User size={16} />
                  </div>
                  <span className="font-medium">{isDemoUser ? "Usuario Demo" : user.email}</span>
                </div>
                <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-rose-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-3">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full text-gray-700 border-gray-300">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register" className="w-full">
                  <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
