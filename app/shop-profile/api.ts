// app/shop-profile/api.ts
export interface ApiShopProfile {
    name: string;
    address: string;
    phone_number: string;
}

export async function getShopProfile(): Promise<ApiShopProfile | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
        const res = await fetch(`${apiUrl}/shop-profile`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.[0] || null;
    } catch {
        return null;
    }
}

// Tambahkan fungsi helper di app/shop-profile/api.ts
export function formatWhatsAppNumber(phone: string): string {
    // Menghapus semua karakter non-digit
    let cleaned = phone.replace(/\D/g, '');
    
    // Jika dimulai dengan '0', ganti dengan '62' (Kode negara Indonesia)
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    
    return cleaned;
  }