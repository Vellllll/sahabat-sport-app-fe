// app/(storefront)/transactions/[id]/actions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function requestItemPreparation(transactionId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { success: false, error: 'Sesi Anda telah berakhir.' };

  try {
    // Sesuaikan dengan endpoint mutasi backend Anda (misal: /transactions/:id/request-ready)
    const res = await fetch(`${API_URL}/transactions/${transactionId}/request`, {
      method: 'POST', // Atau PUT sesuai arsitektur REST API Anda
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json.message || 'Gagal mengajukan penyiapan barang.' };
    }

    // Paksa Next.js untuk memperbarui cache halaman detail transaksi ini secara real-time
    revalidatePath(`/transactions/${transactionId}`);
    return { success: true };
  } catch (error) {
    console.error("Request preparation error:", error);
    return { success: false, error: 'Terjadi kesalahan koneksi server.' };
  }
}