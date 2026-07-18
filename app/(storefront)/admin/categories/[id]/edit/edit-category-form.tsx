// app/admin/categories/[id]/edit/edit-category-form.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateCategory } from '../../actions';

interface Category {
  id: string;
  name: string;
}

interface Props {
  category: Category;
}

const initialState = { errors: {}, message: null };

export default function EditCategoryForm({ category }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateCategory, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.message.toLowerCase().includes('berhasil')) {
      toast.success(state.message);
      router.push(`/admin/categories/${category.id}`);
    } else {
      toast.error(state.message);
    }
  }, [state.message, router, category.id]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={category.id} />

      <div className="space-y-2">
        <label htmlFor="name" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
          Nama Kategori
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={category.name}
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

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#165dfc] text-white py-4 rounded-2xl font-bold text-xs tracking-widest shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
  );
}