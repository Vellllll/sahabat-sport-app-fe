// app/(storefront)/product/[id]/_components/add-to-cart-button.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addToCartAction } from '../actions'; // Mengarah ke Server Action yang kita buat sebelumnya

interface Props {
  productItemId: number;
}

export function AddToCartButton({ productItemId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = () => {
    startTransition(async () => {
      // Menembak API internal Next.js Server Action
      const result = await addToCartAction(productItemId, 1);

      if (!result.success) {
        toast.error(result.error);
        if (result.requireLogin) {
          router.push('/login');
        }
        return;
      }

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