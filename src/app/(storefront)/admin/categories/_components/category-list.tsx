'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Tag, ChevronLeft, ChevronRight, Loader2, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmModal from './delete-confirm-modal';

interface Category {
    id: string | number;
    name: string;
    description?: string;
}

interface Props {
    initialData: Category[];
    totalPages: number;
    currentPage: number;
    currentLimit: number;
}

export default function CategoryListOptimized({ initialData, totalPages, currentPage, currentLimit }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');

    // State Manajemen Modal (delete tetap modal, create/edit/detail sudah jadi dedicated page)
    const [deleteItem, setDeleteItem] = useState<Category | null>(null);

    const updateUrl = (newParams: Record<string, string | number>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => params.set(key, value.toString()));
        startTransition(() => router.push(`?${params.toString()}`));
    };

    function handleLimitChange(value: string): void {
        updateUrl({ limit: value, page: 1 });
    }

    return (
        <div className="space-y-6">
            {/* Search Bar & Button */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        value={inputValue}
                        placeholder="Cari kategori..."
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-transparent focus:bg-white focus:border-brand rounded-xl outline-none transition-all text-xs font-semibold text-slate-700"
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateUrl({ q: inputValue, page: 1 })}
                    />
                </div>
                <button onClick={() => updateUrl({ q: inputValue, page: 1 })} disabled={isPending} className="bg-brand text-white px-5 rounded-xl font-bold text-xs hover:bg-brand-hover transition-all disabled:opacity-50 flex items-center gap-2">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cari'}
                </button>
            </div>

            {/* List Area */}
            <div className={`min-h-[300px] overflow-x-auto rounded-2xl border border-slate-100 ${isPending ? 'opacity-50' : 'opacity-100 transition-opacity'}`}>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                            <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Kategori</th>
                            <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                            <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialData.length > 0 ? (
                            initialData.map((cat) => (
                                <tr key={cat.id} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <Link href={`/admin/categories/${cat.id}`} className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand group-hover:bg-brand/5 transition-colors shrink-0">
                                                <Tag className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-700 leading-tight truncate">{cat.name}</h3>
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs font-mono text-slate-400">#{cat.id}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/admin/categories/${cat.id}/edit`}
                                                className="p-2 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteItem(cat)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="py-16 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    Kategori Tidak Ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination & Limit Control */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-50">

                {/* Limit Selector */}
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <span className="text-xs font-semibold text-slate-400">Baris:</span>
                    <select
                        value={currentLimit}
                        onChange={(e) => handleLimitChange(e.target.value)}
                        className="bg-transparent text-xs font-bold text-brand outline-none cursor-pointer"
                    >
                        {[10, 20, 50, 100].map(val => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => updateUrl({ page: currentPage - 1 })}
                        disabled={currentPage <= 1 || isPending}
                        className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4 text-slate-600" />
                    </button>

                    <span className="text-xs font-semibold text-slate-500 min-w-[50px] text-center">
                        {currentPage} / {totalPages}
                    </span>

                    <button
                        onClick={() => updateUrl({ page: currentPage + 1 })}
                        disabled={currentPage >= totalPages || isPending}
                        className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Delete tetap modal karena berupa aksi destruktif yang perlu konfirmasi cepat */}
            <DeleteConfirmModal
                isOpen={!!deleteItem}
                item={deleteItem}
                onClose={() => setDeleteItem(null)}
            />
        </div>
    );
}