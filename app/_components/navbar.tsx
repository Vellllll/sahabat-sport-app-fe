// app/_components/navbar.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Cart } from "./cart";
import { LogIn, LogOut } from "lucide-react";
import { logoutAction } from "./auth-actions";

interface NavbarProps {
  initialLoginStatus: boolean;
  showAdminLink?: boolean;
}

export function Navbar({ initialLoginStatus, showAdminLink = false }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Fungsi Logout Baru menggunakan Server Action
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction(); // Hapus cookie di sisi server secara aman
      router.refresh(); // Refresh halaman agar layout.tsx mendeteksi token hilang
      router.push("/");
    });
  };

  return (
    <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* BRAND & ROUTES (Sama seperti sebelumnya) */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-2">
            <span className="bg-[#165dfc] text-white px-2.5 py-1 rounded-xl text-sm font-black">S</span>
            Sahabat<span className="text-[#165dfc]">Sport</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {routes
              .filter((route) => route.href !== '/admin' || showAdminLink)
              .map((route) => {
              const isActive = route.href === "/" ? pathname === "/" : pathname.startsWith(route.href);
              return (
                <Link key={route.href} href={route.href} className={cn("text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl relative", isActive ? "text-[#165dfc]" : "text-slate-500 hover:text-slate-900")}>
                  {route.label}
                  {isActive && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#165dfc] rounded-full" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* UTILITIES & DYNAMIC AUTH BUTTONS */}
        <div className="flex items-center gap-3">
          <Cart />
          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* ✅ Gunakan initialLoginStatus yang dikirim dari server */}
          {initialLoginStatus ? (
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors px-4 py-2.5 rounded-xl hover:bg-red-50/60 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" /> {isPending ? "Logging out..." : "Logout"}
            </button>
          ) : (
            <>
              <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-[#165dfc] px-4 py-2.5 rounded-xl">
                <LogIn className="h-3.5 w-3.5" /> Login
              </Link>
              <Link href="/register" className="text-xs font-black uppercase tracking-widest bg-[#165dfc] text-white px-5 py-3 rounded-xl">
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

const routes = [
  { href: "/", label: "Home" },
  { href: "/shop-profile", label: "Profile" },
  { href: "/transactions", label: "Riwayat Transaksi" },
  { href: "/admin", label: "Admin" },
];