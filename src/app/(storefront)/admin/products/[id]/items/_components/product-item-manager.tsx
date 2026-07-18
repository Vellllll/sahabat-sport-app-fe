// app/(storefront)/admin/products/[id]/items/_components/product-item-manager.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Box, DollarSign, Eye, EyeOff, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ProductItem } from '@/lib/products/types';
import { ItemFormModal } from './item-form-modal';
import { ItemDeleteDialog } from './item-delete-dialog';

interface Props {
  productId: string;
  initialItems: ProductItem[];
}

export default function ProductItemManager({ productId, initialItems }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProductItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSuccessModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingItem(null), 300);
    startTransition(() => {
      router.refresh();
    });
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay saat Refresh Data */}
      {isPending && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-[32px]">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Varian Item</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Kelola stok, harga, dan foto untuk setiap varian.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-xs tracking-widest hover:bg-brand-hover shadow-lg shadow-brand/10 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> TAMBAH ITEM
        </button>
      </div>

      {/* Modal - MENGGUNAKAN KEY UNTUK MERESET STATE */}
      {isModalOpen && (
        <ItemFormModal
          key={editingItem ? editingItem.id : 'new-item'}
          productId={productId}
          editingItem={editingItem}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccessModal}
        />
      )}

      {/* Item List */}
      <div className="bg-white rounded-[32px] border border-slate-100 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        {initialItems.length > 0 ? (
          <div className="space-y-1">
            {initialItems.map((item) => (
              <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 gap-4">
                                  
                <div className="flex flex-1 items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                    {item.pic_url ? <img src={item.pic_url} alt={item.name} className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5 text-slate-300" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-slate-800 leading-none">{item.name}</h3>
                      {item.stock === 0 && <span className="text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-md uppercase tracking-wider">Habis</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.is_displayed ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest"><Eye className="h-3 w-3" /> Ditampilkan</div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><EyeOff className="h-3 w-3" /> Disembunyikan</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8 px-4 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5"><DollarSign className="h-3 w-3" /> Harga</p>
                    <p className="text-sm font-black text-slate-700">{formatRupiah(item.price)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5"><Box className="h-3 w-3" /> Stok</p>
                    <p className={`text-sm font-black ${item.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{item.stock} <span className="text-[10px] font-bold uppercase text-slate-400">Pcs</span></p>
                  </div>
                </div>

                {/* Actions Wrapper */}
                <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity pl-0 sm:pl-4 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l border-slate-100 shrink-0 justify-end">
                  <button onClick={() => handleOpenEdit(item)} className="p-2.5 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all cursor-pointer">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <ItemDeleteDialog 
                    productId={Number(productId)} 
                    itemId={item.id} 
                    itemName={item.name} 
                  />
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
              <Box className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">Belum Ada Item</h3>
            <p className="text-xs text-slate-400 font-medium max-w-[250px] mx-auto">Silakan tambah item untuk mengatur harga dan stok.</p>
          </div>
        )}
      </div>
    </div>
  );
}