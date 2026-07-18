// config/routes.ts
export interface RouteItem {
    href: string;
    label: string;
    isAdminOnly: boolean;
  }
  
  export const appRoutes: RouteItem[] = [
    { href: "/", label: "Home", isAdminOnly: false },
    { href: "/shop-profile", label: "Profile", isAdminOnly: false },
    { href: "/transactions", label: "Riwayat Transaksi", isAdminOnly: false },
    { href: "/admin/dashboard", label: "Dashboard", isAdminOnly: true },
    { href: "/admin", label: "Catalog Admin", isAdminOnly: true },
  ];