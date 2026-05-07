'use server'

import { revalidatePath } from 'next/cache';
import { CategorySchema, CategoryFormState } from '@/lib/schema';
import z from 'zod';
import { serverApiFetch } from '@/lib/server-api';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { revalidateTag } from 'next/cache';

export async function createCategory(prevState: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
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
    await serverApiFetch('/product-categories/create', {
      method: 'POST',
      body: validatedFields.data,
    });
    revalidateTag(CACHE_TAGS.categories, 'max');
    revalidatePath('/admin/products'); 
    revalidatePath('/admin/categories');

    return { message: 'Kategori berhasil dibuat!', errors: {} };
  } catch (error) {
    return { message: 'Kesalahan jaringan. Gagal menghubungi server.' };
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
export async function deleteCategory(id: string) {
  try {
    await serverApiFetch(`/product-categories/${id}`, {
      method: 'DELETE',
    });
    revalidateTag(CACHE_TAGS.categories, 'max');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    return { success: true, message: 'Berhasil dihapus' };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus kategori' };
  }
}