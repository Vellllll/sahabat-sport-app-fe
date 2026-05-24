// app/admin/_components/transaction-admin-table.tsx
'use client';

import { useState, useTransition } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // ✅ Import Tabs Shadcn
import { FileImage, CheckCircle, Clock, Loader2, AlertTriangle, PackageOpen, ShieldCheck, Truck } from 'lucide-react';
import { AdminTransactionItem, verifyAdminPayment } from '@/lib/api/admin-transactions';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Perluas interface sedikit untuk mengakomodasi field baru sesuai skenario Anda
interface ExtendedAdminTransactionItem extends AdminTransactionItem {
  is_requested: boolean;
  is_sent: boolean;
}

export function TransactionAdminTable({ initialTransactions }: { initialTransactions: AdminTransactionItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [transactions, setTransactions] = useState<AdminTransactionItem[]>(initialTransactions);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<AdminTransactionItem | null>(null);

  // Filter-filter di bawahnya otomatis berjalan lancar tanpa eror merah lagi
  const queueRequested = transactions.filter(t => t.is_requested && !t.is_paid && !t.is_sent);
  const queueVerify = transactions.filter(t => t.is_paid && !t.is_sent);
  const queueHistory = transactions.filter(t => t.is_sent);

  const formatFullDate = (unixTimestamp: number) => {
    return new Date(unixTimestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleOpenConfirm = (trx: ExtendedAdminTransactionItem) => {
    setSelectedTrx(trx);
    setIsAlertOpen(true);
  };

  const handleConfirmSetLunas = () => {
    if (!selectedTrx) return;

    startTransition(async () => {
      const result = await verifyAdminPayment(selectedTrx.id);
      
      if (!result.success) {
        toast.error(result.error);
      } else {
        setTransactions(prev => prev.map(t => t.id === selectedTrx.id ? { ...t, is_paid: true } : t));
        toast.success(`Transaksi #${selectedTrx.number} diverifikasi lunas!`);
      }

      setIsAlertOpen(false);
      setSelectedTrx(null);
    });
  };

  // RENDER DUMMY TABLE REUSABLE COMPONENT (DRY PRINCIPLE)
  const renderTableData = (filteredList: ExtendedAdminTransactionItem[], emptyMessage: string, showVerifyAction: boolean = false) => {
    return (
      <div className="border border-slate-100 rounded-xl overflow-hidden mt-2 bg-white">
        <Table>
          <TableHeader className="bg-slate-50/60">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-400 py-3.5 px-4">No. Nota</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tanggal</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status Keuangan</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-right px-4">Aksi Audit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-xs font-bold text-slate-400 normal-case">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((trx) => (
                <TableRow key={trx.id} className="hover:bg-slate-50/40 transition-colors">
                  <TableCell className="text-xs font-black text-slate-900 font-mono py-4 px-4">#{trx.number}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-400">{formatFullDate(trx.created_at)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      trx.is_paid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {trx.is_paid ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {trx.is_paid ? 'Lunas' : 'Belum Bayar'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2 px-4">
                    {/* PRATINJAU FILE BERKAS BUKTI TRANSFER */}
                    {trx.pic_proof_of_transfer_url ? (
                      <a 
                        href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/proofs/${trx.pic_proof_of_transfer_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 px-2.5 items-center gap-1 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm"
                      >
                        <FileImage className="h-3.5 w-3.5 text-slate-400" /> Berkas
                      </a>
                    ) : (
                      !trx.is_paid && <span className="text-[10px] font-bold text-slate-300 italic pr-2">Belum upload</span>
                    )}
                    
                    {/* BUTTON SET LUNAS (Hanya tampil jika diarahkan aktif) */}
                    {showVerifyAction && !trx.is_paid && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleOpenConfirm(trx)}
                        className="inline-flex h-8 px-3 items-center bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white rounded-lg text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer"
                      >
                        {isPending && selectedTrx?.id === trx.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Set Lunas'
                        )}
                      </button>
                    )}

                    {trx.is_sent && (
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md">
                        Selesai Dikirim
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* SEKTOR SUB-TABS SEGMENTASI WORKFLOW */}
      <Tabs defaultValue="requested" className="w-full">
        
        {/* SUB-TAB BAR CONTROLLER */}
        <TabsList className="bg-slate-50 p-1 rounded-xl flex w-full grid grid-cols-3 gap-1 border border-slate-100">
          <TabsTrigger value="requested" className="text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
            <PackageOpen className="h-3.5 w-3.5" /> Penyiapan ({queueRequested.length})
          </TabsTrigger>
          <TabsTrigger value="verify" className="text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#165dfc] data-[state=active]:shadow-sm py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Audit Bayar ({queueVerify.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
            <Truck className="h-3.5 w-3.5" /> Riwayat ({queueHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* CONTENT PANEL 1: TRANSAKSI DI-REQUEST BELUM BAYAR */}
        <TabsContent value="requested" className="outline-none">
          {renderTableData(
            queueRequested,
            "Aman! Tidak ada antrean permintaan penyiapan barang dari pembeli saat ini."
          )}
        </TabsContent>

        {/* CONTENT PANEL 2: TRANSAKSI SUDAH BAYAR UNTUK AUDIT MANUAL */}
        <TabsContent value="verify" className="outline-none">
          {renderTableData(
            queueVerify,
            "Bagus! Semua dokumen bukti pembayaran sudah selesai diaudit admin.",
            true // Aktifkan tombol 'Set Lunas' khusus untuk tab ini
          )}
        </TabsContent>

        {/* CONTENT PANEL 3: TRANSAKSI HISTORY SELESAI KIRIM */}
        <TabsContent value="history" className="outline-none">
          {renderTableData(
            queueHistory,
            "Belum ada riwayat transaksi pengiriman barang yang terekam lunas di sistem."
          )}
        </TabsContent>

      </Tabs>

      {/* SHADCN ALERT DIALOG UNTUK KONFIRMASI AUDIT */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white border-none rounded-[24px] p-6 shadow-xl max-w-[90vw] sm:max-w-sm">
          <AlertDialogHeader className="text-left space-y-2">
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Verifikasi Pelunasan Nota?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-semibold text-slate-500 leading-relaxed normal-case">
              Apakah Anda menyatakan bahwa uang transfer untuk nomor transaksi <span className="text-slate-800 font-extrabold">#{selectedTrx?.number}</span> sudah masuk ke rekening toko secara sah?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-row items-center gap-2 justify-end">
            <AlertDialogCancel className="h-10 px-4 bg-slate-50 hover:bg-slate-100 border-none text-slate-500 rounded-xl text-xs font-bold uppercase mt-0 cursor-pointer" onClick={() => { setIsAlertOpen(false); setSelectedTrx(null); }}>
              Kembali
            </AlertDialogCancel>
            <AlertDialogAction className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-emerald-600/10" onClick={handleConfirmSetLunas}>
              Konfirmasi Lunas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}