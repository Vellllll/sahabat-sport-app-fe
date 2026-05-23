// app/page.tsx
import { Suspense } from 'react';
import { ShoppingBag } from 'lucide-react';
import ProductStorefront from '../_components/product-storefront';
// Menggunakan Path Alias '@/' jauh lebih bersih dan tidak rawan broken import saat file dipindah
import { getPublicProducts, getCategories, type FetchProductsParams } from '@/lib/dashboard/api';

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; minPrice?: string; maxPrice?: string; sort?: string; page?: string }>;
}) {
  const sp = await searchParams;
  
  // Mapping URL state ke Parameter API asli backend Anda
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

  // Eksekusi API secara paralel dari file service yang sudah dipisah demi optimalisasi TTFB (Time to First Byte)
  const [{ products, totalPages, totalItems }, categories] = await Promise.all([
    getPublicProducts(apiFilters),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* BRAND HERO BANNER - PREMIUM LOOK */}
      <div className="bg-gradient-to-r from-[#165dfc] to-[#0c44ca] text-white py-14 px-4 text-center relative overflow-hidden">
        {/* Dekorasi background halus opsional */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center gap-2 text-xs font-black bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-widest text-white/90">
            <ShoppingBag className="h-3.5 w-3.5" /> Official Store
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
            Sahabat<span className="text-white/80 font-light">Sport</span>
          </h1>
          <p className="text-white/70 text-xs md:text-sm font-medium max-w-md mx-auto leading-relaxed">
            Penyedia alat olahraga original, bersertifikasi resmi, dan berkualitas tinggi untuk performa terbaik Anda.
          </p>
        </div>
      </div>

      {/* MAIN CATALOG VIEW */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Menggunakan JSON stringify filter sebagai key Suspense agar skeleton terpicu tiap kali user menyaring data */}
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

// PREMIUM SKELETON ANIMATION (SERUPA DENGAN CARD LAYOUT ASLI CLIENT COMPONENT)
function StorefrontSkeleton() {
  return (
    <div className="space-y-8 mt-4">
      {/* Filter Bar Dummy */}
      <div className="h-20 bg-white border border-slate-100 rounded-3xl w-full animate-pulse" />
      
      {/* Product Grid Dummy */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-[24px] border border-slate-100/80 overflow-hidden flex flex-col h-full p-0 space-y-4 animate-pulse">
            <div className="bg-slate-100 aspect-square w-full" />
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-3.5 bg-slate-100 rounded-lg w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
              </div>
              <div className="h-9 bg-slate-50 rounded-xl w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}