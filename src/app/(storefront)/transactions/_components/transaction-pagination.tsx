// app/(storefront)/transactions/_components/transaction-pagination.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function TransactionPagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isPending) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    
    startTransition(() => {
      router.push(`/transactions?${params.toString()}`);
    });
  };

  return (
    <div className="pt-6 border-t border-slate-100 flex items-center justify-between relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] z-10" />
      )}
      
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Halaman <span className="text-slate-800">{currentPage}</span> dari <span className="text-slate-800">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isPending}
          className="h-10 px-3.5 border border-slate-100 bg-white text-slate-600 font-bold text-xs uppercase tracking-wide flex items-center gap-1 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isPending}
          className="h-10 px-3.5 border border-slate-100 bg-white text-slate-600 font-bold text-xs uppercase tracking-wide flex items-center gap-1 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}