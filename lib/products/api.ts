// lib/api.ts

import { cookies } from "next/headers";
const API_URL = process.env.INTERNAL_API_URL;

interface GetProductsParams {
  search?: string;
  page?: number;
  limit?: number;
  categoryId?: string; // Parameter baru
}

export async function getProducts({
  search = "",
  page = 1,
  limit = 20,
  categoryId = "",
}: GetProductsParams) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  // Brutal Fix: Gunakan URLSearchParams agar query string bersih dan aman dari karakter aneh
  const params = new URLSearchParams({
    q: search,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (categoryId) {
    params.append("categoryId", categoryId);
  }

  const res = await fetch(
    `${API_URL}/products?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    }
  );

  if (!res.ok) throw new Error("Gagal mengambil data produk");
  const json = await res.json();

  return {
    products: json.data ?? [],
    totalPages: json.totalPages ?? 1,
    totalItems: json.totalItems ?? 0,
  };
}
