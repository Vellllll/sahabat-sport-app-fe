// app/_components/auto-logout.tsx
'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoLogout({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Jika dari server layout dinyatakan memang tidak login, jangan pasang poller
    if (!isLoggedIn) return;

    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/check');
        
        // Jika Route Handler mengembalikan 401 (token expired/dihapus)
        if (res.status === 401) {
          clearInterval(interval);
          
          startTransition(() => {
            // Refresh data layout server agar Navbar berubah jadi Login/Register
            router.refresh();
            // Lempar ke halaman login dengan info session expired
            router.push('/login?message=session_expired');
          });
        }
      } catch (error) {
        console.error("Failed to verify session with backend", error);
      }
    };

    // Jalankan pengecekan setiap 10-15 detik (sesuaikan agar tidak membebani server)
    const interval = setInterval(checkSession, 15000);

    return () => clearInterval(interval);
  }, [isLoggedIn, router]);

  return null;
}