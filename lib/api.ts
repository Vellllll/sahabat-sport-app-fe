import { cookies } from "next/headers";
const API_URL = process.env.INTERNAL_API_URL;

export async function getCategories() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    const res = await fetch(`${API_URL}/product-categories`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        // Senior Tip: Revalidate every hour to keep data fresh without killing the API
        next: { revalidate: 3600 }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
    }

    const json = await res.json();

    // Brutal check: If result is null or undefined, return empty array to prevent UI crash
    return json.data ?? [];
}

// lib/api.ts
export async function getAllCategories({ search = '', page = 1, limit = 20 }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    const res = await fetch(
      `${API_URL}/product-categories?q=${search}&page=${page}&limit=${limit}`, 
      {
        headers: { 'Authorization': `Bearer ${token}` },
        next: { revalidate: 0 } 
      }
    );
    
    if (!res.ok) throw new Error('Gagal mengambil kategori');
    const json = await res.json();
    
    return {
      categories: json.data ?? [],
      totalPages: json.totalPages ?? 1,
      totalItems: json.totalItems ?? 0 // Tambahkan info total item jika ada
    };
  }