// app/api/auth/check/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    // Panggil endpoint validasi token ringan di backend Anda (misal: /me atau /validate)
    const res = await fetch(`${API_URL}/auth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (res.status === 401) {
      // Jika backend bilang expired, hapus cookie langsung di sini
      cookieStore.delete('session_token');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (!res.ok) throw new Error();

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}