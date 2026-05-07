import { CACHE_TAGS } from "@/lib/cache-tags";
import { serverApiFetch } from "@/lib/server-api";

export interface ApiShopProfile {
    name: string;
    address: string;
    phone_number: string;
}

export async function getShopProfile(): Promise<ApiShopProfile | null> {
    try {
        const data = await serverApiFetch<any>('/shop-profile', {
            withAuth: false,
            revalidate: 3600,
            tags: [CACHE_TAGS.shopProfile],
        });
        return data?.[0] || null;
    } catch {
        return null;
    }
}

export function formatWhatsAppNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }

    return cleaned;
  }