'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface Props {
  totalPages: number;
  currentPage: number;
}

export default function ProductPagination({ totalPages, currentPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Helper untuk membuat URL baru berdasarkan page yang diklik
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  const handlePageChange = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    if (page < 1 || page > totalPages || page === currentPage) return;

    startTransition(() => {
      router.push(createPageURL(page), { scroll: false });
    });
  };

  // Logic untuk merender nomor halaman (dengan ellipsis jika terlalu banyak)
  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 5;

    for (let i = 1; i <= totalPages; i++) {
      // Logic sederhana: Tampilkan halaman 1, terakhir, dan sekitar halaman aktif
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={createPageURL(i)}
              onClick={(e) => handlePageChange(e, i)}
              isActive={currentPage === i}
              className={cn(
                "rounded-xl border-none font-bold transition-all",
                currentPage === i 
                  ? "bg-[#165dfc] text-white shadow-lg shadow-blue-200 hover:bg-[#124ecb]" 
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (
        showEllipsis && 
        (i === currentPage - 2 || i === currentPage + 2)
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationEllipsis className="text-slate-300" />
          </PaginationItem>
        );
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn(
      "mt-10 flex flex-col items-center gap-4 transition-opacity",
      isPending ? "opacity-50 pointer-events-none" : "opacity-100"
    )}>
      <Pagination>
        <PaginationContent className="gap-2">
          
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              href={createPageURL(currentPage - 1)}
              onClick={(e) => handlePageChange(e, currentPage - 1)}
              className={cn(
                "rounded-xl border-slate-100 text-xs font-bold uppercase tracking-widest transition-all",
                currentPage <= 1 ? "pointer-events-none opacity-30" : "hover:bg-slate-50"
              )}
            />
          </PaginationItem>

          {/* Dynamic Page Numbers */}
          {renderPageNumbers()}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              href={createPageURL(currentPage + 1)}
              onClick={(e) => handlePageChange(e, currentPage + 1)}
              className={cn(
                "rounded-xl border-slate-100 text-xs font-bold uppercase tracking-widest transition-all",
                currentPage >= totalPages ? "pointer-events-none opacity-30" : "hover:bg-slate-50"
              )}
            />
          </PaginationItem>

        </PaginationContent>
      </Pagination>

      {/* Page Info Footer */}
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        Halaman <span className="text-slate-900">{currentPage}</span> dari <span className="text-slate-900">{totalPages}</span>
      </p>
    </div>
  );
}