// app/(storefront)/shop-profile/_components/shop-detail-view.tsx
import { Phone, MapPin, Store, Clock, BadgeCheck, Map } from "lucide-react";
import { ApiShopProfile } from "@/lib/api/shop-profile";

interface InfoSectionProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
}

export function ShopDetailView({ shop }: { shop: ApiShopProfile }) {
  // 🟢 IMPLEMENTASI DINAMIS: Encode alamat teks agar aman dibaca oleh URL Google Maps
  const encodedAddress = encodeURIComponent(shop.address || "Jakarta, Indonesia");
  
  // Menggunakan URL Embed resmi Google Maps Search Mode agar mencari berdasarkan teks alamat secara real-time
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* SECTION 1: HEADER BRAND (FRAMELESS INTRO) */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 pb-10 border-b border-slate-100">
        {/* Avatar Monogram Lingkaran Tanpa Box */}
        <div className="h-20 w-20 bg-slate-900 rounded-full flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-sm">
          {shop.name ? shop.name[0].toUpperCase() : <Store className="h-6 w-6" />}
        </div>
        
        <div className="space-y-2 flex-1">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {shop.name}
            </h1>
            <span className="inline-flex items-center gap-1 text-[9px] font-black bg-blue-50 text-[#165dfc] px-2.5 py-1 rounded-md uppercase tracking-wider">
              <BadgeCheck className="h-3 w-3 fill-[#165dfc] text-white" /> Authorized Dealer
            </span>
          </div>
          
          <p className="text-sm font-medium text-slate-500 max-w-xl leading-relaxed">
            {shop.description || "Pusat distribusi perlengkapan olahraga original. Kami menyediakan produk bersertifikasi resmi langsung dari mitra brand internasional terkemuka."}
          </p>
        </div>
      </div>

      {/* SECTION 2: GRID INFORMASI UTAMA & GOOGLE MAPS INTEGRATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        
        {/* KOLOM KIRI: LOKASI GUDANG & PETA INTEGRASI */}
        <div className="space-y-6">
          <InfoSection 
            icon={<MapPin className="h-4 w-4 text-slate-400" />} 
            label="Lokasi Gudang & Retail" 
            value={shop.address} 
          />

          {/* GOOGLE MAPS PENUNJUK ARAH DINAMIS */}
          <div className="space-y-2 pt-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
              <Map className="h-3.5 w-3.5 text-[#165dfc]" /> Google Maps Penunjuk Arah
            </h4>
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm relative group">
              <iframe
                src={googleMapsEmbedUrl} // 🌟 SINKRON 100%: Otomatis memetakan pin point berdasarkan alamat database
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full object-cover select-none"
              />
            </div>
          </div>
        </div>
        
        {/* KOLOM KANAN: HOTLINE & OPERASIONAL JAM */}
        <div className="space-y-8">
          <InfoSection 
            icon={<Phone className="h-4 w-4 text-slate-400" />} 
            label="Layanan Pelanggan (Hotline)" 
            value={shop.phone_number} 
            isLink 
          />

          {/* Jam Operasional Terintegrasi */}
          <div className="pt-2 space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Jam Operasional
            </h4>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">Senin - Sabtu (09:00 - 18:00 WIB)</p>
              <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

function InfoSection({ icon, label, value, isLink }: InfoSectionProps) {
  return (
    <section className="space-y-2.5">
      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        {icon} {label}
      </h2>
      
      {isLink ? (
        <a 
          href={`tel:${value}`} 
          className="text-base font-black text-slate-900 hover:text-[#165dfc] transition-colors inline-block tracking-tight"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-bold text-slate-700 leading-relaxed tracking-tight">
          {value}
        </p>
      )}
    </section>
  );
}