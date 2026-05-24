'use client';

import { useState, useActionState, useRef, useEffect } from 'react';
import { createCategory } from './actions';
import { Plus, X, Loader2 } from 'lucide-react';

export default function AddCategoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createCategory, { errors: {}, message: null });
  const formRef = useRef<HTMLFormElement>(null);

  // Tutup modal dan reset form jika berhasil
  useEffect(() => {
    if (state.message?.toLowerCase().includes('berhasil')) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        formRef.current?.reset();
        // Reset state message agar saat buka lagi tidak ada pesan sukses lama
        state.message = null; 
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.message]);

  return (
    <>
      {/* Tombol Pemicu Popup */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 bg-[#165dfc] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] transition-all"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* Overlay Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* Konten Modal */}
          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kategori Baru</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form ref={formRef} action={formAction} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="Contoh: Raket, Sepatu..."
                    className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] rounded-xl outline-none transition-all font-medium text-slate-700"
                  />
                  {state.errors?.name && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{state.errors.name[0].toUpperCase()}</p>
                  )}
                </div>

                {state.message && (
                  <div className={`text-center py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase ${state.errors && Object.keys(state.errors).length > 0 ? 'text-red-500' : 'text-[#165dfc]'}`}>
                    {state.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#165dfc] text-white py-4 rounded-2xl font-bold text-xs tracking-widest shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SIMPAN KATEGORI'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}