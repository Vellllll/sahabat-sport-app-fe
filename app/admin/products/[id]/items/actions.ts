'use server'

import {
    getProductById as getProductByIdFromApi,
    getProductItems as getProductItemsFromApi,
} from "@/lib/products/server-api";

export async function getProductItems(page: number = 1, limit: number = 10, productId: number = 0, isDisplayed: boolean | null = null) {
    return getProductItemsFromApi(page, limit, productId, isDisplayed);
}

export async function getProductById(id: number) {
    return getProductByIdFromApi(id);
}