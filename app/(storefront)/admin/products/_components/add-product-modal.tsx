// admin/products/_components/add-product-modal.tsx
"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import { createProduct } from "../actions";
import { X, Loader2, Package, Tag, Eye, Plus, Upload } from "lucide-react"; 
import ImportProductModal from "./import-product-modal"; 
import { toast } from "sonner"; // 🟢 1. IMPORT TOAST SONNER

export default function AddProductModal({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false); 

  const [state, formAction, isPending] = useActionState(createProduct, {
    errors: {},
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  // 🟢 2. MONITOR FEEDBACK STRUKTUR VIA SONNER TOAST
  useEffect(() => {
    if (!state.message) return;

    if (state.message.toLowerCase().includes("berhasil")) {
      toast.success(state.message);
      
      const timer = setTimeout(() => {
        setIsOpen(false);
        formRef.current?.reset();
        state.message = ""; // Bersihkan pesan agar tidak terpicu ulang
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Menampilkan alasan spesifik error validasi dari NestJS/Zod
      toast.error(state.message);
    }
  }, [state.message]);

  return (
    <>
      {/* GRUP TOMBOL INTEGRASI AKSI */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsImportOpen(true)}
          className="h-10 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
        >
          <Upload className="h-4 w-4 text-slate-400" /> Import Massal
        </button>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#165dfc] text-white p-3 rounded-2xl font-bold text-xs tracking-widest hover:bg-[#124ecb] shadow-lg shadow-[#165dfc]/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus />
        </button>
      </div>

      <ImportProductModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => !isPending && setIsOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Produk Baru</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X className="h-5 w-5" /></button>
            </div>

            <form ref={formRef} action={formAction} className="space-y-6">
              {/* Nama Produk */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Produk</label>
                <div className="relative">
                  <Package className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
                  <input 
                    name="name" 
                    required 
                    disabled={isPending}
                    placeholder="Contoh: Sepatu Lari Nike" 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] rounded-xl outline-none transition-all font-medium text-slate-700" 
                  />
                </div>
                {state.errors?.name && <p className="text-red-500 text-[10px] font-bold ml-1">{state.errors.name[0]}</p>}
              </div>

              {/* Kategori */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
                  <select 
                    name="product_category_id" 
                    required 
                    disabled={isPending}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] rounded-xl outline-none appearance-none font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                {state.errors?.product_category_id && <p className="text-red-500 text-[10px] font-bold ml-1">{state.errors.product_category_id[0]}</p>}
              </div>

              {/* Toggle Switch Tampilkan Toko */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">Tampilkan di Toko</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="is_displayed" defaultChecked disabled={isPending} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#165dfc]"></div>
                </label>
              </div>

              {/* 🟢 REFACTOR: Boks Alert teks bawaan di bawah ini sudah dihapus total */}

              <button 
                type="submit" 
                disabled={isPending} 
                className="w-full bg-[#165dfc] text-white py-4 rounded-2xl font-bold text-xs tracking-widest shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "SIMPAN PRODUK"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}