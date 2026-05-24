// app/(storefront)/transactions/[id]/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Receipt, ShoppingBag, CreditCard, Clock, ArrowRight, MessageSquare } from 'lucide-react';
import { getTransactionDetail } from '@/lib/api/transactions';
import { PreparationRequestButton } from './_components/preparation-request-button'; // ✅ IMPORT TOMBOL BARU
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

  const formatFullDate = (unixTimestamp: number) => {
    return new Date(unixTimestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
    }) + ' WIB';
  };

  const grandTotal = detail.items.reduce((acc, item) => acc + (item.count * Number(item.product_item.price)), 0);

  const whatsappAdminNumber = "628164889344"; // Ganti dengan nomor WhatsApp resmi toko Anda
  const chatMessage = encodeURIComponent(
    `Halo Admin Sahabat Sport, saya ingin bertanya terkait pesanan saya dengan Nomor Transaksi: ${detail.number}.`
  );
  const whatsappUrl = `https://wa.me/${whatsappAdminNumber}?text=${chatMessage}`;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* NAVIGASI BACK & HEADER EDITORIAL */}
        {/* ================= REFACTOR TOTAL HEADER AREA ================= */}
        <div className="space-y-6 pb-8 border-b border-slate-100">

          {/* Back Button */}
          <Link
            href="/transactions"
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Kembali ke Riwayat
          </Link>

          {/* Main Grid: Info Nota & Action Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Kiri: Nomor Nota & Rentetan Status Linier */}
            <div className="space-y-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <Receipt className="h-6 w-6 text-[#165dfc]" /> {detail.number}
              </h1>

              {/* STATUS FLOW BARIS HORIZONTAL (PREMIUM WORKFLOW LOOK) */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">

                {/* 1. Status Pembayaran */}
                <span className={`px-2 py-0.5 rounded-md font-black ${detail.is_paid ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                  }`}>
                  {detail.is_paid ? 'Lunas' : 'Belum Bayar'}
                </span>

                {/* Dot Separator */}
                <span className="w-1 h-1 bg-slate-200 rounded-full hidden sm:inline-block" />

                {/* 2. Status Kesiapan Barang */}
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span>Kesiapan:</span>
                  <span className={`font-black ${detail.is_ready ? 'text-indigo-600' : 'text-blue-500'
                    }`}>
                    {detail.is_ready ? 'Siap Diambil' : 'Sedang Diproses'}
                  </span>
                </div>

                {/* Dot Separator */}
                <span className="w-1 h-1 bg-slate-200 rounded-full hidden sm:inline-block" />

                {/* 3. Tanggal Dibuat */}
                <span className="text-slate-400 font-medium normal-case">
                  {formatFullDate(detail.created_at)}
                </span>
              </div>
            </div>

            {/* ORKESTRASI TOMBOL AKSI BERDASARKAN STATE */}
            {/* AREA REFACTOR: GRUP TOMBOL AKSI SEJAJAR */}
            <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">

              {/* ✅ REFACTOR: TOMBOL CHAT ADMIN DENGAN AKSEN HIJAU EMERALD PREMIUM */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center shadow-md shadow-emerald-600/10 border-none cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-emerald-100/80" /> Chat Admin
              </a>

              {/* TOMBOL UTAMA BERDASARKAN STATUS LOGIK (Tetap sama seperti sebelumnya) */}
              {detail.is_paid ? (
                detail.pic_proof_of_transfer_url && (
                  <PaymentProofModal transactionId={id} fileName={detail.pic_proof_of_transfer_url} />
                )
              ) : detail.is_ready ? (
                <Link
                  href={`/checkout/${id}`}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-[#165dfc] hover:bg-[#124ecb] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-[#165dfc]/10 active:scale-[0.99] text-center"
                >
                  <CreditCard className="h-4 w-4" /> Bayar Sekarang <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <PreparationRequestButton
                  transactionId={id}
                  isRequested={detail.is_requested}
                  requestedAtStr={detail.requested_at ? formatFullDate(detail.requested_at) : null}
                />
              )}
            </div>

          </div>
        </div>

        {/* LIST ITEM BELANJAAN */}
        <div className="space-y-6">
          {/* ... (Looping detail.items tetap sama seperti sebelumnya) ... */}
          <div className="divide-y divide-slate-100">
            {detail.items.map((item) => (
              <div key={item.id} className="py-5 flex items-center gap-4 sm:gap-6 first:pt-0 last:pb-0">
                <div className="relative h-16 w-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100/60 shrink-0">
                  <Image src={item.product_item.pic_url} alt={item.product_item.name} fill sizes="64px" className="object-cover" priority />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight">{item.product_item.name}</h3>
                  <p className="text-xs font-semibold text-slate-400">{formatRupiah(Number(item.product_item.price))} <span className="text-slate-300 mx-1">×</span> {item.count} item</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-slate-900 tracking-tight">{formatRupiah(item.count * Number(item.product_item.price))}</p>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-0.5">Subtotal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUMMARY RINGKASAN */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2.5 text-slate-400">
            <CreditCard className="h-4 w-4 text-slate-400" />
            <p className="text-[10px] font-black uppercase tracking-widest">Metode Pembayaran Terverifikasi</p>
          </div>
          <div className="w-full sm:w-auto text-right space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pembayaran</p>
            <p className="text-2xl font-black text-[#165dfc] tracking-tight">{formatRupiah(grandTotal)}</p>
          </div>
        </div>

      </div>
    </main>
  );
}