// app/admin/dashboard/ai-report/actions.ts
'use server';

import { serverApiFetch } from '@/lib/server-api';

export interface ChatTableData {
  columns: string[];
  rows: Record<string, string | number | null>[];
}

export interface ChatChartData {
  type: 'line' | 'bar' | 'pie';
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

export interface ChatApiResponse {
  status: number;
  answer: string;
  table: ChatTableData | null;
  chart: ChatChartData | null;
}

export async function sendQueryToDatabaseAgent(
  message: string
): Promise<ChatApiResponse | null> {
  try {
    const endpoint = '/chat/query';

    // serverApiFetch attaches the real admin session token from cookies automatically
    const json = await serverApiFetch<ChatApiResponse>(endpoint, {
      method: 'POST',
      body: { message },
    });

    return json;
  } catch (error) {
    console.error("Gagal berkomunikasi dengan Database Agent AI:", error);
    return null;
  }
}