// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRequiredPermissionForPath, hasPermission } from '@/lib/rbac/permissions';
import { decodeJwtPayload } from '@/lib/rbac/jwt';
import type { UserRole } from '@/lib/rbac/types';

function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

function getRoleFromRequest(request: NextRequest): UserRole | null {
  const token = request.cookies.get('session_token')?.value;
  if (token) {
    const role = decodeJwtPayload(token)?.role;
    if (role) return role;
  }

  const userData = request.cookies.get('user_data')?.value;
  if (!userData) return null;

  try {
    const user = JSON.parse(userData) as { role?: UserRole | null };
    return user.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedPath = pathname.startsWith('/admin') || pathname.startsWith('/checkout');

  if (isProtectedPath) {
    if (!token || isTokenExpired(token)) {
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('session_token');
      response.cookies.delete('user_data');
      return response;
    }

    if (pathname.startsWith('/admin')) {
      const requiredPermission = getRequiredPermissionForPath(pathname);
      const role = getRoleFromRequest(request);

      if (requiredPermission && !hasPermission(role, requiredPermission)) {
        const homeUrl = new URL('/?error=unauthorized', request.url);
        return NextResponse.redirect(homeUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
