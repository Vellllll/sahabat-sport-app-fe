// app/admin/categories/_components/category-actions.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';
import ImportCategoryModal from './import-category-modal';

/**
 * Replaces the old <AddCategoryModal />.
 * "Tambah Kategori" is now a dedicated page (/admin/categories/create),
 * so this component only keeps the bulk-import trigger + a link button.
 */
export default function CategoryActions() {
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* TOMBOL IMPORT CSV MASSAL (tetap modal) */}
        <button
          onClick={() => setIsImportOpen(true)}
          className="h-10 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Upload className="h-4 w-4 text-slate-400" /> Import Massal
        </button>

        {/* Tombol Tambah -> dedicated page */}
        <Link
          href="/admin/categories/create"
          className="w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center hover:bg-brand-hover transition-colors cursor-pointer"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </div>

      <ImportCategoryModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </>
  );
}