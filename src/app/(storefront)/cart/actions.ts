// app/(storefront)/cart/actions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export interface CartMutationState {
  success: boolean;
  error?: string | null;
}

/**
 * Memperbarui kuantitas produk item di dalam keranjang belanja Sahabat Sport.
 */
export async function updateCartItemQuantity(
  productItemId: number,
  incrementValue: number,
  currentCount: number,
  stock: number
): Promise<CartMutationState> {
  const targetQuantity = currentCount + incrementValue;
  
  if (incrementValue > 0 && targetQuantity > stock) {
    return { 
      success: false, 
      error: `Stok tidak cukup! Batas maksimum pembelian produk ini adalah ${stock} item.` 
    };
  }

  if (targetQuantity < 0) {
    return { success: false, error: 'Jumlah pembelian tidak valid.' };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' };
  }

  try {
    const res = await fetch(`${API_URL}/transactions/add-product-item`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_item_id: productItemId,
        count: incrementValue
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { success: false, error: json.message || 'Gagal memperbarui jumlah produk.' };
    }

    revalidatePath('/cart');
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error: any) {
    console.error("Mutation quantity error:", error);
    if (error && error.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Terjadi gangguan koneksi ke server.' };
  }
}

/**
 * 🟢 REFACTOR BARU: Mengajukan penyiapan barang berdasarkan ID Transaksi aktif pembeli
 */
export async function requestTransaction(transactionId: number): Promise<CartMutationState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' };
  }

  try {
    const res = await fetch(`${API_URL}/transactions/${transactionId}/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { 
        success: false, 
        error: json.message || 'Gagal mengajukan penyiapan barang ke gudang.' 
      };
    }

    revalidatePath('/cart');
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error: any) {
    console.error("🔥 [Request Transaction Server Error]:", error);
    if (error && error.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Terjadi gangguan koneksi. Gagal menghubungi server gudang.' };
  }
}