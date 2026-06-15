// app/admin/dashboard/_components/dashboard-filter-form.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Loader2, Filter } from 'lucide-react';

export function DashboardFilterForm({ currentYear }: { currentYear: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentYearNum = new Date().getFullYear();
  const yearsOptions = Array.from({ length: 5 }, (_, i) => (currentYearNum - i).toString());

  const handleYearChange = (yearValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', yearValue);

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
          <Loader2 className="h-5 w-5 animate-spin text-[#165dfc]" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-blue-50 text-[#165dfc] rounded-xl flex items-center justify-center shadow-inner">
          <Filter className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Arsip Data Konsol</p>
          <p className="text-xs font-bold text-slate-700 mt-1">Saring Statistik Berdasarkan Tahun</p>
        </div>
      </div>

      <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2.5">Tahun:</span>
        <select
          value={currentYear}
          onChange={(e) => handleYearChange(e.target.value)}
          className="bg-transparent text-xs font-black text-[#165dfc] outline-none cursor-pointer appearance-none pr-1"
        >
          {yearsOptions.map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </div>
    </div>
  );
}