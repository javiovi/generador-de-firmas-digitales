import UpdatePasswordForm from "@/components/auth/update-password-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Actualizar Contraseña | Generador de Firmas de Email",
  description: "Actualiza tu contraseña para acceder a tu cuenta",
}

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <UpdatePasswordForm />
      </div>
    </div>
  )
}
