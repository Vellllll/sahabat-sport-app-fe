"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Tag, ArrowUpDown, ShoppingBag, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Category, ProductFromAPI } from "@/types/storefront";

interface Props {
  initialProducts: ProductFromAPI[];
  categories: Category[];
  currentFilters: { q: string; category: string; minPrice: number | string; maxPrice: number | string; sort: string; page: number };
  totalPages: number;
  totalItems: number;
}

export default function ProductStorefront({ initialProducts, categories, currentFilters, totalPages, totalItems }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(currentFilters.q);
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice);

  const applyFilters = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-8">
      
      {/* BAR FILTER TOKO ONLINE */}
      <ProductFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        currentFilters={currentFilters}
        categories={categories}
        applyFilters={applyFilters}
        isPending={isPending}
      />

      {/* CUSTOMER SHOP GRID */}
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${isPending ? 'opacity-40 transition-opacity' : ''}`}>
        {initialProducts.length > 0 ? (
          initialProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      {/* STOREFRONT PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentFilters.page} 
          totalPages={totalPages} 
          applyFilters={applyFilters} 
          isPending={isPending} 
        />
      )}

    </div>
  );
}

function ProductFilters({ 
  searchQuery, setSearchQuery, 
  minPrice, setMinPrice, 
  maxPrice, setMaxPrice, 
  currentFilters, categories, applyFilters, isPending 
}: any) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        <div className="relative lg:col-span-2">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            placeholder="Cari perlengkapan olahraga..."
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters({ q: searchQuery, page: 1 })}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-2xl outline-none transition-all text-sm font-semibold text-slate-700"
          />
        </div>

        <div className="relative">
          <Tag className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <select
            value={currentFilters.category}
            onChange={(e) => applyFilters({ category: e.target.value, page: 1 })}
            className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-2xl outline-none transition-all text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <ArrowUpDown className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <select
            value={currentFilters.sort}
            onChange={(e) => applyFilters({ sort: e.target.value, page: 1 })}
            className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-2xl outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer uppercase tracking-wider"
          >
            <option value="latest">Terbaru</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pt-4 border-t border-slate-50 justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-2">Rentang Harga:</span>
          <input
            type="number"
            value={minPrice}
            placeholder="Min Rp"
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => applyFilters({ minPrice: minPrice, page: 1 })}
            className="w-full md:w-36 px-4 py-2.5 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-xl outline-none transition-all text-xs font-bold text-slate-700"
          />
          <span className="text-slate-300 font-bold text-xs">-</span>
          <input
            type="number"
            value={maxPrice}
            placeholder="Max Rp"
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => applyFilters({ maxPrice: maxPrice, page: 1 })}
            className="w-full md:w-36 px-4 py-2.5 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-xl outline-none transition-all text-xs font-bold text-slate-700"
          />
        </div>

        <button
          onClick={() => applyFilters({ q: searchQuery, minPrice, maxPrice, page: 1 })}
          disabled={isPending}
          className="w-full md:w-auto bg-brand text-white px-8 py-3 rounded-xl font-bold text-xs tracking-widest hover:bg-brand-hover transition-all disabled:opacity-50"
        >
          {isPending ? "MENCARI..." : "TERAPKAN"}
        </button>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: ProductFromAPI }) {
  const formatRupiah = (angka: number | null) => {
    if (angka === null) return "Hubungi Admin";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-white rounded-[24px] border border-slate-100/80 overflow-hidden hover:shadow-[0_16px_40px_rgba(0,0,0,0.04)] hover:border-slate-200/60 transition-all flex flex-col h-full cursor-pointer"
    >
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-50 shrink-0">
        {product.lowest_pic_url ? (
          <img 
            src={product.lowest_pic_url} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <ImageIcon className="h-8 w-8 text-slate-200" />
        )}
        
        <span className="absolute top-3 left-3 text-[9px] font-black bg-white/90 backdrop-blur-sm text-slate-800 px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
          {product.product_category?.name || "Sport"}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="text-xs md:text-sm font-bold text-slate-700 group-hover:text-brand transition-colors line-clamp-2 leading-snug tracking-tight">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1 mt-1">
            {product.lowest_price !== null && <span className="text-[10px] font-bold text-slate-400 uppercase">Mulai</span>}
            <p className="text-sm md:text-base font-black text-slate-900">
              {formatRupiah(product.lowest_price)}
            </p>
          </div>
        </div>

        <div className="w-full bg-slate-50 text-slate-700 group-hover:bg-brand group-hover:text-white py-2.5 rounded-xl text-[11px] font-bold tracking-wider transition-all flex items-center justify-center gap-2 uppercase">
          <ShoppingBag className="h-3.5 w-3.5" /> Lihat Detail
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full text-center py-24 bg-white rounded-[32px] border border-dashed border-slate-100">
      <ShoppingBag className="h-10 w-10 text-slate-200 mx-auto mb-3" />
      <h3 className="text-sm font-bold text-slate-700 mb-0.5">Produk Tidak Ditemukan</h3>
      <p className="text-xs text-slate-400 font-medium">Coba hapus atau ubah parameter filter Anda.</p>
    </div>
  );
}

function Pagination({ currentPage, totalPages, applyFilters, isPending }: any) {
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => applyFilters({ page: currentPage - 1 })}
        disabled={currentPage <= 1 || isPending}
        className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-30 shadow-sm text-slate-600"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="px-5 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
        <span className="text-xs font-black text-brand tracking-widest">{currentPage} / {totalPages}</span>
      </div>
      <button
        onClick={() => applyFilters({ page: currentPage + 1 })}
        disabled={currentPage >= totalPages || isPending}
        className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-30 shadow-sm text-slate-600"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}