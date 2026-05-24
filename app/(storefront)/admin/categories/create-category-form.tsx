'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createCategory } from './actions';
import { Loader2, Tag } from 'lucide-react';

export default function CreateCategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategory, { errors: {}, message: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message?.toLowerCase().includes('berhasil')) {
      formRef.current?.reset();
    }
  }, [state.message]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-1">
          Nama Kategori
        </label>
        <div className="relative">
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Contoh: Raket, Sepatu, Aksesoris..."
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#165dfc]/10 focus:border-[#165dfc] outline-none transition-all font-medium text-slate-700"
          />
        </div>
        {state.errors?.name && (
          <p className="text-red-500 text-xs font-medium ml-1">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="pt-4 space-y-4">
        {state.message && (
          <div className={`text-center py-2 rounded-lg text-xs font-bold tracking-wide uppercase ${state.errors && Object.keys(state.errors).length > 0 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#165dfc]'}`}>
            {state.message}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#165dfc] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'TAMBAH KATEGORI'}
        </button>
      </div>
    </form>
  );
}