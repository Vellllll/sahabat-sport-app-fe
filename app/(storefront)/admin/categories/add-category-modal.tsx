// app/admin/categories/add-category-modal.tsx
'use client';

import { useState, useActionState, useRef, useEffect } from 'react';
import { createCategory } from './actions';
import { Plus, X, Loader2, Upload } from 'lucide-react'; // ✅ Import icon Upload
import ImportCategoryModal from './_components/import-category-modal'; // ✅ Import Modal Baru

export default function AddCategoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false); // ✅ State Baru untuk mengontrol modal import massal
  
  const [state, formAction, isPending] = useActionState(createCategory, { errors: {}, message: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message?.toLowerCase().includes('berhasil')) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        formRef.current?.reset();
        state.message = null; 
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.message]);

  return (
    <>
      {/* GRUP AKSI DENGAN INTEGRASI PREMIUM BARU */}
      <div className="flex items-center gap-2">
        {/* ✅ TOMBOL BARU: MEMBUKA MODAL IMPORT CSV MASSAL */}
        <button 
          onClick={() => setIsImportOpen(true)}
          className="h-10 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-sm shadow-slate-100"
        >
          <Upload className="h-4 w-4 text-slate-400" /> Import Massal
        </button>

        {/* Tombol Popup Tunggal Asli Anda */}
        <button 
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 bg-[#165dfc] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* ✅ MOUNT COMPONENT IMPORT DI SINI */}
      <ImportCategoryModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
      />

      {/* Overlay Backdrop Tunggal Tetap Berjalan Normal Di Sini */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isPending && setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kategori Baru</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X className="h-5 w-5" /></button>
              </div>

              <form ref={formRef} action={formAction} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Kategori</label>
                  <input type="text" name="name" id="name" required placeholder="Contoh: Raket, Sepatu..." className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] rounded-xl outline-none transition-all font-medium text-slate-700" />
                  {state.errors?.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{state.errors.name[0].toUpperCase()}</p>}
                </div>
                {state.message && <div className={`text-center py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase ${state.errors && Object.keys(state.errors).length > 0 ? 'text-red-500' : 'text-[#165dfc]'}`}>{state.message}</div>}
                <button type="submit" disabled={isPending} className="w-full bg-[#165dfc] text-white py-4 rounded-2xl font-bold text-xs tracking-widest shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] active:scale-[0.98] transition-all flex items-center justify-center gap-2">{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SIMPAN KATEGORI'}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}