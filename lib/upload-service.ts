import sharp from "sharp"

export async function uploadFile(file: File, folder = "signatures"): Promise<string> {
  try {
    // Convertir el archivo a un buffer para procesarlo con sharp
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Procesar la imagen con sharp para comprimirla
    let processedBuffer
    const fileType = file.type.split("/")[1] // Obtener el formato (jpeg, png, etc.)

    if (fileType === "jpeg" || fileType === "jpg" || fileType === "png") {
      // Comprimir la imagen manteniendo una buena calidad
      processedBuffer = await sharp(buffer)
        .resize(1000, 1000, { fit: "inside", withoutEnlargement: true }) // Redimensionar si es muy grande
        .jpeg({ quality: 80 }) // Comprimir con calidad 80%
        .toBuffer()
    } else {
      // Si no es un formato que podamos comprimir, usar el buffer original
      processedBuffer = buffer
    }

    // Crear un nuevo File con el buffer procesado
    const processedFile = new File([processedBuffer], file.name, { type: "image/jpeg" })

    const formData = new FormData()
    formData.append("file", processedFile)
    formData.append("folder", folder)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to upload file")
    }

    return data.url
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}
