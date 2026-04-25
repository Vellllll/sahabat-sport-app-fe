// app/admin/products/actions.ts
'use server'

import { revalidatePath } from 'next/cache';
import { ProductSchema, ProductFormState } from '@/lib/schema';
import { cookies } from 'next/headers';

export async function createProduct(prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  // 1. Validate the form data locally first (Save bandwidth/API hits)
  const validatedFields = ProductSchema.safeParse({
    name: formData.get('name'),
    is_displayed: formData.get('isDisplayed') === 'on',
    product_category_id: formData.get('categoryId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Check your inputs.',
    };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    // 2. Proxy the request to your Backend API
    const response = await fetch(`${process.env.INTERNAL_API_URL}/products/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedFields.data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle backend-specific errors (e.g., "Product name already exists")
      return {
        message: result.message || 'Backend API error occurred.',
      };
    }

    // 3. Success! Clear the cache for the product list
    revalidatePath('/admin/products');
    
    return { 
      message: 'Product created successfully!', 
      errors: {} 
    };

  } catch (error) {
    return {
      message: 'Network error. Could not reach the server.',
    };
  }
}