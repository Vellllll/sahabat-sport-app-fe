// app/(storefront)/admin/products/[id]/items/_components/item-form.tsx
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { createProductItem, updateProductItem, type ActionState, type ProductItem } from '../actions';
import { UnitItem } from '../../../../units/actions';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

interface ItemFormProps {
    productId: number;
    initialData?: ProductItem;
    units: UnitItem[];
}

const initialState: ActionState = {
    success: false,
    message: null,
};

export function ItemForm({ productId, initialData, units }: ItemFormProps) {
    const router = useRouter();
    const [uploadedPicUrl, setUploadedPicUrl] = useState(initialData?.pic_url || "");
    const [isDisplayed, setIsDisplayed] = useState(initialData ? initialData.is_displayed : true);

    const formatDisplay = (value: string | number | undefined): string => {
        if (value === undefined || value === null) return '';
        const cleanValue = String(value).replace(/\D/g, '');
        if (!cleanValue) return '';
        return new Intl.NumberFormat('id-ID').format(Number(cleanValue));
    };

    const parseRawNumber = (value: string): string => value.replace(/\./g, '');

    const [priceInput, setPriceInput] = useState(formatDisplay(initialData?.price));
    const [stockInput, setStockInput] = useState(formatDisplay(initialData?.stock));

    const boundAction = initialData
        ? updateProductItem.bind(null, initialData.id, productId)
        : createProductItem;

    const [state, formAction, isPending] = useActionState(boundAction, initialState);

    useEffect(() => {
        if (!state.message) return;
        if (state.success) {
            toast.success(state.message);
            router.push(`/admin/products/${productId}/items`);
            router.refresh();
        } else {
            // Masih memicu toast sebagai interseptor interaktif global
            toast.error("Gagal memproses request");
        }
    }, [state, router, productId]);

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

        const MAX_FILE_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            toast.error("Ukuran Terlalu Besar!", {
                description: `Maksimal 2MB. File Anda: ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
                icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
            });
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setUploadedPicUrl(String(reader.result ?? ""));
        reader.onerror = () => toast.error("Gagal membaca file gambar.");
        reader.readAsDataURL(file);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <div className="mb-8">
                <Link
                    href={`/admin/products/${productId}/items`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand transition-colors uppercase tracking-widest mb-6"
                >
                    <ArrowLeft className="h-4 w-4" /> Batal & Kembali
                </Link>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {initialData ? 'Edit Varian' : 'Tambah Varian Baru'}
                </h2>
                <p className="text-sm font-medium text-slate-400 mt-1">
                    Lengkapi form di bawah ini untuk mengonfigurasi varian.
                </p>
            </div>

            {/* RENDER ERROR DARI BACKEND: Menampilkan Bad Request Alert Banner secara inline */}
            {state.message && !state.success && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-black text-red-800 uppercase tracking-wider">Kesalahan Integrasi API (400 Bad Request)</h4>
                        <p className="text-xs font-mono text-red-600 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-red-50/50 mt-1 break-all">
                            {state.message}
                        </p>
                    </div>
                </div>
            )}

            <form action={formAction} className="space-y-6">
                <input type="hidden" name="product_id" value={productId} />
                <input type="hidden" name="pic_url" value={uploadedPicUrl} />
                <input type="hidden" name="is_displayed" value={isDisplayed ? "true" : "false"} />
                <input type="hidden" name="price" value={parseRawNumber(priceInput)} />
                <input type="hidden" name="stock" value={parseRawNumber(stockInput)} />

                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Varian</Label>
                    <Input
                        name="name"
                        required
                        disabled={isPending}
                        defaultValue={initialData?.name ?? ''}
                        placeholder="Contoh: Merah - XL"
                        className="w-full rounded-2xl border-slate-100 bg-slate-50 px-4 py-6 text-sm font-semibold outline-none focus:bg-white transition-all h-12"
                    />
                    {state.errors?.name && <p className="text-[10px] font-bold text-red-500 ml-1">{state.errors.name[0]}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Harga (IDR)</Label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-xs font-bold text-slate-400 select-none">Rp</span>
                            <Input
                                type="text"
                                required
                                disabled={isPending}
                                value={priceInput}
                                onChange={(e) => setPriceInput(formatDisplay(e.target.value))}
                                className="w-full rounded-2xl border-slate-100 bg-slate-50 pl-11 pr-4 py-6 text-sm font-bold outline-none focus:bg-white h-12"
                            />
                        </div>
                        {state.errors?.price && <p className="text-[10px] font-bold text-red-500 ml-1">{state.errors.price[0]}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jumlah Stok</Label>
                        <Input
                            type="text"
                            required
                            disabled={isPending}
                            value={stockInput}
                            onChange={(e) => setStockInput(formatDisplay(e.target.value))}
                            className="w-full rounded-2xl border-slate-100 bg-slate-50 px-4 py-6 text-sm font-bold outline-none focus:bg-white h-12"
                        />
                        {state.errors?.stock && <p className="text-[10px] font-bold text-red-500 ml-1">{state.errors.stock[0]}</p>}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Satuan (Unit)</Label>
                    <select
                        name="unit_id"
                        defaultValue={initialData?.unit?.id || ''}
                        required
                        disabled={isPending}
                        className="w-full px-4 h-12 bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand rounded-2xl outline-none text-sm font-semibold transition-all appearance-none"
                    >
                        <option value="" disabled>Pilih Satuan Kemasan...</option>
                        {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>{unit.name} ({unit.quantity})</option>
                        ))}
                    </select>
                    {state.errors?.unit_id && <p className="text-[10px] font-bold text-red-500 ml-1">{state.errors.unit_id[0]}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Foto Produk</Label>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <input
                            type="file"
                            accept="image/*"
                            disabled={isPending}
                            onChange={handleImageUpload}
                            className="w-full text-xs font-semibold text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:border file:border-slate-200 file:px-4 file:py-2 hover:file:bg-slate-100 disabled:opacity-50 cursor-pointer"
                        />
                        {uploadedPicUrl ? (
                            <img src={uploadedPicUrl} alt="Preview" className="mt-4 h-32 w-32 rounded-xl border border-slate-200 object-cover" />
                        ) : (
                            <div className="mt-4 flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white">
                                <ImageIcon className="h-6 w-6 text-slate-300" />
                            </div>
                        )}
                        {state.errors?.pic_url && <p className="text-[10px] font-bold text-red-500 mt-2">{state.errors.pic_url[0]}</p>}
                    </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">Tampilkan Item</span>
                        <span className="text-[10px] text-slate-400 font-medium">Aktifkan agar varian ini muncul di Storefront</span>
                    </div>
                    <Switch checked={isDisplayed} onCheckedChange={setIsDisplayed} disabled={isPending} />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#165dfc] py-4 text-xs font-black tracking-widest text-white hover:bg-[#124ecb] transition-all disabled:opacity-60 uppercase cursor-pointer"
                >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {initialData ? "Simpan Perubahan" : "Simpan Varian"}
                </button>
            </form>
        </div>
    );
}