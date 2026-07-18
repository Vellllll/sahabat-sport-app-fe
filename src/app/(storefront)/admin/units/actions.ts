'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { serverApiFetch } from '@/lib/server-api';
import { ensurePermission } from '@/lib/rbac/guards';

// Typings sesuai JSON respons dokumentasi API
export interface UnitItem {
  id: number;
  name: string;
  quantity: number;
}

export interface UnitFormState {
  message: string | null;
  errors?: Record<string, string[]>;
  timestamp?: number;
}

const UnitSchema = z.object({
  name: z.string().min(1, "Nama satuan wajib diisi"),
  quantity: z.coerce.number().min(1, "Kuantitas minimal 1"),
});

const UNIT_CACHE_TAG = 'units';

// --- DATA FETCHER ---
export async function getUnits(page: number = 1, limit: number = 10) {
  // Sesuai parameter dokumentasi: page, limit
  const res = await serverApiFetch<any>(`/units?page=${page}&limit=${limit}`, {
    revalidate: 60,
    tags: [UNIT_CACHE_TAG],
  });

  return {
    data: (res.data as UnitItem[]) ?? [],
    meta: res.meta ?? { totalPages: 1, currentPage: 1, totalItems: 0 },
  };
}

// --- MUTATIONS ---
export async function createUnit(_prevState: UnitFormState, formData: FormData): Promise<UnitFormState> {
  const access = await ensurePermission('products:manage'); // Menggunakan domain permission produk
  if (!access.ok) return { message: access.error, timestamp: Date.now() };

  const validatedFields = UnitSchema.safeParse({
    name: formData.get('name'),
    quantity: formData.get('quantity'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validasi gagal. Cek kembali input Anda.',
      timestamp: Date.now(),
    };
  }

  try {
    // Sesuai API POST /units
    await serverApiFetch('/units', {
      method: 'POST',
      body: validatedFields.data,
    });

    revalidatePath('/admin/units');
    return { message: 'Satuan berhasil dibuat!', timestamp: Date.now() };
  } catch (error: any) {
    return { message: error.message || 'Gagal terhubung ke server.', timestamp: Date.now() };
  }
}

export async function updateUnit(_prevState: UnitFormState, formData: FormData): Promise<UnitFormState> {
  const access = await ensurePermission('products:manage');
  if (!access.ok) return { message: access.error, timestamp: Date.now() };

  const id = formData.get('id') as string;
  const validatedFields = UnitSchema.safeParse({
    name: formData.get('name'),
    quantity: formData.get('quantity'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validasi gagal.',
      timestamp: Date.now(),
    };
  }

  try {
    // Sesuai API PUT /units/:id
    await serverApiFetch(`/units/${id}`, {
      method: 'PUT',
      body: validatedFields.data,
    });

    revalidatePath('/admin/units');
    return { message: 'Satuan berhasil diupdate!', timestamp: Date.now() };
  } catch (error: any) {
    return { message: error.message || 'Gagal mengupdate satuan.', timestamp: Date.now() };
  }
}

export async function deleteUnit(id: number) {
  const access = await ensurePermission('products:manage');
  if (!access.ok) return { success: false, message: access.error };

  try {
    // Sesuai API DELETE /units/:id
    await serverApiFetch(`/units/${id}`, { method: 'DELETE' });
    revalidatePath('/admin/units');
    return { success: true, message: 'Satuan berhasil dihapus!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal menghapus satuan.' };
  }
}