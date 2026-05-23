// app/(storefront)/transactions/_components/transaction-table.tsx
'use client';

import { useState } from 'react';
import { Transaction, PaymentStatus, FulfillmentStatus } from '@/lib/types/transactions';
import { Calendar, Receipt, DollarSign, CreditCard, Package } from 'lucide-react';

export function TransactionTable({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions] = useState<Transaction[]>(initialTransactions);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // MAPPING WARNA BADGE STATUS PEMBAYARAN
  const getPaymentBadge = (status: PaymentStatus) => {
    const styles: Record<PaymentStatus, string> = {
      PAID: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
      EXPIRED: 'bg-slate-100 text-slate-600 border-slate-200',
      FAILED: 'bg-red-50 text-red-700 border-red-100'
    };
    return styles[status] || styles['PENDING'];
  };

  // MAPPING WARNA BADGE STATUS fulfillment BARANG
  const getFulfillmentBadge = (status: FulfillmentStatus) => {
    const styles: Record<FulfillmentStatus, string> = {
      PREPARING: 'bg-blue-50 text-blue-700 border-blue-100',
      READY_TO_PICK: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      SHIPPED: 'bg-purple-50 text-purple-700 border-purple-100',
      COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      CANCELED: 'bg-red-50 text-red-700 border-red-100'
    };
    return styles[status] || styles['PREPARING'];
  };

  return (
    <div className="w-full">
      {/* ================= DESKTOP LAYOUT (TABLE VIEW) ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest h-12">
              <th className="pb-4 pl-2"><span className="flex items-center gap-1.5"><Receipt className="h-3.5 w-3.5" /> No. Transaksi</span></th>
              <th className="pb-4"><span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Tanggal</span></th>
              <th className="pb-4"><span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Total</span></th>
              <th className="pb-4"><span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Pembayaran</span></th>
              <th className="pb-4 pr-2"><span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Kesiapan Barang</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-5 pl-2 font-black text-slate-900 group-hover:text-[#165dfc] transition-colors">
                  {tx.transaction_number}
                </td>
                <td className="py-5 text-slate-500 font-medium">
                  {formatDate(tx.created_at)}
                </td>
                <td className="py-5 font-black text-slate-900">
                  {formatRupiah(tx.total_amount)}
                </td>
                <td className="py-5">
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border rounded-md ${getPaymentBadge(tx.payment_status)}`}>
                    {tx.payment_status}
                  </span>
                </td>
                <td className="py-5 pr-2">
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border rounded-md ${getFulfillmentBadge(tx.fulfillment_status)}`}>
                    {tx.fulfillment_status.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE LAYOUT (LIST CARD RESPONSIVE FALLBACK) ================= */}
      <div className="block md:hidden space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="py-5 border-b border-slate-100 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-black text-slate-900">{tx.transaction_number}</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">{formatDate(tx.created_at)}</p>
              </div>
              <p className="text-sm font-black text-slate-900">{formatRupiah(tx.total_amount)}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="space-y-1 flex-1 min-w-[120px]">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Pembayaran</span>
                <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-md ${getPaymentBadge(tx.payment_status)}`}>
                  {tx.payment_status}
                </span>
              </div>
              <div className="space-y-1 flex-1 min-w-[120px]">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Kesiapan Barang</span>
                <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-md ${getFulfillmentBadge(tx.fulfillment_status)}`}>
                  {tx.fulfillment_status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}