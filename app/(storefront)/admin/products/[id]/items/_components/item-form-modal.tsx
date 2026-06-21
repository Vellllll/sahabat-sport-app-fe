// app/(storefront)/admin/products/[id]/items/_components/item-form-modal.tsx
'use client';

import { useActionState, useEffect, useState } from 'react';
import { X, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import { createProductItem, updateProductItem, type ProductItemFormState } from '../actions';
import { ProductItem } from '@/lib/products/types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ItemFormModalProps {
  productId: string;
  editingItem: ProductItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const initialState: ProductItemFormState = {
  success: false,
  message: null,
  timestamp: 0,
};

export function ItemFormModal({ productId, editingItem, onClose, onSuccess }: ItemFormModalProps) {
  const [uploadedPicUrl, setUploadedPicUrl] = useState(editingItem?.pic_url || "");
  const [isDisplayed, setIsDisplayed] = useState(editingItem ? editingItem.is_displayed : true);
  
  const [state, formAction, isPending] = useActionState(
    editingItem ? updateProductItem : createProductItem,
    initialState
  );

  // Memicu reaksi feedback sinkronisasi global via Sonner Toast
  useEffect(() => {
    if (!state.message || !state.timestamp) return;
    if (state.success) {
      toast.success(state.message);
      onSuccess();
    } else {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  // Handler Gambar dengan Proteksi Ketat Ukuran File Maksimum 2MB & Sonner Toast Interseptor
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Format File Tidak Valid!", {
        description: "File yang Anda pilih harus berupa berkas gambar.",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      });
      e.target.value = '';
      return;
    }

    // 🟢 PEMBATASAN UKURAN FILE MAKSIMAL 2MB (2 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran Gambar Terlalu Besar!", {
        description: `File "${file.name}" berukuran ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maksimal batas ukuran gambar adalah 2MB.`,
        icon: <AlertTriangle className="h-5 w-5 text-amber-500 fill-amber-500/10" />,
        duration: 5000,
      });
      e.target.value = ''; // Reset input element
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedPicUrl(String(reader.result ?? ""));
      toast.success("Gambar berhasil diproses!");
    };
    reader.onerror = () => {
      toast.error("Gagal membaca file gambar.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="w-full max-w-lg rounded-[32px] border border-slate-100 bg-white p-8 shadow-2xl overflow-hidden sm:rounded-[32px] gap-0">
        
        <DialogHeader className="mb-6 text-left relative">
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            {editingItem ? 'Edit Varian' : 'Tambah Varian Baru'}
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-slate-400 mt-1">
            Lengkapi detail harga dan stok item varian produk.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          {editingItem && <input type="hidden" name="id" value={editingItem.id} />}
          <input type="hidden" name="product_id" value={productId} />
          <input type="hidden" name="pic_url" value={uploadedPicUrl} />
          <input type="hidden" name="is_displayed" value={isDisplayed ? "true" : "false"} />

          {/* Nama Varian */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Nama Varian
            </Label>
            <Input
              id="name"
              name="name"
              required
              disabled={isPending}
              defaultValue={state.fields?.name ?? editingItem?.name ?? ''}
              placeholder="Contoh: Merah - XL"
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] transition-all h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {state.errors?.name && (
              <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wide">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Grid Harga & Stok */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Harga (IDR)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-xs font-bold text-slate-400 select-none">Rp</span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  required
                  disabled={isPending}
                  defaultValue={state.fields?.price ?? editingItem?.price ?? ''}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 pl-10 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="stock" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Jumlah Stok
              </Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                required
                disabled={isPending}
                defaultValue={state.fields?.stock ?? editingItem?.stock ?? ''}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {/* Foto Produk */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Foto Produk
            </Label>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <input 
                type="file" 
                accept="image/*" 
                disabled={isPending} 
                onChange={handleImageUpload} 
                className="w-full text-xs font-semibold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-2 hover:file:bg-slate-300 disabled:opacity-50 cursor-pointer file:text-xs file:font-bold" 
              />
              {uploadedPicUrl ? (
                <img src={uploadedPicUrl} alt="Preview" className="mt-3 h-24 w-24 rounded-xl border border-slate-200 object-cover animate-in fade-in duration-200" />
              ) : (
                <div className="mt-3 flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
                  <ImageIcon className="h-5 w-5 text-slate-300" />
                </div>
              )}
            </div>
          </div>

          {/* Toggle Switch Display (Shadcn UI Native) */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Tampilkan Item</span>
              <span className="text-[10px] text-slate-400 font-medium">Aktifkan agar varian ini muncul di web</span>
            </div>
            <Switch 
              checked={isDisplayed} 
              onCheckedChange={setIsDisplayed}
              disabled={isPending}
            />
          </div>

          {/* Action Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#165dfc] py-4 text-xs font-black tracking-[0.15em] text-white shadow-lg shadow-[#165dfc]/10 hover:bg-[#124ecb] transition-all disabled:opacity-60 uppercase cursor-pointer h-12"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingItem ? "SIMPAN PERUBAHAN" : "SIMPAN VARIAN"}
            </button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}