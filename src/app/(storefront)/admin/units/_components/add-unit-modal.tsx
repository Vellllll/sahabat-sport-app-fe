'use client';

import { useState, useActionState, useRef, useEffect } from 'react';
import { createUnit } from '../actions';
import { X, Loader2, Plus, Ruler } from 'lucide-react';
import { toast } from 'sonner';

export default function AddUnitModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createUnit, { message: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message?.toLowerCase().includes('berhasil')) {
      toast.success(state.message);
      setIsOpen(false);
      formRef.current?.reset();
      state.message = null; 
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state.message]);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-brand text-white px-5 py-3 rounded-2xl font-bold text-xs tracking-widest hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all flex items-center gap-2">
        <Plus className="h-4 w-4" /> TAMBAH
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isPending && setIsOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Satuan Baru</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X className="h-5 w-5" /></button>
            </div>

            <form ref={formRef} action={formAction} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Satuan</label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
                  <input name="name" required disabled={isPending} placeholder="Contoh: Kilogram" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-xl outline-none font-medium text-slate-700" />
                </div>
                {state.errors?.name && <p className="text-red-500 text-[10px] font-bold ml-1">{state.errors.name[0]}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kuantitas Base</label>
                <input type="number" name="quantity" required disabled={isPending} placeholder="Contoh: 250" min="1" className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-xl outline-none font-medium text-slate-700" />
                {state.errors?.quantity && <p className="text-red-500 text-[10px] font-bold ml-1">{state.errors.quantity[0]}</p>}
              </div>

              <button type="submit" disabled={isPending} className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-xs tracking-widest hover:bg-brand-hover transition-all flex items-center justify-center disabled:opacity-50 uppercase">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "SIMPAN SATUAN"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}