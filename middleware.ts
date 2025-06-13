import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function middleware(request: NextRequest) {
  // Get the path
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/signup" || path === "/" || path.startsWith("/debug/") // Permitir acesso às páginas de debug

  // Check if user is authenticated by looking for the session cookie
  const session = cookies().get("session")?.value
  const hasValidSession = session && session.length > 0

  // Log para depuração (aparecerá no console do servidor)
  console.log(`[Middleware] Path: ${path}, Public: ${isPublicPath}, Session: ${hasValidSession ? "Valid" : "Invalid/None"}`)

  // If the path is for admin routes, we'll need to verify admin status
  const isAdminPath = path.startsWith("/admin")

  // Always allow access to debug pages
  if (path.startsWith("/debug/")) {
    return NextResponse.next()
  }

  // Redirect logic
  if (!hasValidSession && !isPublicPath) {
    // Redirect to login if trying to access protected route without session
    console.log(`[Middleware] Redirecting to login: No valid session found for protected path ${path}`)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (hasValidSession && (path === "/login" || path === "/signup")) {
    // Redirect to dashboard if already logged in and trying to access login/signup
    console.log(`[Middleware] Redirecting to dashboard: User is logged in and accessing ${path}`)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // For admin routes, you would verify admin status here
  if (isAdminPath) {
    // In a real implementation, you would verify the token and check admin status
    // For now, we'll just let the client-side handle this
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
