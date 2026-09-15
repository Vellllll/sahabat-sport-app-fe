import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Ruler } from 'lucide-react';
import { requirePermission } from '@/lib/rbac/guards';
import { getUnits } from './actions';
import UnitListOptimized from './_components/unit-list';
import AddUnitModal from './_components/add-unit-modal';

export default async function UnitsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  await requirePermission('products:manage');

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const currentLimit = Number(params.limit) || 10;

  // Render blocking API Request di Server
  const { data, meta } = await getUnits(currentPage, currentLimit);

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <Link href="/admin" className="inline-flex items-center gap-2 mb-6 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Hub Administrasi
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center">
              <Ruler className="text-brand h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar Satuan</h1>
              <p className="text-slate-400 text-sm font-medium">Kelola kuantitas metrik satuan.</p>
            </div>
          </div>

          <AddUnitModal />
        </div>

        <Suspense fallback={<div className="h-40 bg-white rounded-[32px] animate-pulse" />}>
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6">
            <UnitListOptimized
              initialData={data}
              totalPages={meta.totalPages}
              currentPage={meta.currentPage}
              currentLimit={currentLimit}
              totalItems={meta.totalItems}
            />
          </div>
        </Suspense>
      </div>
    </main>
  );
}