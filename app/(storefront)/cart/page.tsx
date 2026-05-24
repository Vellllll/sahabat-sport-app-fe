// app/(storefront)/cart/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { getCartItems } from '@/lib/api/cart';
import { CartDisplayGrid } from './_components/cart-display-grid';

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) redirect('/login');

  const cartItems = await getCartItems(token);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* HEADER & NAVIGASI KEMBALI */}
        <div className="space-y-3">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Lanjutkan Belanja
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5 uppercase">
            <ShoppingBag className="h-6 w-6 text-[#165dfc]" /> Tas Belanja Anda
          </h1>
        </div>

        {/* LOGIKA KONDISIONAL JIKA KERANJANG KOSONG */}
        {cartItems.length === 0 ? (
          <div className="py-20 text-center space-y-4 border border-dashed border-slate-100 rounded-[32px] bg-slate-50/40">
            <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Keranjang Belanja Kosong</p>
              <p className="text-xs text-slate-400 font-medium">Anda belum memasukkan produk olahraga apa pun ke dalam tas belanja.</p>
            </div>
            <Link href="/" className="inline-flex h-11 px-6 bg-[#165dfc] text-white rounded-xl text-xs font-black uppercase tracking-widest items-center justify-center shadow-md shadow-[#165dfc]/10 hover:bg-[#124ecb] transition-all">
              Jelajahi Produk
            </Link>
          </div>
        ) : (
          /* ✅ OPER DATA KERANJANG DINAMIS KE GRID INTERAKTIF CLIENT COMPONENT */
          <CartDisplayGrid initialItems={cartItems} />
        )}

      </div>
    </main>
  );
}