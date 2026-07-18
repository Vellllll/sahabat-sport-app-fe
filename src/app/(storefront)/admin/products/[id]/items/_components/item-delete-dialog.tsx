// app/(storefront)/admin/products/[id]/items/_components/item-delete-dialog.tsx
'use client';

import { useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProductItem } from '../actions';

interface ItemDeleteDialogProps {
  productId: number;
  itemId: string;
  itemName: string;
}

export function ItemDeleteDialog({ productId, itemId, itemName }: ItemDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProductItem(productId, itemId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          title="Hapus Item"
          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-none shadow-2xl bg-white rounded-[24px] max-w-sm">
        <AlertDialogHeader className='p-1'>
          <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            Hapus Varian Ini?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 text-xs font-medium leading-relaxed mt-2">
            Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-900">"{itemName}"</span>? Tindakan ini tidak dapat dibatalkan dan akan menghapus stok varian ini secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex flex-row items-center gap-2 justify-end">
          <AlertDialogCancel className="rounded-xl border-none bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-500 px-4 py-2.5 transition-all mt-0 cursor-pointer">
            BATAL
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="rounded-xl bg-red-600 font-black text-xs text-white hover:bg-red-700 shadow-lg shadow-red-600/10 px-5 py-2.5 transition-all cursor-pointer"
          >
            {isPending && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
            HAPUS SEKARANG
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}