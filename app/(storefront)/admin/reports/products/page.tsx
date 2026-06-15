// app/admin/reports/products/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getMonthlyProductSalesReport } from './actions';
import { 
  Calendar, Download, Package, 
  TrendingUp, ShoppingBag, DollarSign, Award, Trophy
} from 'lucide-react';
import { ProductReportFilterForm } from './_components/product-report-filter-form';

interface PageProps {
  searchParams: Promise<{
    year?: string;
  }>;
}

export default async function AdminProductSalesReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedYear = params.year || new Date().getFullYear().toString();

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    redirect('/login');
  }

  const apiResponse = await getMonthlyProductSalesReport(token, { year: selectedYear });

  if (!apiResponse || apiResponse.status !== 200) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 max-w-sm text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">✕</div>
          <h2 className="text-lg font-black text-slate-900 uppercase">Gagal Memuat Laporan</h2>
          <p className="text-xs font-semibold text-slate-400 normal-case leading-relaxed">
            Koneksi API bermasalah atau sesi Anda habis. Silakan segarkan halaman browser Anda.
          </p>
        </div>
      </main>
    );
  }

  // 🟢 PROTEKSI 1: Berikan fallback objek kosong jika result atau properti di dalamnya undefined
  const { 
    year = selectedYear, 
    top_products = [], 
    monthly_data = {} 
  } = apiResponse.result || {};

  // Kalkulasi Ringkasan Tahunan Dinamis dengan proteksi data kosong
  let annualTotalRevenue = 0;
  let annualTotalQtySold = 0;
  
  const allMonths = Object.keys(monthly_data).sort((a, b) => b.localeCompare(a));

  allMonths.forEach(month => {
    // Pastikan array produk di dalam bulan tersebut ada sebelum di-loop
    const monthItems = monthly_data[month] || [];
    monthItems.forEach(item => {
      annualTotalRevenue += item.total_revenue || 0;
      annualTotalQtySold += item.quantity_sold || 0;
    });
  });

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatMonthHeader = (yearMonthStr: string) => {
    const [yr, mo] = yearMonthStr.split('-');
    const date = new Date(parseInt(yr), parseInt(mo) - 1, 1);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
  };

  const getRankBadgeStyle = (index: number) => {
    switch(index) {
      case 0: return 'bg-amber-100 text-amber-700 border-amber-200';
      case 1: return 'bg-slate-100 text-slate-700 border-slate-200';
      case 2: return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto space-y-10">
        
        {/* HEADER UTAMA REPORT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-2.5">
              <Package className="h-8 w-8 text-[#165dfc]" /> Laporan Penjualan Produk
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Analisis Volume Kuantitas Varian Terjual • Tahun {year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-11 px-5 bg-[#165dfc] text-white rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-[#124ecb] transition-all shadow-lg shadow-[#165dfc]/10 cursor-pointer">
              <Download className="h-4 w-4" /> Export Excel
            </button>
          </div>
        </div>

        {/* BAR FILTER TAHUNAN */}
        <Suspense fallback={<div className="h-16 bg-white rounded-2xl animate-pulse" />}>
          <ProductReportFilterForm currentYear={year} />
        </Suspense>

        {/* ANNUAL METRIC CARDS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4 border-l-4 border-l-[#165dfc]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Omset Produk ({year})</span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#165dfc] flex items-center justify-center shadow-inner">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight leading-none">
                {formatRupiah(annualTotalRevenue)}
              </h3>
              <p className="text-[10px] font-black text-[#165dfc] bg-blue-50 inline-block px-2.5 py-1 rounded-md uppercase tracking-wide">
                Total Nilai Bruto Perputaran Produk
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Volume Item Terjual</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight leading-none">
                {annualTotalQtySold.toLocaleString('id-ID')} <span className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Pcs</span>
              </h3>
              <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 inline-block px-2.5 py-1 rounded-md uppercase tracking-wide">
                Total Kuantitas Fisik Keluar Gudang
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 🔥 SEKSI TOP PRODUCTS LEADERBOARD (DENGAN PROTEKSI ARRAYS .MAP) */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pl-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.15em]">
              5 Produk Terlaris Utama ({year})
            </h2>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-2">
            <div className="divide-y divide-slate-100">
              {/* 🟢 PROTEKSI 2: Menambahkan fallback array kosong (top_products || []) sebelum .map */}
              {(top_products || []).length === 0 ? (
                <div className="text-center py-8 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tidak ada data produk terlaris di tahun ini
                </div>
              ) : (
                (top_products || []).map((item, index) => (
                  <div key={item.product_id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors first:pt-3 last:pb-3 rounded-2xl">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-xl border font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-sm ${getRankBadgeStyle(index)}`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-sm sm:text-base font-black text-slate-800 truncate uppercase tracking-tight">
                          {item.product_name}
                        </h4>
                        <p className="text-[10px] font-mono font-bold text-slate-400">PRODUCT ID: #{item.product_id}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-8 px-2 sm:px-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 border-dashed">
                      <div className="sm:text-right space-y-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Volume</p>
                        <p className="text-sm font-black text-slate-700 font-mono">
                          {(item.total_units_sold || 0).toLocaleString('id-ID')} <span className="text-[11px] font-sans font-bold text-slate-400">Pcs</span>
                        </p>
                      </div>
                      <div className="text-right space-y-0.5 min-w-[120px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Penjualan</p>
                        <p className="text-sm sm:text-base font-black text-emerald-600 font-mono">
                          {formatRupiah(item.total_revenue || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 📉 DAFTAR BREAKDOWN BULANAN (DENGAN PROTEKSI DATA MANIFEST TABEL) */}
        {/* ========================================================================= */}
        <div className="space-y-8 pt-2">
          <div className="flex items-center gap-2 pl-2 border-t border-slate-200/60 pt-6">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">
              Breakdown Kinerja Varian Bulanan
            </h2>
          </div>

          {allMonths.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[32px] border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Belum ada data breakdown bulanan</p>
            </div>
          ) : (
            allMonths.map((monthKey) => {
              // 🟢 PROTEKSI 3: Pastikan array produk bulanan tidak undefined/null
              const products = monthly_data[monthKey] || [];
              
              return (
                <div key={monthKey} className="space-y-3">
                  <div className="flex items-center gap-2 pl-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#165dfc]" />
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      {formatMonthHeader(monthKey)}
                    </h3>
                  </div>

                  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                          <th className="text-xs font-black uppercase tracking-wider text-slate-400 py-4 px-6 w-16 text-center">ID</th>
                          <th className="text-xs font-black uppercase tracking-wider text-slate-400 py-4 px-4">Nama Produk</th>
                          <th className="text-xs font-black uppercase tracking-wider text-slate-400 py-4 px-4 text-center">Qty</th>
                          <th className="text-xs font-black uppercase tracking-wider text-slate-400 py-4 px-6 text-right">Omset</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-6 text-xs font-bold text-slate-400">
                              Tidak ada transaksi di bulan ini
                            </td>
                          </tr>
                        ) : (
                          products.map((item) => (
                            <tr key={item.product_id} className="hover:bg-slate-50/30 transition-colors group">
                              <td className="text-xs font-mono font-bold text-slate-400 py-4 px-6 text-center">#{item.product_id}</td>
                              <td className="text-sm sm:text-base font-black text-slate-800 py-4 px-4 uppercase group-hover:text-[#165dfc] transition-colors">
                                {item.product_name}
                              </td>
                              <td className="text-sm sm:text-base font-bold text-slate-600 text-center font-mono py-4 px-4">
                                {(item.quantity_sold || 0).toLocaleString('id-ID')} <span className="text-xs font-sans font-bold text-slate-400">Unit</span>
                              </td>
                              <td className="text-sm sm:text-base font-black text-slate-900 text-right font-mono py-4 px-6">
                                {formatRupiah(item.total_revenue || 0)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </main>
  );
}