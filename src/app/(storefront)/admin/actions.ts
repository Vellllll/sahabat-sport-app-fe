// app/admin/_actions/get-detail.ts
'use server';

import { getAdminTransactionDetail, TransactionDetailResponse } from '@/lib/api/admin-transactions';
import { ensurePermission } from '@/lib/rbac/guards';

export async function fetchDetailAction(
  transactionId: number
): Promise<{ success: true; data: TransactionDetailResponse } | { success: false; error: string }> {
  const access = await ensurePermission('transactions:manage');
  if (!access.ok) return { success: false, error: access.error };

  const data = await getAdminTransactionDetail(access.session.token, transactionId);
  if (!data) return { success: false, error: 'Gagal mengambil detail produk dari server.' };

  return { success: true, data };
}