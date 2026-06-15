// app/admin/categories/page.tsx
import { getAllCategories } from '@/lib/api';
import CategoryListOptimized from './_components/category-list';
import AddCategoryModal from './add-category-modal';
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
        <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 flex justify-center items-start">
            <div className="w-full max-w-[540px]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kategori Produk</h1>
                        <p className="text-slate-400 text-sm font-medium">Kelola klasifikasi produk Sahabat Sport.</p>
                    </div>
                    <AddCategoryModal />
                </div>

                <Suspense key={query + currentPage} fallback={<div className="h-40 animate-pulse bg-white rounded-3xl" />}>
                    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 p-6">
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