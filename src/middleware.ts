import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')

  // Jika user belum login dan mencoba akses dashboard
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Jika user sudah login tapi mencoba akses halaman login/register lagi
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Tentukan halaman mana saja yang butuh diproteksi
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/login', '/register'],
}