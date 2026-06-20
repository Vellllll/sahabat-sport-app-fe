// app/(storefront)/cart/_components/cart-display-grid.tsx
'use client';

import { useState, useTransition } from 'react';
import { Trash2, ArrowRight, ShieldCheck, ShoppingBag, Loader2, AlertTriangle, PackageCheck } from 'lucide-react';
import { CartLineItem } from '@/lib/api/cart';
import { updateCartItemQuantity, requestTransaction } from '../actions';
import { toast } from 'sonner';
import { useCart } from '@/context/cart-context'; 
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  initialItems: CartLineItem[];
  transactionId: number;
}

export function CartDisplayGrid({ initialItems, transactionId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<CartLineItem[]>(initialItems);
  const router = useRouter();

  const { decreaseQuantity, addToCart, removeFromCart, clearCart } = useCart();
  
  // State untuk menghapus satu item
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; currentCount: number; name: string } | null>(null);

  // 🟢 KUNCI UX BARU: State untuk mengontrol Modal Konfirmasi "Siapkan Barang Saya"
  const [isCheckoutConfirmOpen, setIsCheckoutConfirmOpen] = useState(false);

  if (initialItems !== items && !isPending) {
    setItems(initialItems);
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const totalItemCount = items.reduce((acc, item) => acc + item.count, 0);
  const grandTotal = items.reduce((acc, item) => acc + (item.count * Number(item.product_item.price)), 0);

  const handleQuantityChange = (
    lineItemId: number,
    productItemId: number,
    currentCount: number,
    stock: number,
    direction: 'plus' | 'minus'
  ) => {
    const incrementValue = direction === 'plus' ? 1 : -1;
    
    if (direction === 'plus' && currentCount >= stock) {
      toast.error('Stok tidak cukup!', {
        description: `Jumlah item di keranjang sudah mencapai batas maksimal stok gudang (${stock} item).`,
        icon: <AlertTriangle className="h-5 h-5 text-amber-500 fill-amber-500/10" />
      });
      return;
    }
    if (direction === 'minus' && currentCount <= 0) return;
    if (direction === 'minus' && currentCount === 1) {
      const targetItem = items.find(item => item.id === lineItemId);
      if (targetItem) {
        setItemToDelete({ id: productItemId, currentCount: 1, name: targetItem.product_item.name });
        setIsAlertOpen(true);
      }
      return;
    }
    
    startTransition(async () => {
      const result = await updateCartItemQuantity(productItemId, incrementValue, currentCount, stock);
      if (!result.success) {
        toast.error(result.error || 'Gagal memperbarui item.');
      } else {
        setItems(prev => prev.map(item => {
          if (item.product_item.id === productItemId) return { ...item, count: item.count + incrementValue };
          return item;
        }));
        const targetItemData = items.find(i => i.product_item.id === productItemId);
        if (targetItemData) {
          if (direction === 'plus') {
            addToCart({ id: productItemId.toString(), name: targetItemData.product_item.name, price: Number(targetItemData.product_item.price) }, 1);
          } else {
            decreaseQuantity(productItemId.toString());
          }
        }
      }
    });
  };

  const confirmDeleteAction = () => {
    if (!itemToDelete) return;
    const { id, currentCount } = itemToDelete;
    startTransition(async () => {
      const result = await updateCartItemQuantity(id, -currentCount, currentCount, 99999);
      if (!result.success) {
        toast.error(result.error || 'Gagal mengeluarkan produk.');
      } else {
        setItems(prev => prev.filter(item => item.product_item.id !== id));
        removeFromCart(id.toString());
        toast.success('Produk berhasil dikeluarkan dari tas belanja.');
      }
      setIsAlertOpen(false);
      setItemToDelete(null);
    });
  };

  // 🟢 REFACTOR HANDLER: Fungsi utama yang dieksekusi SETELAH user klik konfirmasi modal
  const confirmRequestTransactionAction = () => {
    if (items.length === 0 || !transactionId) {
      toast.error('Data transaksi tidak valid.');
      return;
    }

    startTransition(async () => {
      const result = await requestTransaction(transactionId);

      if (!result.success) {
        toast.error(result.error || 'Gagal mengirimkan permintaan penyiapan barang.');
      } else {
        toast.success('Permintaan Berhasil Dikirim!', {
          description: 'Tim gudang Sahabat Sport sedang memvalidasi dan menyiapkan koli barang Anda.',
          icon: <PackageCheck className="h-5 h-5 text-emerald-500" />,
          duration: 5000,
        });

        if (typeof clearCart === 'function') clearCart();
        setItems([]);
        setIsCheckoutConfirmOpen(false); // Tutup modal setelah sukses
        router.push('/transactions');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      
      {/* AREA GRID RENDER ITEM UTAMA */}
      <div className="lg:col-span-7 divide-y divide-slate-100">
        {items.map((item) => {
          const itemPriceNum = Number(item.product_item.price);
          const lineSubtotal = item.count * itemPriceNum;
          return (
            <div key={item.id} className="py-6 flex items-start gap-4 sm:gap-6 first:pt-0 last:pb-0">
              <div className="relative h-20 w-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100/70 shrink-0 flex items-center justify-center">
                <img src={item.product_item.pic_url || '/public/uploads/default-product.jpg'} alt={item.product_item.name} className="h-14 w-14 rounded-xl object-cover" />
              </div>
              <div className="flex-1 min-w-0 space-y-1 pt-0.5">
                <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight uppercase">{item.product_item.name}</h3>
                <p className="text-xs font-semibold text-slate-400">Satuan: {formatRupiah(itemPriceNum)}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide pt-0.5">
                  Stok Gudang: <span className="text-slate-600 font-extrabold">{item.product_item.stock} item</span>
                </p>
                <div className="flex items-center gap-3 pt-3">
                  <div className="flex items-center border rounded-lg p-0.5 transition-colors bg-slate-50 border-slate-100">
                    <button type="button" disabled={isPending} onClick={() => handleQuantityChange(item.id, item.product_item.id, item.count, item.product_item.stock, 'minus')} className="w-7 h-7 font-bold text-slate-500 hover:bg-white hover:text-red-500 rounded-md transition-all text-xs cursor-pointer">-</button>
                    <span className="w-8 text-center font-black text-slate-800 text-xs flex items-center justify-center">
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin text-slate-400" /> : item.count}
                    </span>
                    <button type="button" disabled={item.count >= item.product_item.stock || isPending} onClick={() => handleQuantityChange(item.id, item.product_item.id, item.count, item.product_item.stock, 'plus')} className="w-7 h-7 font-bold text-slate-500 hover:bg-white hover:text-slate-800 rounded-md transition-all text-xs cursor-pointer">+</button>
                  </div>
                  <button type="button" disabled={isPending} onClick={() => { setItemToDelete({ id: item.product_item.id, currentCount: item.count, name: item.product_item.name }); setIsAlertOpen(true); }} className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="text-right shrink-0 pt-1">
                <p className="text-sm font-black text-slate-900 tracking-tight">{formatRupiah(lineSubtotal)}</p>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-0.5">Subtotal</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUMMARY PANEL SIDEBAR RIGHT */}
      <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-8 lg:pt-0 lg:pl-12 lg:sticky lg:top-24 space-y-6">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5" /> Ringkasan Pembelian
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Item Belanja</span>
            <span className="text-sm font-black text-slate-900">{totalItemCount} Pcs</span>
          </div>
          <div className="pt-4 border-t border-slate-100 space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">Nilai Total Keseluruhan</span>
            <p className="text-3xl font-black text-[#165dfc] tracking-tight text-right">{formatRupiah(grandTotal)}</p>
          </div>
        </div>
        
        {/* 🟢 MODIFIKASI ONCLICK: Klik tombol ini sekarang membuka modal konfirmasi terlebih dahulu */}
        <button 
          type="button" 
          disabled={isPending || items.length === 0} 
          onClick={() => setIsCheckoutConfirmOpen(true)}
          className="w-full h-13 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
            </>
          ) : (
            <>
              Siapkan Barang Saya <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="pt-2 flex items-center gap-2 text-slate-400 justify-center lg:justify-end">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jaminan Transaksi Aman & Terverifikasi</p>
        </div>
      </div>

      {/* POPUP 1: ALERT DIALOG HAPUS SATU ITEM (BAWAN KODE SEBELUMNYA) */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white border-none rounded-[24px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-[90vw] sm:max-w-sm">
          <AlertDialogHeader className="text-left space-y-2.5">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-500"><AlertTriangle className="h-5 w-5" /></div>
            <AlertDialogTitle className="text-sm font-black text-slate-900 uppercase tracking-tight">Keluarkan dari Keranjang?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-semibold text-slate-500 leading-relaxed normal-case">
              Apakah Anda yakin ingin menghapus produk <span className="text-slate-800 font-extrabold">{itemToDelete?.name}</span> dari daftar belanjaan Anda saat ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-row items-center gap-2.5 justify-end">
            <AlertDialogCancel className="h-10 px-4 bg-slate-50 hover:bg-slate-100 border-none text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer mt-0" onClick={() => setIsAlertOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction className="h-10 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-red-600/10" onClick={confirmDeleteAction}>Ya, Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 🟢 POPUP 2: SHADCN ALERT DIALOG BARU UNTUK KONFIRMASI "SIAPKAN BARANG SAYA" */}
      <AlertDialog open={isCheckoutConfirmOpen} onOpenChange={setIsCheckoutConfirmOpen}>
        <AlertDialogContent className="bg-white border-none rounded-[24px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-[90vw] sm:max-w-sm">
          <AlertDialogHeader className="text-left space-y-2.5">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#165dfc]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-sm font-black text-slate-900 uppercase tracking-tight">Ajukan Penyiapan Barang?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-semibold text-slate-500 leading-relaxed normal-case">
              Apakah Anda yakin ingin mengajukan penyiapan <span className="text-slate-800 font-extrabold">{totalItemCount} pcs</span> barang olahraga ini ke tim gudang Sahabat Sport?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-row items-center gap-2.5 justify-end">
            <AlertDialogCancel 
              className="h-10 px-4 bg-slate-50 hover:bg-slate-100 border-none text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer mt-0" 
              onClick={() => setIsCheckoutConfirmOpen(false)}
            >
              Periksa Kembali
            </AlertDialogCancel>
            <AlertDialogAction 
              className="h-10 px-5 bg-[#165dfc] hover:bg-[#124ecb] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-blue-600/10" 
              onClick={confirmRequestTransactionAction}
            >
              Ya, Siapkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}