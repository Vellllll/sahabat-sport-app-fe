// lib/api/admin-transactions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export interface AdminTransactionItem {
  id: number;
  number: string;
  total_amount: number;
  is_paid: boolean;
  paid_at: number | null;
  is_ready: boolean;
  pic_proof_of_transfer_url: string | null; // Sesuai JSON baru
  is_requested: boolean;
  requested_at: number | null;
  is_sent: boolean;
  created_at: number;
  updated_at: number;
}
// 1. Fetch seluruh transaksi masuk
export async function getAdminTransactionsByFilter(
  token: string,
  filters: { is_requested?: boolean; is_ready?: boolean; is_paid?: boolean; is_sent?: boolean, is_rejected?: boolean }
): Promise<AdminTransactionItem[]> {
  const queryParams = new URLSearchParams();

  if (filters.is_requested !== undefined) queryParams.append('is_requested', String(filters.is_requested));
  if (filters.is_ready !== undefined) queryParams.append('is_ready', String(filters.is_ready));
  if (filters.is_paid !== undefined) queryParams.append('is_paid', String(filters.is_paid));
  if (filters.is_sent !== undefined) queryParams.append('is_sent', String(filters.is_sent));
  if (filters.is_rejected !== undefined) queryParams.append('is_rejected', String(filters.is_rejected));

  const res = await fetch(`${API_URL}/transactions/admin?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 0 } // Fresh data audit
  });

  if (!res.ok) return [];
  const json = await res.json();
  return json.result ?? [];
}

// 2. Action set lunas pembayaran manual
export async function verifyAdminPayment(transactionId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: 'Sesi berakhir' };

  try {
    // Sesuaikan endpoint bayar/konfirmasi manual dari backend Anda
    const res = await fetch(`${API_URL}/admin/transactions/${transactionId}/verify`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return { success: false, error: 'Gagal memperbarui status transaksi.' };

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gangguan koneksi server.' };
  }
}

// lib/api/admin-transactions.ts

// ... (interface dan fungsi lama tetap aman di atas) ...

export interface TransactionDetailResponse {
  id: number;
  number: string;
  total_amount: number;
  is_paid: boolean;
  created_at: number;
  items: {
    id: number;
    count: number;
    product_item: {
      id: number;
      name: string;
      price: string;
      pic_url: string;
    };
  }[];
}

export async function getAdminTransactionDetail(token: string, transactionId: number): Promise<TransactionDetailResponse | null> {
  try {
    const res = await fetch(`${API_URL}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.result ?? json.data ?? null; // Menyesuaikan pembungkus response backend Anda
  } catch (error) {
    console.error("Fetch transaction detail error:", error);
    return null;
  }
}

export async function readyTransactionAction(transactionId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: 'Sesi Anda telah berakhir.' };

  try {
    const res = await fetch(`${API_URL}/transactions/admin/${transactionId}/ready`, {
      method: 'POST', // Sesuai decorator @Post() di NestJS Anda
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { 
        success: false, 
        error: json.message || 'Gagal mengubah status transaksi menjadi ready.' 
      };
    }

    // Bersihkan cache halaman admin agar 3 list data ter-update otomatis
    revalidatePath('/admin');
    
    return { success: true };
  } catch (error) {
    console.error("Ready transaction error:", error);
    return { success: false, error: 'Terjadi gangguan koneksi ke server.' };
  }
}

export async function shipTransactionAction(transactionId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: 'Sesi Anda telah berakhir.' };

  try {
    // Sesuaikan endpoint penyelesaian/pengiriman barang dari backend NestJS Anda
    const res = await fetch(`${API_URL}/transactions/admin/${transactionId}/ship`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { 
        success: false, 
        error: json.message || 'Gagal mengubah status transaksi menjadi terkirim.' 
      };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Ship transaction error:", error);
    return { success: false, error: 'Terjadi gangguan koneksi ke server.' };
  }
}

export async function rejectTransactionAction(id: number, note: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: 'Sesi Anda telah berakhir.' };

  try {
    const queryParams = new URLSearchParams();
    if (note) queryParams.append('note', note);

    // ✅ Mengirimkan catatan melalui query parameter "?note=..."
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/transactions/admin/${id}/reject?${queryParams.toString()}`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.message || 'Gagal mereject transaksi.' };
    }
    return { success: true, data: json.result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Terjadi kesalahan koneksi server.' };
  }
}