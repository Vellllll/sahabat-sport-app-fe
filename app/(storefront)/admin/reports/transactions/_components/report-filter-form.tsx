// app/admin/reports/transactions/_components/report-filter-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Loader2, XCircle } from 'lucide-react';

interface FilterProps {
  initialStartDate: string;
  initialEndDate: string;
}

export function ReportFilterForm({ initialStartDate, initialEndDate }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const applyFilter = (start: string, end: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (start) params.set('start_date', start);
    else params.delete('start_date');

    if (end) params.set('end_date', end);
    else params.delete('end_date');

    // Mendorong state baru ke URL Next.js secara aman (Server Component otomatis me-re-fetch data API)
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    startTransition(() => {
      router.push('?');
    });
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
      
      {/* Loading overlay mini saat data sedang di-fetch ulang dari server */}
      {isPending && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
          <Loader2 className="h-5 w-5 animate-spin text-[#165dfc]" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest shrink-0">
          <Filter className="h-4 w-4 text-[#165dfc]" /> Filter Tanggal:
        </div>

        {/* Input Tanggal Mulai */}
        <div className="flex flex-col space-y-1 flex-1">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              applyFilter(e.target.value, endDate);
            }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] transition-all cursor-pointer"
          />
        </div>

        <div className="text-slate-300 font-bold hidden sm:block">s/d</div>

        {/* Input Tanggal Selesai */}
        <div className="flex flex-col space-y-1 flex-1">
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              applyFilter(startDate, e.target.value);
            }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* Button Reset Filter */}
      {(startDate || endDate) && (
        <button
          onClick={handleReset}
          className="h-10 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <XCircle className="h-4 w-4" /> Reset Filter
        </button>
      )}

    </div>
  );
}