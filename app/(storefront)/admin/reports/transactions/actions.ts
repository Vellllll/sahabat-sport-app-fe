// app/admin/reports/transactions/actions.ts
'use server';

import { serverApiFetch } from '@/lib/server-api';

export interface ReportApiResponse {
  status: number;
  message: string;
  result: {
    summary: {
      total_transactions: number;
      gross_revenue: number;
      net_revenue: number;
      status_distribution: {
        pending_payment: number;
        paid_processing: number;
        completed: number;
        rejected: number;
      };
    };
    monthly_trends: Array<{
      month: string;
      transaction_count: number;
      total_revenue: number;
    }>;
  };
}

interface FilterParams {
  start_date?: string;
  end_date?: string;
}

// 🟢 HELPER: Konversi String HTML Date (YYYY-MM-DD) menjadi Unix Epoch Seconds (Number)
const convertToEpoch = (dateString: string | undefined, isEndOfDay: boolean): string | undefined => {
  if (!dateString) return undefined;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return undefined;

  if (isEndOfDay) {
    date.setHours(23, 59, 59, 999); // Set ke akhir hari untuk end_date
  } else {
    date.setHours(0, 0, 0, 0); // Set ke awal hari untuk start_date
  }

  // Mengembalikan string angka Epoch Seconds (misal: "1781542800") sesuai validasi DTO NestJS
  return Math.floor(date.getTime() / 1000).toString();
};

export async function getTransactionReportSummary(
  token: string, 
  filters?: FilterParams
): Promise<ReportApiResponse | null> {
  try {
    const queryParams = new URLSearchParams();
    
    // 🟢 Jalankan konversi ke format Epoch sebelum data dimasukkan ke query string
    const epochStart = convertToEpoch(filters?.start_date, false);
    const epochEnd = convertToEpoch(filters?.end_date, true);

    if (epochStart) queryParams.append('start_date', epochStart);
    if (epochEnd) queryParams.append('end_date', epochEnd);

    const queryString = queryParams.toString();
    const endpoint = `/transactions/report/summary${queryString ? `?${queryString}` : ''}`;

    // Debugging di terminal server untuk memastikan data terkirim sebagai angka string
    console.log(`[Next.js Fetch] Menembak API Report: ${endpoint}`);

    const json = await serverApiFetch<ReportApiResponse>(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    return json;
  } catch (error) {
    console.error("Fetch transaction report summary failed:", error);
    return null;
  }
}