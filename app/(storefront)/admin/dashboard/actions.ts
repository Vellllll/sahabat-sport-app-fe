// app/admin/dashboard/actions.ts
'use server';

import { serverApiFetch } from '@/lib/server-api';

export interface DashboardApiResponse {
  status: number;
  message: string;
  result: {
    year: string;
    cards: {
      total_revenue: number;
      total_orders: number;
      total_products: number;
      total_customers: number;
    };
    order_distribution_chart: {
      pending_payment: number;
      processing: number;
      completed: number;
      rejected: number;
    };
    sales_trend_chart: Array<{
      month: string;
      orders: number;
      revenue: number;
    }>;
    top_products: Array<{
      id: number;
      name: string;
      units_sold: number;
      revenue: number;
    }>;
  };
}

interface FilterParams {
  year?: string;
}

export async function getAdminDashboardStats(
  token: string,
  filters?: FilterParams
): Promise<DashboardApiResponse | null> {
  try {
    const queryParams = new URLSearchParams();
    const targetYear = filters?.year || new Date().getFullYear().toString();
    queryParams.append('year', targetYear);

    const endpoint = `/dashboard/admin-stats?${queryParams.toString()}`;

    console.log(`[Next.js Fetch] Menembak API Dashboard: ${endpoint}`);

    // Menggunakan cast 'as any' untuk menghindari konflik parameter ts(2353)
    const json = await serverApiFetch<DashboardApiResponse>(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    } as any);

    return json;
  } catch (error) {
    console.error("Fetch admin dashboard stats failed:", error);
    return null;
  }
}