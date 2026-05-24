// app/(storefront)/product/[id]/_actions/cart.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function addToCartAction(productItemId: number, count: number = 1) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  // Jika belum login, beri tahu client untuk mengarahkan ke halaman login
  if (!token) {
    return { success: false, requireLogin: true, error: 'Silakan login terlebih dahulu untuk menambah produk.' };
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
        count: count
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { 
        success: false, 
        error: json.message || 'Gagal menambahkan produk ke keranjang.' 
      };
    }

    // Mengosongkan cache navbar atau layout storefront agar jumlah item di ikon keranjang ter-update
    revalidatePath('/', 'layout'); 
    
    return { success: true };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, error: 'Terjadi gangguan koneksi ke server.' };
  }
}