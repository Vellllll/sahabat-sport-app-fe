// app/admin/_actions/get-detail.ts
'use server';

import { cookies } from 'next/headers';
import { getAdminTransactionDetail } from '@/lib/api/admin-transactions';

export async function fetchDetailAction(transactionId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return { success: false, error: 'Sesi berakhir.' };

  const data = await getAdminTransactionDetail(token, transactionId);
  if (!data) return { success: false, error: 'Gagal mengambil detail produk dari server.' };

  return { success: true, data };
}