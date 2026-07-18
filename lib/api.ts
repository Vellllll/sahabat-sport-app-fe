import { CACHE_TAGS } from "./cache-tags";
import { serverApiFetch } from "./server-api";

export async function getCategories() {
  const json = await serverApiFetch<any>("/product-categories", {
    revalidate: 300,
    tags: [CACHE_TAGS.categories],
  });
  return json.data ?? [];
}

export async function getAllCategories({ search = "", page = 1, limit = 20 }) {
  const json = await serverApiFetch<any>(`/product-categories?q=${search}&page=${page}&limit=${limit}`, {
    revalidate: 60,
    tags: [CACHE_TAGS.categories],
  });

  return {
    categories: json.data ?? [],
    totalPages: json.totalPages ?? 1,
    totalItems: json.totalItems ?? 0,
  };
}

export interface CategoryProduct {
  id: number;
  name: string;
  is_displayed: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  products?: CategoryProduct[];
}

interface CategoryDetailResponse {
  status: number;
  message: string;
  data: Category;
}

export async function getCategoryById(id: string | number): Promise<Category> {
  // Jika `serverApiFetch` di project Anda generic (mis. serverApiFetch<T>(...)), Anda
  // bisa pakai serverApiFetch<CategoryDetailResponse>(...) supaya lebih type-safe.
  const response = (await serverApiFetch(`/product-categories/${id}`, {
    method: 'GET',
  })) as CategoryDetailResponse;

  // Kalau serverApiFetch kamu sudah otomatis unwrap `data`, ganti baris di atas
  // supaya langsung `return response as Category;`
  return response.data;
}