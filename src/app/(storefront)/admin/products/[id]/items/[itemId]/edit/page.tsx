// app/(storefront)/admin/products/[id]/items/[itemId]/edit/page.tsx
import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/rbac/guards';
import { getProductItemById, getAllUnitsAvailable } from '../../actions';
import { ItemForm } from '../../_components/item-form';

export default async function EditProductItemPage({
    params
}: {
    params: Promise<{ id: string, itemId: string }>
}) {
    await requirePermission('products:manage');

    const { id, itemId } = await params;
    const productId = Number(id);

    const [item, units] = await Promise.all([
        getProductItemById(Number(itemId)),
        getAllUnitsAvailable()
    ]);

    if (!item) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-12 px-4">
            <ItemForm productId={productId} initialData={item} units={units} />
        </main>
    );
}