// app/(storefront)/layout.tsx
import { Navbar } from "../_components/navbar";
import AutoLogout from "../_components/auto-logout";
import { Toaster } from 'sonner';
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
      <AutoLogout isLoggedIn={isLoggedIn} />
      <Navbar initialLoginStatus={isLoggedIn} showAdminLink={showAdminLink} />
      
      {children}

      {/* ✅ 2. Tempatkan Toaster di sini agar bisa diakses seluruh Client Component */}
      <Toaster 
          position="bottom-right" 
          richColors 
          closeButton
          theme="light"
          toastOptions={{
            style: {
              borderRadius: '20px',
              padding: '16px',
              fontFamily: 'var(--font-inter), sans-serif',
            },
          }}
        />
    </>
  );
}