// app/product/[id]/_components/product-detail.tsx
'use client';

import { useState, useTransition } from 'react'; // ✅ Tambah useTransition
import { useRouter } from 'next/navigation';     // ✅ Tambah useRouter untuk navigasi login
import { ShoppingCart, Check, ShieldCheck, Truck, RotateCcw, ImageIcon, Loader2 } from 'lucide-react'; // ✅ Tambah Loader2
import { toast } from 'sonner';                  // ✅ Tambah toast
import { addToCartAction } from '../actions'; // ✅ Import Server Action yang kita buat

interface VariantItem {
  id: number;
  name: string;
  price: number;
  pic_url: string | null;
  stock: number;
}

interface ProductDetailData {
  id: number;
  name: string;
  product_category_name: string;
  items: VariantItem[];
}

interface Props {
  productData: ProductDetailData;
}

export default function ProductDetail({ productData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // ✅ State loading transisi Server Action
  
  const { name: productName, product_category_name, items: rawVariants } = productData;

  const sortedVariants = [...(rawVariants || [])].sort((a, b) => a.price - b.price);
  
  const [selectedVariant, setSelectedVariant] = useState<VariantItem | null>(sortedVariants[0] || null);
  const [quantity, setQuantity] = useState(1);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // ✅ FUNGSI INTERAKSI INTEGRASI API BACKEND
  const handleAddToCart = () => {
    if (!selectedVariant) return;

    startTransition(async () => {
      // Mengirimkan data dinamis: ID Varian terpilih & jumlah qty dari state
      const result = await addToCartAction(selectedVariant.id, quantity);

      if (!result.success) {
        toast.error(result.error);
        if (result.requireLogin) {
          router.push('/login'); // Lempar ke halaman login jika token habis/belum login
        }
        return;
      }

      // Notifikasi Sukses Premium
      toast.success(`${quantity}x ${selectedVariant.name} berhasil dimasukkan ke keranjang belanja!`);
    });
  };

  const displayImage = selectedVariant?.pic_url || sortedVariants[0]?.pic_url || null;

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-6 md:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* KIRI: IMAGE DISPLAY */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-slate-50 border border-slate-100 rounded-[24px] overflow-hidden flex items-center justify-center group">
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={productName} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
            ) : (
              <ImageIcon className="h-12 w-12 text-slate-200" />
            )}
            
            <span className="absolute top-4 left-4 text-[10px] font-black bg-[#165dfc] text-white px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">
              {product_category_name || 'Sport'}
            </span>
          </div>
        </div>

        {/* KANAN: DESCRIPTION & VARIANT SELECTOR */}
        <div className="flex flex-col justify-between h-full space-y-6 py-2">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {productName}
            </h1>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 inline-block w-full">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Harga Varian Terpilih</p>
              <p className="text-3xl font-black text-[#165dfc]">
                {selectedVariant ? formatRupiah(selectedVariant.price) : 'Pilih Varian'}
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informasi Produk</h4>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Produk original berkualitas tinggi. Dijamin sesuai dengan standar kualitas mitra distribusi resmi brand toko kami.
              </p>
            </div>

            {/* SELEKTOR OPTION VARIAN */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pilih Opsi Varian:</h4>
                {selectedVariant && (
                  <span className={`text-[11px] font-bold ${selectedVariant.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {selectedVariant.stock > 0 ? `Sisa Stok: ${selectedVariant.stock} Pcs` : 'Stok Habis'}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {sortedVariants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isAvailable = variant.stock > 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!isAvailable || isPending} // ✅ Kunci tombol saat sedang memproses
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                      className={`px-4 py-3 rounded-xl font-bold text-xs tracking-wide border transition-all flex items-center gap-1.5 uppercase cursor-pointer
                        ${isSelected 
                          ? 'bg-[#165dfc] border-[#165dfc] text-white shadow-md shadow-[#165dfc]/10' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}
                        ${!isAvailable ? 'opacity-40 bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through' : ''}
                      `}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      {variant.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* QUANTITY CONTROL & SUBMIT TO CART */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/40">
                <button 
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !selectedVariant || selectedVariant.stock === 0 || isPending} // ✅ Tambah proteksi isPending
                  className="w-10 h-10 font-bold text-slate-600 hover:bg-white rounded-lg transition-colors text-sm disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center font-black text-slate-800 text-sm">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  disabled={!selectedVariant || quantity >= selectedVariant.stock || isPending} // ✅ Tambah proteksi isPending
                  className="w-10 h-10 font-bold text-slate-600 hover:bg-white rounded-lg transition-colors text-sm disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* ✅ INTEGRASI INTEGRAL: Tombol Aksi terhubung ke handleAddToCart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0 || isPending}
                className="flex-1 bg-[#165dfc] text-white py-4 px-6 rounded-2xl font-black text-xs tracking-widest shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none uppercase flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" /> Tambah Ke Keranjang
                  </>
                )}
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="flex flex-col items-center p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <ShieldCheck className="h-4 w-4 text-[#165dfc] mb-1" />
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-tighter">100% Original</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <Truck className="h-4 w-4 text-[#165dfc] mb-1" />
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-tighter">Bebas Ongkir</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <RotateCcw className="h-4 w-4 text-[#165dfc] mb-1" />
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-tighter">7 Hari Retur</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}