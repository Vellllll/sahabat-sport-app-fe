// app/(auth)/register/actions.ts
'use server'

import { RegisterState, RegisterFields } from './types'
import { serverApiFetch } from '@/lib/server-api'
import { z } from 'zod' // Pastikan zod di-import

// 🟢 REFACTOR UTAMA: Definisikan Skema Validasi Password Super Ketat
const RegisterPasswordSchema = z
  .string()
  .min(8, "Password minimal harus 8 karakter")
  .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar (kapital)")
  .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
  .regex(/[0-9]/, "Password harus mengandung minimal 1 angka")
  .regex(/[^A-Za-z0-9]/, "Password harus mengandung minimal 1 simbol (contoh: @, $, !, %, *, #, ?, &)");

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

  // 1. Validasi Kolom Kosong Dasar
  if (!rawData.name || !rawData.email_or_phone_number || !rawData.password) {
    return { success: false, error: 'Semua kolom wajib diisi!', fields: rawData }
  }

  // 2. Validasi Konfirmasi Password Cocok
  if (rawData.password !== rawData.password_confirmation) {
    return { success: false, error: 'Konfirmasi password tidak cocok.', fields: rawData }
  }

  // 🟢 3. EKSEKUSI VALIDASI PASSWORD DENGAN SKEMA BARU
  const passwordValidation = RegisterPasswordSchema.safeParse(rawData.password);
  
  if (!passwordValidation.success) {
    const firstPasswordError = passwordValidation.error.issues[0].message;
    return { 
      success: false, 
      error: firstPasswordError, 
      fields: rawData 
    };
  }

  try {
    // Jalankan ke backend NestJS jika lolos saringan keamanan ketat Next.js
    await serverApiFetch('/register', {
      method: 'POST',
      body: rawData,
      withAuth: false,
    })

    return { success: true, message: 'Pendaftaran berhasil! Silakan masuk.' }

  } catch (error: any) {
    console.error("Register Server Action Error:", error);

    if (error && typeof error.json === 'function') {
      try {
        const errorPayload = await error.json();
        if (errorPayload && errorPayload.message) {
          return { success: false, error: errorPayload.message, fields: rawData };
        }
      } catch (e) {}
    }

    if (error) {
      return { success: false, error: error.message, fields: rawData };
    }

    return { success: false, error: 'Koneksi ke server gagal atau data sudah terdaftar.', fields: rawData }
  }
}