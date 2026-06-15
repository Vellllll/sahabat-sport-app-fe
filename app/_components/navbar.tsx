// app/_components/navbar.tsx
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Cart } from "./cart";
import { LogIn, LogOut, ChevronDown, BarChart3, Package, ChevronRight } from "lucide-react";
import { logoutAction } from "./auth-actions";

interface NavbarProps {
  initialLoginStatus: boolean;
  showAdminLink?: boolean;
}

export function Navbar({ initialLoginStatus, showAdminLink = false }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // 🟢 State untuk mengontrol visibilitas dropdown report
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fungsi Logout menggunakan Server Action
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.refresh();
      router.push("/");
    });
  };

  // 🟢 Menutup dropdown otomatis ketika pengguna mengklik di luar area dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🟢 Menutup dropdown otomatis setiap kali rute halaman berubah
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  // Periksa apakah rute saat ini berada di bawah rute laporan/reports
  const isReportRouteActive = pathname.startsWith("/admin/reports");

  return (
    <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* BRAND & ROUTES */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-2">
            <span className="bg-[#165dfc] text-white px-2.5 py-1 rounded-xl text-sm font-black">S</span>
            Sahabat<span className="text-[#165dfc]">Sport</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {/* RUTE REGULER */}
            {routes
              .filter((route) => (!route.isAdminOnly || showAdminLink))
              .map((route) => {
                const isActive = route.href === "/" ? pathname === "/" : pathname.startsWith(route.href);
                return (
                  <Link 
                    key={route.href} 
                    href={route.href} 
                    className={cn(
                      "text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl relative transition-colors", 
                      isActive ? "text-[#165dfc]" : "text-slate-500 hover:text-slate-900")
                    }
                  >
                    {route.label}
                    {isActive && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#165dfc] rounded-full" />}
                  </Link>
                );
              })}

            {/* 🟢 REPORT DROPDOWN TAB (MURNI HANYA UNTUK ADMIN) */}
            {showAdminLink && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer select-none",
                    isReportRouteActive ? "text-[#165dfc]" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Reports
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isDropdownOpen && "transform rotate-180")} />
                  {isReportRouteActive && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#165dfc] rounded-full" />}
                </button>

                {/* isi panel menu dropdown */}
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    
                    {/* Sub-menu 1: Laporan Transaksi */}
                    <Link
                      href="/admin/reports/transactions"
                      className={cn(
                        "flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors",
                        pathname.startsWith("/admin/reports/transactions") 
                          ? "bg-blue-50 text-[#165dfc]" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>Transaction Reports</span>
                      </div>
                      <ChevronRight className="h-3 w-3 opacity-40" />
                    </Link>

                    {/* Sub-menu 2: Laporan Produk */}
                    <Link
                      href="/admin/reports/products"
                      className={cn(
                        "flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors",
                        pathname.startsWith("/admin/reports/products") 
                          ? "bg-blue-50 text-[#165dfc]" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>Product Reports</span>
                      </div>
                      <ChevronRight className="h-3 w-3 opacity-40" />
                    </Link>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* UTILITIES & DYNAMIC AUTH BUTTONS */}
        <div className="flex items-center gap-3">
          <Cart />
          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

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

// ✅ LISTING RUTE UTAMA YANG DI-SLIM (Menu Laporan telah dipindah ke dalam internal dropdown)
const routes = [
  { href: "/", label: "Home", isAdminOnly: false },
  { href: "/shop-profile", label: "Profile", isAdminOnly: false },
  { href: "/transactions", label: "Riwayat Transaksi", isAdminOnly: false },
  { href: "/admin", label: "Admin Workspace", isAdminOnly: true },
];