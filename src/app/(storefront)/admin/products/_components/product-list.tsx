"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  PackageOpen,
  ImageIcon,
} from "lucide-react";
import EditProductModal from "./edit-product-modal";
import DeleteProductModal from "./delete-product-modal";
import { formatRupiah } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  product_category_id?: string | null;
  is_displayed: boolean;
  product_category?: {
    name: string;
  };
  thumbnail?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  totalStock?: number;
  variantCount?: number;
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
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

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
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-2xl outline-none transition-all text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
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
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-2xl outline-none transition-all text-sm font-semibold text-slate-700"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && updateUrl({ q: inputValue, page: 1 })}
          />
        </div>

        <button
          onClick={() => updateUrl({ q: inputValue, page: 1 })}
          disabled={isPending}
          className="bg-brand text-white px-8 rounded-2xl font-bold text-xs hover:bg-brand-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 tracking-widest min-w-[120px]"
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
      <div className={`min-h-[400px] overflow-x-auto rounded-2xl border border-slate-100 ${isPending ? "opacity-50" : "opacity-100 transition-opacity"}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Produk</th>
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Kategori</th>
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Harga</th>
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Stok</th>
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {initialData.length > 0 ? (
              initialData.map((product) => (
                <tr
                  key={product.id}
                  className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 truncate">{product.name}</h3>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 w-max text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wider">
                      <Tag className="h-3 w-3" />
                      {product.product_category?.name || "Tanpa Kategori"}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-700 whitespace-nowrap">
                    {product.minPrice == null ? (
                      <span className="text-slate-300">—</span>
                    ) : product.minPrice === product.maxPrice ? (
                      formatRupiah(product.minPrice)
                    ) : (
                      `${formatRupiah(product.minPrice)} – ${formatRupiah(product.maxPrice ?? product.minPrice)}`
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold">
                    {product.variantCount ? (
                      <span className={(product.totalStock ?? 0) > 0 ? "text-emerald-600" : "text-red-500"}>
                        {product.totalStock}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {product.is_displayed ? (
                      <div className="flex items-center gap-1 w-max text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">
                        <Eye className="h-3 w-3" /> Ditampilkan
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 w-max text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                        <EyeOff className="h-3 w-3" /> Disembunyikan
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/products/${product.id}/items`}
                        title="Kelola Item Produk"
                        className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <PackageOpen className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setEditingProduct(product)}
                        title="Edit Produk"
                        className="p-2.5 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingProduct(product)}
                        title="Hapus Produk"
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Produk Tidak Ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
            className="bg-transparent text-xs font-black text-brand outline-none cursor-pointer"
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
            <span className="text-[10px] font-black text-brand tracking-widest">
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
        key={editingProduct?.id ?? "closed"}
        isOpen={!!editingProduct}
        product={editingProduct}
        categories={categories}
        onClose={() => setEditingProduct(null)}
      />

      <DeleteProductModal
        isOpen={!!deletingProduct}
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
      />
    </div>
  );
}