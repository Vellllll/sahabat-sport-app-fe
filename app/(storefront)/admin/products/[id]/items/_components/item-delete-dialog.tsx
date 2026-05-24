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
          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-none shadow-2xl">
        <AlertDialogHeader className='p-2.5'>
          <AlertDialogTitle className="text-xl font-black text-slate-900">
            Hapus Varian Ini?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500">
            Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-900">"{itemName}"</span>? Tindakan ini tidak dapat dibatalkan dan akan menghapus stok varian ini secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="rounded-xl border-slate-100 font-bold text-slate-500">
            BATAL
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="rounded-xl bg-red-500 font-bold text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            HAPUS SEKARANG
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}