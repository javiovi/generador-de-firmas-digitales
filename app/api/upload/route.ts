import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

// Importamos Sharp solo en el servidor
import sharp from "sharp"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "signatures"

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    // Comprimir la imagen en el servidor
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let processedBuffer
    const fileType = file.type.split("/")[1]

    if (fileType === "jpeg" || fileType === "jpg" || fileType === "png") {
      processedBuffer = await sharp(buffer)
        .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer()
    } else {
      processedBuffer = buffer
    }

    // Generar un nombre único para el archivo
    const filename = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`

    // Subir el archivo procesado a Vercel Blob
    const blob = await put(filename, processedBuffer, {
      access: "public",
      contentType: "image/jpeg",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
