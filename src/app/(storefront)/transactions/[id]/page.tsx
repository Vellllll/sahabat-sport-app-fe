// app/(storefront)/transactions/[id]/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Receipt, CreditCard, ArrowRight, MessageSquare,
  CheckCircle2, Clock, XCircle, PackageCheck, Truck, Loader2
} from 'lucide-react';
import { getTransactionDetail } from '@/lib/api/transactions';
import { PreparationRequestButton } from './_components/preparation-request-button';
import { PaymentProofModal } from './_components/payment-proof-modal';

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
        <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">Detail Tidak Ditemukan</h3>
        <Link href="/transactions" className="text-sm font-black text-brand uppercase tracking-widest mt-2 hover:underline">
          Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatFullDate = (unixTimestamp: number) => {
    return new Date(unixTimestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
    }) + ' WIB';
  };

  const grandTotal = detail.items.reduce((acc, item) => acc + (item.count * Number(item.product_item.price)), 0);

  const whatsappAdminNumber = "628164889344";
  const chatMessage = encodeURIComponent(
    `Halo Admin Sahabat Sport, saya ingin bertanya terkait pesanan saya dengan Nomor Transaksi: ${detail.number}.`
  );
  const whatsappUrl = `https://wa.me/${whatsappAdminNumber}?text=${chatMessage}`;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* AREA HEADER & STATUS SEPARASI */}
        <div className="space-y-6 pb-8 border-b border-slate-100">

          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Kembali ke Riwayat
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                <Receipt className="h-7 w-7 text-brand" /> #{detail.number}
              </h1>

              <p className="text-xs sm:text-sm font-bold text-slate-400 normal-case pl-1">
                Waktu Transaksi: {formatFullDate(detail.created_at)}
              </p>

              {/* PILL BADGES STATUS */}
              <div className="flex flex-wrap items-center gap-2 pl-0.5 pt-1">

                {/* 1. Status Pembayaran */}
                {detail.is_paid ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Lunas
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-black uppercase tracking-wider shadow-sm">
                    <Clock className="h-4 w-4 text-amber-600" /> Belum Bayar
                  </span>
                )}

                {/* 2. Status Logistik Pemenuhan */}
                {detail.is_rejected ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider shadow-sm">
                    <XCircle className="h-4 w-4 text-rose-600" /> Dibatalkan
                  </span>
                ) : detail.is_sent ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider shadow-sm">
                    <Truck className="h-4 w-4 text-blue-600" /> Selesai Terkirim
                  </span>
                ) : detail.is_ready ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider shadow-sm">
                    <PackageCheck className="h-4 w-4 text-indigo-600" /> Siap Diambil
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> Diproses Gudang
                  </span>
                )}

              </div>
            </div>

            {/* ========================================================================= */}
            {/* 🛠️ ORKESTRASI TOMBOL UTAMA BERDASARKAN STATUS (DENGAN REFACTOR REJECT BLOCK) */}
            {/* ========================================================================= */}
            <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center shadow-md shadow-emerald-600/10 border-none cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-emerald-100/80" /> Chat Admin
              </a>

              {/* ✅ EVALUASI STRUKTUR UTAMA WORKFLOW */}
              {detail.is_rejected ? (
                // JIKA TEREJECT: Jangan tampilkan tombol persiapan, bayar, atau bukti transfer apapun.
                null
              ) : detail.is_paid ? (
                detail.pic_proof_of_transfer_url && (
                  <PaymentProofModal transactionId={id} fileName={detail.pic_proof_of_transfer_url} />
                )
              ) : detail.is_ready ? (
                <Link
                  href={`/checkout/${id}`}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand/10 active:scale-[0.99] text-center"
                >
                  <CreditCard className="h-4 w-4" /> Bayar Sekarang <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                // Tombol "SEDANG DISIAPKAN ADMIN" / "MINTA PENYIAPAN BARANG" aman di sini
                <PreparationRequestButton
                  transactionId={id}
                  isRequested={detail.is_requested}
                  requestedAtStr={detail.requested_at ? formatFullDate(detail.requested_at) : null}
                />
              )}
            </div>
          </div>

          {/* BOX INFO ALASAN PENOLAKAN JIKA STATUS ADALAH TEREJECT */}
          {detail.is_rejected && detail.reject_note && (
            <div className="mt-6 p-5 bg-rose-50 border border-rose-100 rounded-2xl space-y-1.5 text-sm sm:text-base shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <XCircle className="h-4 w-4" /> Informasi Pembatalan Toko
              </p>
              <p className="text-rose-900 font-extrabold normal-case leading-relaxed">
                "{detail.reject_note}"
              </p>
            </div>
          )}

        </div>

        {/* LIST ITEM BELANJAAN */}
        <div className="space-y-6">
          <div className="divide-y divide-slate-100">
            {detail.items.map((item) => (
              <div key={item.id} className="py-6 flex items-center gap-4 sm:gap-6 first:pt-0 last:pb-0 hover:bg-slate-50/30 rounded-xl transition-colors px-1">
                <div className="relative h-20 w-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100/80 shrink-0 shadow-sm">
                  <Image src={item.product_item.pic_url} alt={item.product_item.name} fill sizes="80px" className="object-cover" priority />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 truncate tracking-tight uppercase">
                    {item.product_item.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-slate-400">
                    {formatRupiah(Number(item.product_item.price))} <span className="text-slate-300 mx-1 font-black">×</span> {item.count} item
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight">
                    {formatRupiah(item.count * Number(item.product_item.price))}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Subtotal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUMMARY RINGKASAN TOTAL */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/40 p-6 rounded-2xl border border-dashed">
          <div className="flex items-center gap-2.5 text-slate-400">
            <CreditCard className="h-5 w-5 text-slate-400" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Metode Pembayaran Terverifikasi</p>
          </div>
          <div className="w-full sm:w-auto text-right space-y-1">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Pembayaran</p>
            <p className="text-2xl sm:text-4xl font-black text-brand font-mono tracking-tight">
              {formatRupiah(grandTotal)}
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}