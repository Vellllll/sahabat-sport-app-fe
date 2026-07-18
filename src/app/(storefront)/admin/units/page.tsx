import { Suspense } from 'react';
import { Ruler } from 'lucide-react';
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
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex justify-center items-start">
      <div className="w-full max-w-[800px]">
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