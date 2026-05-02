'use server'

import { revalidatePath } from 'next/cache';
import { ProductSchema } from '@/lib/schema';
import { cookies } from 'next/headers';
import { UpdateProductSchema } from '@/lib/products/schema';

export interface ProductFormState {
  message: string | null;
  errors?: {
    name?: string[];
    product_category_id?: string[];
    is_displayed?: string[];
  };
}

const API_URL = process.env.INTERNAL_API_URL;

// --- ACTION: CREATE PRODUCT ---
export async function createProduct(prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const validatedFields = ProductSchema.safeParse({
    name: formData.get('name'),
    product_category_id: formData.get('product_category_id'),
    is_displayed: formData.get('is_displayed') === 'on',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal validasi data.',
    };
  }

  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedFields.data), 
    });

    if (!response.ok) throw new Error('API Error');

    revalidatePath('/admin/products');
    return { message: 'Produk berhasil ditambahkan!' };
  } catch (err) {
    return { message: 'Gagal menghubungi server.' };
  }
}

// --- ACTION: UPDATE PRODUCT ---
export async function updateProduct(prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const validatedFields = UpdateProductSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    product_category_id: formData.get('product_category_id'),
    is_displayed: formData.get('is_displayed') === 'on',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal validasi data.',
    };
  }

  const { id, ...dataToUpdate } = validatedFields.data;

  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT', 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToUpdate),
    });

    if (!response.ok) throw new Error('API Error');

    revalidatePath('/admin/products');
    return { message: 'Produk berhasil diupdate!' };
  } catch (err) {
    return { message: 'Gagal menghubungi server.' };
  }
}

export async function deleteProduct(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Gagal menghapus data dari server');
    }

    revalidatePath('/admin/products');
    return { success: true, message: 'Berhasil dihapus' };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus produk' };
  }
}