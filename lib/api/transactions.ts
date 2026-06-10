// lib/api/storefront.ts

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