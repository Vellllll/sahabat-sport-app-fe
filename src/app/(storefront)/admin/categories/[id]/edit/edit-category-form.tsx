// app/admin/categories/[id]/edit/edit-category-form.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateCategory } from '../../actions';

interface Category {
  id: string | number;
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
        <label htmlFor="name" className="text-xs font-semibold text-slate-400 ml-1">
          Nama Kategori
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={category.name}
          required
          disabled={isPending}
          className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-xl outline-none transition-all font-medium text-slate-700 text-sm"
        />
        {state.errors?.name && (
          <p className="text-red-500 text-xs font-semibold mt-1 ml-1">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
          </>
        ) : (
          'Simpan Perubahan'
        )}
      </button>
    </form>
  );
}