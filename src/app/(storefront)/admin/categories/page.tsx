// app/admin/categories/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAllCategories } from '@/lib/api';
import CategoryListOptimized from './_components/category-list';
import CategoryActions from './_components/category-actions';
import { Suspense } from 'react';
import { requirePermission } from '@/lib/rbac/guards';

export default async function CategoriesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string; limit?: string }>;
}) {
    await requirePermission('categories:manage');

    const params = await searchParams;
    const query = params.q || '';
    const currentPage = Number(params.page) || 1;
    const currentLimit = Number(params.limit) || 20; // Default ke 20

    // Panggil fungsi dengan proteksi destructuring
    const { categories, totalPages } = await getAllCategories({
        search: query,
        page: currentPage,
        limit: currentLimit
    });

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full space-y-6">
                <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke Hub Administrasi
                </Link>

                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kategori Produk</h1>
                        <p className="text-slate-400 text-sm font-medium">Kelola klasifikasi produk Sahabat Sport.</p>
                    </div>
                    {/* 🟢 REFACTOR: Tombol "Tambah" sekarang mengarah ke dedicated page /admin/categories/create */}
                    <CategoryActions />
                </div>

                <Suspense key={query + currentPage} fallback={<div className="h-40 animate-pulse bg-white rounded-[32px] border border-slate-100" />}>
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
                        <CategoryListOptimized
                            initialData={categories}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            currentLimit={currentLimit} // Oper limit saat ini
                        />
                    </div>
                </Suspense>
            </div>
        </main>
    );
}