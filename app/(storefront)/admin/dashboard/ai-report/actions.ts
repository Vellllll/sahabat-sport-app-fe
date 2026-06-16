// app/admin/dashboard/ai-report/actions.ts
'use server';

import { serverApiFetch } from '@/lib/server-api';

export interface ChatApiResponse {
  status: number;
  answer: string;
}

export async function sendQueryToDatabaseAgent(
  token: string,
  message: string
): Promise<ChatApiResponse | null> {
  try {
    const endpoint = '/chat/query';

    // 🟢 REFACTOR: Kirim object literal murni karena serverApiFetch akan men-stringify ini secara otomatis
    const json = await serverApiFetch<ChatApiResponse>(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: { message }, // 🌟 DIUBAH DI SINI (Tanpa JSON.stringify)
    } as any);

    return json;
  } catch (error) {
    console.error("Gagal berkomunikasi dengan Database Agent AI:", error);
    return null;
  }
}