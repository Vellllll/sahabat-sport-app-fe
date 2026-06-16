// app/(auth)/login/actions.ts
'use server'

import { cookies } from 'next/headers' // atau 'next/headers' sesuai Next.js version kamu
import { redirect } from 'next/navigation'
import { serverApiFetch } from '@/lib/server-api'

export async function authenticate(prevState: any, formData: FormData) {
  const email_or_phone_number = formData.get('email_or_phone_number')
  const password = formData.get('password')

  // 1. Validasi Input Dasar Sisi Server
  if (!email_or_phone_number || !password) {
    return { error: 'Email/No. HP dan Password wajib diisi.' }
  }

  try {
    // 2. Hit API Backend Utama (NestJS)
    const data = await serverApiFetch<any>('/login', {
      method: 'POST',
      body: { email_or_phone_number, password },
      withAuth: false,
    })

    // 3. Simpan Token ke Cookie jika Berhasil
    const cookieStore = await cookies()
    
    cookieStore.set('session_token', data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 Hari
    })

    if (data.data?.user) {
      cookieStore.set('user_data', JSON.stringify(data.data.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

  } catch (error: any) {
    console.error("Login Server Action Error:", error);

    // 🟢 REFACTOR UTAMA: Ekstrak error response murni dari NestJS
    // Cek apakah ada object response biner dari serverApiFetch yang membawa payload JSON
    if (error && typeof error.json === 'function') {
      try {
        const errorPayload = await error.json();
        // Ambil "Email/No HP atau password salah" dari body response
        if (errorPayload && errorPayload.message) {
          return { error: errorPayload.message };
        }
      } catch (e) {
        // Fallback jika gagal parse JSON
      }
    }

    // Jika error datang dari kustom response object/custom throw yang sudah di-parse
    if (error?.response?.data?.message) {
      return { error: error?.response?.data?.message };
    }
    
    if (error?.message && error.message.includes('Email/No HP')) {
      return { error: error.message };
    }

    // Fallback jika memang server mati atau gangguan jaringan murni
    return { error: 'Gagal terhubung ke server backend atau password salah.' }
  }

  // 4. Redirect ke dashboard jika sukses melewati try block
  redirect('/')
}