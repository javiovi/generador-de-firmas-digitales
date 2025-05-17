import { toast } from "@/components/ui/use-toast"

export async function uploadFile(file: File, folder = "general"): Promise<string> {
  try {
    // Crear un FormData para enviar el archivo
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    // Enviar el archivo al endpoint de carga
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error uploading file:", errorData)
      throw new Error(errorData.error || "Failed to upload file")
    }

    const data = await response.json()
    console.log("File uploaded successfully:", data.url)
    return data.url
  } catch (error) {
    console.error("Error in uploadFile function:", error)
    toast({
      title: "Error al subir el archivo",
      description: "No se pudo subir el archivo. Por favor, inténtalo de nuevo.",
      variant: "destructive",
    })
    throw error
  }
}

// Función para verificar si una URL es válida
export function isValidImageUrl(url: string): boolean {
  if (!url) return false

  // Verificar si es una URL válida
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// Función para obtener una URL de imagen de respaldo si la original falla
export function getFallbackImageUrl(type: "logo" | "photo" = "logo"): string {
  return type === "logo" ? "/images/default-logo.png" : "/images/default-avatar.png"
}
