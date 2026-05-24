// app/(storefront)/checkout/[id]/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { getTransactionDetail, getActiveBankAccounts } from '@/lib/api/transactions';
import { CheckoutForm } from './_components/checkout-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) redirect('/login');

  // Ambil data detail transaksi dan list akun bank secara paralel (Concurrent Fetching)
  const [detail, bankAccounts] = await Promise.all([
    getTransactionDetail(token, id).catch(() => null),
    getActiveBankAccounts(token).catch(() => [])
  ]);

  if (!detail) redirect('/transactions');

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const grandTotal = detail.items.reduce((acc, item) => acc + (item.count * Number(item.product_item.price)), 0);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <Link 
          href={`/transactions/${id}`} 
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Batalkan Pembayaran
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* KOLOM KIRI: FORM INTERAKTIF */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-1.5">
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#165dfc]" /> Metode Pembayaran
              </h1>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pilih rekening tujuan transfer dan unggah dokumen bukti transaksi
              </p>
            </div>

            {/* ✅ OPER DATA BANK DARI API SEBAGAI PROPS */}
            <CheckoutForm transactionId={id} bankAccounts={bankAccounts} />
          </div>

          {/* KOLOM KANAN: RINGKASAN TAGIHAN */}
          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-8 lg:pt-0 lg:pl-12 space-y-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Ringkasan Kewajiban
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nomor Nota</span>
                <span className="text-sm font-black text-slate-900">{detail.number}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Item</span>
                <span className="text-sm font-bold text-slate-700">{detail.items.length} Produk</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">Total Transfer</span>
                <p className="text-3xl font-black text-[#165dfc] tracking-tight text-right">
                  {formatRupiah(grandTotal)}
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-2 text-slate-400 justify-end">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Verifikasi Manual Aman & Terenkripsi
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}