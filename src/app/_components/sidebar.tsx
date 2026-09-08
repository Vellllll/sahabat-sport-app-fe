"use client";

import { useEffect, useState, useTransition, type ComponentType } from "react";
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

import {
  LogIn,
  LogOut,
  ChevronDown,
  ChevronsLeft,
  BarChart3,
  Package,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  Home,
  User,
  History,
  LayoutDashboard,
  Store,
} from "lucide-react";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

const ROUTE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "/": Home,
  "/shop-profile": User,
  "/transactions": History,
  "/admin/dashboard": LayoutDashboard,
  "/admin": Store,
};

interface SidebarProps {
  initialLoginStatus: boolean;
  showAdminLink?: boolean;
}

export function Sidebar({ initialLoginStatus, showAdminLink = false }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") setIsCollapsed(true);
  }, []);

  // Tutup drawer mobile setiap kali rute berpindah
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Kunci scroll halaman di belakang saat drawer mobile terbuka
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  const checkActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || (pathname.startsWith(href) && href !== "/admin");
  };

  return (
    <>
      {/* Top bar mobile: tombol buka sidebar + brand */}
      <div className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md md:hidden">
        <SidebarBrand isCollapsed={false} />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Overlay saat sidebar mobile terbuka */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-100 bg-white transition-[transform,width] duration-200 md:sticky md:top-0 md:z-40 md:h-screen md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "md:w-20" : "md:w-72"
        )}
      >
        <div className={cn("flex h-16 items-center gap-2 px-5", isCollapsed && "md:justify-center md:px-2")}>
          <SidebarBrand isCollapsed={isCollapsed} />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              "hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:flex",
              !isCollapsed && "ml-auto"
            )}
            aria-label={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            title={isCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          >
            <ChevronsLeft className={cn("h-4 w-4 transition-transform duration-200", isCollapsed && "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <SidebarLinks
            showAdminLink={showAdminLink}
            checkActiveRoute={checkActiveRoute}
            onNavigate={() => setIsOpen(false)}
            isCollapsed={isCollapsed}
          />
          {showAdminLink && (
            <SidebarAdminMenu
              pathname={pathname}
              onNavigate={() => setIsOpen(false)}
              isCollapsed={isCollapsed}
            />
          )}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className={cn("mb-3", isCollapsed && "md:flex md:justify-center")}>
            <Cart isCollapsed={isCollapsed} />
          </div>
          <SidebarAuthControls initialLoginStatus={initialLoginStatus} isCollapsed={isCollapsed} />
        </div>
      </aside>
    </>
  );
}

function SidebarBrand({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 transition-opacity hover:opacity-90"
    >
      <span className="shrink-0 rounded-xl bg-brand px-2.5 py-1 text-sm font-black text-white">S</span>
      <span className={cn(isCollapsed && "md:hidden")}>
        Sahabat<span className="text-brand">Sport</span>
      </span>
    </Link>
  );
}

function SidebarLinks({
  showAdminLink,
  checkActiveRoute,
  onNavigate,
  isCollapsed,
}: {
  showAdminLink: boolean;
  checkActiveRoute: (href: string) => boolean;
  onNavigate: () => void;
  isCollapsed: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {appRoutes
        .filter((route) => !route.isAdminOnly || showAdminLink)
        .map((route) => {
          const isActive = checkActiveRoute(route.href);
          const Icon = ROUTE_ICONS[route.href];
          return (
            <Link
              key={route.href}
              href={route.href}
              onClick={onNavigate}
              title={isCollapsed ? route.label : undefined}
              className={cn(
                "relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors",
                isCollapsed && "md:justify-center md:px-0",
                isActive ? "bg-blue-50/60 text-brand" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className={cn(isCollapsed && "md:hidden")}>{route.label}</span>
            </Link>
          );
        })}
    </div>
  );
}

function SidebarAdminMenu({
  pathname,
  onNavigate,
  isCollapsed,
}: {
  pathname: string;
  onNavigate: () => void;
  isCollapsed: boolean;
}) {
  const isReportRouteActive =
    pathname.startsWith("/admin/reports") || pathname.startsWith("/admin/dashboard/ai-report");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title={isCollapsed ? "Reports" : undefined}
          className={cn(
            "mt-1 flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest outline-none transition-colors select-none cursor-pointer",
            isCollapsed ? "md:justify-center md:px-0" : "justify-between",
            isReportRouteActive ? "bg-blue-50/60 text-brand" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <span className="flex items-center gap-2.5">
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className={cn(isCollapsed && "md:hidden")}>Reports</span>
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180",
              isCollapsed && "md:hidden"
            )}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="right"
        sideOffset={8}
        className="w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-left-2 duration-150 z-50"
      >
        <DropdownMenuItem asChild>
          <Link
            href="/admin/reports/transactions"
            onClick={onNavigate}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer outline-none",
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
            onClick={onNavigate}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer outline-none",
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
            onClick={onNavigate}
            className={cn(
              "mt-1 flex w-full items-center justify-between rounded-xl border-t border-slate-100 px-3 py-2.5 pt-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer outline-none",
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

function SidebarAuthControls({
  initialLoginStatus,
  isCollapsed,
}: {
  initialLoginStatus: boolean;
  isCollapsed: boolean;
}) {
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
        title={isCollapsed ? "Logout" : undefined}
        className={cn(
          "h-auto w-full cursor-pointer gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50/60 hover:text-red-600 disabled:opacity-50",
          isCollapsed ? "md:justify-center md:px-0" : "justify-start"
        )}
      >
        <LogOut className="h-3.5 w-3.5 shrink-0" />
        <span className={cn(isCollapsed && "md:hidden")}>
          {isPending ? "Logging out..." : "Logout"}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      asChild
      title={isCollapsed ? "Login" : undefined}
      className={cn(
        "h-auto w-full rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-brand",
        isCollapsed ? "md:justify-center md:px-0" : "justify-start"
      )}
    >
      <Link href="/login">
        <LogIn className="h-3.5 w-3.5 shrink-0" />
        <span className={cn(isCollapsed && "md:hidden")}>Login</span>
      </Link>
    </Button>
  );
}
