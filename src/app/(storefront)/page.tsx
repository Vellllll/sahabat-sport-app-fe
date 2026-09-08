// app/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { ShoppingBag, MapPin, Phone } from 'lucide-react';
import ProductStorefront from '@/app/_components/product-storefront';
// Menggunakan Path Alias '@/' jauh lebih bersih dan tidak rawan broken import saat file dipindah
import { getPublicProducts, getCategories, type FetchProductsParams } from '@/lib/dashboard/api';
import { getShopProfile } from '@/lib/api/shop-profile';

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
  const [{ products, totalPages, totalItems }, categories, shop] = await Promise.all([
    getPublicProducts(apiFilters),
    getCategories(),
    getShopProfile()
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* MAIN CATALOG VIEW */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* BRAND HERO BANNER - COMPACT */}
        <div className="relative mb-8 flex flex-col gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-brand to-[#0c44ca] px-5 py-5 text-white sm:px-7 sm:py-6 animate-in fade-in slide-in-from-top-4 duration-500 sm:flex-row sm:items-center">
          {/* Dekorasi background halus opsional */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <span className="relative z-10 hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md sm:flex">
            <ShoppingBag className="h-5 w-5" />
          </span>

          <div className="relative z-10 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/70">
              <ShoppingBag className="h-3 w-3 sm:hidden" /> Official Store
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase sm:text-2xl">
              {shop?.name ? (
                shop.name
              ) : (
                <>Sahabat<span className="font-light text-white/70">Sport</span></>
              )}
            </h1>
            <p className="hidden text-xs font-medium leading-relaxed text-white/70 sm:block sm:max-w-md">
              {shop?.description || 'Penyedia alat olahraga original, bersertifikasi resmi, dan berkualitas tinggi.'}
            </p>
          </div>

          {shop && (shop.address || shop.phone_number) && (
            <div className="relative z-10 flex shrink-0 flex-col gap-1.5 text-[11px] font-medium text-white/80 sm:border-l sm:border-white/15 sm:pl-5">
              {shop.address && (
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-white/60" />
                  <span className="line-clamp-2 sm:max-w-52">{shop.address}</span>
                </div>
              )}
              {shop.phone_number && (
                <Link href={`tel:${shop.phone_number}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-white/60" />
                  <span>{shop.phone_number}</span>
                </Link>
              )}
            </div>
          )}
        </div>

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
      <div className="h-14 bg-white border border-slate-100 rounded-2xl w-full animate-pulse" />
      
      {/* Product Grid Dummy */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex flex-col bg-white rounded-2xl border border-slate-100 p-3 animate-pulse">
            <div className="aspect-square w-full rounded-xl bg-slate-100" />
            <div className="pt-3 flex-1 space-y-2">
              <div className="h-2.5 bg-slate-100 rounded-md w-1/3" />
              <div className="h-3.5 bg-slate-100 rounded-lg w-3/4" />
              <div className="h-3.5 bg-slate-100 rounded-md w-1/2" />
            </div>
            <div className="mt-3 h-8 bg-slate-50 rounded-lg w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}