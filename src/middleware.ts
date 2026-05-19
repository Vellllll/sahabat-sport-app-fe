// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const arrayToken = token.split('.');
    if (arrayToken.length !== 3) return true;
    
    const payload = JSON.parse(Buffer.from(arrayToken[1], 'base64').toString());
    if (!payload.exp) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  // Tentukan rute mana saja yang butuh proteksi ketat (misal halaman admin atau checkout)
  const isProtectedPath = pathname.startsWith('/admin') || pathname.startsWith('/checkout');

  if (isProtectedPath) {
    if (!token || isTokenExpired(token)) {
      // Jika token tidak ada atau sudah mati, redirect ke login
      const loginUrl = new URL('/login', request.url);
      
      // Buat response redirect
      const response = NextResponse.redirect(loginUrl);
      
      // Hapus cookie yang kedaluwarsa dari browser lewat header response
      response.cookies.delete('session_token');
      
      return response;
    }
  }

  return NextResponse.next();
}

// Konfigurasi agar middleware tidak mengecek file statis/assets
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};