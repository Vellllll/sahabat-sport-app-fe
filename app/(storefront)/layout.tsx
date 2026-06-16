// app/(storefront)/layout.tsx
import { Navbar } from "../_components/navbar";
import AutoLogout from "../_components/auto-logout";
import { Toaster } from 'sonner';
import { getOptionalSession } from '@/lib/rbac/guards';
import { canAccessAdmin } from '@/lib/rbac/permissions';
import { CartProvider } from "@/context/cart-context";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Ambil session secara secure di level Server Component
  const session = await getOptionalSession();
  const isLoggedIn = !!session;
  
  // 2. Cek hak akses role (apakah dia SUPER_ADMIN / ADMIN / OPERATOR)
  const showAdminLink = canAccessAdmin(session?.user.role);

  return (
    <>
      {/* Poller pengecekan session kadaluwarsa secara background */}
      <AutoLogout isLoggedIn={isLoggedIn} />
      
      {/* Pembungkus State Keranjang Belanja Global */}
      <CartProvider>
          {/* 🟢 SEKARANG DINAMIS: Parameter dialirkan dari hasil session check server */}
          <Navbar initialLoginStatus={isLoggedIn} showAdminLink={showAdminLink} />
          
          <main>{children}</main>
      </CartProvider>

      {/* Notifikasi Toast Premium Sonner */}
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