// app/(storefront)/checkout/[id]/actions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function uploadPaymentReceipt(transactionId: string, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' };

  try {
    // Menembak endpoint NestJS Anda: POST /transactions/:id/pay
    const res = await fetch(`${API_URL}/transactions/${transactionId}/pay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // ⚠️ PENTING: Jangan tulis 'Content-Type': 'multipart/form-data' secara manual di sini.
        // Biarkan fetch browser/server yang menyusun boundary-nya secara otomatis.
      },
      body: formData, // Mengirimkan objek FormData yang berisi key 'image'
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { 
        success: false, 
        error: json.message || 'Gagal mengonfirmasi pembayaran ke server.' 
      };
    }

    // Bersihkan cache riwayat dan detail transaksi agar status berubah menjadi "Lunas" (is_paid = true)
    revalidatePath('/transactions');
    revalidatePath(`/transactions/${transactionId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return { success: false, error: 'Terjadi kegagalan koneksi dengan server e-commerce.' };
  }
}