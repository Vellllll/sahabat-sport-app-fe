// app/(storefront)/transactions/_components/transaction-filter-bar.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface FilterProps {
  currentFilters: {
    q: string;
    startDate: string;
    endDate: string;
    fulfillment: string;
  };
}

export function TransactionFilterBar({ currentFilters }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local states untuk menampung input user
  const [q, setQ] = useState(currentFilters.q);
  const [startDate, setStartDate] = useState(currentFilters.startDate);
  const [endDate, setEndDate] = useState(currentFilters.endDate);
  const [fulfillment, setFulfillment] = useState(currentFilters.fulfillment);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Update pencarian, reset ke page 1 tiap ganti filter
      if (q) params.set('q', q); else params.delete('q');
      if (startDate) params.set('startDate', startDate); else params.delete('startDate');
      if (endDate) params.set('endDate', endDate); else params.delete('endDate');
      if (fulfillment && fulfillment !== 'ALL') params.set('fulfillment', fulfillment); else params.delete('fulfillment');
      params.set('page', '1'); 

      router.push(`/transactions?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setQ('');
    setStartDate('');
    setEndDate('');
    setFulfillment('ALL');
    router.push('/transactions');
  };

  const hasActiveFilter = currentFilters.q || currentFilters.startDate || currentFilters.endDate || currentFilters.fulfillment !== 'ALL';

  return (
    <form onSubmit={handleApplyFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end text-slate-700">
      
      {/* Cari Nomor Transaksi */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">No. Transaksi</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="TRX-XXXX..."
            className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 text-xs font-bold outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all"
          />
        </div>
      </div>

      {/* Tanggal Mulai */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Mulai Tanggal</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all text-slate-600"
        />
      </div>

      {/* Tanggal Selesai */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Sampai Tanggal</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all text-slate-600"
        />
      </div>

      {/* Status Kesiapan Barang */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Kesiapan Barang</label>
        <select
          value={fulfillment}
          onChange={(e) => setFulfillment(e.target.value)}
          className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all text-slate-600 appearance-none"
        >
          <option value="ALL">SEMUA STATUS</option>
          <option value="PREPARING">PREPARING</option>
          <option value="READY_TO_PICK">READY TO PICK</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELED">CANCELED</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-11 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
        >
          <Filter className="h-3.5 w-3.5" /> {isPending ? 'Saring...' : 'Filter'}
        </button>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={handleReset}
            className="h-11 w-11 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center cursor-pointer"
            title="Reset Filter"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>

    </form>
  );
}