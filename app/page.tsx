// app/page.tsx
import { Suspense } from 'react';
import ProductStorefront from './_components/product-storefront';
import { getPublicProducts, getCategories, type FetchProductsParams } from '../lib/dashboard/api';

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; minPrice?: string; maxPrice?: string; sort?: string; page?: string }>;
}) {
  const sp = await searchParams;
  
  // Mapping URL state ke Parameter API asli
  const apiFilters: FetchProductsParams = {
    name: sp.q || '',
    minAmount: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxAmount: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    productCategoryId: sp.category || '',
    sortPrice: sp.sort === 'price_asc' ? 'asc' : sp.sort === 'price_desc' ? 'desc' : '',
    page: Number(sp.page) || 1,
    limit: 12,
    isAvailable: true 
  };

  // Eksekusi API secara paralel dari file service yang sudah dipisah
  const [{ products, totalPages, totalItems }, categories] = await Promise.all([
    getPublicProducts(apiFilters),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Brand Hero Banner */}
      <div className="bg-gradient-to-r from-[#165dfc] to-[#0c44ca] text-white py-12 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">SAHABAT SPORT</h1>
        <p className="text-white/80 text-sm font-medium max-w-md mx-auto">Penyedia alat olahraga original dan berkualitas tinggi.</p>
      </div>

      {/* Main Catalog View */}
      <main className="max-w-[1200px] mx-auto px-4 py-10">
        <Suspense key={JSON.stringify(apiFilters)} fallback={<StorefrontSkeleton />}>
          <ProductStorefront 
            initialProducts={products} 
            categories={categories}
            currentFilters={{
              q: apiFilters.name || '',
              category: apiFilters.productCategoryId || '',
              minPrice: apiFilters.minAmount || '',
              maxPrice: apiFilters.maxAmount || '',
              sort: sp.sort || 'latest',
              page: apiFilters.page || 1
            }}
            totalPages={totalPages}
            totalItems={totalItems}
          />
        </Suspense>
      </main>
    </div>
  );
}

function StorefrontSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse mt-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="bg-slate-200 rounded-3xl aspect-square w-full" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}