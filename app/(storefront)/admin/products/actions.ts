'use server'

import { revalidatePath, revalidateTag } from 'next/cache';
import { ProductSchema } from '@/lib/schema';
import { UpdateProductSchema } from '@/lib/products/schema';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { serverApiFetch } from '@/lib/server-api';
import { ensurePermission } from '@/lib/rbac/guards';

export interface ProductFormState {
  message: string | null;
  errors?: {
    name?: string[];
    product_category_id?: string[];
    is_displayed?: string[];
  };
}

export async function getCategories() {
  const json = await serverApiFetch<any>('/product-categories', {
    revalidate: 300,
    tags: [CACHE_TAGS.categories],
  });
  return json.data ?? [];
}

// --- ACTION: CREATE PRODUCT ---
export async function createProduct(prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const access = await ensurePermission('products:manage');
  if (!access.ok) return { message: access.error };

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
    await serverApiFetch('/products', {
      method: 'POST',
      body: validatedFields.data,
    });

    revalidateTag(CACHE_TAGS.products, 'max');
    revalidatePath('/admin/products');
    revalidatePath('/admin/categories');
    return { message: 'Produk berhasil ditambahkan!' };
  } catch (err) {
    return { message: 'Gagal menghubungi server.' };
  }
}

// --- ACTION: UPDATE PRODUCT ---
export async function updateProduct(prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const access = await ensurePermission('products:manage');
  if (!access.ok) return { message: access.error };

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
    await serverApiFetch(`/products/${id}`, {
      method: 'PUT',
      body: dataToUpdate,
    });

    revalidateTag(CACHE_TAGS.products, 'max');
    revalidatePath('/admin/products');
    return { message: 'Produk berhasil diupdate!' };
  } catch (err) {
    return { message: 'Gagal menghubungi server.' };
  }
}

export async function deleteProduct(id: string) {
  const access = await ensurePermission('products:manage');
  if (!access.ok) return { success: false, message: access.error };

  try {
    await serverApiFetch(`/products/${id}`, {
      method: 'DELETE',
    });

    revalidateTag(CACHE_TAGS.products, 'max');
    revalidatePath('/admin/products');
    return { success: true, message: 'Berhasil dihapus' };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus produk' };
  }
}