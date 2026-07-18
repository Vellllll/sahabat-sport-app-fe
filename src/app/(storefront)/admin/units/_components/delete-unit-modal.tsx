'use client';

import { useTransition, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { deleteUnit, UnitItem } from '../actions';
import { toast } from 'sonner';

export default function DeleteUnitModal({ isOpen, onClose, unit }: { isOpen: boolean; onClose: () => void; unit: UnitItem | null }) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !unit) return null;

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await deleteUnit(unit.id);
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isPending && onClose()} />
      <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Hapus Satuan?</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Anda akan menghapus satuan <span className="font-bold text-slate-800">"{unit.name}"</span>. Data tidak dapat dikembalikan.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button disabled={isPending} onClick={onClose} className="py-3.5 px-6 rounded-2xl font-bold text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all uppercase">
              Batal
            </button>
            <button disabled={isPending} onClick={handleConfirm} className="py-3.5 px-6 rounded-2xl font-bold text-xs tracking-widest bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all uppercase flex items-center justify-center gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}