// app/admin/page.tsx
import { getAdminTransactionsByFilter } from '@/lib/api/admin-transactions';
import { AdminHubHero } from './_components/admin-hub-hero';
import { TransactionAdminWorkspace } from './_components/transaction-admin-workspace';
import { requirePermission } from '@/lib/rbac/guards';
import { hasPermission } from '@/lib/rbac/permissions';

export default async function AdminHubPage() {
  const session = await requirePermission('admin:access');
  const canManageProducts = hasPermission(session.user.role, 'products:manage');
  const canManageCategories = hasPermission(session.user.role, 'categories:manage');

  const initialRequestedData = await getAdminTransactionsByFilter(session.token, { 
    is_requested: true,
  }).catch(() => []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-[1200px] mx-auto space-y-10">
        <AdminHubHero
          canManageProducts={canManageProducts}
          canManageCategories={canManageCategories}
        />
        
        <TransactionAdminWorkspace 
          token={session.token} 
          initialRequested={initialRequestedData} 
        />
      </div>
    </main>
  );
}