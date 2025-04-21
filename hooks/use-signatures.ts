"use client"

import { useState, useCallback } from "react"
import type { SignatureData } from "@/components/signature-generator"
import type { SignatureRecord } from "@/lib/supabase"

export function useSignatures() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signatures, setSignatures] = useState<SignatureRecord[]>([])

  // Cargar todas las firmas
  const loadSignatures = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/signatures")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load signatures")
      }

      setSignatures(data.signatures)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Guardar una firma
  const saveSignature = useCallback(
    async (name: string, title: string, signatureData: SignatureData, logoUrl?: string, photoUrl?: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/signatures", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            title,
            signature_data: signatureData,
            logo_url: logoUrl,
            photo_url: photoUrl,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to save signature")
        }

        return data.signature
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // Cargar una firma por ID
  const loadSignature = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/signatures/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load signature")
      }

      return data.signature
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Actualizar una firma
  const updateSignature = useCallback(
    async (
      id: string,
      name: string,
      title: string,
      signatureData: SignatureData,
      logoUrl?: string,
      photoUrl?: string,
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/signatures/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            title,
            signature_data: signatureData,
            logo_url: logoUrl,
            photo_url: photoUrl,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to update signature")
        }

        return data.signature
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // Eliminar una firma
  const deleteSignature = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/signatures/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete signature")
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    signatures,
    loadSignatures,
    saveSignature,
    loadSignature,
    updateSignature,
    deleteSignature,
  }
}
