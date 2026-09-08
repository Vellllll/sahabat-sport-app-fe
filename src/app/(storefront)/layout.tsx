// app/(storefront)/layout.tsx
import { Sidebar } from "../_components/sidebar";
import AutoLogout from "../_components/auto-logout";
import { getOptionalSession } from '@/lib/rbac/guards';
import { canAccessAdmin } from '@/lib/rbac/permissions';

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOptionalSession();
  const isLoggedIn = !!session;
  const showAdminLink = canAccessAdmin(session?.user.role);

  return (
    <div className="md:flex">
      {/* Background poller untuk memantau masa aktif token JWT */}
      <AutoLogout isLoggedIn={isLoggedIn} />

      {/* 🟢 SIDEBAR HANYA MERENDER DI SINI (Halaman dalam grup storefront) */}
      <Sidebar initialLoginStatus={isLoggedIn} showAdminLink={showAdminLink} />

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}