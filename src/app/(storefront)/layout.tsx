// app/(storefront)/layout.tsx
import { Navbar } from "../_components/navbar";
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
    <>
      {/* Background poller untuk memantau masa aktif token JWT */}
      <AutoLogout isLoggedIn={isLoggedIn} />
      
      {/* 🟢 NAVBAR HANYA MERENDER DI SINI (Halaman dalam grup storefront) */}
      <Navbar initialLoginStatus={isLoggedIn} showAdminLink={showAdminLink} />
      
      <main>{children}</main>
    </>
  );
}