// app/layout.tsx
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sahabat Sport",
  description: "Penyedia Alat Olahraga Premium & Berkualitas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} ${geistSans.variable} ${geistMono.variable} antialiased text-slate-600 bg-[#F8FAFC]`}
      >
        {/* 🟢 Provider & Toaster ditaruh di level global agar aktif di seluruh rute (termasuk Auth) */}
        <CartProvider>
          {children}
        </CartProvider>

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
      </body>
    </html>
  );
}