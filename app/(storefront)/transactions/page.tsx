// app/(storefront)/transactions/page.tsx
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { TransactionTable } from './_components/transaction-table';
import { TransactionFilterBar } from './_components/transaction-filter-bar';
import { TransactionPagination } from './_components/transaction-pagination';
import { Transaction } from '@/lib/types/transactions';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

interface SearchParams {
  q?: string;
  startDate?: string;
  endDate?: string;
  fulfillment?: string;
  page?: string;
}

async function getUserTransactions(sp: SearchParams): Promise<{ data: Transaction[]; totalPages: number }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) redirect('/login');

  // Menyusun query string ke backend berdasarkan Search Params URL Next.js
  const query = new URLSearchParams({
    page: sp.page || '1',
    limit: '10',
    ...(sp.q && { transactionNumber: sp.q }),
    ...(sp.startDate && { startDate: sp.startDate }),
    ...(sp.endDate && { endDate: sp.endDate }),
    ...(sp.fulfillment && sp.fulfillment !== 'ALL' && { fulfillmentStatus: sp.fulfillment }),
  });

  try {
    const res = await fetch(`${API_URL}/user/transactions?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }
    });

    if (res.status === 401) redirect('/login');
    if (!res.ok) return { data: [], totalPages: 1 };

    const json = await res.json();
    return {
      data: json.data ?? [],
      totalPages: json.totalPages ?? 1
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Fetch transactions error:", error);
    return { data: [], totalPages: 1 };
  }
}

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const { data: transactions, totalPages } = await getUserTransactions(sp);
  const currentPage = Number(sp.page) || 1;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* EDITORIAL PAGE HEADER */}
        <div className="space-y-2 pb-6 border-b border-slate-100">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            Riwayat Transaksi
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pantau status pembayaran dan kesiapan unit pesanan Anda
          </p>
        </div>

        {/* 1. COMPONENT FILTER BAR */}
        <TransactionFilterBar currentFilters={{
          q: sp.q || '',
          startDate: sp.startDate || '',
          endDate: sp.endDate || '',
          fulfillment: sp.fulfillment || 'ALL'
        }} />

        {/* 2. DATA TABLE VIEWPORT WITH SUSPENSE KEY */}
        <Suspense key={JSON.stringify(sp)} fallback={<TableSkeleton />}>
          {transactions.length > 0 ? (
            <div className="space-y-8">
              <TransactionTable initialTransactions={transactions} />
              
              {/* 3. COMPONENT PAGINATION */}
              {totalPages > 1 && (
                <TransactionPagination currentPage={currentPage} totalPages={totalPages} />
              )}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-slate-200 rounded-[24px]">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Data Tidak Ditemukan</h3>
              <p className="text-xs text-slate-400 font-medium max-w-[280px] mx-auto mt-1 leading-relaxed">
                Tidak ada transaksi yang cocok dengan parameter filter pencarian Anda.
              </p>
            </div>
          )}
        </Suspense>

      </div>
    </main>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4 w-full animate-pulse pt-4">
      <div className="h-10 bg-slate-100 rounded-lg w-full" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-50 rounded-xl w-full" />
      ))}
    </div>
  );
}