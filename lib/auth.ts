import { createServerSupabaseClient, createBrowserSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

// Verificar si el usuario está autenticado en el servidor
// Usando solo el token de servicio de Supabase
export async function requireAuth() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null // En lugar de redirigir, devolvemos null
  }

  return user
}

// Función para redirigir si no hay usuario autenticado
export function redirectToLogin() {
  redirect("/login")
}

// Verificar si el usuario está autenticado en el cliente
export async function checkAuthClient() {
  const supabase = createBrowserSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { user }
}
