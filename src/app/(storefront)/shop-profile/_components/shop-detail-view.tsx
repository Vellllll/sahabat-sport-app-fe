// app/(storefront)/shop-profile/_components/shop-detail-view.tsx
import { Phone, MapPin, Store, Clock } from "lucide-react";
import { ApiShopProfile } from "@/lib/api/shop-profile";

export function ShopDetailView({ shop }: { shop: ApiShopProfile }) {
  // Encode alamat teks agar aman dibaca oleh URL Google Maps
  const encodedAddress = encodeURIComponent(shop.address || "Jakarta, Indonesia");

  // Menggunakan URL Embed resmi Google Maps Search Mode agar mencari berdasarkan teks alamat secara real-time
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full space-y-6">

      {/* BRAND HERO BANNER - selaras dengan banner di halaman utama */}
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-brand to-[#0c44ca] px-5 py-6 text-white sm:flex-row sm:items-center sm:px-8 sm:py-7">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold backdrop-blur-md">
          {shop.name ? shop.name[0].toUpperCase() : <Store className="h-6 w-6" />}
        </span>

        <div className="relative z-10 min-w-0 flex-1 space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/70">
            <Store className="h-3 w-3" /> Profil Toko
          </div>
          <h1 className="text-xl font-black tracking-tight sm:text-2xl">{shop.name}</h1>
          <p className="text-xs font-medium leading-relaxed text-white/70 sm:max-w-2xl">
            {shop.description || "Pusat distribusi perlengkapan olahraga original. Kami menyediakan produk bersertifikasi resmi langsung dari mitra brand internasional terkemuka."}
          </p>
        </div>
      </div>

      {/* INFO TILES - alamat, layanan pelanggan, jam operasional dalam kartu seimbang */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoTile icon={<MapPin className="h-4 w-4" />} label="Alamat">
          <p className="text-sm font-bold leading-relaxed text-slate-700">{shop.address}</p>
        </InfoTile>

        <InfoTile icon={<Phone className="h-4 w-4" />} label="Layanan Pelanggan">
          <a href={`tel:${shop.phone_number}`} className="text-sm font-bold text-slate-900 transition-colors hover:text-brand">
            {shop.phone_number}
          </a>
        </InfoTile>

        <InfoTile icon={<Clock className="h-4 w-4" />} label="Jam Operasional">
          <p className="text-sm font-bold text-slate-700">Senin - Sabtu, 09:00 - 18:00 WIB</p>
        </InfoTile>
      </div>

      {/* PETA LOKASI - full width */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
        <iframe
          src={googleMapsEmbedUrl}
          width="100%"
          height="360"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
        />
      </div>

    </div>
  );
}

function InfoTile({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
          {icon}
        </div>
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</h2>
      </div>
      {children}
    </div>
  );
}
