// app/(storefront)/transactions/_components/transaction-filter-bar.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, RotateCcw } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterProps {
  currentFilters: {
    q: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

export function TransactionFilterBar({ currentFilters }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Sinkronisasi local state
  const [q, setQ] = useState(currentFilters.q);
  const [startDate, setStartDate] = useState(currentFilters.startDate);
  const [endDate, setEndDate] = useState(currentFilters.endDate);
  const [status, setStatus] = useState(currentFilters.status);

  // Efek reaktif jika parameter URL diubah dari luar komponen (misal tombol reset navbar)
  useEffect(() => {
    setQ(currentFilters.q);
    setStartDate(currentFilters.startDate);
    setEndDate(currentFilters.endDate);
    setStatus(currentFilters.status);
  }, [currentFilters]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (q.trim()) params.set('q', q.trim()); else params.delete('q');
      if (startDate) params.set('startDate', startDate); else params.delete('startDate');
      if (endDate) params.set('endDate', endDate); else params.delete('endDate');
      if (status && status !== 'ALL') params.set('status', status); else params.delete('status');
      
      params.set('page', '1'); 
      router.push(`/transactions?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setQ('');
    setStartDate('');
    setEndDate('');
    setStatus('ALL');
    startTransition(() => {
      router.push('/transactions');
    });
  };

  const hasActiveFilter = currentFilters.q || currentFilters.startDate || currentFilters.endDate || currentFilters.status !== 'ALL';

  return (
    <form onSubmit={handleApplyFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end text-slate-700 relative">
      
      {isPending && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px] rounded-2xl z-20 flex items-center justify-center" />
      )}

      {/* Input Nota */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">No. Transaksi</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="TRX-2026..."
            className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 text-xs font-bold outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all text-slate-800"
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
          className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none focus:bg-white focus:border-[#165dfc] transition-all text-slate-600 cursor-pointer"
        />
      </div>

      {/* Tanggal Akhir */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Sampai Tanggal</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none focus:bg-white focus:border-[#165dfc] transition-all text-slate-600 cursor-pointer"
        />
      </div>

      {/* Status Dropdown Premium via Shadcn UI */}
      <div className="space-y-1.5 flex flex-col">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Status Pesanan</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 shadow-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all cursor-pointer">
            <SelectValue placeholder="SEMUA STATUS" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-slate-100 shadow-xl rounded-xl p-1 z-50">
            <SelectItem value="ALL" className="text-xs font-bold uppercase py-2.5 px-3 rounded-lg cursor-pointer text-slate-700">Semua Status</SelectItem>
            <SelectItem value="READY" className="text-xs font-bold uppercase py-2.5 px-3 rounded-lg cursor-pointer text-indigo-600">Siap Diambil</SelectItem>
            <SelectItem value="PROCESSING" className="text-xs font-bold uppercase py-2.5 px-3 rounded-lg cursor-pointer text-blue-600">Sedang Diproses</SelectItem>
            <SelectItem value="SENT" className="text-xs font-bold uppercase py-2.5 px-3 rounded-lg cursor-pointer text-emerald-600">Terkirim</SelectItem>
            <SelectItem value="REJECTED" className="text-xs font-bold uppercase py-2.5 px-3 rounded-lg cursor-pointer text-rose-600">Tereject</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-11 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Filter className="h-3.5 w-3.5" /> Saring
        </button>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="h-11 w-11 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            title="Reset Saringan"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}