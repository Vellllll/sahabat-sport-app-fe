'use server'

import { revalidatePath } from 'next/cache';
import { CategorySchema, CategoryFormState } from '@/lib/schema';
import { cookies } from 'next/headers';

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