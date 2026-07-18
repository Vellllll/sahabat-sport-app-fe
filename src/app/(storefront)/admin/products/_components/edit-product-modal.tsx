'use client';

import { useActionState, useEffect, useState } from 'react';
import { X, Loader2, Tag } from 'lucide-react';
import { ProductFormState, updateProduct, getCategories } from '../actions';

interface Product {
  id: string;
  name: string;
  product_category_id?: string;
  is_displayed: boolean;
  product_category?: {
    id?: string | number;
    name?: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: { id: string; name: string }[];
}

export default function EditProductModal({ isOpen, onClose, product, categories: initialCategories }: Props) {
  const initialState: ProductFormState = { message: null };
  const [state, formAction, isPending] = useActionState(updateProduct, initialState);

  // State lokal untuk kategori
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(initialCategories);
  const [isLoadingCats, setIsLoadingCats] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  useEffect(() => {
    if (isOpen && product) {
      const categoryId = product.product_category_id ?? product.product_category?.id ?? "";
      setSelectedCategoryId(String(categoryId));
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (isOpen && initialCategories.length > 0) {
      setCategories(initialCategories);
      return;
    }

    if (isOpen && initialCategories.length === 0) {
      const fetchData = async () => {
        setIsLoadingCats(true);
        try {
          const data = await getCategories();
          setCategories(data || []);
        } catch (err) {
          console.error("Gagal memuat kategori:", err);
        } finally {
          setIsLoadingCats(false);
        }
      };
      fetchData();
    }
  }, [isOpen, initialCategories]);

  // 2. Feedback sukses & Auto-close
  useEffect(() => {
    if (state.message?.toLowerCase().includes('berhasil')) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.message, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" 
        onClick={() => !isPending && onClose()} 
      />

      <div className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Produk</h2>
          <button 
            onClick={() => !isPending && onClose()} 
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={product.id} />

          {/* Input Nama */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Nama Produk
            </label>
            <input 
              type="text" 
              name="name" 
              defaultValue={product.name} 
              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-xl outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
              placeholder="Masukkan nama produk..." 
            />
            {state.errors?.name && (
              <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Dropdown Kategori dengan Loading State */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Kategori
            </label>
            <div className="relative">
              <select 
                name="product_category_id" 
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                disabled={isLoadingCats}
                className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-xl outline-none transition-all font-medium text-slate-700 cursor-pointer appearance-none disabled:opacity-50"
              >
                <option value="">
                  {isLoadingCats ? "Memuat daftar kategori..." : "Pilih Kategori"}
                </option>
                {selectedCategoryId && !categories.some((cat) => String(cat.id) === selectedCategoryId) && (
                  <option value={selectedCategoryId}>Kategori saat ini</option>
                )}
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-3.5 pointer-events-none text-slate-300">
                {isLoadingCats ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
              </div>
            </div>
            {state.errors?.product_category_id && (
              <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{state.errors.product_category_id[0]}</p>
            )}
          </div>

          {/* Toggle Display */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
            <span className="text-sm font-bold text-slate-700 tracking-tight">Tampilkan di Katalog</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="is_displayed" 
                defaultChecked={product.is_displayed} 
                className="sr-only peer" 
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-4">
            {state.message && (
              <div className={`text-center py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase animate-in fade-in slide-in-from-top-1 ${state.errors ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-brand'}`}>
                {state.message}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={isPending || isLoadingCats} 
              className="w-full bg-brand text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-brand/20 hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin text-white/80" /> : 'SIMPAN PERUBAHAN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}