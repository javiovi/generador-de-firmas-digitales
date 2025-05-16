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
  // Verificar si hay una cookie de modo demo
  const cookieStore = cookies()
  const isDemoMode = cookieStore.get("demo_mode")?.value === "true"

  // Solo intentamos autenticar si no estamos en modo demo
  let user = null
  if (!isDemoMode) {
    user = await requireAuth()

    // Si no hay usuario y no estamos en modo demo, verificamos en el middleware
    // El middleware se encargará de la redirección si es necesario
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
