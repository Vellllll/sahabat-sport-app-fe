// app/admin/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminTransactionsByFilter } from '@/lib/api/admin-transactions';
import { AdminHubHero } from './_components/admin-hub-hero';
import { TransactionAdminWorkspace } from './_components/transaction-admin-workspace';

export default async function AdminHubPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) redirect('/login');

  // Ambil data untuk tab pertama (Penyiapan) sebagai initial data dari server
  const initialRequestedData = await getAdminTransactionsByFilter(token, { 
    is_requested: true,
  }).catch(() => []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-[1200px] mx-auto space-y-10">
        <AdminHubHero />
        
        <TransactionAdminWorkspace 
          token={token} 
          initialRequested={initialRequestedData} 
        />
      </div>
    </main>
  );
}