// app/layout.tsx
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

// 1. Inisialisasi Font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Buat variabel CSS untuk Inter
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
      {/* 2. Suntikkan class font ke body. 
          Gunakan inter.className sebagai font default global utama aplikasi */}
      <body 
        className={`${inter.className} ${geistSans.variable} ${geistMono.variable} antialiased text-slate-600 bg-[#F8FAFC]`}
      >
        {/* Langsung render children, Next.js otomatis memilih layout grup yang sesuai */}
        {children}
      </body>
    </html>
  );
}