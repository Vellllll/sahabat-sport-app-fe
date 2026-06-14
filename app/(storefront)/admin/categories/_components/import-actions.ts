// app/admin/products/_components/import-actions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';
import { serverApiFetch } from '@/lib/server-api';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { getCategories } from '@/lib/api';
import z from 'zod';

const BulkProductRowSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  product_category_name: z.string().min(1, "Nama Kategori wajib diisi"),
  is_displayed: z.boolean().default(true),
});

export async function importProductsAction(
  parsedRows: Array<{ name: string; product_category_name: string; is_displayed: boolean }>
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' };

  try {
    // 1. 🔥 AMBIL DATA KATEGORI LANGSUNG DARI DATABASE SEBAGAI REFERENSI UTAMA
    const dbCategories = await getCategories();

    // 2. Validasi Keamanan & Rekonsiliasi ID di Sisi Server
    const validatedProducts = [];
    
    for (const [index, row] of parsedRows.entries()) {
      const result = BulkProductRowSchema.safeParse(row);
      if (!result.success) {
        return { 
          success: false, 
          error: `Baris ke-${index + 1}: Data tidak valid (${result.error.errors[0].message}).` 
        };
      }

      const { name, product_category_name, is_displayed } = result.data;

      // 🧠 PENCOCOKAN DI SISI SERVER: Cari objek kategori yang namanya sama persis di database
      const matchedCategory = dbCategories.find(
        (cat: any) => cat.name.toLowerCase() === product_category_name.toLowerCase()
      );

      if (!matchedCategory) {
        return {
          success: false,
          error: `Baris ke-${index + 1}: Kategori bernama "${product_category_name}" tidak ditemukan di database. Pastikan ejaan sudah benar.`
        };
      }

      // Format payload akhir dengan menyuntikkan ID asli hasil kueri database
      validatedProducts.push({
        name,
        product_category_id: String(matchedCategory.id), // Diubah kembali ke ID untuk konsumsi DTO backend NestJS
        is_displayed
      });
    }

    if (validatedProducts.length === 0) {
      return { success: false, error: 'Tidak ada data produk valid yang ditemukan.' };
    }

    // 3. Kirim payload array bersih ke endpoint batch backend NestJS Anda
    await serverApiFetch('/products/batch', {
      method: 'POST',
      body: { products: validatedProducts },
    });

    // 4. Bersihkan cache server Next.js
    revalidateTag(CACHE_TAGS.products, 'max' as any);
    revalidatePath('/admin/products');

    return { success: true, message: `Sukses mengimpor ${validatedProducts.length} produk ke dalam katalog!` };
  } catch (error) {
    console.error("Bulk product import server error:", error);
    return { success: false, error: 'Gagal memproses ke server. Periksa koneksi atau relasi database Anda.' };
  }
}