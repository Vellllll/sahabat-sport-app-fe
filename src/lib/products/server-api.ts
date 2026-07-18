import { CACHE_TAGS } from "@/lib/cache-tags";
import { serverApiFetch } from "@/lib/server-api";

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
  const params = new URLSearchParams({
    q: search,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (categoryId) {
    params.append("categoryId", categoryId);
  }

  const json = await serverApiFetch<any>(`/products?${params.toString()}`, {
    revalidate: 60,
    tags: [CACHE_TAGS.products],
  });

  return {
    products: json.data ?? [],
    totalPages: json.totalPages ?? 1,
    totalItems: json.totalItems ?? 0,
  };
}

export async function getProductById(id: number) {
  const json = await serverApiFetch<any>(`/products/${id}`, {
    revalidate: 60,
    tags: [CACHE_TAGS.products],
  });
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
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    productId: productId.toString(),
  });

  if (isDisplayed !== null) {
    params.set("isDisplayed", String(isDisplayed));
  }

  const json = await serverApiFetch<any>(`/product-items?${params.toString()}`, {
    revalidate: 60,
    tags: [CACHE_TAGS.productItems],
  });

  return {
    items: json.data ?? [],
    totalPages: json.totalPages ?? 1,
    totalItems: json.totalItems ?? 0,
  };
}
