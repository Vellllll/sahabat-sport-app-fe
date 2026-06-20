// app/(auth)/login/actions.ts
'use server'

import { cookies } from 'next/headers'
import { serverApiFetch } from '@/lib/server-api'
import { redirect } from 'next/navigation'
import { LoginState } from './types'

export async function authenticate(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  
  const email_or_phone_number = formData.get('email_or_phone_number') as string;
  const password = formData.get('password') as string;
  const remember_me = formData.get('remember_me') === 'on';

  const rawFields = { email_or_phone_number };

  // 1. Validasi Input Dasar
  if (!email_or_phone_number || !password) {
    return { 
      error: 'Email/Nomor Handphone dan Password wajib diisi!', 
      fields: rawFields,
      timestamp: Date.now()
    };
  }

  // flag penanda jika proses login sepenuhnya berhasil menembus API
  let loginSuccessful = false;

  try {
    const data = await serverApiFetch<any>('/login', {
      method: 'POST',
      body: { email_or_phone_number, password },
      withAuth: false,
    });

    const cookieStore = await cookies();
    const maxAgeSeconds = remember_me ? 60 * 60 * 24 * 7 : 60 * 60 * 2; // 7 hari atau 2 jam

    cookieStore.set('session_token', data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    });

    // Nyalakan bendera sukses jika tidak ada error meledak sampai baris ini
    loginSuccessful = true;

  } catch (error: any) {
    console.error("🔥 [Login API Error]:", error);

    // Kupas tuntas error payload JSON dari NestJS
    if (error && typeof error.json === 'function') {
      try {
        const errorPayload = await error.json();
        if (errorPayload && errorPayload.message) {
          return { 
            error: Array.isArray(errorPayload.message) ? errorPayload.message[0] : errorPayload.message, 
            fields: rawFields,
            timestamp: Date.now()
          };
        }
      } catch (e) {}
    }

    if (error?.message) {
      return { error: error.message, fields: rawFields, timestamp: Date.now() };
    }
    
    return { 
      error: 'Kredensial salah atau gagal terhubung ke server.', 
      fields: rawFields,
      timestamp: Date.now()
    };
  }

  // 🟢 KUNCI PEMBERANGUS TS(2366): Eksekusi pengalihan halaman secara eksklusif menggunakan blok pengondisian
  if (loginSuccessful) {
    redirect('/admin');
  }

  // 🟢 FALLBACK RETURN: Mengunci kepastian TypeScript agar fungsi selalu mengembalikan tipe LoginState di segala kondisi
  return {
    success: true,
    error: null,
    timestamp: Date.now()
  };
}