// app/(storefront)/cart/_actions/cart-mutations.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function updateCartItemQuantity(productItemId: number, incrementValue: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { success: false, error: 'Sesi Anda telah berakhir.' };

  try {
    const res = await fetch(`${API_URL}/transactions/add-product-item`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_item_id: productItemId,
        count: incrementValue // Mengirimkan angka 1 untuk tambah, atau -1 untuk kurang
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { 
        success: false, 
        error: json.message || 'Gagal memperbarui jumlah produk.' 
      };
    }

    // Paksa Next.js memperbarui data cache halaman cart dan navbar layout secara real-time
    revalidatePath('/cart');
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error) {
    console.error("Mutation quantity error:", error);
    return { success: false, error: 'Terjadi gangguan koneksi ke server.' };
  }
}