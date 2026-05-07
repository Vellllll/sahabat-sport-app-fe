import { cookies } from "next/headers";

const API_URL = process.env.INTERNAL_API_URL;

interface GetProductsParams {
  search?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
}

interface ProductApiResponse {
  id: string | number;
  name: string;
  product_category_id?: string | null;
  is_displayed?: boolean;
}

export async function getProducts({
  search = "",
  page = 1,
  limit = 20,
  categoryId = "",
}: GetProductsParams) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const params = new URLSearchParams({
    q: search,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (categoryId) {
    params.append("categoryId", categoryId);
  }

  const res = await fetch(`${API_URL}/products?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error("Gagal mengambil data produk");
  const json = await res.json();

  return {
    products: json.data ?? [],
    totalPages: json.totalPages ?? 1,
    totalItems: json.totalItems ?? 0,
  };
}

export async function getProductById(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const res = await fetch(`${API_URL}/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error("Failed to fetch product");

  const json = await res.json();
  const rawProduct: ProductApiResponse = json.data ?? json;

  return {
    id: String(rawProduct.id),
    name: rawProduct.name,
    product_category_id: rawProduct.product_category_id ? String(rawProduct.product_category_id) : "",
    is_displayed: Boolean(rawProduct.is_displayed),
  };
}

export async function getProductItems(
  page: number = 1,
  limit: number = 10,
  productId: number = 0,
  isDisplayed: boolean | null = null
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    productId: productId.toString(),
  });

  if (isDisplayed !== null) {
    params.set("isDisplayed", String(isDisplayed));
  }

  const res = await fetch(`${API_URL}/product-items?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error("Failed to fetch product items");
  const json = await res.json();

  return {
    items: json.data ?? [],
    totalPages: json.totalPages ?? 1,
    totalItems: json.totalItems ?? 0,
  };
}
