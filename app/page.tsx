"use client"

import Image from "next/image"
import SignatureGenerator from "@/components/signature-generator"
import Navbar from "@/components/navbar"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { createBrowserSupabaseClient } from "@/lib/supabase"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si es un usuario de demostración
        const isDemoUser = Cookies.get("demo_user") === "true"

        if (isDemoUser) {
          setIsAuthenticated(true)
          setIsLoading(false)
          setIsLoaded(true)
          return
        }

        // Verificar autenticación con Supabase
        const supabase = createBrowserSupabaseClient()
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          setIsAuthenticated(true)
        } else {
          // Redirigir a login si no hay sesión
          window.location.href = "/login"
          return
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsLoading(false)
        setIsLoaded(true)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto min-h-screen bg-background px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <motion.div
              className="flex justify-center mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {!imageError ? (
                <Image
                  src="/images/identymail-logo.png"
                  alt="Identymail"
                  width={250}
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
            </motion.div>
            <motion.p
              className="text-lg text-text/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              Crea firmas de email profesionales para tu empresa en minutos
            </motion.p>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <SignatureGenerator />
          </motion.div>
        </div>
      </main>
    </>
  )
}
