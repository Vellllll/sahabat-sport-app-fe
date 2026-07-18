// app/(storefront)/transactions/page.tsx
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShoppingBag, Receipt, Calendar } from 'lucide-react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { TransactionTable } from './_components/transaction-table';
import { TransactionFilterBar } from './_components/transaction-filter-bar';
import { TransactionPagination } from './_components/transaction-pagination';
import { ApiResponseTransactions, getUserTransactions, TransactionItem, type FetchTransactionsParams } from '@/lib/api/transactions';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) redirect('/login');

  const convertToEpoch = (dateString: string | undefined, isEndOfDay: boolean): number | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return undefined;

    if (isEndOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return Math.floor(date.getTime() / 1000); // Mengembalikan tipe data Number (Unix Timestamp)
  };

  const selectedStatus = sp.status || 'ALL';

  // 🟢 LIVE ALIGNMENT DTO: Ambil nilai boolean murni true atau biarkan undefined
  const apiParams: FetchTransactionsParams = {
    page: Number(sp.page) || 1,
    per_page: 10,
    transaction_number: sp.q || undefined,
    from_created_time: convertToEpoch(sp.startDate, false),
    to_created_time: convertToEpoch(sp.endDate, true),

    // Kirim tipe data BOOLEAN MURNI (bukan string) sesuai dengan dekorator @Type(() => Boolean) Anda
    is_ready: selectedStatus === 'READY' ? true : undefined,
    is_requested: selectedStatus === 'PROCESSING' ? true : undefined,
    is_sent: selectedStatus === 'SENT' ? true : undefined,
    is_rejected: selectedStatus === 'REJECTED' ? true : undefined,
  };

  let transactionsData: ApiResponseTransactions = {
    data: [] as TransactionItem[], // 🌟 Tambahkan 'as TransactionItem[]' di sini juga jika diperlukan
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalItems: 0
  };

  try {
    const apiResponse = await getUserTransactions(token, apiParams);
    if (apiResponse) {
      transactionsData = apiResponse;
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') redirect('/login');
    if (isRedirectError(error)) throw error;
    console.error(error);
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="space-y-2 pb-6 border-b border-slate-100">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-brand" /> Riwayat Transaksi Toko
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Pantau berkas pembayaran dan pemenuhan logistik koli pesanan Anda
          </p>
        </div>

        {/* Filter Bar */}
        <TransactionFilterBar currentFilters={{
          q: sp.q || '',
          startDate: sp.startDate || '',
          endDate: sp.endDate || '',
          status: selectedStatus
        }} />

        {/* Viewport Render Tabel */}
        <Suspense key={JSON.stringify(sp)} fallback={<TableSkeleton />}>
          {transactionsData.data.length > 0 ? (
            <div className="space-y-8">
              <TransactionTable initialTransactions={transactionsData.data} />
              {transactionsData.totalPages > 1 && (
                <TransactionPagination currentPage={transactionsData.currentPage} totalPages={transactionsData.totalPages} />
              )}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-slate-200 rounded-[24px] bg-slate-50/10">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Rekaman Data Nihil</h3>
              <p className="text-xs text-slate-400 font-medium max-w-[280px] mx-auto mt-1">
                Tidak ada dokumen riwayat transaksi yang cocok dengan kriteria saringan Anda.
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
      <div className="h-11 bg-slate-50 rounded-xl w-full" />
      {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-50/60 rounded-xl w-full" />)}
    </div>
  );
}