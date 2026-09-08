// app/admin/_components/admin-hub-hero.tsx
import Link from 'next/link';
import { Layers, Package, LayoutDashboard, ArrowUpRight, Ruler } from 'lucide-react';

export function AdminHubHero({
  canManageProducts,
  canManageCategories,
}: {
  canManageProducts: boolean;
  canManageCategories: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-brand" /> Hub Administrasi
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">
          Pusat kendali operasional logistik, klasifikasi kategori, dan peninjauan inventaris Sahabat Sport.
        </p>
      </div>

      {(canManageCategories || canManageProducts) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {canManageCategories && (
            <Link
              href="/admin/categories"
              className="group p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-brand/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-brand rounded-lg flex items-center justify-center">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Manajemen Kategori</h3>
                  <p className="text-xs font-medium text-slate-400">Kelola klasifikasi rumpun produk</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-brand transition-colors" />
            </Link>
          )}

          {canManageProducts && (
            <Link
              href="/admin/products"
              className="group p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-brand/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-brand rounded-lg flex items-center justify-center">
                  <Package className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Katalog Produk</h3>
                  <p className="text-xs font-medium text-slate-400">Atur unit spesifikasi & varian stok</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-brand transition-colors" />
            </Link>
          )}

          {/* Menu Baru: Manajemen Satuan */}
          {canManageProducts && (
            <Link
              href="/admin/units"
              className="group p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-brand/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-brand rounded-lg flex items-center justify-center">
                  <Ruler className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Manajemen Satuan</h3>
                  <p className="text-xs font-medium text-slate-400">Atur parameter kuantitas</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-brand transition-colors" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
