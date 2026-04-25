// app/shop-profile/_components/shop-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin } from "lucide-react";
import { ApiShopProfile } from "../api";

export function ShopCard({ shop }: { shop: ApiShopProfile }) {
    return (
        <Card className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-lg">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-8 text-center text-white">
                <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 mb-4">
                    {shop.name[0]}
                </div>
                <h1 className="text-2xl font-bold">{shop.name}</h1>
            </div>
            <CardContent className="p-8 space-y-6">
                <InfoSection icon={<MapPin />} label="Lokasi" value={shop.address} />
                <InfoSection icon={<Phone />} label="Kontak" value={shop.phone_number} />
            </CardContent>
        </Card>
    );
}

function InfoSection({ icon, label, value, isLink }: any) {
    return (
        <section className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h2 className="text-xs font-bold text-blue-600 uppercase flex items-center gap-2 mb-2">
                {icon} {label}
            </h2>
            {isLink ? (
                <a href={`tel:${value}`} className="font-semibold text-slate-800 hover:underline">{value}</a>
            ) : (
                <p className="text-slate-700 font-medium">{value}</p>
            )}
        </section>
    );
}