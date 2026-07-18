// app/admin/reports/transactions/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getTransactionReportSummary } from './actions';
import { 
  TrendingUp, CheckCircle2, XCircle, ArrowLeftRight, 
  BarChart3, Calendar, Download, RefreshCw, Layers, DollarSign, Wallet, ClipboardList
} from 'lucide-react';
import { ReportFilterForm } from './_components/report-filter-form';

interface PageProps {
  searchParams: Promise<{
    start_date?: string;
    end_date?: string;
  }>;
}

export default async function AdminTransactionReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const startDate = params.start_date || '';
  const endDate = params.end_date || '';

  // 🟢 AMBIL TOKEN DI SINI (Akar Utama Server Component)
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  // Jika token memang tidak ada sejak awal, baru diarahkan ke login
  if (!token) {
    redirect('/login');
  }

  // 🟢 Oper token ke server action secara eksplisit
  const apiResponse = await getTransactionReportSummary(token, {
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });

  // Jika token kedaluwarsa atau server down, tampilkan pesan error yang aman tanpa menendang user keluar
  if (!apiResponse || apiResponse.status !== 200) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 max-w-sm text-center space-y-4 shadow-sm">
          <XCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-slate-900 uppercase">Gagal Memuat Laporan</h2>
          <p className="text-xs font-semibold text-slate-400 normal-case leading-relaxed">
            Sesi pemicuan filter bermasalah atau koneksi API NestJS terputus. Silakan segarkan halaman browser Anda.
          </p>
        </div>
      </main>
    );
  }

  const { summary, monthly_trends } = apiResponse.result;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatMonthLabel = (yearMonthStr: string) => {
    const [year, month] = yearMonthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto space-y-8">
        
        {/* HEADER UTAMA REPORT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-2.5">
              <BarChart3 className="h-8 w-8 text-brand" /> Ikhtisar Pendapatan & Transaksi
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Filtered Executive Summary Data Dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="h-11 px-5 bg-brand text-white rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-brand-hover transition-all shadow-lg shadow-brand/10 cursor-pointer">
              <Download className="h-4 w-4" /> Cetak PDF
            </button>
          </div>
        </div>

        {/* BAR FILTER TANGGAL */}
        <Suspense fallback={<div className="h-16 bg-white rounded-2xl animate-pulse" />}>
          <ReportFilterForm initialStartDate={startDate} initialEndDate={endDate} />
        </Suspense>

        {/* CORE FINANCIAL METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Gross Revenue */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pendapatan Kotor (Gross)</span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-brand flex items-center justify-center shadow-inner">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight leading-none">
                {formatRupiah(summary.gross_revenue)}
              </h3>
              <p className="text-[10px] font-black text-blue-600 bg-blue-50 inline-block px-2.5 py-1 rounded-md uppercase tracking-wide">
                Nilai Akumulasi Koli Pesanan
              </p>
            </div>
          </div>

          {/* Card 2: Net Revenue */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pendapatan Bersih (Net)</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-4xl font-black text-emerald-600 font-mono tracking-tight leading-none">
                {formatRupiah(summary.net_revenue)}
              </h3>
              <p className="text-[10px] font-black text-white bg-emerald-600 inline-block px-2.5 py-1 rounded-md uppercase tracking-wide shadow-sm">
                Dana Bersih Terverifikasi
              </p>
            </div>
          </div>

          {/* Card 3: Total Transaksi */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Volume Sirkulasi Nota</span>
              <div className="h-9 w-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shadow-inner">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight leading-none">
                {summary.total_transactions} <span className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Invoice</span>
              </h3>
              <p className="text-[10px] font-black text-slate-500 bg-slate-100 inline-block px-2.5 py-1 rounded-md uppercase tracking-wide">
                Total Dokumen Terbit
              </p>
            </div>
          </div>
        </div>

        {/* DISTRIBUSI LOGISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand" /> Komposisi Arus Operasional
              </h2>
              <p className="text-xs font-medium text-slate-400">Pembagian status sirkulasi dokumen berjalan saat ini.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-black uppercase tracking-wide">
                  <span className="text-slate-500 flex items-center gap-1.5">⏳ Menunggu Pembayaran</span>
                  <span className="text-amber-600 font-mono">{summary.status_distribution.pending_payment} Invoice</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: summary.total_transactions > 0 ? `${(summary.status_distribution.pending_payment / summary.total_transactions) * 100}%` : '0%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-black uppercase tracking-wide">
                  <span className="text-slate-500 flex items-center gap-1.5">📦 Penyiapan Gudang / Lunas</span>
                  <span className="text-indigo-600 font-mono">{summary.status_distribution.paid_processing} Invoice</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: summary.total_transactions > 0 ? `${(summary.status_distribution.paid_processing / summary.total_transactions) * 100}%` : '0%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-black uppercase tracking-wide">
                  <span className="text-slate-500 flex items-center gap-1.5">✓ Sukses Terkirim / Diambil</span>
                  <span className="text-emerald-600 font-mono">{summary.status_distribution.completed} Invoice</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: summary.total_transactions > 0 ? `${(summary.status_distribution.completed / summary.total_transactions) * 100}%` : '0%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-black uppercase tracking-wide">
                  <span className="text-slate-500 flex items-center gap-1.5">✕ Dibatalkan / Reject Admin</span>
                  <span className="text-rose-600 font-mono">{summary.status_distribution.rejected} Invoice</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: summary.total_transactions > 0 ? `${(summary.status_distribution.rejected / summary.total_transactions) * 100}%` : '0%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Tren Bulanan */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" /> Tabel Tren Bulanan
              </h2>
              <p className="text-xs font-medium text-slate-400">Rekapitulasi pertumbuhan finansial berkala toko.</p>
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white mt-2">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80">
                  <tr className="border-b border-slate-100">
                    <th className="text-xs font-black uppercase tracking-wider text-slate-400 py-3.5 px-5">Bulan</th>
                    <th className="text-xs font-black uppercase tracking-wider text-slate-400 text-center">Volume</th>
                    <th className="text-xs font-black uppercase tracking-wider text-slate-400 text-right px-5">Total Omset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthly_trends.map((trend, index) => (
                    <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                      <td className="text-sm font-black text-slate-800 py-4 px-5 uppercase">
                        {formatMonthLabel(trend.month)}
                      </td>
                      <td className="text-sm font-bold text-slate-600 text-center font-mono">
                        {trend.transaction_count} <span className="text-[10px] font-bold text-slate-400 font-sans">Trx</span>
                      </td>
                      <td className="text-sm font-black text-brand text-right font-mono px-5">
                        {formatRupiah(trend.total_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}