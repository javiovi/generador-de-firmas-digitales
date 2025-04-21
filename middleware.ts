import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refrescar la sesión si existe
  await supabase.auth.getSession()

  // Verificar si el usuario está autenticado para rutas protegidas
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ["/", "/api/signatures"]
  const isProtectedRoute = protectedRoutes.some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith("/api/signatures/"),
  )

  // Rutas de autenticación
  const authRoutes = ["/login", "/register", "/reset-password"]
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname === route)

  // Verificar si hay una cookie de demostración
  const isDemoUser = request.cookies.get("demo_user")?.value === "true"

  // Redirigir a login si no está autenticado y la ruta es protegida
  if (isProtectedRoute && !user && !isDemoUser) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirigir a la página principal si está autenticado y está en una ruta de autenticación
  if (isAuthRoute && (user || isDemoUser)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
