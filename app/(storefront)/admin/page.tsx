// app/admin/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Layers, Package, ArrowLeftRight, LayoutDashboard, ArrowUpRight } from 'lucide-react';
import { getAdminTransactionsByFilter } from '@/lib/api/admin-transactions';
import { TransactionAdminWorkspace } from './_components/transaction-admin-workspace';

export default async function AdminHubPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) redirect('/login');

  // ⚡ SERVER-SIDE CONCURRENT FETCHING: Ambil data 3 filter sekaligus secara paralel
  const [requestedList, verifyList, historyList] = await Promise.all([
    getAdminTransactionsByFilter(token, { is_requested: true }).catch(() => []),
    getAdminTransactionsByFilter(token, { is_paid: true }).catch(() => []),
    getAdminTransactionsByFilter(token, { is_sent: true }).catch(() => [])
  ]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-[900px] mx-auto space-y-10">
        
        {/* BRANDING HEADER KONSOL */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-[#165dfc]" /> Hub Administrasi
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Pusat audit keuangan, inventaris, dan pengawasan alur logistik pesanan Sahabat Sport.
          </p>
        </div>

        {/* ✅ AMAN: CARD MANAJEMEN KATEGORI & PRODUK TETAP DI SINI SEBAGAI JALAN PINTAS UTAMA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Tautan Menuju Halaman Kategori Anda (app/admin/categories/page.tsx) */}
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

          {/* Tautan Menuju Halaman Katalog Produk Anda (app/admin/products/page.tsx) */}
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

        </div>

        {/* 📑 WORKSPACE 3 LIST TRANSAKSI BERDASARKAN API BARU */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
            <ArrowLeftRight className="h-4 w-4 text-slate-400" /> Arus Dokumen Transaksi Masuk
          </h2>
          
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6">
            <TransactionAdminWorkspace 
              requestedList={requestedList} 
              verifyList={verifyList} 
              historyList={historyList} 
            />
          </div>
        </div>

      </div>
    </main>
  );
}