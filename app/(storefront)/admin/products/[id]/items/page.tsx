import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';
import ProductItemManager from './_components/product-item-manager';
import { getProductById, getProductItems } from './actions'; 

export default async function ProductItemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; limit?: string; isDisplayed?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const currentPage = Number(sp.page) || 1;
  const currentLimit = Number(sp.limit) || 10;
  
  const isDisplayed = sp.isDisplayed === 'true' ? true : 
                      sp.isDisplayed === 'false' ? false : null;

  const data = await getProductItems(currentPage, currentLimit, parseInt(id), isDisplayed);
  const parentProduct = await getProductById(parseInt(id));

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex justify-center items-start">
      <div className="w-full max-w-[800px]">
        
        {/* Navigasi & Breadcrumb */}
        <Link 
          href="/admin/products" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#165dfc] transition-colors mb-6 tracking-widest uppercase"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
        </Link>

        {/* Header Section */}
        <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 p-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#165dfc]/10 rounded-2xl flex items-center justify-center">
              <Package className="text-[#165dfc] h-7 w-7" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                Parent Product
              </p>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {parentProduct.name}
              </h1>
            </div>
          </div>
        </div>

        <ProductItemManager 
          productId={parentProduct.id}
          initialItems={data.items}
        />

      </div>
    </main>
  );
}