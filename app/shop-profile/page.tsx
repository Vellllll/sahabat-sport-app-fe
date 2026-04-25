// app/shop-profile/page.tsx
import { getShopProfile } from "./api";
import { ShopCard } from "./_components/shop-card";
import { WhatsAppButton } from "./_components/whatsapp-button";

export default async function ShopProfilePage() {
  const shop = await getShopProfile();

  if (!shop) return <div className="p-10 text-center text-slate-500">Data tidak ditemukan.</div>;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-4">
        {/* Komponen Card yang sudah kita buat sebelumnya */}
        <ShopCard shop={shop} />
        
        {/* Tombol WhatsApp di luar Card atau di dalam Card Footer */}
        <div className="flex flex-col gap-3">
          <WhatsAppButton phone={shop.phone_number} shopName={shop.name} />
          
          <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Respon cepat di jam kerja
          </p>
        </div>
      </div>
    </main>
  );
}