// admin/products/[id]/items/actions.ts
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

export interface ProductItemFormState {
    success: boolean;
    message: string | null;
    errors?: Record<string, string[]>;
    timestamp?: number;
    fields?: {
        name?: string;
        price?: string;
        stock?: string;
    };
}

const ProductItemSchema = z.object({
    id: z.string().optional(),
    product_id: z.coerce.number().positive(),
    name: z.string().min(1, "Nama varian wajib diisi"),
    price: z.coerce.number().min(0, "Harga tidak boleh minus"),
    stock: z.coerce.number().min(0, "Stok tidak boleh minus"),
    pic_url: z.string().optional(),
    is_displayed: z.boolean().default(true),
});

// ==========================================
// 🟢 3. CREATE ACTION
// ==========================================
export async function createProductItem(
    _prevState: ProductItemFormState,
    formData: FormData
): Promise<ProductItemFormState> {
    const access = await ensurePermission('products:manage');
    if (!access.ok) return { success: false, message: access.error, timestamp: Date.now() };

    // 🌟 FIX SILENT BUG: Ekstrak seluruh data utuh untuk Zod
    const rawInput = {
        product_id: formData.get('product_id'),
        name: formData.get('name'),
        price: formData.get('price'),
        stock: formData.get('stock'),
        pic_url: formData.get('pic_url'),
        is_displayed: formData.get('is_displayed') === 'on',
    };

    // Data cadangan untuk dikembalikan ke UI agar nilai input tidak hilang
    const rawFields = {
        name: formData.get('name') as string,
        price: formData.get('price') as string,
        stock: formData.get('stock') as string,
    };

    // Masukkan data utuh (rawInput) ke Zod
    const validated = ProductItemSchema.safeParse(rawInput);

    // 🌟 FIX TS ERROR: Karena hanya mengecek !validated.success, TS yakin 100% .error pasti ada
    if (!validated.success) {
        const fieldErrors = validated.error.flatten().fieldErrors;
        const firstErrorMessage = Object.values(fieldErrors).flat()[0] || 'Validasi data input gagal.';
        
        return { 
            success: false, 
            message: firstErrorMessage, 
            errors: fieldErrors as Record<string, string[]>, 
            timestamp: Date.now(),
            fields: rawFields 
        };
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
        console.error("🔥 Create Variant Error:", error);
        
        if (error && typeof error.json === 'function') {
            try {
                const errorPayload = await error.json();
                if (errorPayload?.message) {
                    return { 
                        success: false, 
                        message: Array.isArray(errorPayload.message) ? errorPayload.message[0] : errorPayload.message, 
                        timestamp: Date.now(),
                        fields: rawFields 
                    };
                }
            } catch (e) {}
        }

        return { success: false, message: 'Gagal membuat varian.', timestamp: Date.now(), fields: rawFields };
    }
}

// ==========================================
// 🟢 4. UPDATE ACTION
// ==========================================
export async function updateProductItem(
    _prevState: ProductItemFormState,
    formData: FormData
): Promise<ProductItemFormState> {
    const access = await ensurePermission('products:manage');
    if (!access.ok) return { success: false, message: access.error, timestamp: Date.now() };

    const id = formData.get('id') as string;
    
    // 🌟 FIX LOGIC TS: Cek ID secara terpisah agar TypeScript tidak bingung!
    if (!id) {
        return { success: false, message: 'ID Varian tidak ditemukan.', timestamp: Date.now() };
    }

    // 🌟 FIX SILENT BUG: Ekstrak seluruh data utuh untuk Zod
    const rawInput = {
        product_id: formData.get('product_id'),
        name: formData.get('name'),
        price: formData.get('price'),
        stock: formData.get('stock'),
        pic_url: formData.get('pic_url'),
        is_displayed: formData.get('is_displayed') === 'on',
    };

    const rawFields = {
        name: formData.get('name') as string,
        price: formData.get('price') as string,
        stock: formData.get('stock') as string,
    };

    const validated = ProductItemSchema.safeParse(rawInput);

    if (!validated.success) {
        const fieldErrors = validated.error.flatten().fieldErrors; 
        const firstErrorMessage = Object.values(fieldErrors).flat()[0] || 'Validasi data input gagal.';
        
        return { 
            success: false, 
            message: firstErrorMessage, 
            errors: fieldErrors as Record<string, string[]>, 
            timestamp: Date.now(),
            fields: rawFields
        };
    }

    const { product_id, ...restData } = validated.data;

    try {
        await serverApiFetch(`/product-items/${id}`, {
            method: 'PUT',
            body: { 
                ...restData, 
                productId: product_id
            },
        });

        revalidateTag(CACHE_TAGS.productItems, 'max' as any);
        revalidatePath(`/admin/products/${product_id}/items`);

        return { success: true, message: 'Varian berhasil diupdate!', timestamp: Date.now() };
    } catch (error: any) {
        console.error("🔥 Update Variant Error:", error);

        if (error && typeof error.json === 'function') {
            try {
                const errorPayload = await error.json();
                if (errorPayload?.message) {
                    return { 
                        success: false, 
                        message: Array.isArray(errorPayload.message) ? errorPayload.message[0] : errorPayload.message, 
                        timestamp: Date.now(),
                        fields: rawFields
                    };
                }
            } catch (e) {}
        }

        return { success: false, message: 'Gagal mengupdate varian.', timestamp: Date.now(), fields: rawFields };
    }
}

// ==========================================
// 🟢 5. DELETE ACTION (TETAP SEPERTI SEMULA)
// ==========================================
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