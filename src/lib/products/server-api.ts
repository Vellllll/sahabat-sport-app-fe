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
  product_category?: { id?: string | number; name: string };
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

export interface ProductWithSummary extends Omit<ProductApiResponse, "id" | "is_displayed"> {
  id: string;
  is_displayed: boolean;
  thumbnail: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  totalStock: number;
  variantCount: number;
}

/**
 * Product records don't carry price/stock/photo themselves (those live on
 * product_items/variants), so the admin list fetches each product's items
 * in parallel and folds them into a display-ready summary.
 */
export async function getProductsWithSummary(params: GetProductsParams) {
  const { products, totalPages, totalItems } = await getProducts(params);

  const withSummary: ProductWithSummary[] = await Promise.all(
    products.map(async (product: ProductApiResponse) => {
      try {
        const { items } = await getProductItems(1, 100, Number(product.id));
        const prices = items
          .map((item: { price: string | number }) => Number(item.price))
          .filter((price: number) => !Number.isNaN(price));
        const thumbnail = items.find((item: { pic_url?: string }) => item.pic_url)?.pic_url ?? null;

        return {
          ...product,
          id: String(product.id),
          is_displayed: Boolean(product.is_displayed),
          thumbnail,
          minPrice: prices.length ? Math.min(...prices) : null,
          maxPrice: prices.length ? Math.max(...prices) : null,
          totalStock: items.reduce((sum: number, item: { stock: number }) => sum + (Number(item.stock) || 0), 0),
          variantCount: items.length,
        };
      } catch {
        return {
          ...product,
          id: String(product.id),
          is_displayed: Boolean(product.is_displayed),
          thumbnail: null,
          minPrice: null,
          maxPrice: null,
          totalStock: 0,
          variantCount: 0,
        };
      }
    })
  );

  return { products: withSummary, totalPages, totalItems };
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
