import type { Metadata } from "next"
import SignatureGenerator from "@/components/signature-generator"
import Navbar from "@/components/navbar"
import { requireAuth } from "@/lib/auth"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Generador de Firmas de Email",
  description: "Crea firmas de email profesionales para tu empresa",
}

export default async function Home() {
  // Verificar si es un usuario de demostración
  const cookieStore = cookies()
  const isDemoUser = cookieStore.get("demo_user")?.value === "true"

  // Solo verificar autenticación si no es un usuario de demostración
  if (!isDemoUser) {
    await requireAuth()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen p-4 md:p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Generador de Firmas de Email</h1>
            <p className="text-gray-600">Crea firmas de email profesionales para tu empresa</p>
          </header>

          <SignatureGenerator />
        </div>
      </main>
    </>
  )
}
