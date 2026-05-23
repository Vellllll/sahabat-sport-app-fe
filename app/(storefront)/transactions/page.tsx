// app/(storefront)/transactions/page.tsx
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { TransactionTable } from './_components/transaction-table';
import { TransactionFilterBar } from './_components/transaction-filter-bar';
import { TransactionPagination } from './_components/transaction-pagination';
import { ApiResponseTransactions, getUserTransactions, type FetchTransactionsParams } from '@/lib/api/transactions';

interface SearchParams {
  q?: string;
  startDate?: string;
  endDate?: string;
  fulfillment?: string;
  page?: string;
}

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) redirect('/login');

  const convertToEpoch = (dateString: string | undefined, isEndOfDay: boolean): string | undefined => {
    if (!dateString) return undefined;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return undefined;

    if (isEndOfDay) {
      date.setHours(23, 59, 59, 999); // Set ke akhir hari
    } else {
      date.setHours(0, 0, 0, 0); // Set ke awal hari
    }

    // Math.floor mengubah milidetik menjadi detik (Epoch)
    console.log(Math.floor(date.getTime() / 1000).toString())
    return Math.floor(date.getTime() / 1000).toString();
  };

  // Mapping state URL ke parameter API asli Backend Anda
  const apiParams: FetchTransactionsParams = {
    page: Number(sp.page) || 1,
    per_page: 10,
    transaction_number: sp.q || undefined,
    from_created_time: convertToEpoch(sp.startDate, false), 
    to_created_time: convertToEpoch(sp.endDate, true),
    is_ready: sp.fulfillment === 'READY' ? true : sp.fulfillment === 'NOT_READY' ? false : undefined
  };

  let transactionsData: ApiResponseTransactions = { 
    data: [], 
    currentPage: 1,
    perPage: 10,
    totalPages: 1, 
    totalItems: 0 
  };

  try {
    transactionsData = await getUserTransactions(token, apiParams);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') redirect('/login');
    if (isRedirectError(error)) throw error;
    console.error(error);
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="space-y-2 pb-6 border-b border-slate-100">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Riwayat Transaksi</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pantau status pembayaran dan kesiapan unit pesanan Anda
          </p>
        </div>

        {/* Filter Bar */}
        <TransactionFilterBar currentFilters={{
          q: sp.q || '',
          startDate: sp.startDate || '',
          endDate: sp.endDate || '',
          fulfillment: sp.fulfillment || 'ALL'
        }} />

        {/* Viewport Tabel */}
        <Suspense key={JSON.stringify(sp)} fallback={<TableSkeleton />}>
          {transactionsData.data.length > 0 ? (
            <div className="space-y-8">
              <TransactionTable initialTransactions={transactionsData.data} />
              {transactionsData.totalPages > 1 && (
                <TransactionPagination currentPage={apiParams.page} totalPages={transactionsData.totalPages} />
              )}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-slate-200 rounded-[24px]">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Data Tidak Ditemukan</h3>
              <p className="text-xs text-slate-400 font-medium max-w-[280px] mx-auto mt-1">
                Tidak ada riwayat transaksi yang cocok dengan filter Anda.
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
      {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-xl w-full" />)}
    </div>
  );
}