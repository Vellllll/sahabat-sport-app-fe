// app/api/auth/check/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isTokenExpired } from '@/lib/auth';
import { getPermissionsForRole } from '@/lib/rbac/permissions';
import { getRoleFromToken } from '@/lib/rbac/jwt';
import type { SessionUser } from '@/lib/rbac/types';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token || isTokenExpired(token)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/auth`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (res.status === 401) {
      cookieStore.delete('session_token');
      cookieStore.delete('user_data');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (!res.ok) throw new Error();

    const payload = await res.json();
    const user = payload?.data?.user as SessionUser | undefined;
    const role = user?.role ?? getRoleFromToken(token);

    if (user) {
      cookieStore.set('user_data', JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user,
      permissions: getPermissionsForRole(role),
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
