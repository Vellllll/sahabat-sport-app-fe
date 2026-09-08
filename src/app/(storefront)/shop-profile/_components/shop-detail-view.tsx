// app/(storefront)/shop-profile/_components/shop-detail-view.tsx
import { Phone, MapPin, Store, Clock } from "lucide-react";
import { ApiShopProfile } from "@/lib/api/shop-profile";

interface InfoSectionProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
}

export function ShopDetailView({ shop }: { shop: ApiShopProfile }) {
  // Encode alamat teks agar aman dibaca oleh URL Google Maps
  const encodedAddress = encodeURIComponent(shop.address || "Jakarta, Indonesia");

  // Menggunakan URL Embed resmi Google Maps Search Mode agar mencari berdasarkan teks alamat secara real-time
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full space-y-8">

      {/* SECTION 1: HEADER BRAND */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 pb-6 border-b border-slate-100">
        <div className="h-14 w-14 bg-brand rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0">
          {shop.name ? shop.name[0].toUpperCase() : <Store className="h-5 w-5" />}
        </div>

        <div className="space-y-1.5 flex-1">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            {shop.name}
          </h1>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {shop.description || "Pusat distribusi perlengkapan olahraga original. Kami menyediakan produk bersertifikasi resmi langsung dari mitra brand internasional terkemuka."}
          </p>
        </div>
      </div>

      {/* SECTION 2: GRID INFORMASI UTAMA & GOOGLE MAPS INTEGRATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

        {/* KOLOM KIRI: LOKASI GUDANG & PETA INTEGRASI */}
        <div className="space-y-4">
          <InfoSection
            icon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
            label="Alamat"
            value={shop.address}
          />

          <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* KOLOM KANAN: HOTLINE & OPERASIONAL JAM */}
        <div className="space-y-4">
          <InfoSection
            icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
            label="Layanan Pelanggan"
            value={shop.phone_number}
            isLink
          />

          <div className="space-y-1.5">
            <h2 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" /> Jam Operasional
            </h2>
            <p className="text-sm font-bold text-slate-700">Senin - Sabtu, 09:00 - 18:00 WIB</p>
          </div>
        </div>

      </div>

    </div>
  );
}

function InfoSection({ icon, label, value, isLink }: InfoSectionProps) {
  return (
    <section className="space-y-1.5">
      <h2 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
        {icon} {label}
      </h2>

      {isLink ? (
        <a
          href={`tel:${value}`}
          className="text-sm font-bold text-slate-900 hover:text-brand transition-colors inline-block"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-bold text-slate-700 leading-relaxed">
          {value}
        </p>
      )}
    </section>
  );
}
