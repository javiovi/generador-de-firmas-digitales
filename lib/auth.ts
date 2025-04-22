import { createServerSupabaseClient, createBrowserSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

// Verificar si el usuario está autenticado en el servidor
// Usando solo el token de servicio de Supabase
export async function requireAuth() {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    return user
  } catch (error) {
    console.error("Error requiring auth:", error)
    // En caso de error, redirigir al login
    redirect("/login")
  }
}

// Verificar si el usuario está autenticado en el cliente
export async function checkAuthClient() {
  const supabase = createBrowserSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { user }
}
