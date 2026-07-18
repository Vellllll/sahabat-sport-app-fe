// app/admin/categories/[id]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Edit2, Tag, Package } from 'lucide-react';
import { requirePermission } from '@/lib/rbac/guards';
import { getCategoryById } from '@/lib/api';
import DeleteCategoryButton from './delete-category-button';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const category = await getCategoryById(id).catch(() => null);
  return {
    title: category ? `${category.name} | Kategori` : 'Kategori Tidak Ditemukan',
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  await requirePermission('categories:manage');
  const { id } = await params;

  const category = await getCategoryById(id).catch(() => null);
  if (!category) notFound();

  const productCount = category.products?.length ?? 0;

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
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand/5 flex items-center justify-center text-brand shrink-0">
              <Tag className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight break-words">{category.name}</h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">ID: {category.id}</p>
            </div>
          </div>

          {category.description && (
            <div className="mb-8">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Deskripsi</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{category.description}</p>
            </div>
          )}

          {/* Daftar Produk dalam Kategori Ini */}
          <div className="mb-8">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Package className="h-3.5 w-3.5" /> Produk Terkait ({productCount})
            </h2>

            {productCount === 0 ? (
              <p className="text-sm text-slate-400 font-medium italic">Belum ada produk pada kategori ini.</p>
            ) : (
              <div className="space-y-2">
                {category.products!.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl"
                  >
                    <span className="text-sm font-semibold text-slate-700 truncate">{product.name}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ml-3 ${
                        product.is_displayed
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {product.is_displayed ? 'Tampil' : 'Disembunyikan'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
            <Link
              href={`/admin/categories/${category.id}/edit`}
              className="flex-1 py-3.5 rounded-2xl font-bold text-xs tracking-widest bg-brand text-white text-center shadow-lg shadow-brand/20 hover:bg-brand-hover transition-all uppercase flex items-center justify-center gap-2"
            >
              <Edit2 className="h-4 w-4" /> Edit Kategori
            </Link>

            <DeleteCategoryButton id={category.id} name={category.name} />
          </div>
        </div>
      </div>
    </main>
  );
}