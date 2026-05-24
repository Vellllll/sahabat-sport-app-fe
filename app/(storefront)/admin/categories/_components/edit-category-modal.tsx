'use client';

import { useActionState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { updateCategory } from '../actions';

// 1. Definisikan Type State yang ketat (Bisa juga di-import dari schema kamu)
interface FormState {
  message: string | null;
  errors?: {
    name?: string[];
  };
}

// 2. Terapkan tipe tersebut ke Server Action (atau Mock Action)
async function mockUpdateAction(prevState: FormState, formData: FormData): Promise<FormState> {
  // Simulasi delay API
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return { 
    message: 'Kategori berhasil diupdate!', 
    errors: {} 
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: { id: string; name: string; description?: string } | null;
}

export default function EditCategoryModal({ isOpen, onClose, item }: Props) {
  // 3. TypeScript sekarang bahagia karena initial state cocok dengan definisi FormState
  const initialState: FormState = { errors: {}, message: null };
  const [state, formAction, isPending] = useActionState(updateCategory, initialState);

  useEffect(() => {
    if (state.message?.toLowerCase().includes('berhasil')) {
      const timer = setTimeout(() => {
        onClose();
        state.message = null; // Reset state saat ditutup
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.message, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isPending && onClose()} />
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Kategori</h2>
          <button onClick={() => !isPending && onClose()} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Edit */}
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={item.id} />

          <div className="space-y-2">
            <label htmlFor="edit-name" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Kategori</label>
            <input type="hidden" name="id" value={item.id} />
            <input 
              type="text" 
              id="edit-name" 
              name="name" 
              defaultValue={item.name} 
              required 
              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] rounded-xl outline-none transition-all font-medium text-slate-700" 
            />
            {state.errors?.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{state.errors.name[0]}</p>}
          </div>

          {state.message && (
            <div className={`text-center py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase ${state.errors && Object.keys(state.errors).length > 0 ? 'text-red-500' : 'text-[#165dfc]'}`}>
              {state.message}
            </div>
          )}

          <button type="submit" disabled={isPending} className="w-full bg-[#165dfc] text-white py-4 rounded-2xl font-bold text-xs tracking-widest shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SIMPAN PERUBAHAN'}
          </button>
        </form>
      </div>
    </div>
  );
}