"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  ListFilter,
} from "lucide-react";
import EditProductModal from "./edit-product-modal";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  product_category_id?: string;
  is_displayed: boolean;
  product_category?: {
    name: string;
  };
}

interface Props {
  initialData: Product[];
  categories: Category[];
  currentCategoryId: string;
  totalPages: number;
  currentPage: number;
  currentLimit: number;
  totalItems: number;
}

export default function ProductListOptimized({
  initialData,
  categories,
  currentCategoryId,
  totalPages,
  currentPage,
  currentLimit,
  totalItems,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const updateUrl = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    startTransition(() => router.push(`?${params.toString()}`));
  };

  const from = (currentPage - 1) * currentLimit + 1;
  const to = Math.min(currentPage * currentLimit, totalItems);

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH BAR SECTION */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-48">
          <ListFilter className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <select
            value={currentCategoryId}
            onChange={(e) => updateUrl({ categoryId: e.target.value, page: 1 })}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 rounded-2xl outline-none transition-all text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={inputValue}
            placeholder="Cari nama produk..."
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 rounded-2xl outline-none transition-all text-sm font-semibold text-slate-700"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && updateUrl({ q: inputValue, page: 1 })}
          />
        </div>

        <button
          onClick={() => updateUrl({ q: inputValue, page: 1 })}
          disabled={isPending}
          className="bg-[#165dfc] text-white px-8 rounded-2xl font-bold text-xs hover:bg-[#124ecb] transition-all disabled:opacity-50 flex items-center justify-center gap-2 tracking-widest min-w-[120px]"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "CARI"}
        </button>
      </div>

      {/* INFO TOTAL DATA */}
      <div className="px-2 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          {totalItems > 0 ? `${from}-${to} dari ${totalItems} PRODUK` : "0 PRODUK"}
        </span>
      </div>

      {/* LIST AREA */}
      <div className={`space-y-3 min-h-[400px] ${isPending ? "opacity-50" : "opacity-100 transition-opacity"}`}>
        {initialData.length > 0 ? (
          initialData.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-[#165dfc]/30 hover:shadow-md transition-all gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-slate-800">{product.name}</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wider">
                    <Tag className="h-3 w-3" />
                    {product.product_category?.name || "Tanpa Kategori"}
                  </div>
                  {product.is_displayed ? (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">
                      <Eye className="h-3 w-3" /> Ditampilkan
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                      <EyeOff className="h-3 w-3" /> Disembunyikan
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingProduct(product)}
                  title="Edit Produk"
                  className="p-2.5 text-slate-400 hover:text-[#165dfc] hover:bg-[#165dfc]/5 rounded-xl transition-all"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  title="Hapus Produk"
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Produk Tidak Ditemukan
            </p>
          </div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Limit:
          </span>
          <select
            value={currentLimit}
            onChange={(e) => updateUrl({ limit: e.target.value, page: 1 })}
            className="bg-transparent text-xs font-black text-[#165dfc] outline-none cursor-pointer"
          >
            {[10, 20, 50].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => updateUrl({ page: currentPage - 1 })}
            disabled={currentPage <= 1 || isPending}
            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-10 transition-all text-slate-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm">
            <span className="text-[10px] font-black text-[#165dfc] tracking-widest">
              {currentPage} / {totalPages}
            </span>
          </div>
          <button
            onClick={() => updateUrl({ page: currentPage + 1 })}
            disabled={currentPage >= totalPages || isPending}
            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-10 transition-all text-slate-600"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <EditProductModal
        isOpen={!!editingProduct}
        product={editingProduct}
        categories={categories}
        onClose={() => setEditingProduct(null)}
      />
    </div>
  );
}