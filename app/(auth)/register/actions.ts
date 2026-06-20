// app/(auth)/register/actions.ts
'use server'

import { RegisterState, RegisterFields } from './types'
import { serverApiFetch } from '@/lib/server-api'
import { z } from 'zod'

const RegisterSchema = z.object({
  name: z
    .string()
    .min(1, "Nama lengkap wajib diisi")
    .transform((val) => val.trim()),
  
  email_or_phone_number: z
    .string()
    .min(1, "Email atau Nomor Telepon wajib diisi")
    .transform((val) => val.trim()),
    
  password: z
    .string()
    .min(8, "Password minimal harus 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar (kapital)")
    .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung minimal 1 simbol (contoh: @, $, !, %, *, #, ?, &)"),
    
  password_confirmation: z
    .string()
    .min(1, "Konfirmasi password wajib diisi")
}).refine((data) => data.password === data.password_confirmation, {
  message: "Konfirmasi password tidak cocok",
  path: ["password_confirmation"],
});

export async function registerUser(
  _prevState: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  
  const rawFields: RegisterFields = {
    name: (formData.get('name') || '') as string,
    email_or_phone_number: (formData.get('email_or_phone_number') || '') as string,
    password: (formData.get('password') || '') as string,
    password_confirmation: (formData.get('password_confirmation') || '') as string,
  }

  const validation = RegisterSchema.safeParse(rawFields);
  
  if (!validation.success) {
    const firstErrorMessage = validation.error.issues[0].message;
    return { 
      success: false, 
      error: firstErrorMessage, 
      fields: rawFields,
      timestamp: Date.now()
    };
  }

  try {
    await serverApiFetch('/register', {
      method: 'POST',
      body: validation.data,
      withAuth: false,
    })

    return { success: true, message: 'Pendaftaran berhasil! Silakan masuk.', timestamp: Date.now() }

  } catch (error: any) {
    console.error("🔥 [Register API Error]:", error);

    if (error && typeof error.json === 'function') {
      try {
        const errorPayload = await error.json();
        if (errorPayload && errorPayload.message) {
          return { 
            success: false, 
            error: Array.isArray(errorPayload.message) ? errorPayload.message[0] : errorPayload.message, 
            fields: rawFields,
            timestamp: Date.now()
          };
        }
      } catch (e) {}
    }

    if (error?.message) return { success: false, error: error.message, fields: rawFields, timestamp: Date.now() };

    return { success: false, error: 'Koneksi ke server gagal atau data sudah terdaftar.', fields: rawFields, timestamp: Date.now() }
  }
}