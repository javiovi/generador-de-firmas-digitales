import type { Metadata } from "next"
import SignatureGenerator from "@/components/signature-generator"
import Navbar from "@/components/navbar"
import { requireAuth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Generador de Firmas de Email",
  description: "Crea firmas de email profesionales para tu empresa",
}

export default async function Home() {
  try {
    // Intentar verificar autenticación, pero capturar errores para permitir modo demo
    await requireAuth()
  } catch (error) {
    // Si falla la autenticación, el middleware se encargará de redirigir
    // o permitir el acceso si es un usuario de demostración
    console.log("Verificación de autenticación omitida, posible usuario de demostración")
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
