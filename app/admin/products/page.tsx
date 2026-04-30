// app/admin/products/page.tsx
import { getProducts } from '@/lib/products/api';
import { getCategories } from '@/lib/api'; // Pastikan fungsi getCategories di-import
import ProductListOptimized from './_components/product-list';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import { Suspense } from 'react';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; limit?: string; categoryId?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const currentPage = Number(params.page) || 1;
  const currentLimit = Number(params.limit) || 20;
  const currentCategoryId = params.categoryId || ''; // Ambil categoryId dari URL

  // Jalankan 2 API Fetch secara pararel (Concurrent) agar lebih cepat!
  const [productData, categoryData] = await Promise.all([
    getProducts({ search: query, page: currentPage, limit: currentLimit, categoryId: currentCategoryId }),
    getCategories() // Ambil cukup banyak kategori untuk opsi dropdown
  ]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex justify-center items-start">
      <div className="w-full max-w-[800px]">
        {/* Header Section (Sama seperti sebelumnya) */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#165dfc]/10 rounded-2xl flex items-center justify-center">
              <Package className="text-[#165dfc] h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Produk</h1>
              <p className="text-slate-400 text-sm font-medium">Kelola inventaris Sahabat Sport.</p>
            </div>
          </div>
          <Link href="/admin/products/add" className="...">
             {/* Tombol Tambah (Sama) */}
          </Link>
        </div>

        <Suspense key={query + currentPage + currentLimit + currentCategoryId} fallback={<ListSkeleton />}>
          <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 p-6">
            <ProductListOptimized 
              initialData={productData.products} 
              totalPages={productData.totalPages} 
              currentPage={currentPage}
              currentLimit={currentLimit}
              totalItems={productData.totalItems}
              categories={categoryData} // Oper daftar kategori ke UI
              currentCategoryId={currentCategoryId} // Oper kategori terpilih ke UI
            />
          </div>
        </Suspense>
      </div>
    </main>
  );
}

// (ListSkeleton sama seperti sebelumnya)

function ListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-slate-50 rounded-2xl w-full" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-slate-50 rounded-2xl w-full" />
      ))}
    </div>
  );
}