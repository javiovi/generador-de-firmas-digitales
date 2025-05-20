import { createBrowserSupabaseClient } from "./supabase"

const STORAGE_KEY = 'sb-session'

export const setAuthSession = async (access_token: string, refresh_token: string) => {
  try {
    // Guardar la sesión completa en localStorage
    const sessionData = {
      access_token,
      refresh_token,
      expires_at: Date.now() + 3600 * 1000, // 1 hora
      provider_token: null,
      provider_refresh_token: null,
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))
    
    // También guardar tokens individuales como respaldo
    localStorage.setItem("sb-access-token", access_token)
    localStorage.setItem("sb-refresh-token", refresh_token)
    
    return true
  } catch (error) {
    console.error("Error guardando tokens:", error)
    return false
  }
}

export const getAuthSession = async () => {
  try {
    const supabase = createBrowserSupabaseClient()
    
    // Primero intentar obtener la sesión de Supabase
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (session) {
      console.log("Sesión encontrada en Supabase")
      return session
    }

    if (error) {
      console.error("Error obteniendo sesión de Supabase:", error)
    }

    // Si no hay sesión, intentar recuperar del localStorage
    const storedSession = localStorage.getItem(STORAGE_KEY)
    const access_token = localStorage.getItem("sb-access-token")
    const refresh_token = localStorage.getItem("sb-refresh-token")

    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession)
        console.log("Intentando restaurar sesión desde localStorage")
        const { data: { session: restoredSession }, error: restoreError } = 
          await supabase.auth.setSession(sessionData)

        if (restoreError) {
          console.error("Error restaurando sesión:", restoreError)
        } else if (restoredSession) {
          console.log("Sesión restaurada exitosamente")
          return restoredSession
        }
      } catch (e) {
        console.error("Error parseando sesión almacenada:", e)
      }
    }

    // Como último recurso, intentar con los tokens individuales
    if (access_token && refresh_token) {
      console.log("Intentando restaurar sesión con tokens individuales")
      const { data: { session: tokenSession }, error: tokenError } = 
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

      if (tokenError) {
        console.error("Error restaurando sesión con tokens:", tokenError)
      } else if (tokenSession) {
        console.log("Sesión restaurada con tokens individuales")
        return tokenSession
      }
    }

    console.log("No se pudo recuperar la sesión")
    return null
  } catch (error) {
    console.error("Error en getAuthSession:", error)
    return null
  }
} 