// app/admin/reports/products/actions.ts
'use server';

import { serverApiFetch } from '@/lib/server-api';

export interface TopProductItem {
  product_id: number;
  product_name: string;
  total_units_sold: number;
  total_revenue: number;
}

export interface ProductSalesItem {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface MonthlyProductSalesReportResponse {
  status: number;
  message: string;
  result: {
    year: string;
    top_products: TopProductItem[]; // 🟢 Menambahkan properti baru dari API
    monthly_data: Record<string, ProductSalesItem[]>;
  };
}

interface FilterParams {
  year?: string;
}

export async function getMonthlyProductSalesReport(
  token: string,
  filters?: FilterParams
): Promise<MonthlyProductSalesReportResponse | null> {
  try {
    const queryParams = new URLSearchParams();
    const targetYear = filters?.year || new Date().getFullYear().toString();
    queryParams.append('year', targetYear);

    const endpoint = `/products/report/monthly-sales?${queryParams.toString()}`;

    console.log(`[Next.js Fetch] Menembak API Product Report: ${endpoint}`);

    const json = await serverApiFetch<MonthlyProductSalesReportResponse>(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    } as any);

    return json;
  } catch (error) {
    console.error("Fetch monthly product sales report failed:", error);
    return null;
  }
}