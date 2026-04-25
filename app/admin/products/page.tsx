// app/admin/products/page.tsx
import { getCategories } from '@/lib/api';
import CreateProductForm from './create-form';

export default async function AdminProductsPage() {
  const categories = await getCategories();

  return (
    // Background light gray untuk membuat card putih 'pop'
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-[480px]">
        {/* Card Putih Bersih ala Login Page */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10">
          <header className="mb-10">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tambah Produk
            </h1>
            <p className="text-slate-400 mt-1.5 text-sm font-medium">
              Silakan lengkapi informasi katalog di bawah.
            </p>
          </header>

          <CreateProductForm categories={categories} />
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-xs font-medium tracking-wide">
          SAHABAT SPORT &bull; INTERNAL SYSTEM
        </p>
      </div>
    </main>
  );
}