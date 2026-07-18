// app/admin/reports/transactions/_components/report-filter-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Loader2, XCircle, CalendarDays, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface FilterProps {
  initialStartDate: string;
  initialEndDate: string;
}

export function ReportFilterForm({ initialStartDate, initialEndDate }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 🟢 KUNCI REFACTOR: Simpan tanggal dalam state lokal agar tidak langsung memicu API fetch saat diketik
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Fungsi pengiriman query parameter yang dieksekusi eksklusif saat tombol diklik
  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();

    // 🟢 VALIDASI KETAT: Cek jika tanggal mulai melebihi tanggal selesai
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      if (start > end) {
        toast.error("Rentang Tanggal Tidak Valid!", {
          description: "Tanggal mulai filter tidak boleh melebihi atau melewati batas tanggal selesai.",
          icon: <AlertTriangle className="h-5 w-5 text-amber-500 fill-amber-500/10" />,
          duration: 5000,
        });
        return; // Hentikan eksekusi pengiriman data ke server
      }
    }

    const params = new URLSearchParams(searchParams.toString());
    
    if (startDate) params.set('start_date', startDate);
    else params.delete('start_date');

    if (endDate) params.set('end_date', endDate);
    else params.delete('end_date');

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
    <form 
      onSubmit={handleApplyFilter} 
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative"
    >
      
      {/* Loading overlay mini saat data sedang di-fetch ulang dari server */}
      {isPending && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest shrink-0">
          <Filter className="h-4 w-4 text-brand" /> Filter Tanggal:
        </div>

        {/* Input Tanggal Mulai */}
        <div className="flex flex-col space-y-1 flex-1">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)} // Hanya mengubah state lokal
            className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-brand transition-all cursor-pointer w-full"
          />
        </div>

        <div className="text-slate-300 font-bold hidden sm:block text-xs uppercase select-none">s/d</div>

        {/* Input Tanggal Selesai */}
        <div className="flex flex-col space-y-1 flex-1">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)} // Hanya mengubah state lokal
            className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-brand transition-all cursor-pointer w-full"
          />
        </div>
      </div>

      {/* Area Tombol Kontrol Filter */}
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        {/* Button Reset Filter */}
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleReset}
            className="h-11 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <XCircle className="h-4 w-4" /> Reset
          </button>
        )}

        {/* 🟢 TOMBOL SUBMIT FILTER UTAMA */}
        <button
          type="submit"
          disabled={isPending}
          className="h-11 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm w-full sm:w-auto"
        >
          <CalendarDays className="h-4 w-4 text-blue-400" /> Terapkan Filter
        </button>
      </div>

    </form>
  );
}