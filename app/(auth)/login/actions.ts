'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { serverApiFetch } from '@/lib/server-api'

export async function authenticate(prevState: any, formData: FormData) {
  const email_or_phone_number = formData.get('email_or_phone_number')
  const password = formData.get('password')

  if (!email_or_phone_number || !password) {
    return { error: 'Semua kolom wajib diisi.' }
  }

  // 1. Validasi Input Dasar
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

    // 3. Simpan Token ke Cookie
    const cookieStore = await cookies()
    
    // Simpan JWT Token
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
    return { error: 'Gagal terhubung ke server backend.' }
  }

  // 4. Redirect ke dashboard
  redirect('/')
}