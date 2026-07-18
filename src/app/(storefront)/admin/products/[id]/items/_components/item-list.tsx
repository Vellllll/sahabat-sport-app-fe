// app/(storefront)/admin/products/[id]/items/_components/item-list.tsx
'use client';

import { useTransition, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Search, ChevronLeft, ChevronRight, EyeOff, Eye, Plus, Box, DollarSign } from 'lucide-react';
import { ProductItem } from '../actions';
import { ItemDeleteDialog } from './item-delete-dialog';

interface Props {
    initialData: ProductItem[];
    meta: { currentPage: number; perPage: number; totalPages: number; totalItems: number };
    productId: number;
}

export default function ProductItemList({ initialData, meta, productId }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchVal, setSearchVal] = useState(searchParams.get('q') || '');

    const updateUrl = (newParams: Record<string, string | number>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === '') params.delete(key);
            else params.set(key, value.toString());
        });
        startTransition(() => router.push(`?${params.toString()}`));
    };

    const formatRupiah = (amount: string | number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <form
                    onSubmit={(e) => { e.preventDefault(); updateUrl({ q: searchVal, page: 1 }); }}
                    className="relative w-full max-w-md"
                >
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        placeholder="Cari varian..."
                        className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-xl outline-none text-sm font-medium transition-all"
                    />
                    <button type="submit" className="absolute right-2 top-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                        Cari
                    </button>
                </form>

                <Link
                    href={`/admin/products/${productId}/items/new`}
                    className="bg-brand text-white px-5 py-3 rounded-2xl font-bold text-xs tracking-widest hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 uppercase shrink-0"
                >
                    <Plus className="h-4 w-4" /> Tambah Varian
                </Link>
            </div>

            <div className={`space-y-3 min-h-[300px] ${isPending ? 'opacity-50' : 'opacity-100 transition-opacity'}`}>
                {initialData.length > 0 ? (
                    initialData.map((item) => (
                        <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-brand/30 hover:shadow-md transition-all gap-4">
                            <div className="flex flex-1 items-center gap-4">
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                                    {item.pic_url ? (
                                        <img src={item.pic_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                            <Box className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-slate-800">{item.name}</h3>
                                        {item.is_displayed ? (
                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-green-50 text-green-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider"><Eye className="h-2.5 w-2.5" /> Publik</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded-md uppercase tracking-wider"><EyeOff className="h-2.5 w-2.5" /> Arsip</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 bg-blue-50 text-brand px-2 py-0.5 rounded inline-block">Unit: {item.unit?.name || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 sm:gap-8 px-4 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5"><DollarSign className="h-3 w-3" /> Harga</p>
                                    <p className="text-sm font-black text-slate-700">{formatRupiah(item.price)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5"><Box className="h-3 w-3" /> Stok</p>
                                    <p className={`text-sm font-black ${item.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{item.stock}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity pl-0 sm:pl-4 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l border-slate-100 shrink-0">
                                <Link href={`/admin/products/${productId}/items/${item.id}/edit`} className="p-2.5 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all">
                                    <Edit2 className="h-4 w-4" />
                                </Link>
                                <ItemDeleteDialog productId={productId} itemId={item.id} itemName={item.name} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-100">
                        Varian Item Belum Tersedia
                    </div>
                )}
            </div>

            {meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Total: {meta.totalItems} varian</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => updateUrl({ page: meta.currentPage - 1 })} disabled={meta.currentPage <= 1 || isPending} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-10 text-slate-600"><ChevronLeft className="h-5 w-5" /></button>
                        <div className="px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black text-brand tracking-widest">{meta.currentPage} / {meta.totalPages}</span>
                        </div>
                        <button onClick={() => updateUrl({ page: meta.currentPage + 1 })} disabled={meta.currentPage >= meta.totalPages || isPending} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-10 text-slate-600"><ChevronRight className="h-5 w-5" /></button>
                    </div>
                </div>
            )}
        </div>
    );
}