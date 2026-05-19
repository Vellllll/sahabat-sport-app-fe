import { Suspense } from 'react';
import ProductList from './_components/product-list';
import ProductFilters from './_components/product-filters';
import ProductPagination from './_components/product-pagination';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
    const filters = await searchParams;
    const currentPage = Number(filters.page) || 1;

    return (
        <div className="flex flex-col space-y-8 p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Katalog Produk</h1>
                    <p className="text-slate-500">Kelola dan pantau semua inventaris produk Anda.</p>
                </div>
            </div>

            {/* Filter Section - Client Component */}
            <ProductFilters />

            {/* List Section - Server Component with Suspense */}
            <Suspense key={JSON.stringify(filters)} fallback={<ProductListSkeleton />}>
                <ProductList filters={{ ...filters, page: currentPage }} />
                <ProductPagination
                    totalPages={0}
                    currentPage={currentPage}
                />
            </Suspense>
        </div>
    );
}

function ProductListSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-[300px] w-full rounded-[24px]" />
            ))}
        </div>
    );
}