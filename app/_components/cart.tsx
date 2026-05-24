// app/_components/navbar-cart-button.tsx (Atau sesuaikan path file asli Anda, misal: app/_components/cart.tsx)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

// Interface lokal untuk kalkulasi jumlah badge
interface CartItemPayload {
  count: number;
}

export function Cart() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState<number>(0);

  // Cek apakah user saat ini sedang berada di halaman cart atau tidak
  const isCartPageActive = pathname === "/cart";

  useEffect(() => {
    // 💡 TIPS SENIOR: Di sini Anda bisa menyematkan logic pembacaan real-time 
    // global state (seperti Zustand atau React Context) untuk menangkap perubahan jumlah item 
    // saat user menekan tombol "Tambah ke Keranjang" di halaman detail produk.
    
    // Contoh dummy penanda kuantitas item aktif di tas belanja
    setCartCount(0); 
  }, [pathname]);

  return (
    <Link
      href="/cart"
      className={cn(
        "relative h-10 px-3.5 border rounded-xl inline-flex items-center justify-center gap-2 transition-all group cursor-pointer shadow-sm shadow-slate-100/40 select-none",
        isCartPageActive
          ? "border-[#165dfc] bg-blue-50/20 text-[#165dfc]"
          : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 active:scale-[0.98]"
      )}
      title="Buka Keranjang Belanja Anda"
    >
      {/* Ikon Tas Belanja dengan Micro-Animation Hover */}
      <ShoppingBag 
        className={cn(
          "h-4 w-4 transition-transform group-hover:scale-105", 
          isCartPageActive ? "text-[#165dfc]" : "text-slate-400 group-hover:text-slate-800"
        )} 
      />

      {/* Teks Deskripsi Ringkas (Disembunyikan di layar super kecil) */}
      <span className="text-[11px] font-black uppercase tracking-wider hidden sm:inline-block">
        Cart
      </span>

      {/* ✅ BADGE NOTIFIKASI DINAMIS QUANTITY
      {cartCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-[#165dfc] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in duration-300">
          {cartCount}
        </span>
      )} */}
    </Link>
  );
}