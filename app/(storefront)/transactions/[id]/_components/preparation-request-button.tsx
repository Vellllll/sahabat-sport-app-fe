// app/(storefront)/transactions/[id]/_components/preparation-request-button.tsx
'use client';

import { useTransition } from 'react';
import { PackageCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { requestItemPreparation } from '../actions';

interface Props {
  transactionId: string;
  isRequested: boolean; // ✅ Terima status dari server
  requestedAtStr: string | null; // ✅ Terima string tanggal terformat dari server
}

export function PreparationRequestButton({ transactionId, isRequested, requestedAtStr }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleRequest = () => {
    if (confirm('Ajukan permintaan penyiapan barang ke admin gudang sekarang?')) {
      startTransition(async () => {
        const result = await requestItemPreparation(transactionId);
        if (!result.success) {
          alert(result.error);
        } else {
          alert('Permintaan berhasil dikirim!');
        }
      });
    }
  };

  // ✅ KONDISI 1: JIKA SUDAH PERNAH DI-REQUEST
  if (isRequested) {
    return (
      <div className="space-y-1.5 w-full sm:w-auto text-left sm:text-right">
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed w-full sm:w-auto"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Permintaan Terkirim
        </button>
        {requestedAtStr && (
          <p className="text-[10px] font-semibold text-slate-400 block px-1">
            Diajukan pada: <span className="text-slate-600 font-bold">{requestedAtStr}</span>
          </p>
        )}
      </div>
    );
  }

  // ✅ KONDISI 2: JIKA BELUM DI-REQUEST (TOMBOL AKTIF)
  return (
    <button
      type="button"
      onClick={handleRequest}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-[#165dfc] hover:bg-[#124ecb] disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-[#165dfc]/10 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> memproses...
        </>
      ) : (
        <>
          <PackageCheck className="h-4 w-4" /> Siapkan Barang Saya
        </>
      )}
    </button>
  );
}