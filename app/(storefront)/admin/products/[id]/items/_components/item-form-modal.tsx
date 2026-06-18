// admin/products/[id]/items/_components/item-form-modal.tsx
'use client';

import { useActionState, useEffect, useState } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createProductItem, updateProductItem, type ProductItemFormState } from '../actions';
import { ProductItem } from '@/lib/products/types';
import { toast } from 'sonner'; // 🟢 1. IMPORT TOAST SONNER

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
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    editingItem ? updateProductItem : createProductItem,
    initialState
  );

  // 🟢 2. MONITOR REAKSI FEEDBACK SINKRONISASI VIA SONNER TOAST
  useEffect(() => {
    if (!state.message || !state.timestamp) return;

    if (state.success) {
      toast.success(state.message);
      onSuccess(); // Eksekusi callback sukses
    } else {
      // Menampilkan alasan spesifik error validasi / bisnis dari NestJS
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  const handleImageUpload = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setUploadError('File harus berupa gambar.');
    if (file.size > 2 * 1024 * 1024) return setUploadError('Ukuran gambar maksimal 2MB.');

    const reader = new FileReader();
    reader.onload = () => {
      setUploadError(null);
      setUploadedPicUrl(String(reader.result ?? ""));
    };
    reader.onerror = () => setUploadError('Gagal membaca file gambar.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isPending && onClose()} />

      <div className="relative w-full max-w-lg rounded-[32px] border border-slate-100 bg-white p-8 shadow-2xl animate-in zoom-in duration-200">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {editingItem ? 'Edit Varian' : 'Tambah Varian Baru'}
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-1">Lengkapi detail harga dan stok item.</p>
          </div>
          <button type="button" disabled={isPending} onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="space-y-5">
          {editingItem && <input type="hidden" name="id" value={editingItem.id} />}
          <input type="hidden" name="product_id" value={productId} />
          <input type="hidden" name="pic_url" value={uploadedPicUrl} />

          {/* Nama Varian */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Varian</label>
            <input
              name="name"
              required
              disabled={isPending}
              // 🟢 REFACTOR: Jika ada error, ambil ketikan terakhir di state.fields.name, jika tidak ada baru gunakan editingItem
              defaultValue={state.fields?.name ?? editingItem?.name ?? ''}
              placeholder="Contoh: Merah - XL"
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] transition-all"
            />
            {state.errors?.name && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{state.errors.name[0]}</p>}
          </div>

          {/* Grid Harga & Stok */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Harga (IDR)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  name="price"
                  type="number"
                  required
                  disabled={isPending}
                  // 🟢 REFACTOR: Ambil ketikan terakhir di state.fields.price jika validasi gagal
                  defaultValue={state.fields?.price ?? editingItem?.price ?? ''}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 pl-10 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jumlah Stok</label>
              <input
                name="stock"
                type="number"
                required
                disabled={isPending}
                // 🟢 REFACTOR: Ambil ketikan terakhir di state.fields.stock jika validasi gagal
                defaultValue={state.fields?.stock ?? editingItem?.stock ?? ''}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc]"
              />
            </div>
          </div>

          {/* Foto Produk */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Foto Produk</label>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <input type="file" accept="image/*" disabled={isPending} onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)} className="w-full text-xs font-semibold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-2 hover:file:bg-slate-300 disabled:opacity-50 cursor-pointer" />
              {uploadError && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase">{uploadError}</p>}
              {uploadedPicUrl ? (
                <img src={uploadedPicUrl} alt="Preview" className="mt-3 h-24 w-24 rounded-xl border border-slate-200 object-cover" />
              ) : (
                <div className="mt-3 flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
                  <ImageIcon className="h-5 w-5 text-slate-300" />
                </div>
              )}
            </div>
          </div>

          {/* Toggle Switch Display */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Tampilkan Item</span>
              <span className="text-[10px] text-slate-400 font-medium">Aktifkan agar varian ini muncul di web</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="is_displayed" defaultChecked={editingItem ? editingItem.is_displayed : true} disabled={isPending} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#165dfc] peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Action Submit Button */}
          <div className="pt-4">
            {/* 🟢 REFACTOR: Boks Alert teks bawaan di bawah ini sudah dihapus total */}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#165dfc] py-4 text-xs font-black tracking-[0.15em] text-white shadow-lg hover:bg-[#124ecb] transition-all disabled:opacity-60 uppercase cursor-pointer"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingItem ? "SIMPAN PERUBAHAN" : "SIMPAN VARIAN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}