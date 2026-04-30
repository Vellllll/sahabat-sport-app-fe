// app/admin/products/actions.ts
'use server'

import { revalidatePath } from 'next/cache';
import { ProductSchema, ProductFormState } from '@/lib/schema';
import { cookies } from 'next/headers';

const API_URL = process.env.INTERNAL_API_URL;

export async function createProduct(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  // 2. Tarik data menggunakan key yang sama persis
  const validatedFields = ProductSchema.safeParse({
    name: formData.get('name'),
    product_category_id: formData.get('product_category_id'), // <--- Sesuaikan
    is_displayed: formData.get('is_displayed') === 'on',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal validasi data.',
    };
  }

  try {
    // 3. Kirim ke API dengan struktur yang diharapkan Backend
    // Jika backend minta snake_case (product_category_id), kirim persis seperti itu.
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // ValidatedFields.data sekarang berisi: { name, product_category_id, is_displayed }
      body: JSON.stringify(validatedFields.data), 
    });

    if (!response.ok) throw new Error('API Error');

    revalidatePath('/admin/products');
    return { message: 'Produk berhasil ditambahkan!', errors: {} };
  } catch (err) {
    return { message: 'Gagal menghubungi server.', errors: {} };
  }
}