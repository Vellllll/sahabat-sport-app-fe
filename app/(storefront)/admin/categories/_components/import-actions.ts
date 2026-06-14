'use server';

import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';
import { serverApiFetch } from '@/lib/server-api';
import { CACHE_TAGS } from '@/lib/cache-tags';
import z from 'zod';

const ImportRowSchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
});

export async function importCategoriesAction(parsedRows: Array<{ name: string }>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' };

  // 1. Jalankan Validasi Struktur Menggunakan Zod secara Massal
  const validatedData: string[] = [];
  
  for (const [index, row] of parsedRows.entries()) {
    const result = ImportRowSchema.safeParse(row);
    if (!result.success) {
      const errorMsg = result.error.flatten().fieldErrors.name?.[0] || 'Format salah';
      return { 
        success: false, 
        error: `Baris ke-${index + 1}: ${errorMsg}. Periksa kembali file Anda.` 
      };
    }
    validatedData.push(result.data.name);
  }

  if (validatedData.length === 0) {
    return { success: false, error: 'File kosong atau tidak mengandung data kategori yang valid.' };
  }

  try {
    // 2. Kirim Array Kategori ke Endpoint Batch Backend NestJS Anda
    // Asumsi rute endpoint massal: /product-categories/batch-create
    await serverApiFetch('/product-categories/batch-create', {
      method: 'POST',
      body: { names: validatedData },
    });

    // 3. Bersihkan Cache Lapisan Server Next.js
    revalidateTag(CACHE_TAGS.categories, 'max');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');

    return { success: true, message: `Berhasil mengimpor ${validatedData.length} kategori sekaligus!` };
  } catch (error) {
    console.error("Import bulk categories error:", error);
    return { success: false, error: 'Gagal menghubungi server. Pastikan format file sesuai.' };
  }
}