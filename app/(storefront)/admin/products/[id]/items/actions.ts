'use server'

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import {
    getProductById as getProductByIdFromApi,
    getProductItems as getProductItemsFromApi,
} from "@/lib/products/server-api";
import { CACHE_TAGS } from '@/lib/cache-tags';
import { serverApiFetch } from '@/lib/server-api';
import { ensurePermission } from '@/lib/rbac/guards';

export async function getProductItems(page: number = 1, limit: number = 10, productId: number = 0, isDisplayed: boolean | null = null) {
    return getProductItemsFromApi(page, limit, productId, isDisplayed);
}

export async function getProductById(id: number) {
    return getProductByIdFromApi(id);
}

// 1. Standarisasi State
export interface ProductItemFormState {
    success: boolean;
    message: string | null;
    errors?: Record<string, string[]>;
    timestamp?: number;
}

// 2. Skema Validasi Zod
const ProductItemSchema = z.object({
    id: z.string().optional(),
    product_id: z.coerce.number().positive(),
    name: z.string().min(1, "Nama varian wajib diisi"),
    price: z.coerce.number().min(0, "Harga tidak valid"),
    stock: z.coerce.number().min(0, "Stok tidak valid"),
    pic_url: z.string().optional(),
    is_displayed: z.boolean().default(true),
});

// 3. CREATE ACTION
export async function createProductItem(
    _prevState: ProductItemFormState,
    formData: FormData
): Promise<ProductItemFormState> {
    const access = await ensurePermission('products:manage');
    if (!access.ok) return { success: false, message: access.error, timestamp: Date.now() };

    const validated = ProductItemSchema.safeParse({
        product_id: formData.get('product_id'),
        name: formData.get('name'),
        price: formData.get('price'),
        stock: formData.get('stock'),
        pic_url: formData.get('pic_url'),
        is_displayed: formData.get('is_displayed') === 'on',
    });

    if (!validated.success) {
        return { success: false, message: 'Validasi gagal.', errors: validated.error.flatten().fieldErrors };
    }

    try {
        await serverApiFetch('/product-items', {
            method: 'POST',
            body: validated.data,
        });

        revalidateTag(CACHE_TAGS.productItems, 'max' as any);
        revalidatePath(`/admin/products/${validated.data.product_id}/items`);

        return { success: true, message: 'Varian berhasil dibuat!', timestamp: Date.now() };
    } catch (error: any) {
        return { success: false, message: error.message || 'Gagal membuat varian.', timestamp: Date.now() };
    }
}

// 4. UPDATE ACTION
export async function updateProductItem(
    _prevState: ProductItemFormState,
    formData: FormData
): Promise<ProductItemFormState> {
    const access = await ensurePermission('products:manage');
    if (!access.ok) return { success: false, message: access.error, timestamp: Date.now() };

    const id = formData.get('id');
    const validated = ProductItemSchema.safeParse({
        product_id: formData.get('product_id'),
        name: formData.get('name'),
        price: formData.get('price'),
        stock: formData.get('stock'),
        pic_url: formData.get('pic_url'),
        is_displayed: formData.get('is_displayed') === 'on',
    });

    if (!validated.success || !id) {
        return { success: false, message: 'Validasi gagal.', errors: validated.error?.flatten().fieldErrors };
    }

    try {
        await serverApiFetch(`/product-items/${id}`, {
            method: 'PUT',
            body: { ...validated.data, productId: validated.data.product_id }, // DTO mapping jika backend NestJS/Spring
        });

        revalidateTag(CACHE_TAGS.productItems, 'max' as any);
        revalidatePath(`/admin/products/${validated.data.product_id}/items`);

        return { success: true, message: 'Varian berhasil diupdate!', timestamp: Date.now() };
    } catch (error: any) {
        return { success: false, message: error.message || 'Gagal mengupdate varian.', timestamp: Date.now() };
    }
}

export async function deleteProductItem(
    productId: number,
    itemId: string
): Promise<ProductItemFormState> {
    const access = await ensurePermission('products:manage');
    if (!access.ok) return { success: false, message: access.error, timestamp: Date.now() };

    try {
        await serverApiFetch(`/product-items/${itemId}`, {
            method: 'DELETE',
        });

        // Revalidasi agar UI sinkron
        revalidateTag(CACHE_TAGS.productItems, 'max' as any);
        revalidatePath(`/admin/products/${productId}/items`);

        return { 
            success: true, 
            message: 'Varian berhasil dihapus!', 
            timestamp: Date.now() 
        };
    } catch (error: any) {
        return { 
            success: false, 
            message: error.message || 'Gagal menghapus varian.', 
            timestamp: Date.now() 
        };
    }
}