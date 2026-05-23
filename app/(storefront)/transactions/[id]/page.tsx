// app/(storefront)/transactions/[id]/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Receipt, ShoppingBag, CreditCard, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { getTransactionDetail } from '@/lib/api/transactions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) redirect('/login');

  let detail = null;
  try {
    detail = await getTransactionDetail(token, id);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') redirect('/login');
  }

  if (!detail) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Detail Tidak Ditemukan</h3>
        <Link href="/transactions" className="text-xs font-black text-[#165dfc] uppercase tracking-widest mt-2 hover:underline">
          Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // Konversi Unix Timestamp (detik) ke Waktu & Tanggal Lokal Indonesia
  const formatFullDate = (unixTimestamp: number) => {
    return new Date(unixTimestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' WIB';
  };

  const grandTotal = detail.items.reduce((acc, item) => {
    return acc + (item.count * Number(item.product_item.price));
  }, 0);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* NAVIGASI BACK & HEADER EDITORIAL */}
        <div className="space-y-6 pb-8 border-b border-slate-100">
          <Link 
            href="/transactions" 
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Kembali ke Riwayat
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <Receipt className="h-6 w-6 text-[#165dfc]" /> {detail.number}
              </h1>
              {/* MENAMPILKAN created_at (CONVERTED TIMESTAMP) */}
              <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-300" /> Dibuat pada: <span className="text-slate-600 font-bold">{formatFullDate(detail.created_at)}</span>
              </p>
            </div>

            {/* BARIS REFACTOR: LIVE BADGE STATUS MONITOR */}
            <div className="flex flex-wrap gap-2 pt-1 md:pt-0">
              {/* Menampilkan Status Pembayaran (is_paid) */}
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border rounded-xl ${
                detail.is_paid 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {detail.is_paid ? 'Lunas' : 'Belum Bayar'}
              </span>

              {/* Menampilkan Status Kesiapan Barang (is_ready) */}
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border rounded-xl ${
                detail.is_ready 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                  : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}>
                {detail.is_ready ? 'Siap Diambil' : 'Sedang Diproses'}
              </span>
            </div>
          </div>
        </div>

        {/* LIST ITEM BELANJAAN (FRAMELESS ROWS) */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ShoppingBag className="h-3.5 w-3.5" /> Varian Produk Terpesan
          </h2>
          
          <div className="divide-y divide-slate-100">
            {detail.items.map((item) => {
              const priceNum = Number(item.product_item.price);
              const subTotal = item.count * priceNum;

              return (
                <div key={item.id} className="py-5 flex items-center gap-4 sm:gap-6 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100/60 shrink-0">
                    <Image
                      src={item.product_item.pic_url}
                      alt={item.product_item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      priority
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight">
                      {item.product_item.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400">
                      {formatRupiah(priceNum)} <span className="text-slate-300 mx-1">×</span> {item.count} item
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-slate-900 tracking-tight">
                      {formatRupiah(subTotal)}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-0.5">Subtotal</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SUMMARY RINGKASAN HARGA AKHIR */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2.5 text-slate-400">
            <CreditCard className="h-4 w-4 text-slate-400" />
            <p className="text-[10px] font-black uppercase tracking-widest">Metode Pembayaran Terverifikasi</p>
          </div>
          <div className="w-full sm:w-auto text-right space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pembayaran</p>
            <p className="text-2xl font-black text-[#165dfc] tracking-tight">
              {formatRupiah(grandTotal)}
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}