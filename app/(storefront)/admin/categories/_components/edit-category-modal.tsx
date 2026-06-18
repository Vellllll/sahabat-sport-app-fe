// admin/categories/_components/edit-category-modal.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { updateCategory } from '../actions';
import { toast } from 'sonner'; // 🟢 1. IMPORT TOAST SONNER

interface FormState {
  message: string | null;
  errors?: {
    name?: string[];
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: { id: string; name: string; description?: string } | null;
}

export default function EditCategoryModal({ isOpen, onClose, item }: Props) {
  const initialState: FormState = { errors: {}, message: null };
  const [state, formAction, isPending] = useActionState(updateCategory, initialState);

  // 🟢 2. MONITOR REAKSI FEEDBACK VIA SONNER TOAST
  useEffect(() => {
    if (!state.message) return;

    if (state.message.toLowerCase().includes('berhasil')) {
      // Tampilkan toast sukses
      toast.success(state.message);
      
      const timer = setTimeout(() => {
        onClose(); // Tutup modal secara otomatis
        state.message = null; // Reset state pesan
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Tampilkan toast error jika ada validasi gagal atau gangguan server
      toast.error(state.message);
    }
  }, [state.message, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" 
        onClick={() => !isPending && onClose()} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Kategori</h2>
          <button 
            type="button"
            onClick={() => !isPending && onClose()} 
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Edit */}
        <form action={formAction} className="space-y-6">
          {/* SUNTIKKAN ID KATEGORI */}
          <input type="hidden" name="id" value={item.id} />

          <div className="space-y-2">
            <label htmlFor={`edit-name-${item.id}`} className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Nama Kategori
            </label>
            <input 
              type="text" 
              id={`edit-name-${item.id}`} 
              name="name" 
              defaultValue={item.name} 
              required 
              disabled={isPending}
              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] rounded-xl outline-none transition-all font-medium text-slate-700 text-sm" 
            />
            {state.errors?.name && (
              <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wide">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* 🟢 REFACTOR: Teks Box Alert Bawaan {state.message && ...} di Sini Sudah Dihapus Total */}

          {/* Action Button */}
          <button 
            type="submit" 
            disabled={isPending} 
            className="w-full bg-[#165dfc] text-white py-4 rounded-2xl font-bold text-xs tracking-widest shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              'SIMPAN PERUBAHAN'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}