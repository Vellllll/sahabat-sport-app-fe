'use server'

import { revalidatePath } from 'next/cache';
import { CategorySchema, CategoryFormState } from '@/lib/schema';
import { cookies } from 'next/headers';
import z from 'zod';

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
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    const response = await fetch(`${process.env.INTERNAL_API_URL}/product-categories/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      const result = await response.json();
      return { message: result.message || 'Gagal menyimpan kategori ke database.' };
    }

    // Paksa Next.js untuk refresh cache kategori
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
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    // API Call: PUT/PATCH ke /product-categories/:id
    const response = await fetch(`${process.env.INTERNAL_API_URL}/product-categories/${id}`, {
      method: 'PUT', // Ganti 'PATCH' jika backend kamu pakai PATCH
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      return { message: result.message || 'Gagal memperbarui kategori ke database.' };
    }

    // Refresh cache agar UI langsung terupdate
    revalidatePath('/admin/categories');
    return { message: 'Kategori berhasil diupdate!', errors: {} };
  } catch (error) {
    return { message: 'Kesalahan jaringan. Gagal menghubungi server.' };
  }
}

// --- ACTION: DELETE KATEGORI ---
export async function deleteCategory(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    // API Call: DELETE ke /product-categories/:id
    const response = await fetch(`${process.env.INTERNAL_API_URL}/product-categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Gagal menghapus data dari server');
    }

    revalidatePath('/admin/categories');
    return { success: true, message: 'Berhasil dihapus' };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus kategori' };
  }
}