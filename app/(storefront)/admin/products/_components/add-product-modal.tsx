"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import { createProduct } from "../actions";
import { X, Loader2, Package, Tag, Eye, Plus } from "lucide-react";

export default function AddProductModal({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createProduct, {
    errors: {},
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message?.toLowerCase().includes("berhasil")) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        formRef.current?.reset();
        state.message = "";
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.message]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#165dfc] text-white px-5 py-3 rounded-2xl font-bold text-xs tracking-widest hover:bg-[#124ecb] shadow-lg shadow-[#165dfc]/20 transition-all flex items-center gap-2"
      >
        <Plus/>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => !isPending && setIsOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Produk Baru
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} action={formAction} className="space-y-6">
              {/* Nama Produk */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Nama Produk
                </label>
                <div className="relative">
                  <Package className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
                  <input
                    name="name"
                    required
                    placeholder="Contoh: Sepatu Lari Nike"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] rounded-xl outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                {state.errors?.name && (
                  <p className="text-red-500 text-[10px] font-bold ml-1">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              {/* Kategori */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Kategori
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
                  <select
                    name="product_category_id" // <--- INI YANG WAJIB DIUBAH
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] rounded-xl outline-none appearance-none font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Sesuaikan juga error statenya jika kamu merubah nama key di Zod */}
                {state.errors?.product_category_id && (
                  <p className="text-red-500 text-[10px] font-bold ml-1">
                    {state.errors.product_category_id[0]}
                  </p>
                )}
              </div>

              {/* Status Display */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">
                    Tampilkan di Toko
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_displayed"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#165dfc]"></div>
                </label>
              </div>

              {state.message && (
                <div
                  className={`text-center py-2 text-[10px] font-bold uppercase tracking-widest ${
                    state.errors && Object.keys(state.errors).length > 0
                      ? "text-red-500"
                      : "text-[#165dfc]"
                  }`}
                >
                  {state.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#165dfc] text-white py-4 rounded-2xl font-bold text-xs tracking-widest shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "SIMPAN PRODUK"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
