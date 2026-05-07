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
