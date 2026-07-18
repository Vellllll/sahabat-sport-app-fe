// app/admin/categories/[id]/delete-category-button.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import DeleteConfirmModal from '../_components/delete-confirm-modal';

interface Props {
  id: string | number;
  name: string;
}

export default function DeleteCategoryButton({ id, name }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="py-3.5 px-6 rounded-2xl font-bold text-xs tracking-widest text-red-500 hover:bg-red-50 transition-all uppercase flex items-center justify-center gap-2"
      >
        <Trash2 className="h-4 w-4" /> Hapus
      </button>

      <DeleteConfirmModal
        isOpen={isOpen}
        item={{ id, name }}
        onClose={() => setIsOpen(false)}
        onDeleted={() => router.push('/admin/categories')}
      />
    </>
  );
}