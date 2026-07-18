// app/(storefront)/transactions/[id]/_components/preparation-request-button.tsx
'use client';

import { useTransition } from 'react';
import { PackageCheck, Loader2, Clock } from 'lucide-react';
import { requestItemPreparation } from '../actions';
import { toast } from 'sonner'; // ✅ Import Sonner Toast
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
} from "@/components/ui/alert-dialog"; // ✅ Import AlertDialog Shadcn

interface Props {
  transactionId: string;
  isRequested: boolean;
  requestedAtStr: string | null;
}

export function PreparationRequestButton({ transactionId, isRequested, requestedAtStr }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleExecuteRequest = () => {
    startTransition(async () => {
      const result = await requestItemPreparation(transactionId);
      
      if (!result.success) {
        // ✅ Notifikasi Gagal via Sonner
        toast.error(result.error);
      } else {
        // ✅ Notifikasi Sukses via Sonner dengan warna premium
        toast.success('Permintaan berhasil dikirim! Admin gudang akan segera menyiapkan pesanan Anda.');
      }
    });
  };

  // 1. TAMPILAN JIKA SUDAH DI-REQUEST (STATUS BANNER)
  if (isRequested) {
    return (
      <div className="bg-slate-50/70 border border-slate-100 p-3.5 px-4 rounded-2xl flex items-start gap-3 max-w-sm w-full md:w-auto animate-in fade-in duration-300">
        <div className="p-1.5 bg-white rounded-lg shadow-sm text-amber-500 shrink-0 mt-0.5">
          <Clock className="h-3.5 w-3.5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
            Sedang Disiapkan Admin
          </p>
          {requestedAtStr && (
            <p className="text-[10px] font-medium text-slate-400">
              Diajukan: <span className="text-slate-500 font-bold">{requestedAtStr}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // 2. TAMPILAN TOMBOL AKTIF DENGAN DIALOG KONFIRMASI SHADCN
  return (
    <AlertDialog>
      {/* Trigger adalah tombol utama yang memicu munculnya Modal Dialog */}
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-brand/10 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed w-full md:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
            </>
          ) : (
            <>
              <PackageCheck className="h-4 w-4" /> Siapkan Barang Saya
            </>
          )}
        </button>
      </AlertDialogTrigger>

      {/* STRUKTUR DIALOG BOX SHADCN (EDITORIAL DESIGN ADJUSTMENT) */}
      <AlertDialogContent className="rounded-[28px] max-w-sm border-none bg-white p-6 gap-5 shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
        <AlertDialogHeader className="space-y-2 text-left">
          <AlertDialogTitle className="text-base font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-brand" /> Konfirmasi Penyiapan
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs font-medium text-slate-500 leading-relaxed">
            Kirim sinyal permintaan ke admin gudang Sahabat Sport untuk segera mengemas varian unit olahraga pesanan Anda? Aksi ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex flex-row items-center gap-2 pt-1">
          <AlertDialogCancel className="flex-1 h-11 border border-slate-100 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer mt-0">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleExecuteRequest}
            className="flex-1 h-11 bg-brand hover:bg-brand-hover text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-brand/5 border-none"
          >
            Ya, Kirim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}