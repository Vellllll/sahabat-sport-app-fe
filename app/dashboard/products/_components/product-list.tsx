import { getProducts } from "@/lib/dashboard/products/api";
import ProductCard from "./product-card";
import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductListProps {
  filters: {
    q?: string;
    category?: string;
    page?: number;
  };
}

/**
 * @description Server Component untuk menampilkan daftar produk.
 * Memisahkan fetching logic dari UI untuk maintainability maksimal.
 */
export default async function ProductList({ filters }: ProductListProps) {
  // 1. Data Fetching di sisi server
  // Kita asumsikan API mengembalikan data dan meta untuk pagination
  const { data: products, meta } = await getProducts({
    query: filters.q,
    category: filters.category,
    page: filters.page,
  });

  // 2. Empty State Handling
  // Sangat penting untuk UX agar user tidak bingung saat pencarian nihil
  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-100 bg-slate-50/50 p-12 text-center animate-in fade-in duration-500">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
          <PackageSearch className="h-10 w-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Produk Tidak Ditemukan</h3>
        <p className="mt-2 max-w-[300px] text-sm font-medium text-slate-400">
          Coba ubah kata kunci pencarian atau filter kategori Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3. Grid System yang Responsif & Efisien */}
      <div 
        className={cn(
          "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          "animate-in fade-in slide-in-from-bottom-4 duration-700"
        )}
      >
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 4. Tanda Akhir Katalog (Optional Ops) */}
      <div className="flex items-center justify-center py-8">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
          Akhir dari Katalog
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
    </div>
  );
}