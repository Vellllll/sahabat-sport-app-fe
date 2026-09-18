'use server'

import { revalidatePath, revalidateTag } from 'next/cache';
import { ProductSchema } from '@/lib/schema';
import { UpdateProductSchema } from '@/lib/products/schema';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { serverApiFetch } from '@/lib/server-api';
import { ensurePermission } from '@/lib/rbac/guards';
import { extractApiErrorMessage, asRecord } from '@/lib/api-error';

export interface ProductFormState {
  message: string | null;
  errors?: {
    name?: string[];
    product_category_id?: string[];
    is_displayed?: string[];
  };
}

interface CategoryListResponse {
  data: { id: string; name: string }[];
}

export async function getCategories() {
  const json = await serverApiFetch<CategoryListResponse>('/product-categories', {
    revalidate: 300,
    tags: [CACHE_TAGS.categories],
  });
  return json.data ?? [];
}

// --- ACTION: CREATE PRODUCT ---
export async function createProduct(prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const access = await ensurePermission('products:manage');
  if (!access.ok) return { message: access.error, errors: {} };

  const validatedFields = ProductSchema.safeParse({
    name: formData.get('name'),
    product_category_id: formData.get('product_category_id'),
    is_displayed: formData.get('is_displayed') === 'on',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal validasi data input.',
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
    return { message: 'Produk berhasil ditambahkan!', errors: {} };
  } catch (error: unknown) {
    console.error("🔥 Create Product Server Action Error:", error);

    // 🟢 REFACTOR UTAMA: Kupas tuntas error payload JSON dari Exception NestJS
    const apiMessage = await extractApiErrorMessage(error);
    if (apiMessage) return { message: apiMessage, errors: {} };

    const errorRecord = asRecord(error);
    const bodyMessage = asRecord(errorRecord?.body)?.message;
    if (typeof bodyMessage === 'string') return { message: bodyMessage, errors: {} };

    const dataMessage = asRecord(errorRecord?.data)?.message;
    if (typeof dataMessage === 'string') return { message: dataMessage, errors: {} };

    if (error instanceof Error && error.message) return { message: error.message, errors: {} };

    return { message: 'Gagal menghubungi server.', errors: {} };
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