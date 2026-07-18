// app/(storefront)/admin/products/[id]/items/actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { serverApiFetch } from '@/lib/server-api';
import { ensurePermission } from '@/lib/rbac/guards';
import { UnitItem } from '../../../units/actions';

export interface ProductItemRelation {
    id: number;
    name: string;
    is_displayed: boolean;
}

export interface ProductItem {
    id: number;
    name: string;
    price: string | number;
    pic_url: string;
    stock: number;
    is_displayed: boolean;
    product?: ProductItemRelation;
    unit?: {
        id: number;
        name: string;
        quantity: number;
    };
}

export interface ActionState {
    success?: boolean;
    message: string | null;
    errors?: Record<string, string[]>;
    timestamp?: number;
}

const ProductItemSchema = z.object({
    name: z.string().min(1, 'Nama item wajib diisi'),
    price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
    pic_url: z.string().min(1, 'URL gambar wajib diisi'),
    stock: z.coerce.number().min(0, 'Stok tidak boleh negatif'),
    is_displayed: z.preprocess((val) => val === 'true', z.boolean()),
    product_id: z.coerce.number().min(1, 'ID Produk wajib diisi'),
    unit_id: z.coerce.number().min(1, 'Satuan wajib dipilih'),
});

const UpdateProductItemSchema = z.object({
    name: z.string().min(1, 'Nama item wajib diisi'),
    price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
    pic_url: z.string().min(1, 'URL gambar wajib diisi'),
    stock: z.coerce.number().min(0, 'Stok tidak boleh negatif'),
    is_displayed: z.preprocess((val) => val === 'true', z.boolean()),
    unit_id: z.coerce.number().min(1, 'Satuan wajib dipilih'),
});

const ITEM_CACHE_TAG = 'product-items';

/**
 * Mengambil data varian item spesifik berdasarkan productId melalui query params.
 * Pola ini menjamin isolasi data pada layer database backend.
 */
export async function getProductItems(productId: string, page: number = 1, limit: number = 10, search: string = '') {
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        q: search,
        productId: productId, // Menyematkan productId secara eksplisit ke params API
    });

    const res = await serverApiFetch<any>(`/product-items?${query.toString()}`);
    return {
        data: (res.data as ProductItem[]) ?? [],
        meta: {
            currentPage: res.currentPage ?? 1,
            perPage: res.perPage ?? 10,
            totalPages: res.totalPages ?? 1,
            totalItems: res.totalItems ?? 0
        }
    };
}

export async function getProductItemById(itemId: number): Promise<ProductItem | null> {
    try {
        const res = await serverApiFetch<any>(`/product-items/${itemId}`);
        return res.data as ProductItem;
    } catch {
        return null;
    }
}

export async function getAllUnitsAvailable() {
    try {
        const res = await serverApiFetch<any>('/units?page=1&limit=100');
        return (res.data as UnitItem[]) ?? [];
    } catch {
        return [];
    }
}

export async function createProductItem(_prevState: ActionState, formData: FormData): Promise<ActionState> {
    const access = await ensurePermission('products:manage');
    if (!access.ok) return { success: false, message: access.error, timestamp: Date.now() };

    const validatedFields = ProductItemSchema.safeParse({
        name: formData.get('name'),
        price: formData.get('price'),
        pic_url: formData.get('pic_url'),
        stock: formData.get('stock'),
        is_displayed: formData.get('is_displayed'),
        product_id: formData.get('product_id'),
        unit_id: formData.get('unit_id'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validasi gagal. Mohon periksa kembali input Anda.',
            timestamp: Date.now(),
        };
    }

    try {
        await serverApiFetch('/product-items', { method: 'POST', body: validatedFields.data });
        revalidatePath(`/admin/products/${validatedFields.data.product_id}/items`);
        return { success: true, message: 'Item produk berhasil ditambahkan!', timestamp: Date.now() };
    } catch (error: any) {
        return { success: false, message: error.message || 'Gagal menyimpan item ke server.', timestamp: Date.now() };
    }
}

export async function updateProductItem(id: number, productId: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
    const access = await ensurePermission('products:manage');
    if (!access.ok) return { success: false, message: access.error, timestamp: Date.now() };

    const validatedFields = UpdateProductItemSchema.safeParse({
        name: formData.get('name'),
        price: formData.get('price'),
        pic_url: formData.get('pic_url'),
        stock: formData.get('stock'),
        is_displayed: formData.get('is_displayed'),
        unit_id: formData.get('unit_id'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validasi gagal.',
            timestamp: Date.now(),
        };
    }

    try {
        await serverApiFetch(`/product-items/${id}`, { method: 'PUT', body: validatedFields.data });
        revalidatePath(`/admin/products/${productId}/items`);
        return { success: true, message: 'Item produk berhasil diperbarui!', timestamp: Date.now() };
    } catch (error: any) {
        return { success: false, message: error.message || 'Gagal memperbarui item.', timestamp: Date.now() };
    }
}

export async function deleteProductItem(id: number, productId: number) {
    const access = await ensurePermission('products:manage');
    if (!access.ok) return { success: false, message: access.error };

    try {
        await serverApiFetch(`/product-items/${id}`, { method: 'DELETE' });
        revalidatePath(`/admin/products/${productId}/items`);
        return { success: true, message: 'Item produk berhasil dihapus!' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Gagal menghapus item.' };
    }
}