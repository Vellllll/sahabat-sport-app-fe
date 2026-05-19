'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) params.set('q', term); else params.delete('q');
    params.set('page', '1'); // Reset ke hal 1 saat search

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleCategory = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') params.set('category', value); else params.delete('category');
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Cari nama produk..."
          className="pl-10 rounded-2xl border-slate-100 bg-white focus:ring-4 focus:ring-blue-50 transition-all"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('q') ?? ''}
        />
        {isPending && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-500" />}
      </div>

      <Select 
        defaultValue={searchParams.get('category') ?? 'all'}
        onValueChange={handleCategory}
      >
        <SelectTrigger className="w-full md:w-[200px] rounded-2xl border-slate-100">
          <SelectValue placeholder="Semua Kategori" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          <SelectItem value="all">Semua Kategori</SelectItem>
          <SelectItem value="electronics">Elektronik</SelectItem>
          <SelectItem value="fashion">Fashion</SelectItem>
          <SelectItem value="food">Makanan</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}