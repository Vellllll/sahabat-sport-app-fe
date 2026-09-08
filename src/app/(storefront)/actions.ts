// app/(storefront)/actions.ts
'use server';

import { getPublicProducts } from '@/lib/dashboard/api';

interface LoadMoreParams {
  q: string;
  category: string;
  minPrice: number | string;
  maxPrice: number | string;
  sort: string;
  page: number;
}

export async function loadMoreProductsAction(params: LoadMoreParams) {
  return getPublicProducts({
    name: params.q || '',
    minAmount: params.minPrice ? Number(params.minPrice) : undefined,
    maxAmount: params.maxPrice ? Number(params.maxPrice) : undefined,
    productCategoryId: params.category || '',
    sortPrice: params.sort === 'price_asc' ? 'asc' : params.sort === 'price_desc' ? 'desc' : '',
    page: params.page,
    limit: 12,
    isAvailable: true,
  });
}
