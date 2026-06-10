// app/(storefront)/transactions/_components/transaction-table.tsx
'use client';

import { TransactionItem } from '@/lib/api/transactions';
import { Calendar, Receipt, DollarSign, CreditCard, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link'; // ✅ IMPORT LINK UNTUK NAVIGASI DYNAMIC

export function TransactionTable({ initialTransactions }: { initialTransactions: TransactionItem[] }) {
  
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (unixTimestamp: number) => {
    return new Date(unixTimestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full">
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {/* ✅ MERAPATKAN TAG: Pastikan tidak ada spasi/enter di antara <tr> dan <th> */}
            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest h-12">
              <th className="pb-4 pl-2"><span className="flex items-center gap-1.5"><Receipt className="h-3.5 w-3.5" /> No. Transaksi</span></th>
              <th className="pb-4"><span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Tanggal</span></th>
              <th className="pb-4"><span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Total</span></th>
              <th className="pb-4"><span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Pembayaran</span></th>
              <th className="pb-4"><span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Status Pesanan</span></th>
              <th className="pb-4 pr-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
            {initialTransactions.map((tx) => (
              /* ✅ MERAPATKAN TAG: Rapatkan seluruh baris <td> di dalam loop agar terhindar dari text node liar */
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-5 pl-2 font-black text-slate-900 group-hover:text-[#165dfc] transition-colors">{tx.number}</td>
                <td className="py-5 text-slate-500 font-medium">{formatDate(tx.created_at)}</td>
                <td className="py-5 font-black text-slate-900">{formatRupiah(tx.total_amount)}</td>
                <td className="py-5">
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border rounded-md ${tx.is_paid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                    {tx.is_paid ? 'Lunas' : 'Belum Bayar'}
                  </span>
                </td>
                <td className="py-5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {!tx.is_rejected && !tx.is_sent && (
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border rounded-md ${tx.is_ready ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {tx.is_ready ? 'Siap Diambil' : 'Diproses'}
                      </span>
                    )}
                    {tx.is_sent && (
                      <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border rounded-md bg-purple-50 text-purple-700 border-purple-100">
                        Terkirim
                      </span>
                    )}
                    {tx.is_rejected && (
                      <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border rounded-md bg-red-50 text-red-700 border-red-100">
                        Tereject
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-5 pr-2 text-right">
                  <Link href={`/transactions/${tx.id}`} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#165dfc] transition-all hover:gap-2 cursor-pointer">
                    Detail <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE VIEW ================= */}
      <div className="block md:hidden space-y-4">
        {initialTransactions.map((tx) => (
          <div key={tx.id} className="py-5 border-b border-slate-100 space-y-4 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-black text-slate-900 group-hover:text-[#165dfc] transition-colors">{tx.number}</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">{formatDate(tx.created_at)}</p>
              </div>
              <p className="text-sm font-black text-slate-900">{formatRupiah(tx.total_amount)}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="space-y-1 flex-1 min-w-[120px]">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Pembayaran</span>
                <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-md ${tx.is_paid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  {tx.is_paid ? 'Lunas' : 'Belum Bayar'}
                </span>
              </div>
              <div className="space-y-1 flex-1 min-w-[120px]">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Status Pesanan</span>
                <div className="flex flex-wrap gap-1.5">
                  {!tx.is_rejected && !tx.is_sent && (
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-md ${tx.is_ready ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                      {tx.is_ready ? 'Siap Diambil' : 'Diproses'}
                    </span>
                  )}
                  {tx.is_sent && (
                    <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-md bg-purple-50 text-purple-700 border-purple-100">
                      Terkirim
                    </span>
                  )}
                  {tx.is_rejected && (
                    <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-md bg-red-50 text-red-700 border-red-100">
                      Tereject
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ TOMBOL DETAIL MOBILE (PREMIUM SLATE FULL WIDTH BLOCK) */}
            <div className="pt-2">
              <Link
                href={`/transactions/${tx.id}`}
                className="w-full bg-slate-50 hover:bg-[#165dfc] text-slate-700 hover:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-100/50 hover:border-[#165dfc]"
              >
                Lihat Detail Pesanan <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}