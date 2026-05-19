"use client";

import { ShoppingCart, Trash2, Plus, Minus, ImageIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Mock data untuk keranjang
const mockCartItems = [
  {
    id: "1",
    name: "Yonex Astrox 99 Pro Chameleon Limited Edition",
    price: 2500000,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&q=80",
    variant: "Chameleon / 4U",
  },
  {
    id: "2",
    name: "Lining Way of Wade 10 White Hot",
    price: 3200000,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80",
    variant: "White Hot / Size 43",
  },
];

export function Cart() {
  const total = mockCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = mockCartItems.reduce((acc, item) => acc + item.quantity, 0);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-slate-100 transition-all">
          <ShoppingCart className="h-5 w-5 text-slate-700" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#165dfc] text-[9px] font-black text-white shadow-[0_0_8px_rgba(22,93,252,0.4)] border-2 border-white animate-in zoom-in duration-200">
              {itemCount}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-md bg-white rounded-l-[32px] border-l border-slate-100 p-0">
        {/* Header Section */}
        <SheetHeader className="px-6 pt-8 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-xl font-black text-slate-900 tracking-tight">Keranjang Belanja</SheetTitle>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {itemCount} Item
            </span>
          </div>
        </SheetHeader>

        {/* Scrollable Cart Items Area */}
        <div className="flex flex-1 flex-col overflow-hidden px-6">
          <ScrollArea className="flex-1 pr-4 -mr-4">
            {mockCartItems.length > 0 ? (
              <div className="flex flex-col gap-6 py-6">
                {mockCartItems.map((item) => (
                  <div key={item.id} className="group flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">

                    {/* Image Container with Fallback */}
                    <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-300" />
                      )}
                    </div>

                    {/* Item Meta & Controls */}
                    <div className="flex flex-1 flex-col min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 tracking-tight leading-snug truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {item.variant}
                      </p>
                      <p className="text-sm font-black text-[#165dfc] mt-1">
                        {formatRupiah(item.price)}
                      </p>

                      {/* Integrated Capsule Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl p-0.5 shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-black text-slate-800 w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors sm:opacity-0 group-hover:opacity-100"
                          title="Hapus dari keranjang"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              /* Premium Empty State Visual */
              <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                  <ShoppingCart className="h-6 w-6 text-slate-300" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-800 uppercase tracking-wider">Keranjang Kosong</span>
                  <span className="block text-xs text-slate-400 font-medium max-w-[220px] mx-auto mt-1 leading-relaxed">
                    Kamu belum menambahkan produk apapun ke dalam keranjang belanja.
                  </span>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer Summary Blocks */}
        <div className="bg-slate-50/50 border-t border-slate-100 p-6 space-y-4 rounded-bl-[32px]">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Subtotal Belanja</span>
              <span className="text-sm font-black text-slate-700">{formatRupiah(total)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Estimasi Pengiriman</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-black">GRATIS</span>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 tracking-tight">Total Pembayaran</span>
            <span className="text-xl font-black text-[#165dfc]">{formatRupiah(total)}</span>
          </div>

          <SheetFooter className="pt-2">
            <Button className="w-full bg-[#165dfc] hover:bg-[#124ecb] h-12 text-xs font-black tracking-[0.15em] uppercase text-white shadow-lg shadow-[#165dfc]/20 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Lanjutkan Ke Pembayaran <ArrowRight className="h-4 w-4" />
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}