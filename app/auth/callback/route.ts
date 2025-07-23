import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  console.log("Auth callback called with:", { code, error, error_description, next })

  // Si hay un error, redirigir al login con el error
  if (error) {
    console.error("Auth callback error:", error, error_description)
    const errorUrl = new URL("/login", requestUrl.origin)
    errorUrl.searchParams.set("error", error)
    if (error_description) {
      errorUrl.searchParams.set("error_description", error_description)
    }
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error("Session exchange error:", sessionError)
        const errorUrl = new URL("/login", requestUrl.origin)
        errorUrl.searchParams.set("error", "session_error")
        errorUrl.searchParams.set("error_description", sessionError.message)
        return NextResponse.redirect(errorUrl)
      }

      console.log("Auth callback successful, user:", data.user?.email)
    } catch (err) {
      console.error("Unexpected error in auth callback:", err)
      const errorUrl = new URL("/login", requestUrl.origin)
      errorUrl.searchParams.set("error", "unexpected_error")
      return NextResponse.redirect(errorUrl)
    }
  }

  // URL to redirect to after sign in process completes
  const redirectUrl = new URL(next, requestUrl.origin)
  console.log("Redirecting to:", redirectUrl.toString())
  return NextResponse.redirect(redirectUrl)
}
