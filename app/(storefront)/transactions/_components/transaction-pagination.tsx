// app/(storefront)/transactions/_components/transaction-pagination.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function TransactionPagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    
    router.push(`/transactions?${params.toString()}`);
  };

  return (
    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
      
      {/* Teks Info Halaman */}
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Halaman <span className="text-slate-800">{currentPage}</span> dari <span className="text-slate-800">{totalPages}</span>
      </p>

      {/* Tombol Navigasi */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-10 px-3 border border-slate-100 rounded-xl bg-white text-slate-600 font-bold text-xs uppercase tracking-wide flex items-center gap-1 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-10 px-3 border border-slate-100 rounded-xl bg-white text-slate-600 font-bold text-xs uppercase tracking-wide flex items-center gap-1 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  );
}