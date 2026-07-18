// lib/api/storefront.ts

import { serverApiFetch } from "../server-api";

export interface TransactionItem {
    id: number;
    number: string;
    total_amount: number;
    is_paid: boolean;
    is_ready: boolean;
    is_sent: boolean;
    is_rejected: boolean;
    is_requested: boolean;
    created_at: number; // Unix Timestamp dalam detik (contoh: 1779009201)
}

export interface FetchTransactionsParams {
    page: number;
    per_page: number;
    transaction_number?: string;

    // 🟢 SEHARUSNYA NUMBER: Ubah dari string menjadi number/undefined agar cocok dengan DTO NestJS
    from_created_time?: number;
    to_created_time?: number;

    is_ready?: boolean;
    is_requested?: boolean;
    is_sent?: boolean;
    is_rejected?: boolean;
}

export interface ApiResponseTransactions {
    data: TransactionItem[];
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
}

export interface ProductItemDetail {
    id: number;
    name: string;
    price: string; // Mengikuti tipe string dari JSON backend Anda ("84458.00")
    pic_url: string;
    stock: number;
    is_displayed: boolean;
}

export interface TransactionDetailItem {
    id: number;
    count: number;
    product_item: ProductItemDetail;
}

// lib/api/storefront.ts

export interface ApiResponseTransactionDetail {
    reject_note: boolean;
    is_sent: boolean;
    is_rejected: boolean;
    pic_proof_of_transfer_url: string;
    number: string;
    created_at: number;
    is_paid: boolean;
    is_ready: boolean;
    is_requested: boolean; // ✅ Tambahan key status request
    requested_at: number | null; // ✅ Unix timestamp (detik) atau null jika belum di-request
    items: TransactionDetailItem[];
}

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function getUserTransactions(
    token: string, 
    params: FetchTransactionsParams
  ): Promise<ApiResponseTransactions> {
    
    const query = new URLSearchParams();
    
    // 1. Masukkan parameter wajib paginasi
    query.append('page', params.page.toString());
    query.append('per_page', params.per_page.toString());
    
    // 2. Masukkan nomor nota pencarian jika diinput oleh user
    if (params.transaction_number) {
      query.append('transaction_number', params.transaction_number);
    }
    
    // 3. Masukkan rentang Unix Timestamp waktu transaksi
    if (params.from_created_time !== undefined) {
      query.append('from_created_time', params.from_created_time.toString());
    }
    if (params.to_created_time !== undefined) {
      query.append('to_created_time', params.to_created_time.toString());
    }
  
    // 🟢 KUNCI ALIGNMENT MULTI-FLAG STATUS (SINKRON DTO BACKEND):
    // Kita cek secara eksplisit kombinasi parameter boolean flag berdasarkan filter yang aktif
    if (params.is_ready === true) {
      // 1. Siap Diambil
      query.append('is_requested', 'true');
      query.append('is_ready', 'true');
    //   query.append('is_sent', 'false');
    //   query.append('is_rejected', 'false');
    } 
    else if (params.is_requested === true) {
      // 2. Sedang Diproses
      query.append('is_requested', 'true');
    //   query.append('is_ready', 'false');
    //   query.append('is_sent', 'false');
    //   query.append('is_rejected', 'false');
    } 
    else if (params.is_sent === true) {
      // 3. Terkirim
      query.append('is_requested', 'true');
      query.append('is_ready', 'true');
      query.append('is_sent', 'true');
    //   query.append('is_rejected', 'false');
    } 
    else if (params.is_rejected === true) {
      // 4. Tereject
      query.append('is_requested', 'true');
    //   query.append('is_ready', 'false');
    //   query.append('is_sent', 'false');
      query.append('is_rejected', 'true');
    }
    // Catatan: Jika params.status adalah 'ALL', semua properti di atas akan bernilai undefined
    // sehingga parameter status tidak akan di-append ke URLSearchParams, memicu @IsOptional() di NestJS.
  
    const endpoint = `${API_URL}/transactions?${query.toString()}`;
  
    try {
      console.log(`[Native Fetch] Menembak API Core dengan Saringan Kombinasi: ${endpoint}`);
  
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store', // Nonaktifkan cache server Next.js agar data selalu reaktif
      });
  
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
  
      if (!response.ok) {
        throw new Error(`Fetch gagal. Status: ${response.status}`);
      }
  
      const payload = await response.json();
      
      return payload.result;
  
    } catch (error) {
      console.error("Gagal mengeksekusi getUserTransactions native fetch:", error);
      // Kembalikan fallback agar layout storefront tidak pecah jika server offline
      return {
        data: [],
        currentPage: 1,
        perPage: 10,
        totalPages: 1,
        totalItems: 0
      };
    }
  }

export async function getTransactionDetail(token: string, id: string): Promise<ApiResponseTransactionDetail | null> {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        next: { revalidate: 0 }
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error('UNAUTHORIZED');
        return null;
    }

    const json = await res.json();
    return json.result ?? null;
}

// lib/api/storefront.ts

export interface BankAccountItem {
    name: string;      // Nama pemilik rekening (Atas Nama)
    number: string;    // Nomor Rekening
    bank_name: string; // Nama Bank (BCA, Mandiri, dll)
}

// Fungsi Fetch List Bank Akun Resmi Toko
export async function getActiveBankAccounts(token: string): Promise<BankAccountItem[]> {
    // Menyusun query parameter is_displayed=true sesuai kontrak API Anda
    const query = new URLSearchParams({ is_displayed: 'true' });

    const res = await fetch(`${API_URL}/accounts?${query.toString()}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 } // Cache selama 1 jam karena data rekening jarang berubah mendadak
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json.result ?? [];
}