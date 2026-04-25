'use server'

import { RegisterState, RegisterFields } from './types'

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

  // 1. Validasi Sederhana
  if (!rawData.name || !rawData.email_or_phone_number || !rawData.password) {
    return { success: false, error: 'Semua kolom wajib diisi!', fields: rawData }
  }

  if (rawData.password !== rawData.password_confirmation) {
    return { success: false, error: 'Konfirmasi password tidak cocok.', fields: rawData }
  }

  try {
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(rawData),
    })

    const result = await response.json()

    if (!response.ok) {
      return { 
        success: false,
        error: result.message || 'Pendaftaran gagal.', 
        fields: rawData 
      }
    }

    return { success: true, message: 'Pendaftaran berhasil! Silakan masuk.' }

  } catch (e) {
    return { success: false, error: 'Koneksi ke server gagal.', fields: rawData }
  }
}