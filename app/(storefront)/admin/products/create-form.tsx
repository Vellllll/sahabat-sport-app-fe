'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createProduct } from './actions';
import { Loader2, ChevronDown } from 'lucide-react';

export default function CreateProductForm({ categories }: { categories: any[] }) {
  const [state, formAction, isPending] = useActionState(createProduct, { errors: {}, message: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message?.toLowerCase().includes('sukses')) {
      formRef.current?.reset();
    }
  }, [state.message]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      
      {/* Input Nama Produk */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-1">
          Nama Produk
        </label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Nama item sport..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#165dfc]/10 focus:border-[#165dfc] outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
        />
        {state.errors?.name && (
          <p className="text-red-500 text-xs font-medium ml-1">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Input Kategori */}
      <div className="space-y-2">
        <label htmlFor="categoryId" className="text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-1">
          Kategori
        </label>
        <div className="relative">
          <select
            name="categoryId"
            id="categoryId"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#165dfc]/10 focus:border-[#165dfc] outline-none transition-all text-slate-600 font-medium appearance-none cursor-pointer"
          >
            <option value="">Pilih Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
        {state.errors?.product_category_id && (
          <p className="text-red-500 text-xs font-medium ml-1">{state.errors.product_category_id[0]}</p>
        )}
      </div>

      {/* Toggle Display - Desain Baris Minimalis */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">Display Produk</span>
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">Aktifkan di katalog</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" name="isDisplayed" defaultChecked className="sr-only peer" />
          <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#165dfc]"></div>
        </label>
      </div>

      {/* Submit Button & Feedback */}
      <div className="pt-4 space-y-4">
        {state.message && (
          <div className={`text-center py-2 rounded-lg text-xs font-bold tracking-wide uppercase ${state.errors && Object.keys(state.errors).length > 0 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#165dfc]'}`}>
            {state.message}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#165dfc] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] hover:shadow-xl hover:shadow-[#165dfc]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin text-white/80" /> : 'SIMPAN PRODUK'}
        </button>
      </div>

    </form>
  );
}