// app/admin/categories/create/create-category-form.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { createCategory } from '../actions';

const initialState = { errors: {}, message: null };

export default function CreateCategoryForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createCategory, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.message.toLowerCase().includes('berhasil')) {
      toast.success(state.message);
      router.push('/admin/categories');
    } else {
      toast.error(state.message);
    }
  }, [state.message, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
          Nama Kategori
        </label>
        <div className="relative">
          <Tag className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
          <input
            type="text"
            name="name"
            id="name"
            required
            disabled={isPending}
            placeholder="Contoh: Raket, Sepatu, Aksesoris..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 rounded-xl outline-none transition-all font-medium text-slate-700"
          />
        </div>
        {state.errors?.name && (
          <p className="text-red-500 text-xs font-medium ml-1">{state.errors.name[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 hover:bg-brand-hover active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tambah Kategori'}
      </button>
    </form>
  );
}