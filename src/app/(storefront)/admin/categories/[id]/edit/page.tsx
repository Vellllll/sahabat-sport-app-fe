// app/admin/categories/[id]/edit/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/rbac/guards';
import { getCategoryById } from '@/lib/api';
import EditCategoryForm from './edit-category-form';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Kategori | Admin',
};

export default async function EditCategoryPage({ params }: Props) {
  await requirePermission('categories:manage');
  const { id } = await params;

  const category = await getCategoryById(id).catch(() => null);
  if (!category) notFound();

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 flex justify-center items-start">
      <div className="w-full max-w-2xl">
        <Link
          href={`/admin/categories/${id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Detail Kategori
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Edit Kategori</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Perbarui informasi kategori &quot;{category.name}&quot;.
            </p>
          </div>

          <EditCategoryForm category={category} />
        </div>
      </div>
    </main>
  );
}