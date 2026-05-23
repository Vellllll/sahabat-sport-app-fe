// lib/api/storefront.ts

export interface TransactionItem {
    id: number;
    number: string;
    total_amount: number;
    is_paid: boolean;
    is_ready: boolean;
    created_at: number; // Unix Timestamp dalam detik (contoh: 1779009201)
  }
  
  export interface FetchTransactionsParams {
    page: number;
    per_page: number;
    transaction_number?: string;
    from_created_time?: string;
    to_created_time?: string;
    is_ready?: boolean; // Murni Boolean (true / false / undefined)
  }
  
  export interface ApiResponseTransactions {
    data: TransactionItem[];
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  }
  
  const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  
  export async function getUserTransactions(token: string, params: FetchTransactionsParams): Promise<ApiResponseTransactions> {
  
    // 1. Ambil parameter string terlebih dahulu menggunakan URLSearchParams
    const queryObj: Record<string, string> = {
      page: params.page.toString(),
      per_page: params.per_page.toString(),
    };
  
    if (params.transaction_number) queryObj.transaction_number = params.transaction_number;
    if (params.from_created_time) queryObj.from_created_time = params.from_created_time;
    if (params.to_created_time) queryObj.to_created_time = params.to_created_time;
  
    let queryString = new URLSearchParams(queryObj).toString();
  
    // 2. ✅ PERBAIKAN DI SINI: Inject parameter boolean secara manual tanpa tanda kutip string
    // Hasil akhir URL akan menjadi: /transactions?page=1&per_page=10&is_ready=true (bukan &is_ready="true")
    if (params.is_ready) {
      queryString += `&is_ready=${params.is_ready}`; 
    }
  
    const res = await fetch(`${API_URL}/transactions?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }
    });
  
    if (!res.ok) {
      if (res.status === 401) throw new Error('UNAUTHORIZED');
      throw new Error('FAILED_FETCH');
    }
  
    const json = await res.json();
    return json.result ?? { data: [], currentPage: 1, perPage: 10, totalPages: 1, totalItems: 0 };
  }