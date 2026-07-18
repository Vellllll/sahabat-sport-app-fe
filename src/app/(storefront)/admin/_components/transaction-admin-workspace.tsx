// app/(storefront)/admin/_components/transaction-admin-workspace.tsx
'use client';

import { useState, useTransition } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  PackageOpen, Store, ShieldCheck, Truck, ArrowLeftRight, Receipt, Eye, FileImage, Loader2, PackageCheck, AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';
import { AdminTransactionItem, getAdminTransactionsByFilter } from '@/lib/api/admin-transactions';
import { fetchDetailAction } from '../actions';
import { readyTransactionAction } from '@/lib/api/admin-transactions';
import { shipTransactionAction } from '@/lib/api/admin-transactions';
import { rejectTransactionAction } from '@/lib/api/admin-transactions';
import { toast } from 'sonner';

interface WorkspaceProps {
  token: string;
  initialRequested: AdminTransactionItem[];
}

export function TransactionAdminWorkspace({ token, initialRequested }: WorkspaceProps) {
  const [isTabPending, startTabTransition] = useTransition();
  const [isFetchPending, startFetchTransition] = useTransition();
  const [isReadyPending, startReadyTransition] = useTransition();
  const [isShipPending, startShipTransition] = useTransition();
  const [isRejectPending, startRejectTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<string>('requested');
  const [currentListData, setCurrentListData] = useState<AdminTransactionItem[]>(initialRequested);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [inspectTrx, setInspectTrx] = useState<any | null>(null);
  const [activeBtnId, setActiveBtnId] = useState<number | null>(null);

  const [isReadyAlertOpen, setIsReadyAlertOpen] = useState(false);
  const [isShipAlertOpen, setIsShipAlertOpen] = useState(false);
  const [isRejectAlertOpen, setIsRejectAlertOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState<string>('');

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatFullDate = (unixTimestamp: number) => {
    return new Date(unixTimestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    
    startTabTransition(async () => {
      let filters = {};

      switch (tabValue) {
        case 'requested':
          filters = { is_requested: true };
          break;
        case 'ready':
          filters = { is_requested: true, is_ready: true };
          break;
        case 'paid':
          filters = { is_requested: true, is_ready: true, is_paid: true };
          break;
        case 'sent':
          filters = { is_requested: true, is_ready: true, is_paid: true, is_sent: true };
          break;
        case 'rejected':
          filters = { is_requested: true, is_rejected: true };
          break;
        default:
          filters = { is_requested: true, is_ready: false, is_paid: false, is_sent: false, is_rejected: false };
      }

      const data = await getAdminTransactionsByFilter(token, filters);
      setCurrentListData(data);
    });
  };

  const handleOpenDetail = (trx: AdminTransactionItem) => {
    setActiveBtnId(trx.id);
    startFetchTransition(async () => {
      const result = await fetchDetailAction(trx.id);
      if (!result.success) {
        toast.error(result.error || 'Gagal memuat rincian item produk.');
        setActiveBtnId(null);
        return;
      }
      setInspectTrx(result.data);
      setIsDetailOpen(true);
      setActiveBtnId(null);
    });
  };

  const handleSetTransactionReady = () => {
    if (!inspectTrx) return;
    const transactionId = inspectTrx.id;

    startReadyTransition(async () => {
      const result = await readyTransactionAction(transactionId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success('Koli barang berhasil dikemas dan dipindahkan ke antrean berikutnya!');
      if (activeTab === 'requested') {
        setCurrentListData(prev => prev.filter(t => t.id !== transactionId));
      }
      setIsReadyAlertOpen(false);
      setIsDetailOpen(false);
      setInspectTrx(null);
    });
  };

  const handleSetTransactionShipped = () => {
    if (!inspectTrx) return;
    const transactionId = inspectTrx.id;

    startShipTransition(async () => {
      const result = await shipTransactionAction(transactionId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success('Pesanan berhasil diserahkan dan selesai dikirim!');
      
      if (activeTab === 'paid') {
        setCurrentListData(prev => prev.filter(t => t.id !== transactionId));
      }

      setIsShipAlertOpen(false);
      setIsDetailOpen(false);
      setInspectTrx(null);
    });
  };

  const handleRejectTransaction = () => {
    if (!inspectTrx) return;
    const transactionId = inspectTrx.id;

    startRejectTransition(async () => {
      const result = await rejectTransactionAction(transactionId, rejectNote);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success('Transaksi berhasil ditolak dan dipindahkan ke daftar reject!');
      if (activeTab === 'requested') {
        setCurrentListData(prev => prev.filter(t => t.id !== transactionId));
      }
      setIsRejectAlertOpen(false);
      setIsDetailOpen(false);
      setInspectTrx(null);
      setRejectNote('');
    });
  };

  const calculatedGrandTotal = inspectTrx?.items?.reduce((acc: number, item: any) => {
    return acc + (Number(item.product_item?.price || 0) * item.count);
  }, 0) || 0;

  return (
    <div className="space-y-4 max-w-full overflow-hidden px-1">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
        <ArrowLeftRight className="h-4 w-4 text-slate-400" /> Arus Dokumen Transaksi Masuk
      </h2>

      <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-100 p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-5">
          
          {/* 🟢 REFACTOR RESPONSIVE TAB BAR: Mengizinkan horizontal scroll otomatis di layar HP */}
          <div className="w-full overflow-x-auto no-scrollbar pb-1">
            <TabsList className="bg-slate-50 p-1 rounded-xl flex min-w-[640px] md:min-w-0 md:grid md:grid-cols-5 gap-1 border border-slate-100">
              <TabsTrigger value="requested" className="flex-1 text-[11px] md:text-[12px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
                <PackageOpen className="h-3.5 w-3.5" /> Penyiapan
              </TabsTrigger>
              <TabsTrigger value="ready" className="flex-1 text-[11px] md:text-[12px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
                <Store className="h-3.5 w-3.5" /> Siap Diambil
              </TabsTrigger>
              <TabsTrigger value="paid" className="flex-1 text-[11px] md:text-[12px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Sudah Lunas
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex-1 text-[11px] md:text-[12px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
                <Truck className="h-3.5 w-3.5" /> Terkirim
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex-1 text-[11px] md:text-[12px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
                <XCircle className="h-3.5 w-3.5" /> Tereject
              </TabsTrigger>
            </TabsList>
          </div>

          {/* AREA DATA WRAPPER */}
          <div className="relative min-h-[200px]">
            {isTabPending && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10 animate-in fade-in duration-100 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                  <Loader2 className="h-4 w-4 animate-spin text-brand" /> Mengambil Data API...
                </div>
              </div>
            )}

            {currentListData.length === 0 ? (
              <div className="text-center py-16 text-sm sm:text-base font-bold text-slate-400 bg-white rounded-xl border border-slate-100">
                Tidak ada rekaman data transaksi untuk filter tab ini.
              </div>
            ) : (
              <>
                {/* 🟢 VIEWPORT A: TAMPILAN TABEL FORMAL (Hanya Aktif di Desktop/Tablet) */}
                <div className="hidden md:block border border-slate-100 rounded-xl overflow-hidden bg-white">
                  <Table>
                    <TableHeader className="bg-slate-50/60">
                      <TableRow>
                        <TableHead className="text-xs font-black uppercase tracking-wider text-slate-400 py-4 px-5">No. Nota</TableHead>
                        <TableHead className="text-xs font-black uppercase tracking-wider text-slate-400">Tanggal</TableHead>
                        <TableHead className="text-xs font-black uppercase tracking-wider text-slate-400 text-right">Nominal Tagihan</TableHead>
                        <TableHead className="text-xs font-black uppercase tracking-wider text-slate-400 text-right px-5">Aksi Dokumen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentListData.map((trx) => {
                        const isThisLoading = isFetchPending && activeBtnId === trx.id;
                        return (
                          <TableRow key={trx.id} className="hover:bg-slate-50/40 transition-colors">
                            <TableCell className="text-sm sm:text-base font-black text-slate-900 font-mono py-5 px-5">#{trx.number}</TableCell>
                            <TableCell className="text-xs sm:text-sm font-bold text-slate-500">{formatFullDate(trx.created_at)}</TableCell>
                            <TableCell className="text-sm sm:text-base font-black text-slate-800 text-right">{formatRupiah(trx.total_amount)}</TableCell>
                            <TableCell className="text-right space-x-2 px-5 flex items-center justify-end h-16">
                              <button
                                type="button"
                                disabled={isFetchPending}
                                onClick={() => handleOpenDetail(trx)}
                                className="inline-flex h-10 px-3.5 items-center gap-1.5 border border-slate-200 hover:bg-slate-50 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
                              >
                                {isThisLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                                Detail
                              </button>
                              {trx.pic_proof_of_transfer_url && (
                                <a href={trx.pic_proof_of_transfer_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 px-3.5 items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-sm active:scale-[0.98]">
                                  <FileImage className="h-4 w-4 text-slate-400" /> Bukti
                                </a>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* 🟢 VIEWPORT B: KARTU SPASIAL LAYAR HP (Otomatis Aktif di Device Mobile) */}
                <div className="block md:hidden space-y-4">
                  {currentListData.map((trx) => {
                    const isThisLoading = isFetchPending && activeBtnId === trx.id;
                    return (
                      <div key={trx.id} className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-400">No. Nota</p>
                            <p className="text-sm font-black text-slate-900 font-mono">#{trx.number}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Nominal Tagihan</p>
                            <p className="text-sm font-black text-brand font-mono">{formatRupiah(trx.total_amount)}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-50 flex items-center justify-between gap-4">
                          <span className="text-[11px] font-bold text-slate-400">{formatFullDate(trx.created_at)}</span>
                          
                          {/* Akses Tombol Responsif Gampang Diklik di HP */}
                          <div className="flex items-center gap-1.5">
                            {trx.pic_proof_of_transfer_url && (
                              <a href={trx.pic_proof_of_transfer_url} target="_blank" rel="noopener noreferrer" className="h-9 w-9 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center transition-all" title="Buka Bukti Transfer">
                                <FileImage className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              type="button"
                              disabled={isFetchPending}
                              onClick={() => handleOpenDetail(trx)}
                              className="h-9 px-3 border border-slate-200 bg-white text-slate-800 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              {isThisLoading ? <Loader2 className="h-3 w-3 animate-spin text-slate-400" /> : <Eye className="h-3.5 w-3.5" />}
                              Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* 📑 DIALOG DETAIL (MENDUKUNG PADDING RESPONSIF PADA LAYAR HP) */}
      {/* ========================================================================= */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white border-none rounded-[24px] sm:rounded-[32px] p-0 shadow-2xl w-[95vw] max-w-full sm:max-w-2xl lg:max-w-3xl overflow-hidden animate-in fade-in duration-200 max-h-[92vh] flex flex-col">
          
          <DialogHeader className="text-left space-y-3 p-5 sm:p-8 pb-4 sm:pb-6 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl sm:rounded-3xl bg-blue-50 flex items-center justify-center text-brand">
                <Receipt className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              {inspectTrx?.is_rejected ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 border border-rose-700 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-sm">
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </div>
              ) : inspectTrx?.is_sent ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 border border-emerald-700 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-sm">
                  <Truck className="h-3.5 w-3.5" /> Terkirim
                </div>
              ) : inspectTrx?.is_paid ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] sm:text-xs font-black uppercase tracking-wider">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Lunas
                </div>
              ) : null}
            </div>
            
            <div className="space-y-1">
              <DialogTitle className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Rincian Nota Pemesanan</DialogTitle>
              <DialogDescription className="text-[11px] sm:text-sm font-mono font-bold text-slate-400 uppercase tracking-widest truncate">No. Invoice: {inspectTrx?.number}</DialogDescription>
            </div>
          </DialogHeader>

          {/* Bagian Tengah Modal yang Bisa Di-Scroll secara Independen */}
          <div className="p-5 sm:p-8 pt-4 sm:pt-6 space-y-6 overflow-y-auto flex-1 text-sm sm:text-base">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-100 font-bold text-slate-400">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-black tracking-wider">Waktu Transaksi</p>
                <p className="text-slate-800 text-sm sm:text-base">{inspectTrx ? formatFullDate(inspectTrx.created_at) : '-'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-black tracking-wider">Kesiapan Logistik</p>
                <p className={`font-black uppercase tracking-wide text-xs sm:text-sm ${inspectTrx?.is_rejected ? 'text-rose-600' : inspectTrx?.is_sent ? 'text-emerald-600' : inspectTrx?.is_ready ? 'text-indigo-600' : 'text-amber-600'}`}>
                  {inspectTrx?.is_rejected ? '✕ Di-Reject Admin' : inspectTrx?.is_sent ? '✓ Transaksi Selesai' : inspectTrx?.is_ready ? '✓ Siap Diambil' : '⏳ Proses Gudang'}
                </p>
              </div>
            </div>

            {inspectTrx?.reject_note && (
              <div className="p-4 sm:p-5 bg-rose-50 border border-rose-100 rounded-2xl space-y-1 text-xs sm:text-sm shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5" /> Alasan Pembatalan / Reject Note
                </p>
                <p className="text-rose-900 font-extrabold normal-case leading-relaxed">"{inspectTrx.reject_note}"</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-0.5">Daftar Produk Dibeli</p>
              {inspectTrx?.items && inspectTrx.items.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl px-4 sm:px-6 bg-white shadow-sm">
                  {inspectTrx.items.map((subItem: any, idx: number) => {
                    const itemPrice = Number(subItem.product_item?.price || 0);
                    return (
                      <div key={idx} className="py-4 flex justify-between items-center gap-4 text-xs sm:text-base hover:bg-slate-50/50 transition-colors">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="font-black text-slate-800 uppercase tracking-tight text-sm sm:text-lg truncate">{subItem.product_item?.name || 'Varian Produk'}</p>
                          <p className="text-[11px] sm:text-xs text-slate-400 font-extrabold">{subItem.count} pcs x {formatRupiah(itemPrice)}</p>
                        </div>
                        <p className="font-black text-slate-900 font-mono text-right shrink-0 text-sm sm:text-base">{formatRupiah(itemPrice * subItem.count)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs font-bold text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed">Data manifest item produk kosong.</div>
              )}
            </div>
          </div>

          {/* 🟢 REFACTOR BOTTOM ACTIONS: Menumpuk vertikal otomatis jika dijalankan di layar HP */}
          <div className="p-5 sm:p-8 py-4 sm:py-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Total Nilai Transaksi</p>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <p className="text-xl sm:text-3xl font-black text-brand tracking-tight">{formatRupiah(calculatedGrandTotal)}</p>
                {inspectTrx?.is_rejected ? (
                  <span className="text-[9px] font-black uppercase text-white bg-rose-600 px-1.5 py-0.5 rounded font-sans tracking-wider">REJECTED</span>
                ) : inspectTrx?.is_sent ? (
                  <span className="text-[9px] font-black uppercase text-white bg-emerald-600 px-1.5 py-0.5 rounded font-sans tracking-wider">TERKIRIM</span>
                ) : inspectTrx?.is_paid ? (
                  <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded font-sans tracking-wider">LUNAS</span>
                ) : null}
              </div>
            </div>
            
            {/* Tombol-tombol Aksi Berformat Full-Width di HP */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto justify-end">
              {inspectTrx && !inspectTrx.is_ready && !inspectTrx.is_rejected && activeTab === 'requested' && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRejectAlertOpen(true)}
                    className="w-full sm:w-auto h-12 px-5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 text-rose-500" /> Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsReadyAlertOpen(true)}
                    className="w-full sm:w-auto h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PackageCheck className="h-4 w-4" /> Set Ready
                  </button>
                </>
              )}

              {inspectTrx && inspectTrx.is_paid && !inspectTrx.is_sent && activeTab === 'paid' && (
                <button
                  type="button"
                  onClick={() => setIsShipAlertOpen(true)}
                  className="w-full sm:w-auto h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Truck className="h-4 w-4" /> Kirim / Selesai
                </button>
              )}

              <button type="button" onClick={() => { setIsDetailOpen(false); setInspectTrx(null); }} className="w-full sm:w-auto h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg cursor-pointer">Tutup</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* ⚠️ MODAL OVERLAY ALERT KONFIRMASI (SUDAH DIOPTIMALKAN UNTUK HP) */}
      {/* ========================================================================= */}
      
      {/* AlertDialog: Set Ready */}
      <AlertDialog open={isReadyAlertOpen} onOpenChange={setIsReadyAlertOpen}>
        <AlertDialogContent className="bg-white border-none rounded-[24px] p-5 sm:p-8 shadow-2xl max-w-[92vw] sm:max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <AlertDialogHeader className="text-left space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tight">Konfirmasi Pesanan Siap?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed normal-case">
              Apakah Anda yakin bahwa semua produk fisik untuk nota pesanan <strong className="font-extrabold text-slate-900">#{inspectTrx?.number}</strong> telah selesai dikemas dan <strong className="text-indigo-600">siap diambil pembeli</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-row items-center gap-2 justify-end">
            <AlertDialogCancel className="h-10 px-4 bg-slate-50 hover:bg-slate-100 border-none text-slate-600 rounded-xl text-xs font-bold uppercase cursor-pointer mt-0" onClick={() => setIsReadyAlertOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={isReadyPending} onClick={handleSetTransactionReady} className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer">
              {isReadyPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Ya, Siap'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Set Shipped */}
      <AlertDialog open={isShipAlertOpen} onOpenChange={setIsShipAlertOpen}>
        <AlertDialogContent className="bg-white border-none rounded-[24px] p-5 sm:p-8 shadow-2xl max-w-[92vw] sm:max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <AlertDialogHeader className="text-left space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Truck className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tight">Konfirmasi Pengiriman Produk?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed normal-case">
              Apakah Anda menyatakan bahwa barang belanjaan untuk nomor transaksi <strong className="font-extrabold text-slate-900">#{inspectTrx?.number}</strong> secara fisik <strong className="text-emerald-600">telah diserahkan ke kurir / dibawa pulang</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-row items-center gap-2 justify-end">
            <AlertDialogCancel className="h-10 px-4 bg-slate-50 hover:bg-slate-100 border-none text-slate-600 rounded-xl text-xs font-bold uppercase cursor-pointer mt-0" onClick={() => setIsShipAlertOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={isShipPending} onClick={handleSetTransactionShipped} className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer">
              {isShipPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Ya, Selesai'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Reject */}
      <AlertDialog open={isRejectAlertOpen} onOpenChange={setIsRejectAlertOpen}>
        <AlertDialogContent className="bg-white border-none rounded-[24px] p-5 sm:p-8 shadow-2xl max-w-[92vw] sm:max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <AlertDialogHeader className="text-left space-y-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tight">Tolak Transaksi Masuk?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed normal-case">
              Apakah Anda yakin ingin membatalkan pesanan <strong className="font-extrabold text-slate-900">#{inspectTrx?.number}</strong>? Berikan alasan penolakan wajib di bawah ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-1">
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Contoh: Stok ukuran sepatu habis..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-rose-300 focus:outline-none transition-all resize-none"
            />
          </div>

          <AlertDialogFooter className="mt-4 flex flex-row items-center gap-2 justify-end">
            <AlertDialogCancel className="h-10 px-4 bg-slate-50 hover:bg-slate-100 border-none text-slate-600 rounded-xl text-xs font-bold uppercase cursor-pointer mt-0" onClick={() => { setIsRejectAlertOpen(false); setRejectNote(''); }}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={isRejectPending || !rejectNote.trim()} onClick={handleRejectTransaction} className="h-10 px-5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed">
              {isRejectPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Ya, Tolak'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}