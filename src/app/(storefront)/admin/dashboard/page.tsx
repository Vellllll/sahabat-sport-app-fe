// app/admin/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getAdminDashboardStats } from './actions';
import { 
  LayoutDashboard, Calendar, DollarSign, 
  ShoppingBag, Package, Users, Award 
} from 'lucide-react';
import { DashboardFilterForm } from './_components/dashboard-filter-form';
import { SalesTrendChart } from './_components/sales-trend-chart';
import { OrderDistributionChart } from './_components/order-distribution-chart';

interface PageProps {
  searchParams: Promise<{
    year?: string;
  }>;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  // 1. Ambil query parameter tahun dari URL (default ke tahun berjalan jika kosong)
  const params = await searchParams;
  const selectedYear = params.year || new Date().getFullYear().toString();

  // 2. Ambil token sesi admin dari cookie secara aman di sisi server
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    redirect('/login');
  }

  // 3. Tarik data metrik dashboard dari API NestJS via Server Action
  const apiResponse = await getAdminDashboardStats(token, { year: selectedYear });

  // Tampilkan layar fallback jika terjadi kegagalan koneksi ke API
  if (!apiResponse || apiResponse.status !== 200) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 max-w-sm text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">✕</div>
          <h2 className="text-lg font-black text-slate-900 uppercase">Gagal Memuat Dashboard</h2>
          <p className="text-xs font-semibold text-slate-400 normal-case leading-relaxed">
            Koneksi API `/dashboard/admin-stats` terputus atau token sesi administrasi telah kedaluwarsa. Silakan muat ulang halaman.
          </p>
        </div>
      </main>
    );
  }

  // Uraikan hasil response API ke dalam variabel lokal dengan proteksi data kosong (fallback)
  const { 
    year = selectedYear, 
    cards = { total_revenue: 0, total_orders: 0, total_products: 0, total_customers: 0 }, 
    order_distribution_chart = { pending_payment: 0, processing: 0, completed: 0, rejected: 0 }, 
    sales_trend_chart = [], 
    top_products = [] 
  } = apiResponse.result || {};

  // Helper pemformatan mata uang Rupiah murni tanpa desimal
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
  };

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto space-y-10">
        
        {/* ========================================================================= */}
        {/* 📑 HEADER UTAMA DASHBOARD */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-2.5">
              <LayoutDashboard className="h-8 w-8 text-brand" /> Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Konsol Data Utama Operasional • Hari ini {currentDateStr}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ⚡ BAR FILTER DROPDOWN TAHUNAN */}
        {/* ========================================================================= */}
        <Suspense fallback={<div className="h-16 bg-white rounded-2xl animate-pulse" />}>
          <DashboardFilterForm currentYear={year} />
        </Suspense>

        {/* ========================================================================= */}
        {/* 📊 CORE METRIC CARDS GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Total Revenue */}
          <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</span>
              <div className="h-8 w-8 rounded-xl bg-blue-50 text-brand flex items-center justify-center shadow-inner">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {formatRupiah(cards.total_revenue)}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Akumulasi Pendapatan</p>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</span>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {(cards.total_orders || 0).toLocaleString('id-ID')}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Volume Nota Terbit</p>
            </div>
          </div>

          {/* Card 3: Total Products */}
          <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Products</span>
              <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {(cards.total_products || 0).toLocaleString('id-ID')}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Induk Katalog Aktif</p>
            </div>
          </div>

          {/* Card 4: Total Customers */}
          <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Customers</span>
              <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {(cards.total_customers || 0).toLocaleString('id-ID')}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">User Terdaftar</p>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 📈 INTERACTIVE CHARTS GRAPHICS SECTION (RECHARTS INTEGRATION) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Panel Kiri: Donut Chart Komposisi Transaksi */}
          <Suspense fallback={<div className="h-72 bg-white rounded-[32px] border border-slate-100 animate-pulse" />}>
            <OrderDistributionChart data={order_distribution_chart} />
          </Suspense>

          {/* Panel Kanan: Area/Line Chart Tren Omset Bulanan */}
          <Suspense fallback={<div className="h-72 bg-white rounded-[32px] border border-slate-100 animate-pulse" />}>
            <SalesTrendChart data={sales_trend_chart} />
          </Suspense>

        </div>

        {/* ========================================================================= */}
        {/* 🏆 TOP SELLING PRODUCTS LEADERBOARD */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pl-1">
            <Award className="h-4 w-4 text-amber-500" />
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.15em]">
              Produk Terlaris Sepanjang Tahun {year}
            </h2>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="text-[10px] font-black uppercase tracking-wider text-slate-400 py-4 px-6 w-16 text-center">Rank</th>
                  <th className="text-[10px] font-black uppercase tracking-wider text-slate-400 py-4 px-4">Nama Item Katalog</th>
                  <th className="text-[10px] font-black uppercase tracking-wider text-slate-400 py-4 px-4 text-center">Volume Terjual</th>
                  <th className="text-[10px] font-black uppercase tracking-wider text-slate-400 py-4 px-6 text-right">Kontribusi Omset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(top_products || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Belum ada rekaman data produk terlaris.
                    </td>
                  </tr>
                ) : (
                  (top_products || []).map((prod, index) => (
                    <tr key={prod.id} className="hover:bg-slate-50/30 transition-colors group">
                      {/* Badge Peringkat */}
                      <td className="py-4 px-6 text-center">
                        <span className={`w-6 h-6 text-[11px] font-black font-mono rounded-lg flex items-center justify-center mx-auto border shadow-sm
                          ${index === 0 
                            ? 'bg-amber-100 border-amber-200 text-amber-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                          }
                        `}>
                          {index + 1}
                        </span>
                      </td>
                      {/* Nama Produk */}
                      <td className="text-xs sm:text-sm font-black text-slate-800 py-4 px-4 uppercase group-hover:text-brand transition-colors">
                        {prod.name}
                      </td>
                      {/* Volume Kuantitas Terjual */}
                      <td className="text-xs sm:text-sm font-bold text-slate-600 text-center font-mono py-4 px-4">
                        {prod.units_sold} <span className="text-[10px] font-bold text-slate-400 font-sans">Unit</span>
                      </td>
                      {/* Kontribusi Omset */}
                      <td className="text-xs sm:text-sm font-black text-slate-900 text-right font-mono py-4 px-6">
                        {formatRupiah(prod.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}