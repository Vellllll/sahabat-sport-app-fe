"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { appRoutes } from "@/config/routes";
import { Cart } from "./cart";
import { logoutAction } from "./auth-actions";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogIn, LogOut, ChevronDown, BarChart3, Package, ChevronRight, Sparkles } from "lucide-react";

interface NavbarProps {
  initialLoginStatus: boolean;
  showAdminLink?: boolean;
}

export function Navbar({ initialLoginStatus, showAdminLink = false }: NavbarProps) {
  const pathname = usePathname();

  // Helper fungsi presisi untuk mendeteksi rute aktif tanpa bug tumpang tindih
  const checkActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || (pathname.startsWith(href) && href !== "/admin");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        
        <div className="flex items-center gap-8">
          <NavBrand />
          
          <div className="hidden md:flex items-center gap-1">
            <NavLinks showAdminLink={showAdminLink} checkActiveRoute={checkActiveRoute} />
            {showAdminLink && <NavAdminMenu pathname={pathname} />}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Cart />
          <div className="hidden h-5 w-px bg-slate-200 mx-1 sm:block" />
          <NavAuthControls initialLoginStatus={initialLoginStatus} />
        </div>

      </div>
    </nav>
  );
}

function NavBrand() {
  return (
    <Link 
      href="/" 
      className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 transition-opacity hover:opacity-90"
    >
      <span className="rounded-xl bg-brand px-2.5 py-1 text-sm font-black text-white">
        S
      </span>
      Sahabat<span className="text-brand">Sport</span>
    </Link>
  );
}

function NavLinks({ 
  showAdminLink, 
  checkActiveRoute 
}: { 
  showAdminLink: boolean; 
  checkActiveRoute: (href: string) => boolean;
}) {
  return (
    <>
      {appRoutes
        .filter((route) => !route.isAdminOnly || showAdminLink)
        .map((route) => {
          const isActive = checkActiveRoute(route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "relative px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors rounded-xl",
                isActive ? "text-brand" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {route.label}
              {isActive && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-brand" />
              )}
            </Link>
          );
        })}
    </>
  );
}

function NavAdminMenu({ pathname }: { pathname: string }) {
  const isReportRouteActive = pathname.startsWith("/admin/reports") || pathname.startsWith("/admin/dashboard/ai-report");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors rounded-xl outline-none select-none cursor-pointer",
            isReportRouteActive ? "text-brand" : "text-slate-500 hover:text-slate-900"
          )}
        >
          Reports
          <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 data-[state=open]:rotate-180" />
          {isReportRouteActive && (
            <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-brand" />
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        sideOffset={8}
        className="w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50"
      >
        <DropdownMenuItem asChild>
          <Link
            href="/admin/reports/transactions"
            className={cn(
              "flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer outline-none",
              pathname.startsWith("/admin/reports/transactions")
                ? "bg-blue-50 text-brand"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Transaction Reports</span>
            </div>
            <ChevronRight className="h-3 w-3 opacity-40" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/admin/reports/products"
            className={cn(
              "flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer outline-none",
              pathname.startsWith("/admin/reports/products")
                ? "bg-blue-50 text-brand"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Product Reports</span>
            </div>
            <ChevronRight className="h-3 w-3 opacity-40" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/admin/dashboard/ai-report"
            className={cn(
              "flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border-t border-slate-100 cursor-pointer outline-none mt-1 pt-3",
              pathname.startsWith("/admin/dashboard/ai-report")
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
              <span>AI Smart Reports</span>
            </div>
            <ChevronRight className="h-3 w-3 opacity-40" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavAuthControls({ initialLoginStatus }: { initialLoginStatus: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.refresh();
      router.push("/");
    });
  };

  if (initialLoginStatus) {
    return (
      <Button
        variant="ghost"
        disabled={isPending}
        onClick={handleLogout}
        className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50/60 rounded-xl px-4 py-2.5 h-auto inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <LogOut className="h-3.5 w-3.5" /> 
        {isPending ? "Logging out..." : "Logout"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        asChild
        className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-brand px-4 py-2.5 h-auto rounded-xl"
      >
        <Link href="/login">
          <LogIn className="h-3.5 w-3.5 mr-1.5" /> Login
        </Link>
      </Button>
      <Button
        asChild
        className="bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 h-auto rounded-xl transition-colors shadow-sm"
      >
        <Link href="/register">
          Register
        </Link>
      </Button>
    </div>
  );
}