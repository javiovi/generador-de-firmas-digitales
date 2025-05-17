import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Rutas que no requieren autenticación
const publicRoutes = ["/login", "/register", "/reset-password", "/update-password", "/auth/callback"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar si el usuario está en modo demo
  const isDemoMode = req.cookies.get("demo_mode")?.value === "true"

  // Si está en modo demo, permitir acceso a todas las rutas
  if (isDemoMode) {
    return res
  }

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    return res
  }

  // Verificar autenticación para rutas protegidas
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si no hay usuario y no es una ruta pública, redirigir al login
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Configurar el middleware para ejecutarse en todas las rutas excepto _next y api
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
}
