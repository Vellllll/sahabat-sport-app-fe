// app/(storefront)/shop-profile/_api/shop.ts
import { cookies } from "next/headers";

export interface ApiShopProfile {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  description?: string;
}

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function getShopProfile(): Promise<ApiShopProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}/shop-profile`, {
      headers,
      next: { revalidate: 3600 }, // Cache profil selama 1 jam karena jarang berubah
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json.data ?? null;
  } catch (error) {
    console.error("Fetch shop profile error:", error);
    return null;
  }
}

// Helper untuk membersihkan nomor HP agar valid untuk wa.me API
export function formatWhatsAppNumber(phone: string): string {
  let clean = phone.replace(/\D/g, ""); // Hapus semua karakter non-angka
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1); // Ubah 08xxx menjadi 628xxx
  }
  return clean;
}