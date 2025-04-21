import RegisterForm from "@/components/auth/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Registrarse | Generador de Firmas de Email",
  description: "Crea una cuenta para utilizar el generador de firmas de email",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Crear Cuenta</h1>
          <p className="mt-2 text-gray-600">Regístrate para comenzar a crear y gestionar tus firmas de email</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
