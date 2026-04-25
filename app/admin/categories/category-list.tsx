'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Tag, ChevronLeft, ChevronRight, Loader2, ListFilter } from 'lucide-react';

interface Props {
  initialData: any[];
  totalPages: number;
  currentPage: number;
  currentLimit: number;
}

export default function CategoryListOptimized({ initialData, totalPages, currentPage, currentLimit }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');

  const updateUrl = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value.toString());
    });
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleLimitChange = (newLimit: string) => {
    updateUrl({ limit: newLimit, page: 1 }); // Reset ke hal 1 jika limit berubah
  };

  return (
    <div className="space-y-6">
      {/* Search Bar - Sama seperti sebelumnya */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={inputValue}
            placeholder="Cari kategori..."
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 rounded-2xl outline-none transition-all text-sm font-semibold text-slate-700"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateUrl({ q: inputValue, page: 1 })}
          />
        </div>
        <button
          onClick={() => updateUrl({ q: inputValue, page: 1 })}
          disabled={isPending}
          className="bg-[#165dfc] text-white px-6 rounded-2xl font-bold text-xs hover:bg-[#124ecb] transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CARI'}
        </button>
      </div>

      {/* List Area */}
      <div className={`space-y-2 min-h-[300px] ${isPending ? 'opacity-50' : 'opacity-100 transition-opacity'}`}>
        {initialData.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-2xl">
             {/* ... item content ... */}
             <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-[#165dfc]" />
                <span className="text-sm font-bold text-slate-700">{cat.name}</span>
             </div>
          </div>
        ))}
      </div>

      {/* Pagination & Limit Control */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-50">
        
        {/* Limit Selector */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baris:</span>
          <select 
            value={currentLimit}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="bg-transparent text-xs font-black text-[#165dfc] outline-none cursor-pointer"
          >
            {[10, 20, 50, 100].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => updateUrl({ page: currentPage - 1 })}
            disabled={currentPage <= 1 || isPending}
            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-10 transition-all"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>

          <span className="text-[10px] font-black text-slate-500 min-w-[60px] text-center uppercase tracking-widest">
            {currentPage} / {totalPages}
          </span>

          <button 
            onClick={() => updateUrl({ page: currentPage + 1 })}
            disabled={currentPage >= totalPages || isPending}
            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-10 transition-all"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}