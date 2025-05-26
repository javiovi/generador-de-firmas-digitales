import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// GET - Obtener una firma por ID (verificando que pertenezca al usuario)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Obtener el usuario actual usando el token de sesión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    const { data, error } = await supabase
      .from("signatures")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Signature not found" }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ signature: data })
  } catch (error) {
    console.error("Error fetching signature:", error)
    return NextResponse.json({ error: "Failed to fetch signature" }, { status: 500 })
  }
}

// PUT - Actualizar una firma (verificando que pertenezca al usuario)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Obtener el usuario actual usando el token de sesión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()
    const { name, title, signature_data, logo_url, photo_url } = body

    if (!name || !signature_data) {
      return NextResponse.json({ error: "Name and signature data are required" }, { status: 400 })
    }

    // Primero verificamos que la firma pertenezca al usuario
    const { data: existingSignature, error: fetchError } = await supabase
      .from("signatures")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Signature not found" }, { status: 404 })
      }
      throw fetchError
    }

    if (existingSignature.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("signatures")
      .update({
        name,
        title,
        signature_data,
        logo_url,
        photo_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      throw error
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "Signature not found" }, { status: 404 })
    }

    return NextResponse.json({ signature: data[0] })
  } catch (error) {
    console.error("Error updating signature:", error)
    return NextResponse.json({ error: "Failed to update signature" }, { status: 500 })
  }
}

// DELETE - Eliminar una firma (verificando que pertenezca al usuario)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Obtener el usuario actual usando el token de sesión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Primero verificamos que la firma pertenezca al usuario
    const { data: existingSignature, error: fetchError } = await supabase
      .from("signatures")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Signature not found" }, { status: 404 })
      }
      throw fetchError
    }

    if (existingSignature.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { error } = await supabase.from("signatures").delete().eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting signature:", error)
    return NextResponse.json({ error: "Failed to delete signature" }, { status: 500 })
  }
}
