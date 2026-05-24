// app/(storefront)/transactions/[id]/_components/payment-proof-modal.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Eye, FileImage, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  transactionId: string; // ✅ Tambahkan props ID Transaksi untuk kebutuhan redirect
  fileName: string;
}

export function PaymentProofModal({ transactionId, fileName }: Props) {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const imageUrl = `${apiBaseUrl}/uploads/proofs/${fileName}`;

  const handleRedirectToReupload = () => {
    // Alihkan pembeli kembali ke halaman checkout untuk melakukan upload ulang berkas resmi
    router.push(`/checkout/${transactionId}`);
  };

  return (
    <Dialog>
      {/* Tombol Pemicu Utama */}
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.99] cursor-pointer w-full md:w-auto shadow-sm"
        >
          <Eye className="h-4 w-4 text-slate-400" /> Lihat Bukti Pembayaran
        </button>
      </DialogTrigger>

      {/* Konten Pop-up Gambar */}
      <DialogContent className="sm:max-w-md bg-white border-none rounded-[28px] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.12)] max-w-[92vw]">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <FileImage className="h-4 w-4 text-[#165dfc]" /> Arsip Dokumen Bukti
          </DialogTitle>
          <DialogDescription className="text-[11px] font-medium text-slate-400 truncate">
            File: {fileName}
          </DialogDescription>
        </DialogHeader>
        
        {/* AREA PREVIEW GAMBAR */}
        <div className="relative mt-2 w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Bukti Transfer Pembayaran Sahabat Sport"
            className="w-full h-full object-contain select-none"
            loading="lazy"
          />
        </div>

        {/* ✅ FITUR BARU: TOMBOL AKSI UPLOAD ULANG DI BAWAH PREVIEW */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col">
          <button
            type="button"
            onClick={handleRedirectToReupload}
            className="inline-flex items-center justify-center gap-2 h-11 w-full bg-amber-50 hover:bg-amber-100/80 text-amber-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Upload Ulang Bukti Baru
          </button>
          <p className="text-[10px] text-center text-slate-400 font-medium mt-2.5 normal-case">
            Aksi ini akan menimpa berkas lama Anda yang tersimpan di server.
          </p>
        </div>

      </DialogContent>
    </Dialog>
  );
}