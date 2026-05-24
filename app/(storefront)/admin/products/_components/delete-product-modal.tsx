'use client';

import { useTransition, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { deleteProduct } from '../actions';

interface Product {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function DeleteProductModal({ isOpen, onClose, product }: Props) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      
      if (result.success) {
        onClose(); 
      } else {
        setErrorMsg(result.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={() => !isPending && onClose()} 
      />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          
          {/* Warning Icon */}
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Hapus Produk?</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Anda akan menghapus produk <span className="font-bold text-slate-800">"{product.name}"</span>. Data yang dihapus tidak dapat dikembalikan.
          </p>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="w-full mb-6 p-3 bg-red-50 text-red-500 text-[10px] font-bold rounded-xl uppercase tracking-widest border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              disabled={isPending}
              onClick={onClose}
              className="py-3.5 px-6 rounded-2xl font-bold text-xs tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all uppercase"
            >
              Batal
            </button>
            <button
              disabled={isPending}
              onClick={handleConfirm}
              className="py-3.5 px-6 rounded-2xl font-bold text-xs tracking-widest bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all uppercase flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ya, Hapus'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}