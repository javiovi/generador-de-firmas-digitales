// Este archivo se ejecuta en el cliente, no debe usar Sharp directamente

export async function uploadFile(file: File, folder = "signatures"): Promise<string> {
  try {
    // Simplemente enviamos el archivo al servidor y dejamos que el servidor
    // se encargue de la compresión con Sharp
    const formData = new FormData()
    formData.append("file", file)
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
