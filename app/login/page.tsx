import LoginForm from "@/components/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Iniciar Sesión | Generador de Firmas de Email",
  description: "Inicia sesión en tu cuenta para acceder al generador de firmas de email",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
          <p className="mt-2 text-gray-600">Accede a tu cuenta para gestionar tus firmas de email</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
