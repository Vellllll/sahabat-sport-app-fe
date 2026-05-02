'use server'

import { cookies } from "next/headers";

const API_URL = process.env.INTERNAL_API_URL;

export async function getProductItems(page: number = 1, limit: number = 10, productId: number = 0, isDisplayed: boolean | null = null) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        productId: productId.toString(),
        isDisplayed: isDisplayed?.toString() || '',
    })

    const res = await fetch(`${API_URL}/product-items?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Failed to fetch product items");
    const data = await res.json();
    return data;
}