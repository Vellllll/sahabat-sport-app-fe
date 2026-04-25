'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Tag, ChevronLeft, ChevronRight, Loader2, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmModal from './delete-confirm-modal';
import EditCategoryModal from './edit-category-modal';

interface Category {
    id: string;
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

    // State Manajemen Modal
    const [deleteItem, setDeleteItem] = useState<Category | null>(null);
    const [editItem, setEditItem] = useState<Category | null>(null);

    const updateUrl = (newParams: Record<string, string | number>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => params.set(key, value.toString()));
        startTransition(() => router.push(`?${params.toString()}`));
    };

    function handleLimitChange(value: string): void {
        throw new Error('Function not implemented.');
    }

    return (
        <div className="space-y-6">
            {/* Search Bar & Button */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={inputValue}
                        placeholder="Cari kategori..."
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 rounded-2xl outline-none transition-all text-sm font-semibold text-slate-700"
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateUrl({ q: inputValue, page: 1 })}
                    />
                </div>
                <button onClick={() => updateUrl({ q: inputValue, page: 1 })} disabled={isPending} className="bg-[#165dfc] text-white px-6 rounded-2xl font-bold text-xs hover:bg-[#124ecb] transition-all disabled:opacity-50 flex items-center gap-2">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CARI'}
                </button>
            </div>

            {/* List Area */}
            <div className={`space-y-2 min-h-[300px] ${isPending ? 'opacity-50' : 'opacity-100 transition-opacity'}`}>
                {initialData.map((cat) => (
                    <div key={cat.id} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#165dfc]/30 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#165dfc] group-hover:bg-[#165dfc]/5 transition-colors">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 leading-tight">{cat.name}</h3>
                            </div>
                        </div>

                        {/* Action Buttons (Muncul Saat Hover) */}
                        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setEditItem(cat)}
                                className="p-2.5 text-slate-400 hover:text-[#165dfc] hover:bg-[#165dfc]/5 rounded-xl transition-all"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setDeleteItem(cat)}
                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination & Limit Control */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-50">

                {/* Limit Selector */}
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baris:</span>
                    <select
                        value={currentLimit}
                        onChange={(e) => handleLimitChange(e.target.value)}
                        className="bg-transparent text-xs font-black text-[#165dfc] outline-none cursor-pointer"
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
                        className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-10 transition-all"
                    >
                        <ChevronLeft className="h-4 w-4 text-slate-600" />
                    </button>

                    <span className="text-[10px] font-black text-slate-500 min-w-[60px] text-center uppercase tracking-widest">
                        {currentPage} / {totalPages}
                    </span>

                    <button
                        onClick={() => updateUrl({ page: currentPage + 1 })}
                        disabled={currentPage >= totalPages || isPending}
                        className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-10 transition-all"
                    >
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Mount Modals di bawah hirarki */}
            <EditCategoryModal
                isOpen={!!editItem}
                item={editItem}
                onClose={() => setEditItem(null)}
            />

            <DeleteConfirmModal
                isOpen={!!deleteItem}
                item={deleteItem}
                onClose={() => setDeleteItem(null)}
            />
        </div>
    );
}