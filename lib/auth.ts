import { createServerSupabaseClient, createBrowserSupabaseClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Obtener la sesión del usuario actual en el servidor
export async function getSession() {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { user }
}

// Verificar si el usuario está autenticado en el servidor
export async function requireAuth() {
  const { user } = await getSession()

  if (!user) {
    redirect("/login")
  }

  return user
}

// Verificar si el usuario está autenticado en el cliente
export async function checkAuthClient() {
  const supabase = createBrowserSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { user }
}
