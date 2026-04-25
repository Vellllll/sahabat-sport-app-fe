'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
    const response = await fetch(`${process.env.INTERNAL_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_or_phone_number, password }),
    })

    const data = await response.json()
    console.log(data)

    // Jika NestJS melempar UnauthorizedException atau error lainnya
    if (!response.ok) {
      return { error: data.message || 'Email atau Password salah.' }
    }

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

    // Jika API kamu mengembalikan data user, simpan untuk UI
    if (data.user) {
      cookieStore.set('user_data', JSON.stringify(data.user), { 
        path: '/',
        maxAge: 60 * 60 * 24 * 7 
      })
    }

  } catch (error) {
    console.error('Login Error:', error)
    return { error: 'Gagal terhubung ke server backend.' }
  }

  // 4. Redirect ke dashboard
  redirect('/dashboard')
}