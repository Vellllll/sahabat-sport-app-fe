import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function getProductDetail(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
        // Sesuai endpoint baru kamu: /get-product-list/:id
        const res = await fetch(`${API_URL}/get-product-list/${id}`, { headers });

        if (res.status === 401) redirect('/login');
        if (!res.ok) return null;

        const json = await res.json();
        return json.data; // Mengembalikan object { id, name, product_category_name, items }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error("Fetch product detail error:", error);
        return null;
    }
}