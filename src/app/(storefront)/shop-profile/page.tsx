// app/(storefront)/shop-profile/page.tsx
import { getShopProfile } from "@/lib/api/shop-profile";
import { ShopDetailView } from "./_components/shop-detail-view";
import { WhatsAppButton } from "./_components/whatsapp-button";
import { ShieldCheck, Store } from "lucide-react";

export default async function ShopProfilePage() {
  const shop = await getShopProfile();

  if (!shop) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3">
          <Store className="h-5 w-5" />
        </div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Profil Gagal Dimuat</h3>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
          Koneksi terputus atau data toko belum diset oleh admin.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto space-y-4">

        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
          <ShopDetailView shop={shop} />
        </div>

        {/* Footer Action Area */}
        <div className="max-w-md mx-auto space-y-3">
          <WhatsAppButton phone={shop.phone_number} shopName={shop.name} />

          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <p className="text-[11px] font-medium">Koneksi aman terenkripsi SSL</p>
          </div>
        </div>

      </div>
    </main>
  );
}
