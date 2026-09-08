// admin/categories/_components/delete-confirm-modal.tsx
'use client';

import { useTransition } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { deleteCategory } from '../actions';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: { id: string | number; name: string } | null;
  /** Optional: called after a successful delete, in addition to onClose. Useful for redirecting away from a detail page that no longer exists. */
  onDeleted?: () => void;
}

export default function DeleteConfirmModal({ isOpen, onClose, item, onDeleted }: Props) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    startTransition(async () => {
      // Panggil Action Server
      const result = await deleteCategory(item.id);

      if (result.success) {
        toast.success(result.message);
        onClose();
        onDeleted?.();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isPending && onClose()}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl border border-slate-100 p-6 animate-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">Hapus Kategori?</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Anda akan menghapus <span className="font-bold text-slate-800">"{item.name}"</span>. Data tidak dapat dipulihkan.
          </p>

          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleConfirm}
              className="py-2.5 px-6 rounded-xl font-bold text-xs bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}