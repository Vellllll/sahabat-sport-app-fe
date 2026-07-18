// lib/api/cart.ts

export interface CartProductItem {
    id: number;
    name: string;
    price: string; // Tipe string sesuai response JSON backend Anda ("22815.00")
    pic_url: string;
    stock: number;
    is_displayed: boolean;
  }
  
  export interface CartLineItem {
    id: number; // ID Baris Item Transaksi (Contoh: 304)
    count: number;
    product_item: CartProductItem;
  }
  
  const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  
  export async function getCartItems(token: string): Promise<CartLineItem[]> {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 } // Selalu ambil data segar dari server untuk halaman keranjang
    });
  
    if (!res.ok) return [];
    
    const json = await res.json();
    return json.result ?? [];
  }