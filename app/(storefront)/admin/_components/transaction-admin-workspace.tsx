// app/admin/_components/transaction-admin-workspace.tsx
'use client';

import { useState, useTransition } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileImage, CheckCircle, Clock, Loader2, AlertTriangle, 
  PackageOpen, ShieldCheck, Truck, Eye, Receipt 
} from 'lucide-react';
import { AdminTransactionItem, verifyAdminPayment } from '@/lib/api/admin-transactions';
import { fetchDetailAction } from '../actions';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WorkspaceProps {
  requestedList: AdminTransactionItem[];
  verifyList: AdminTransactionItem[];
  historyList: AdminTransactionItem[];
}

export function TransactionAdminWorkspace({ requestedList, verifyList, historyList }: WorkspaceProps) {
  const [isPending, startTransition] = useTransition();
  const [isFetchPending, startFetchTransition] = useTransition();
  
  const [localVerifyList, setLocalVerifyList] = useState<AdminTransactionItem[]>(verifyList);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<AdminTransactionItem | null>(null);

  // State Dialog Detail
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [inspectTrx, setInspectTrx] = useState<any | null>(null);
  const [activeBtnId, setActiveBtnId] = useState<number | null>(null);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatFullDate = (unixTimestamp: number) => {
    return new Date(unixTimestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleOpenConfirm = (trx: AdminTransactionItem) => {
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
        setLocalVerifyList(prev => prev.filter(t => t.id !== selectedTrx.id));
        toast.success(`Transaksi #${selectedTrx.number} dideklarasikan lunas!`);
      }
      setIsAlertOpen(false);
      setSelectedTrx(null);
    });
  };

  const handleOpenDetail = (trx: AdminTransactionItem) => {
    setActiveBtnId(trx.id);
    startFetchTransition(async () => {
      const result = await fetchDetailAction(trx.id);
      if (!result.success) {
        toast.error(result.error || 'Gagal memuat rincian item.');
        setActiveBtnId(null);
        return;
      }
      setInspectTrx(result.data);
      setIsDetailOpen(true);
      setActiveBtnId(null);
    });
  };

  // Kalkulasi total di client
  const calculatedGrandTotal = inspectTrx?.items?.reduce((acc: number, item: any) => {
    const price = Number(item.product_item?.price || 0);
    const count = Number(item.count || 0);
    return acc + (price * count);
  }, 0) || 0;

  const renderTable = (data: AdminTransactionItem[], emptyMessage: string, isAuditTab: boolean = false) => {
    return (
      <div className="border border-slate-100 rounded-xl overflow-hidden mt-2 bg-white">
        <Table>
          <TableHeader className="bg-slate-50/60">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-400 py-3.5 px-4">No. Nota</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tanggal</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Nominal Tagihan</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-right px-4">Aksi Dokumen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-xs font-bold text-slate-400 normal-case">{emptyMessage}</TableCell>
              </TableRow>
            ) : (
              data.map((trx) => {
                const isThisLoading = isFetchPending && activeBtnId === trx.id;
                return (
                  <TableRow key={trx.id} className="hover:bg-slate-50/40 transition-colors">
                    <TableCell className="text-xs font-black text-slate-900 font-mono py-4 px-4">#{trx.number}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-400">{formatFullDate(trx.created_at)}</TableCell>
                    <TableCell className="text-xs font-black text-slate-800 text-right">{formatRupiah(trx.total_amount)}</TableCell>
                    <TableCell className="text-right space-x-1.5 px-4 flex items-center justify-end h-14">
                      <button
                        type="button"
                        disabled={isFetchPending}
                        onClick={() => handleOpenDetail(trx)}
                        className="inline-flex h-8 px-2.5 items-center gap-1 border border-slate-200 hover:bg-slate-50 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm cursor-pointer"
                      >
                        {isThisLoading ? <Loader2 className="h-3 w-3 animate-spin text-slate-400" /> : <Eye className="h-3.5 w-3.5 text-slate-400" />}
                        Detail
                      </button>
                      {trx.pic_proof_of_transfer_url ? (
                        <a href={trx.pic_proof_of_transfer_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 px-2.5 items-center gap-1 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm"><FileImage className="h-3.5 w-3.5 text-slate-400" /> Bukti</a>
                      ) : (
                        !trx.is_paid && <span className="text-[10px] font-bold text-slate-300 italic pr-1">No proof</span>
                      )}
                      {isAuditTab && (
                        <button type="button" disabled={isPending} onClick={() => handleOpenConfirm(trx)} className="inline-flex h-8 px-3 items-center bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white rounded-lg text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer">{isPending && selectedTrx?.id === trx.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Set Lunas'}</button>
                      )}
                      {trx.is_sent && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">Sent</span>}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="requested" className="w-full">
        <TabsList className="bg-slate-50 p-1 rounded-xl flex w-full grid grid-cols-3 gap-1 border border-slate-100">
          <TabsTrigger value="requested" className="text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
            <PackageOpen className="h-3.5 w-3.5" /> Penyiapan ({requestedList.length})
          </TabsTrigger>
          <TabsTrigger value="verify" className="text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#165dfc] data-[state=active]:shadow-sm py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Audit Bayar ({localVerifyList.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
            <Truck className="h-3.5 w-3.5" /> Riwayat ({historyList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requested" className="outline-none">
          {renderTable(requestedList, "Aman! Tidak ada antrean permintaan penyiapan barang dari pembeli saat ini.")}
        </TabsContent>
        <TabsContent value="verify" className="outline-none">
          {renderTable(localVerifyList, "Bagus! Semua dokumen bukti pembayaran sudah selesai diaudit admin.", true)}
        </TabsContent>
        <TabsContent value="history" className="outline-none">
          {renderTable(historyList, "Belum ada riwayat transaksi pengiriman barang yang terekam lunas di sistem.")}
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* ✅ SEKTOR MODAL DETAIL DI-REFACTOR: LEBIH BESAR & UKURAN FONT MAKSIMAL */}
      {/* ========================================================================= */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white border-none rounded-[32px] p-0 shadow-2xl w-[95vw] sm:max-w-2xl lg:max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Area (Font Perbesar) */}
          <DialogHeader className="text-left space-y-3 p-8 pb-6 border-b border-slate-100 bg-white">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 flex items-center justify-center text-[#165dfc]">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                Rincian Nota Pemesanan
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm font-mono font-bold text-slate-400 uppercase tracking-widest">
                No. Invoice: {inspectTrx?.number}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Body List Area (Font Perbesar & Spacing Lega) */}
          <div className="p-8 pt-6 space-y-8 max-h-[55vh] overflow-y-auto">
            
            {/* Metadata Ringkas */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-xs sm:text-sm font-bold text-slate-500">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Waktu Transaksi</p>
                <p className="text-slate-800">{inspectTrx ? formatFullDate(inspectTrx.created_at) : '-'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Status Bayar</p>
                <p className={`font-black ${inspectTrx?.is_paid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {inspectTrx?.is_paid ? '✓ Sudah Lunas' : '⏳ Pending Verifikasi'}
                </p>
              </div>
            </div>

            {/* Manifest Item Belanja */}
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-0.5">Daftar Produk Dibeli</p>
              
              {inspectTrx?.items && inspectTrx.items.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl px-5 bg-white shadow-sm">
                  {inspectTrx.items.map((subItem: any, idx: number) => {
                    const itemPrice = Number(subItem.product_item?.price || 0);
                    const itemSubtotal = itemPrice * subItem.count;

                    return (
                      <div key={idx} className="py-4 flex justify-between items-center gap-4 text-xs sm:text-sm">
                        <div className="space-y-1">
                          <p className="font-black text-slate-800 uppercase tracking-tight text-sm sm:text-base">
                            {subItem.product_item?.name || 'Varian Produk'}
                          </p>
                          <p className="text-xs text-slate-400 font-bold">
                            Jumlah: {subItem.count} pcs x {formatRupiah(itemPrice)}
                          </p>
                        </div>
                        <p className="font-black text-slate-900 font-mono text-right text-sm sm:text-base">
                          {formatRupiah(itemSubtotal)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-sm font-bold text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed">
                  Data manifest item produk kosong atau gagal dimuat.
                </div>
              )}
            </div>
          </div>

          {/* Footer Area (Font Perbesar & Sticky Style) */}
          <div className="p-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Total Nilai Transaksi</p>
              <p className="text-2xl sm:text-3xl font-black text-[#165dfc] tracking-tight">
                {formatRupiah(calculatedGrandTotal)}
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => { setIsDetailOpen(false); setInspectTrx(null); }} 
              className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] cursor-pointer"
            >
              Tutup Laporan
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG KONFIRMASI AUDIT KEUANGAN */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white border-none rounded-[24px] p-6 shadow-xl max-w-[90vw] sm:max-w-sm">
          <AlertDialogHeader className="text-left space-y-2">
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500"><AlertTriangle className="h-5 w-5" /></div>
            <AlertDialogTitle className="text-sm font-black text-slate-900 uppercase tracking-tight">Verifikasi Pelunasan Nota?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-semibold text-slate-500 leading-relaxed normal-case">Apakah Anda menyatakan bahwa uang transfer senilai <span className="text-slate-800 font-extrabold">{selectedTrx ? formatRupiah(selectedTrx.total_amount) : ''}</span> untuk nomor transaksi <span className="text-slate-800 font-extrabold">#{selectedTrx?.number}</span> sudah masuk ke rekening toko?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-row items-center gap-2 justify-end">
            <AlertDialogCancel className="h-10 px-4 bg-slate-50 hover:bg-slate-100 border-none text-slate-500 rounded-xl text-xs font-bold uppercase mt-0 cursor-pointer" onClick={() => { setIsAlertOpen(false); setSelectedTrx(null); }}>Batal</AlertDialogCancel>
            <AlertDialogAction className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-emerald-600/10" onClick={handleConfirmSetLunas}>Konfirmasi Lunas</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}