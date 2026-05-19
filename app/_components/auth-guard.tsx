// app/_components/auth-guard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Helper sederhana untuk membaca cookie di sisi client
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

// Helper untuk decode JWT (mengambil isi payload 'exp')
function isTokenExpired(token: string): boolean {
  try {
    const arrayToken = token.split('.');
    if (arrayToken.length !== 3) return true;
    
    const payload = JSON.parse(atob(arrayToken[1]));
    if (!payload.exp) return false;
    
    // Konversi milidetik ke detik waktu sekarang
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true; // Jika gagal decode, anggap expired demi keamanan
  }
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Jalankan pengecekan berkala setiap 5 detik
    const checkAuth = () => {
      const token = getCookie('session_token');
      
      if (token && isTokenExpired(token)) {
        // 1. Hapus cookie secara client-side
        document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // 2. Alert user atau langsung lempar ke login
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        
        // 3. Redirect ke login
        router.push('/login');
      }
    };

    checkAuth(); // Cek saat pertama kali masuk halaman
    const interval = setInterval(checkAuth, 5000); 

    return () => clearInterval(interval);
  }, [router]);

  return <>{children}</>;
}