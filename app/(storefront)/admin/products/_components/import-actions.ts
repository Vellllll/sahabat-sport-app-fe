'use server';

import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';
import { serverApiFetch } from '@/lib/server-api';
import { CACHE_TAGS } from '@/lib/cache-tags';
import z from 'zod';

const BulkProductRowSchema = z.object({
    name: z.string().min(1, "Nama produk wajib diisi"),
    product_category_name: z.string().min(1, "ID Kategori wajib diisi"),
    is_displayed: z.boolean().default(true),
});

export async function importProductsAction(
    parsedRows: Array<{ name: string; product_category_name: string; is_displayed: boolean }>
) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' };

    // 1. Validasi Keamanan Lapis Pertama Sisi Server (Type Safety Check)
    const validatedProducts = [];
    for (const [index, row] of parsedRows.entries()) {
        const result = BulkProductRowSchema.safeParse(row);
        if (!result.success) {
            // Log error validasi di terminal server agar tahu baris mana yang gagal
            console.error(`[VALIDASI GAGAL] Baris ${index + 1}:`, result.error.errors);
            return {
                success: false,
                error: `Baris ke-${index + 1}: Data tidak valid (${result.error.errors[0].message}).`
            };
        }
        validatedProducts.push(result.data);
    }

    if (validatedProducts.length === 0) {
        return { success: false, error: 'Tidak ada data produk valid yang ditemukan di dalam file CSV.' };
    }

    try {
        // 2. Kirim payload array ke endpoint batch milik backend NestJS Anda
        // Asumsi rute endpoint bulk insert: POST /products/batch

        await serverApiFetch('/products/batch', {
            method: 'POST',
            body: { products: validatedProducts },
        });

        // 3. Bersihkan cache server Next.js agar UI langsung diperbarui secara real-time
        revalidateTag(CACHE_TAGS.products, 'max' as any);
        revalidatePath('/admin/products');

        return { success: true, message: `Sukses mengimpor ${validatedProducts.length} produk ke dalam katalog!` };
    } catch (error) {
        console.error("Bulk product import server error:", error);
        return { success: false, error: 'Gagal memproses ke server. Periksa relasi ID Kategori Anda.' };
    }
}