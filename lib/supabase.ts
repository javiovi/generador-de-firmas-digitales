import { createClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Tipos para nuestra base de datos
export type SignatureRecord = {
  id: string
  name: string
  title: string
  signature_data: any
  logo_url: string | null
  photo_url: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      signatures: {
        Row: SignatureRecord
        Insert: Omit<SignatureRecord, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<SignatureRecord, "id" | "created_at" | "updated_at">>
      }
    }
  }
}

// Cliente para el servidor - sin usar cookies
export const createServerSupabaseClient = () => {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Cliente para el navegador (con auth helpers)
export const createBrowserSupabaseClient = () => {
  return createClientComponentClient<Database>()
}

// Cliente legacy (para compatibilidad)
export const createLegacyBrowserSupabaseClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
