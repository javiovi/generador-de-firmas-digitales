import { put } from "@vercel/blob"

export async function uploadImageToBlob(file: File, folder: string): Promise<string> {
  try {
    // Generar un nombre único para el archivo
    const filename = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`

    // Subir el archivo a Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("Error uploading image to Blob:", error)
    throw new Error("Failed to upload image")
  }
}
