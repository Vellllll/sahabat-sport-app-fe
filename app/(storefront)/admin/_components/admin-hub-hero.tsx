// app/admin/_components/admin-hub-hero.tsx
import Link from 'next/link';
import { Layers, Package, LayoutDashboard, ArrowUpRight } from 'lucide-react';

export function AdminHubHero({
  canManageProducts,
  canManageCategories,
}: {
  canManageProducts: boolean;
  canManageCategories: boolean;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-[#165dfc]" /> Hub Administrasi
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">
          Pusat kendali operasional logistik, klasifikasi kategori, dan peninjauan inventaris Sahabat Sport.
        </p>
      </div>

      {(canManageCategories || canManageProducts) && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {canManageCategories && (
        <Link 
          href="/admin/categories"
          className="group p-5 bg-white border border-slate-100 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between hover:border-[#165dfc]/30 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-50 text-[#165dfc] rounded-xl flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Manajemen Kategori</h3>
              <p className="text-[11px] font-medium text-slate-400">Kelola klasifikasi rumpun produk</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-[#165dfc] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
        )}

        {canManageProducts && (
        <Link 
          href="/admin/products"
          className="group p-5 bg-white border border-slate-100 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between hover:border-[#165dfc]/30 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-50 text-[#165dfc] rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Katalog Produk</h3>
              <p className="text-[11px] font-medium text-slate-400">Atur unit spesifikasi & varian stok</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-[#165dfc] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
        )}
      </div>
      )}
    </div>
  );
}