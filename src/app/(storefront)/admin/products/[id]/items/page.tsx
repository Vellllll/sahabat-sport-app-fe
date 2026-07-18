import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Box } from 'lucide-react';
import { requirePermission } from '@/lib/rbac/guards';
import { getProductItems, getAllUnitsAvailable } from './actions';
import ProductItemList from './_components/item-list';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; limit?: string; q?: string }>;
}

export default async function ProductItemsPage({ params, searchParams }: PageProps) {
  await requirePermission('products:manage');

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const productId = Number(resolvedParams.id);
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const currentLimit = Number(resolvedSearchParams.limit) || 10;
  const searchQuery = resolvedSearchParams.q || '';

  const [{ data, meta }, units] = await Promise.all([
    getProductItems(resolvedParams.id, currentPage, currentLimit, searchQuery),
    getAllUnitsAvailable()
  ]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex justify-center items-start">
      <div className="w-full max-w-[1000px]">

        <div className="mb-6">
          <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Produk
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center">
              <Box className="text-brand h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Varian Item</h1>
              <p className="text-slate-400 text-sm font-medium">Kelola stok, harga, nama variasi spesifik, dan metrik satuan.</p>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="h-60 bg-white rounded-[32px] animate-pulse" />}>
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6">
            <ProductItemList
              initialData={data}
              meta={meta}
              productId={productId}
            />
          </div>
        </Suspense>
      </div>
    </main>
  );
}