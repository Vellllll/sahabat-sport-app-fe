// app/(auth)/register/actions.ts
'use server'

import { RegisterState, RegisterFields } from './types'
import { serverApiFetch } from '@/lib/server-api'

export async function registerUser(
  prevState: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  const rawData: RegisterFields = {
    name: formData.get('name') as string,
    email_or_phone_number: formData.get('email_or_phone_number') as string,
    password: formData.get('password') as string,
    password_confirmation: formData.get('password_confirmation') as string,
  }

  // 1. Validasi Sederhana Sisi Server
  if (!rawData.name || !rawData.email_or_phone_number || !rawData.password) {
    return { success: false, error: 'Semua kolom wajib diisi!', fields: rawData }
  }

  if (rawData.password !== rawData.password_confirmation) {
    return { success: false, error: 'Konfirmasi password tidak cocok.', fields: rawData }
  }

  try {
    await serverApiFetch('/register', {
      method: 'POST',
      body: rawData,
      withAuth: false,
    })

    return { success: true, message: 'Pendaftaran berhasil! Silakan masuk.' }

  } catch (error: any) {
    console.error("Register Server Action Error:", error);

    // 🟢 REFACTOR UTAMA: Ambil pesan kesalahan spesifik murni dari NestJS
    if (error && typeof error.json === 'function') {
      try {
        const errorPayload = await error.json();
        // Menangkap "Email atau nomor telepon sudah terdaftar!" dari backend
        if (errorPayload && errorPayload.message) {
          return { success: false, error: errorPayload.message, fields: rawData };
        }
      } catch (e) {
        // Fallback jika gagal parse JSON
      }
    }

    if (error?.message) {
      return { success: false, error: error?.message, fields: rawData };
    }

    // Fallback jika terjadi gangguan jaringan murni
    return { success: false, error: 'Koneksi ke server gagal atau data sudah terdaftar.', fields: rawData }
  }
}