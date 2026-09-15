// app/admin/products/page.tsx
import Link from 'next/link';
import { getProductsWithSummary } from '@/lib/products/api';
import { getCategories } from '@/lib/api';
import ProductListOptimized from './_components/product-list';
import { ArrowLeft, Package } from 'lucide-react';
import { Suspense } from 'react';
import AddProductModal from './_components/add-product-modal';
import { requirePermission } from '@/lib/rbac/guards';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; limit?: string; categoryId?: string }>;
}) {
  await requirePermission('products:manage');

  const params = await searchParams;
  const query = params.q || '';
  const currentPage = Number(params.page) || 1;
  const currentLimit = Number(params.limit) || 20;
  const currentCategoryId = params.categoryId || ''; // Ambil categoryId dari URL

  // Jalankan 2 API Fetch secara pararel (Concurrent) agar lebih cepat!
  const [productData, categoryData] = await Promise.all([
    getProductsWithSummary({ search: query, page: currentPage, limit: currentLimit, categoryId: currentCategoryId }),
    getCategories() // Ambil cukup banyak kategori untuk opsi dropdown
  ]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <Link href="/admin" className="inline-flex items-center gap-2 mb-6 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Hub Administrasi
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center">
              <Package className="text-brand h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Produk</h1>
              {/* <p className="text-slate-400 text-sm font-medium">Sahabat Sport v2.0</p> */}
            </div>
          </div>

          {/* PANGGIL MODAL DI SINI */}
          <AddProductModal categories={categoryData} />
        </div>

        <Suspense fallback={<div className="h-40 bg-white rounded-3xl animate-pulse" />}>
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6">
            <ProductListOptimized
              initialData={productData.products}
              categories={categoryData}
              {...productData} // Oper totalPages, totalItems
              currentPage={Number(params.page) || 1}
              currentLimit={Number(params.limit) || 20}
              currentCategoryId={params.categoryId || ''}
            />
          </div>
        </Suspense>
      </div>
    </main>
  );
}