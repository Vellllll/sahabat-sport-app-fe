'use client';

import { useActionState, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Box, DollarSign, Eye, EyeOff, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { ProductItem } from '@/lib/products/types';
import { createProductItem, CreateProductItemState } from '../[id]/items/actions';
import { useRouter } from 'next/navigation';

interface Props {
  productId: string;
  initialItems: ProductItem[];
}

export default function ProductItemManager({ productId, initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<ProductItem[]>(initialItems);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [uploadedPicUrl, setUploadedPicUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const initialCreateState: CreateProductItemState = { message: null };
  const [createState, createFormAction, isCreating] = useActionState(createProductItem, initialCreateState);

  useEffect(() => {
    if (createState.success) {
      setIsCreateOpen(false);
      setUploadedPicUrl("");
      setUploadError(null);
      router.refresh();
    }
  }, [createState.success, router]);

  const handleImageUpload = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Ukuran gambar maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadError(null);
      setUploadedPicUrl(String(reader.result ?? ""));
    };
    reader.onerror = () => setUploadError('Gagal membaca file gambar.');
    reader.readAsDataURL(file);
  };

  // Format Rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <div className="space-y-6">

      {/* Title & Action Bar */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Varian Item</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Kelola stok, harga, dan foto untuk setiap varian.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#165dfc] text-white px-5 py-2.5 rounded-xl font-bold text-xs tracking-widest hover:bg-[#124ecb] shadow-lg shadow-[#165dfc]/20 transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> TAMBAH ITEM
        </button>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop dengan Blur */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isCreating && setIsCreateOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg rounded-[32px] border border-slate-100 bg-white p-8 shadow-2xl animate-in zoom-in duration-200">

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Tambah Varian Baru</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Lengkapi detail harga dan stok item.</p>
              </div>
              <button
                type="button"
                disabled={isCreating}
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={createFormAction} className="space-y-5">
              <input type="hidden" name="product_id" value={productId} />
              <input type="hidden" name="pic_url" value={uploadedPicUrl} />

              {/* Nama Item */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Varian</label>
                <input
                  name="name"
                  placeholder="Contoh: Merah - XL"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all"
                />
                {createState.errors?.name && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-tighter">{createState.errors.name[0]}</p>}
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
                      placeholder="0"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 pl-10 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] transition-all"
                    />
                  </div>
                  {createState.errors?.price && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{createState.errors.price[0]}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jumlah Stok</label>
                  <input
                    name="stock"
                    type="number"
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] transition-all"
                  />
                  {createState.errors?.stock && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{createState.errors.stock[0]}</p>}
                </div>
              </div>

              {/* Upload Gambar */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Foto Produk</label>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)}
                    className="w-full text-xs font-semibold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-300"
                  />
                  {uploadedPicUrl ? (
                    <img
                      src={uploadedPicUrl}
                      alt="Preview item"
                      className="mt-3 h-24 w-24 rounded-xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="mt-3 flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
                      <ImageIcon className="h-5 w-5 text-slate-300" />
                    </div>
                  )}
                </div>
                {uploadError && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{uploadError}</p>}
                {createState.errors?.pic_url && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{createState.errors.pic_url[0]}</p>}
              </div>

              {/* Toggle Display Custom */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">Tampilkan Item</span>
                  <span className="text-[10px] text-slate-400 font-medium">Aktifkan agar varian ini muncul di web</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="is_displayed" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#165dfc]"></div>
                </label>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                {createState.message && (
                  <div className={`mb-4 text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${createState.success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {createState.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#165dfc] py-4 text-xs font-black tracking-[0.15em] text-white shadow-lg shadow-[#165dfc]/20 hover:bg-[#124ecb] hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-60 uppercase"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  SIMPAN VARIAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item List */}
      <div className="bg-white rounded-[32px] border border-slate-100 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        {items.length > 0 ? (
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 gap-4"
              >

                {/* Thumbnail & Info Varian */}
                <div className="flex flex-1 items-center gap-4">

                  {/* Thumbnail Image */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                    {item.pic_url ? (
                      <img
                        src={item.pic_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-300" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-slate-800 leading-none">{item.name}</h3>
                      {item.stock === 0 && (
                        <span className="text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Habis
                        </span>
                      )}
                    </div>

                    {/* Status Display Badge */}
                    <div className="flex items-center gap-2">
                      {item.is_displayed ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                          <Eye className="h-3 w-3" /> Ditampilkan
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <EyeOff className="h-3 w-3" /> Disembunyikan
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Harga & Stok (Grid Data) */}
                <div className="flex items-center gap-6 sm:gap-8 px-4 border-l border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                      <DollarSign className="h-3 w-3" /> Harga
                    </p>
                    <p className="text-sm font-black text-slate-700">{formatRupiah(item.price)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                      <Box className="h-3 w-3" /> Stok
                    </p>
                    <p className={`text-sm font-black ${item.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {item.stock} <span className="text-[10px] font-bold uppercase text-slate-400">Pcs</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity pl-4 border-l border-slate-100 shrink-0">
                  <button
                    title="Edit Item"
                    className="p-2.5 text-slate-400 hover:text-[#165dfc] hover:bg-[#165dfc]/5 rounded-xl transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    title="Hapus Item"
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
            <p className="text-xs text-slate-400 font-medium max-w-[250px] mx-auto">
              Produk ini belum memiliki varian. Silakan tambah item untuk mengatur harga dan stok.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}