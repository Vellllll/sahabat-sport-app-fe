'use client';

import { useActionState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ProductFormState, updateProduct } from '../actions';

interface Product {
  id: string;
  name: string;
  product_category_id?: string;
  is_displayed: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: { id: string; name: string }[];
}

export default function EditProductModal({ isOpen, onClose, product, categories }: Props) {
  const initialState: ProductFormState = { message: null };
  const [state, formAction, isPending] = useActionState(updateProduct, initialState);

  useEffect(() => {
    if (state.message?.toLowerCase().includes('berhasil')) {
      const timer = setTimeout(() => {
        onClose();
        // Memaksa reset state via mutasi lokal untuk UI
        state.message = null; 
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.message, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isPending && onClose()} />
      <div className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Produk</h2>
          <button onClick={() => !isPending && onClose()} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={product.id} />

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Produk</label>
            <input 
              type="text" 
              name="name" 
              defaultValue={product.name} 
              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] rounded-xl outline-none transition-all font-medium text-slate-700" 
            />
            {state.errors?.name && (
              <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
            <select 
              name="product_category_id" 
              defaultValue={product.product_category_id || ""} 
              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] rounded-xl outline-none transition-all font-medium text-slate-700 cursor-pointer"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {state.errors?.product_category_id && (
              <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{state.errors.product_category_id[0]}</p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Display Produk</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="is_displayed" 
                defaultChecked={product.is_displayed} 
                className="sr-only peer" 
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#165dfc]"></div>
            </label>
          </div>

          <div className="pt-4 space-y-4">
            {state.message && (
              <div className={`text-center py-2 rounded-lg text-xs font-bold tracking-wide uppercase ${state.errors ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#165dfc]'}`}>
                {state.message}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={isPending} 
              className="w-full bg-[#165dfc] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SIMPAN PERUBAHAN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}