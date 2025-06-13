
import { NextRequest, NextResponse } from 'next/server'

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/signup', 
  '/debug/env',
  '/debug/firebase',
  '/debug/auth',
  '/debug/setup-admin'
]

// Rotas protegidas que precisam de autenticação
const protectedRoutes = [
  '/dashboard',
  '/editor', 
  '/profile',
  '/projects',
  '/admin'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('session')?.value

  console.log(`[Middleware] Path: ${pathname}, Public: ${isPublicRoute(pathname)}, Session: ${sessionCookie ? 'Valid' : 'Invalid/None'}`)

  // Se é uma rota pública, permitir acesso
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Se é uma rota protegida e não tem sessão, redirecionar para login
  if (isProtectedRoute(pathname) && !sessionCookie) {
    console.log(`[Middleware] Redirecting to login from ${pathname}`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se tem sessão mas está tentando acessar login/signup, redirecionar para dashboard
  if (sessionCookie && (pathname === '/login' || pathname === '/signup')) {
    console.log(`[Middleware] Redirecting to dashboard from ${pathname}`)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}
