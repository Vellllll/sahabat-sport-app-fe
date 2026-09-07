// app/_api/storefront.ts
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface FetchProductsParams {
  name?: string;
  minAmount?: number;
  maxAmount?: number;
  isAvailable?: boolean;
  productCategoryId?: string;
  page?: number;
  limit?: number;
  sortPrice?: 'asc' | 'desc' | '';
}

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

// Fungsi Helper untuk mengambil Token secara Server-Side
async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// Service 1: Ambil Daftar Produk
export async function getPublicProducts(filters: FetchProductsParams) {
  const query = new URLSearchParams();
  if (filters.name) query.set('name', filters.name);
  if (filters.minAmount) query.set('minAmount', filters.minAmount.toString());
  if (filters.maxAmount) query.set('maxAmount', filters.maxAmount.toString());
  if (filters.isAvailable !== undefined) query.set('isAvailable', filters.isAvailable.toString());
  if (filters.productCategoryId) query.set('productCategoryId', filters.productCategoryId);
  if (filters.page) query.set('page', filters.page.toString());
  if (filters.limit) query.set('limit', filters.limit.toString());
  if (filters.sortPrice) query.set('sortPrice', filters.sortPrice);

  const headers = await getAuthHeaders();

  try {
    const res = await fetch(`${API_URL}/get-product-list?${query.toString()}`, {
      headers,
      next: { revalidate: 0 } // Sesuaikan cache sesuai kebutuhan bisnismu
    });

    // Storefront publik dapat diakses oleh guest/non-logged-in user
    if (res.status === 401) {
      return { products: [], totalPages: 1, totalItems: 0 };
    }
    
    if (!res.ok) throw new Error('Failed to fetch product list');
    
    const json = await res.json();
    return {
      products: json.data ?? [],
      totalPages: json.totalPages ?? 1,
      totalItems: json.totalItems ?? 0
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Storefront fetch error:", error);
    return { products: [], totalPages: 1, totalItems: 0 };
  }
}

// Service 2: Ambil Daftar Kategori untuk Dropdown Filter
export async function getCategories() {
  const headers = await getAuthHeaders();

  try {
    const res = await fetch(`${API_URL}/product-categories?limit=100`, { headers });
    const json = await res.json();
    return json.data ?? [];
  } catch (error) {
    console.error("Categories fetch error:", error);
    return [];
  }
}