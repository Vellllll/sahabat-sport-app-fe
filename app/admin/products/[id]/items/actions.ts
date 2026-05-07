'use server'

import { revalidatePath, revalidateTag } from 'next/cache';
import {
    getProductById as getProductByIdFromApi,
    getProductItems as getProductItemsFromApi,
} from "@/lib/products/server-api";
import { CACHE_TAGS } from '@/lib/cache-tags';
import { serverApiFetch } from '@/lib/server-api';

export async function getProductItems(page: number = 1, limit: number = 10, productId: number = 0, isDisplayed: boolean | null = null) {
    return getProductItemsFromApi(page, limit, productId, isDisplayed);
}

export async function getProductById(id: number) {
    return getProductByIdFromApi(id);
}

export interface CreateProductItemState {
    message: string | null;
    errors?: {
        name?: string[];
        price?: string[];
        pic_url?: string[];
        stock?: string[];
        product_id?: string[];
    };
    success?: boolean;
}

export async function createProductItem(
    _prevState: CreateProductItemState,
    formData: FormData
): Promise<CreateProductItemState> {
    const name = String(formData.get('name') ?? '').trim();
    const pic_url = String(formData.get('pic_url') ?? '').trim();
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const product_id = Number(formData.get('product_id'));
    const is_displayed = formData.get('is_displayed') === 'on';

    const errors: CreateProductItemState['errors'] = {};

    if (!name) errors.name = ['Nama item wajib diisi'];
    if (!Number.isFinite(price) || price < 0) errors.price = ['Harga tidak valid'];
    if (!Number.isFinite(stock) || stock < 0) errors.stock = ['Stok tidak valid'];
    if (!Number.isFinite(product_id) || product_id <= 0) errors.product_id = ['Product ID tidak valid'];

    if (Object.keys(errors).length > 0) {
        return { message: 'Validasi gagal.', errors, success: false };
    }

    try {
        await serverApiFetch('/product-items', {
            method: 'POST',
            body: {
                name,
                price,
                pic_url,
                stock,
                is_displayed,
                product_id,
            },
        });

        revalidateTag(CACHE_TAGS.productItems, 'max');
        revalidatePath(`/admin/products/${product_id}/items`);

        return { message: 'Item produk berhasil dibuat!', success: true };
    } catch (_error) {
        return { message: 'Gagal membuat item produk.', success: false };
    }
}