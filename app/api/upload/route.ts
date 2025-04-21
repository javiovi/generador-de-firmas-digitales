import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "signatures"

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    // Generar un nombre único para el archivo
    const filename = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`

    // Subir el archivo a Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
