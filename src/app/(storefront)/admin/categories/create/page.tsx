// app/admin/categories/create/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Tag } from 'lucide-react';
import { requirePermission } from '@/lib/rbac/guards';
import CreateCategoryForm from './create-category-form';

export const metadata: Metadata = {
  title: 'Tambah Kategori | Admin',
};

export default async function CreateCategoryPage() {
  await requirePermission('categories:manage');

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
      <div className="w-full max-w-xl space-y-6">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Kategori
        </Link>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0">
              <Tag className="text-brand h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kategori Baru</h1>
              <p className="text-slate-400 text-sm font-medium mt-0.5">
                Buat klasifikasi produk baru untuk toko Anda.
              </p>
            </div>
          </div>

          <CreateCategoryForm />
        </div>
      </div>
    </main>
  );
}