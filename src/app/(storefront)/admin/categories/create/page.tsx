// app/admin/categories/create/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/rbac/guards';
import CreateCategoryForm from './create-category-form';

export const metadata: Metadata = {
  title: 'Tambah Kategori | Admin',
};

export default async function CreateCategoryPage() {
  await requirePermission('categories:manage');

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 flex justify-center items-start">
      <div className="w-full max-w-[540px]">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Kategori
        </Link>

        <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kategori Baru</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Buat klasifikasi produk baru untuk toko Anda.
            </p>
          </div>

          <CreateCategoryForm />
        </div>
      </div>
    </main>
  );
}