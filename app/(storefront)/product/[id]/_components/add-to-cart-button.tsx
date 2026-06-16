// app/(storefront)/product/[id]/_components/add-to-cart-button.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addToCartAction } from '../actions'; 
import { useCart } from '@/context/cart-context'; // 🟢 1. IMPORT HOOK CONTEXT

interface Props {
  productItemId: number;
  productName?: string; // Tambahkan optional props jika ingin menaruh nama produk secara eksplisit
  productPrice?: number;
}

export function AddToCartButton({ productItemId, productName = "Item", productPrice = 0 }: Props) {
  const router = useRouter();
  const { addToCart } = useCart(); // 🟢 2. AMBIL FUNGSI CONTEXT
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = () => {
    startTransition(async () => {
      const result = await addToCartAction(productItemId, 1);

      if (!result.success) {
        toast.error(result.error);
        if (result.requireLogin) {
          router.push('/login');
        }
        return;
      }

      // 🟢 3. SINKRONKAN STATE: Dorong counter ke navbar browser secara real-time
      addToCart({
        id: productItemId.toString(),
        name: productName,
        price: productPrice
      });

      toast.success('Varian produk berhasil ditambahkan ke keranjang belanja!');
    });
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isPending}
      className="w-full h-12 bg-[#165dfc] hover:bg-[#124ecb] disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-[#165dfc]/10 active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Mengamankan Item...
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> Masukkan Keranjang
        </>
      )}
    </button>
  );
}