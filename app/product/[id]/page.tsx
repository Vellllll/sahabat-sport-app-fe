// app/product/[id]/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import ProductDetail from './_components/product-detail';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

async function getProductDetail(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    // Sesuai endpoint baru kamu: /get-product-list/:id
    const res = await fetch(`${API_URL}/get-product-list/${id}`, { headers });
    
    if (res.status === 401) redirect('/login');
    if (!res.ok) return null;
    
    const json = await res.json();
    return json.data; // Mengembalikan object { id, name, product_category_name, items }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Fetch product detail error:", error);
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productData = await getProductDetail(id);

  if (!productData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4">
        <h2 className="text-xl font-black text-slate-800 mb-2">Produk Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 mb-6">Produk mungkin telah dihapus atau tidak tersedia.</p>
        <Link href="/" className="bg-[#165dfc] text-white px-6 py-3 rounded-xl font-bold text-xs tracking-widest uppercase shadow-md hover:bg-[#124ecb] transition-all">
          Kembali ke Toko
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#165dfc] transition-colors mb-8 tracking-widest uppercase"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali Belanja
        </Link>

        <Suspense fallback={<DetailSkeleton />}>
          {/* Oper data tunggal dari API ke client component */}
          <ProductDetail productData={productData} />
        </Suspense>

      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse bg-white p-8 rounded-[32px]">
      <div className="bg-slate-100 aspect-square rounded-3xl w-full" />
      <div className="space-y-4 py-4">
        <div className="h-4 bg-slate-100 rounded w-1/4" />
        <div className="h-8 bg-slate-100 rounded w-3/4" />
        <div className="h-6 bg-slate-100 rounded w-1/3" />
        <div className="h-24 bg-slate-100 rounded w-full pt-8" />
      </div>
    </div>
  );
}