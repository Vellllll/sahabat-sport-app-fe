'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { serverApiFetch } from '@/lib/server-api';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { ensurePermission } from '@/lib/rbac/guards';
import z from 'zod';

const BulkCategoryRowSchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
});

export async function importCategoriesAction(
  parsedRows: Array<{ name: string }>
) {
  const access = await ensurePermission('categories:manage');
  if (!access.ok) return { success: false, error: access.error };

  const validatedNames: string[] = [];

  for (const [index, row] of parsedRows.entries()) {
    const result = BulkCategoryRowSchema.safeParse(row);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Data tidak valid';
      return {
        success: false,
        error: `Baris ke-${index + 1}: ${message}.`,
      };
    }

    validatedNames.push(result.data.name);
  }

  if (validatedNames.length === 0) {
    return { success: false, error: 'Tidak ada data kategori valid yang ditemukan.' };
  }

  try {
    await serverApiFetch('/product-categories/batch-create', {
      method: 'POST',
      body: { names: validatedNames },
    });

    revalidateTag(CACHE_TAGS.categories, 'max');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');

    return {
      success: true,
      message: `Sukses mengimpor ${validatedNames.length} kategori!`,
    };
  } catch (error) {
    console.error('Bulk category import server error:', error);
    return { success: false, error: 'Gagal memproses ke server.' };
  }
}
