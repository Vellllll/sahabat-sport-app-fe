'use server'

import { revalidatePath } from 'next/cache';
import { CategorySchema, CategoryFormState } from '@/lib/schema';
import z from 'zod';
import { serverApiFetch } from '@/lib/server-api';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { revalidateTag } from 'next/cache';
import { ensurePermission } from '@/lib/rbac/guards';
import { extractApiErrorMessage, asRecord } from '@/lib/api-error';

export async function createCategory(prevState: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  const access = await ensurePermission('categories:manage');
  if (!access.ok) return { message: access.error, errors: {} };

  const validatedFields = CategorySchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validasi gagal. Cek kembali input Anda.',
    };
  }

  try {
    // Eksekusi post ke backend NestJS
    await serverApiFetch('/product-categories/create', {
      method: 'POST',
      body: validatedFields.data,
    });
    
    revalidateTag(CACHE_TAGS.categories, 'max');
    revalidatePath('/admin/products');
    revalidatePath('/admin/categories');
    
    return { message: 'Kategori berhasil dibuat!', errors: {} };
    
  } catch (error: unknown) {
    console.error("🔥 Debug Error Kategori Di Server Action:", error);

    // 🟢 STRATEGI 1: Jika error adalah Response Fetch (memiliki method .json)
    const apiMessage = await extractApiErrorMessage(error);
    if (apiMessage) return { message: apiMessage, errors: {} };

    // 🟢 STRATEGI 2: Jika serverApiFetch mengekstrak payload ke properti internal (e.g. error.body / error.data)
    const errorRecord = asRecord(error);
    const bodyMessage = asRecord(errorRecord?.body)?.message;
    if (typeof bodyMessage === 'string') return { message: bodyMessage, errors: {} };

    const dataMessage = asRecord(errorRecord?.data)?.message;
    if (typeof dataMessage === 'string') return { message: dataMessage, errors: {} };

    // 🟢 STRATEGI 3: Jika serverApiFetch melemparkan instansiasi teks string langsung ke error.message
    if (error instanceof Error && error.message) {
      try {
        // Cek apakah di dalam string message terdapat raw JSON string stringify
        const parsedMessage = JSON.parse(error.message);
        if (parsedMessage?.message) {
          return { message: parsedMessage.message, errors: {} };
        }
      } catch {
        // Jika error.message berupa teks string biasa ("Nama kategori sudah terdaftar")
        return { message: error.message, errors: {} };
      }
    }

    // Fallback terakhir jika memang mutlak putus koneksi internet / server mati total
    return { message: 'Kesalahan jaringan. Gagal menghubungi server.', errors: {} };
  }
}

export interface FormState {
  message: string | null;
  errors?: {
    name?: string[];
  };
}

const UpdateCategorySchema = z.object({
  id: z.string().min(1, "ID Kategori tidak valid"),
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
});

// --- ACTION: UPDATE KATEGORI ---
export async function updateCategory(prevState: FormState, formData: FormData): Promise<FormState> {
  const access = await ensurePermission('categories:manage');
  if (!access.ok) return { message: access.error, errors: {} };

  const validatedFields = UpdateCategorySchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validasi gagal. Cek kembali input Anda.',
    };
  }

  const { id, name } = validatedFields.data;

  try {
    await serverApiFetch(`/product-categories/${id}`, {
      method: 'PUT',
      body: { name },
    });
    revalidateTag(CACHE_TAGS.categories, 'max');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    return { message: 'Kategori berhasil diupdate!', errors: {} };
  } catch (error) {
    return { message: 'Kesalahan jaringan. Gagal menghubungi server.' };
  }
}

// --- ACTION: DELETE KATEGORI ---
export async function deleteCategory(id: string | number) {
  const access = await ensurePermission('categories:manage');
  if (!access.ok) return { success: false, message: access.error };

  try {
    await serverApiFetch(`/product-categories/${id}`, {
      method: 'DELETE',
    });
    revalidateTag(CACHE_TAGS.categories, 'max');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    return { success: true, message: 'Kategori berhasil dihapus!' };
  } catch (error: unknown) {
    console.error("Delete Category Server Action Error:", error);

    // 🟢 REFACTOR UTAMA: Ekstrak error biner JSON dari NestJS BadRequestException
    const apiMessage = await extractApiErrorMessage(error);
    if (apiMessage) return { success: false, message: apiMessage };

    const errorRecord = asRecord(error);
    const bodyMessage = asRecord(errorRecord?.body)?.message;
    if (typeof bodyMessage === 'string') return { success: false, message: bodyMessage };

    const dataMessage = asRecord(errorRecord?.data)?.message;
    if (typeof dataMessage === 'string') return { success: false, message: dataMessage };

    if (error instanceof Error && error.message) return { success: false, message: error.message };

    // Fallback umum
    return { success: false, message: 'Gagal menghapus kategori akibat kesalahan jaringan.' };
  }
}