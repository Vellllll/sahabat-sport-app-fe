'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Edit2, Trash2, Box } from 'lucide-react';
import { UnitItem } from '../actions';
import EditUnitModal from './edit-unit-modal';
import DeleteUnitModal from './delete-unit-modal';

interface Props {
  initialData: UnitItem[];
  totalPages: number;
  currentPage: number;
  currentLimit: number;
  totalItems: number;
}

export default function UnitListOptimized({ initialData, totalPages, currentPage, currentLimit, totalItems }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<UnitItem | null>(null);

  const updateUrl = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => params.set(key, value.toString()));
    startTransition(() => router.push(`?${params.toString()}`));
  };

  return (
    <div className="space-y-6 relative">
      <div className={`space-y-3 min-h-[300px] ${isPending ? 'opacity-50' : 'opacity-100 transition-opacity'}`}>
        {initialData.length > 0 ? (
          initialData.map((unit) => (
            <div key={unit.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-[#165dfc]/30 hover:shadow-md transition-all gap-4">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-slate-800">{unit.name}</h3>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wider w-max">
                  <Box className="h-3 w-3" /> Qty: {unit.quantity}
                </div>
              </div>

              <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingUnit(unit)} className="p-2.5 text-slate-400 hover:text-[#165dfc] hover:bg-[#165dfc]/5 rounded-xl transition-all">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => setDeletingUnit(unit)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-100">
            Data Satuan Kosong
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limit:</span>
          <select value={currentLimit} onChange={(e) => updateUrl({ limit: e.target.value, page: 1 })} className="bg-transparent text-xs font-black text-[#165dfc] outline-none cursor-pointer">
            {[10, 20, 50].map((val) => (<option key={val} value={val}>{val}</option>))}
          </select>
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={() => updateUrl({ page: currentPage - 1 })} disabled={currentPage <= 1 || isPending} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-10 transition-all text-slate-600">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm">
            <span className="text-[10px] font-black text-[#165dfc] tracking-widest">{currentPage} / {totalPages}</span>
          </div>
          <button onClick={() => updateUrl({ page: currentPage + 1 })} disabled={currentPage >= totalPages || isPending} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-10 transition-all text-slate-600">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Modals Rendering */}
      <EditUnitModal isOpen={!!editingUnit} unit={editingUnit} onClose={() => setEditingUnit(null)} />
      <DeleteUnitModal isOpen={!!deletingUnit} unit={deletingUnit} onClose={() => setDeletingUnit(null)} />
    </div>
  );
}