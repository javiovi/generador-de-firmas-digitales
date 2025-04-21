import ResetPasswordForm from "@/components/auth/reset-password-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Restablecer Contraseña | Generador de Firmas de Email",
  description: "Restablece tu contraseña para acceder a tu cuenta",
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Restablecer Contraseña</h1>
          <p className="mt-2 text-gray-600">Ingresa tu correo electrónico para recibir un enlace de restablecimiento</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
