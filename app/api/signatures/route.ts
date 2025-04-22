import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET - Obtener todas las firmas del usuario actual
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Obtener el usuario actual directamente de Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("signatures")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ signatures: data })
  } catch (error) {
    console.error("Error fetching signatures:", error)
    return NextResponse.json({ error: "Failed to fetch signatures" }, { status: 500 })
  }
}

// POST - Crear una nueva firma para el usuario actual
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Obtener el usuario actual directamente de Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, title, signature_data, logo_url, photo_url } = body

    if (!name || !signature_data) {
      return NextResponse.json({ error: "Name and signature data are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("signatures")
      .insert({
        name,
        title,
        signature_data,
        logo_url,
        photo_url,
        user_id: user.id,
      })
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ signature: data[0] })
  } catch (error) {
    console.error("Error creating signature:", error)
    return NextResponse.json({ error: "Failed to create signature" }, { status: 500 })
  }
}
