// app/(storefront)/admin/products/[id]/items/new/page.tsx
import { requirePermission } from '@/lib/rbac/guards';
import { getAllUnitsAvailable } from '../actions';
import { ItemForm } from '../_components/item-form';

export default async function NewProductItemPage({ params }: { params: Promise<{ id: string }> }) {
    await requirePermission('products:manage');

    const { id } = await params;
    const productId = Number(id);
    const units = await getAllUnitsAvailable();

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-12 px-4">
            <ItemForm productId={productId} units={units} />
        </main>
    );
}