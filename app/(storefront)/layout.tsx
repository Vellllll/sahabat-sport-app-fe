// app/(storefront)/layout.tsx
import { cookies } from "next/headers";
import { Navbar } from "../_components/navbar"; // Sesuaikan path komponen Anda
import AutoLogout from "../_components/auto-logout";
import { isTokenExpired } from "@/lib/auth";
import { Toaster } from 'sonner';

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const isLoggedIn = !!token && !isTokenExpired(token);

  return (
    <>
      {/* Sistem proteksi berkala berjalan di latar belakang */}
      <AutoLogout isLoggedIn={isLoggedIn} />
      
      {/* Navigasi Premium hanya muncul di sini */}
      <Navbar initialLoginStatus={isLoggedIn} />
      
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