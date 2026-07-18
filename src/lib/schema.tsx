// lib/schema.ts
import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  is_displayed: z.boolean().default(true),
  product_category_id: z.string().min(1, "Please select a category"),
});

export type ProductFormState = {
  errors?: {
    name?: string[];
    product_category_id?: string[];
  };
  message?: string | null;
};

// lib/schema.ts
export const CategorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
});

export type CategoryFormState = {
  errors?: {
    name?: string[];
  };
  message?: string | null;
};