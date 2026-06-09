// app/admin/_components/transaction-admin-workspace.tsx
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

  // State utama penampung data dinamis per tab aktif
  const [activeTab, setActiveTab] = useState<string>('requested');
  const [currentListData, setCurrentListData] = useState<AdminTransactionItem[]>(initialRequested);

  // State Modal Detail Inspector
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [inspectTrx, setInspectTrx] = useState<any | null>(null);
  const [activeBtnId, setActiveBtnId] = useState<number | null>(null);

  // State Kontrol untuk modal konfirmasi AlertDialog
  const [isReadyAlertOpen, setIsReadyAlertOpen] = useState(false);
  const [isShipAlertOpen, setIsShipAlertOpen] = useState(false);
  const [isRejectAlertOpen, setIsRejectAlertOpen] = useState(false);

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
          filters = { is_requested: true, };
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

      console.log(result.data)
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
      const result = await rejectTransactionAction(transactionId);
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
    });
  };

  const calculatedGrandTotal = inspectTrx?.items?.reduce((acc: number, item: any) => {
    return acc + (Number(item.product_item?.price || 0) * item.count);
  }, 0) || 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
        <ArrowLeftRight className="h-4 w-4 text-slate-400" /> Arus Dokumen Transaksi Masuk
      </h2>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
          <TabsList className="bg-slate-50 p-1 rounded-xl flex w-full grid grid-cols-2 md:grid-cols-5 gap-1 border border-slate-100">
            <TabsTrigger value="requested" className="text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
              <PackageOpen className="h-3.5 w-3.5" /> Penyiapan
            </TabsTrigger>
            <TabsTrigger value="ready" className="text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
              <Store className="h-3.5 w-3.5" /> Siap Diambil
            </TabsTrigger>
            <TabsTrigger value="paid" className="text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Sudah Lunas
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
              <Truck className="h-3.5 w-3.5" /> Terkirim
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-[11px] font-black uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-400">
              <XCircle className="h-3.5 w-3.5" /> Tereject
            </TabsTrigger>
          </TabsList>

          <div className="border border-slate-100 rounded-xl overflow-hidden bg-white relative min-h-[200px]">
            {isTabPending && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10 animate-in fade-in duration-100">
                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                  <Loader2 className="h-4 w-4 animate-spin text-[#165dfc]" /> Mengambil Data API...
                </div>
              </div>
            )}

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
                {currentListData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-xs font-bold text-slate-400 normal-case">
                      Tidak ada rekaman data transaksi untuk filter tab ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentListData.map((trx) => {
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
                            className="inline-flex h-8 px-2.5 items-center gap-1 border border-slate-200 hover:bg-slate-50 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                          >
                            {isThisLoading ? <Loader2 className="h-3 w-3 animate-spin text-slate-400" /> : <Eye className="h-3.5 w-3.5 text-slate-400" />}
                            Detail
                          </button>

                          {trx.pic_proof_of_transfer_url && (
                            <a href={trx.pic_proof_of_transfer_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 px-2.5 items-center gap-1 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm"><FileImage className="h-3.5 w-3.5 text-slate-400" /> Bukti</a>
                          )}

                          {activeTab === 'sent' && (
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">Sent</span>
                          )}

                          {activeTab === 'rejected' && (
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-md">Rejected</span>
                          )}

                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* 📑 GIANT SCALE DIALOG DETAIL */}
      {/* ========================================================================= */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white border-none rounded-[32px] p-0 shadow-2xl w-[95vw] sm:max-w-2xl lg:max-w-3xl overflow-hidden animate-in fade-in duration-200">
          <DialogHeader className="text-left space-y-3 p-8 pb-6 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="h-12 w-12 rounded-3xl bg-blue-50 flex items-center justify-center text-[#165dfc]">
                <Receipt className="h-6 w-6" />
              </div>

              {/* BADGE STATUS DINAMIS DI HEADER MODAL */}
              {inspectTrx?.is_rejected ? (
                // ✅ PENANDA 1: SOLID BADGE WARNA MERAH KHUSUS UNTUK TAB REJECTED
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 border border-rose-700 text-white text-[11px] font-black uppercase tracking-wider shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <XCircle className="h-3.5 w-3.5" />
                  Transaksi Dibatalkan / Di-Reject
                </div>
              ) : inspectTrx?.is_sent ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 border border-emerald-700 text-white text-[11px] font-black uppercase tracking-wider shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <Truck className="h-3.5 w-3.5" />
                  Selesai Dikirim / Diambil
                </div>
              ) : inspectTrx?.is_paid ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-wider animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Sudah Lunas
                </div>
              ) : null}
            </div>
            
            <div className="space-y-1">
              <DialogTitle className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Rincian Nota Pemesanan</DialogTitle>
              <DialogDescription className="text-xs sm:text-base font-mono font-bold text-slate-400 uppercase tracking-widest">No. Invoice: {inspectTrx?.number}</DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-8 pt-6 space-y-8 max-h-[55vh] overflow-y-auto text-base sm:text-lg">
            <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-100 font-bold text-slate-500">
              <div className="space-y-0.5">
                <p className="text-xs uppercase font-black text-slate-400 tracking-wider">Waktu Transaksi</p>
                <p className="text-slate-800 text-sm sm:text-base">{inspectTrx ? formatFullDate(inspectTrx.created_at) : '-'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs uppercase font-black text-slate-400 tracking-wider">Kesiapan Logistik</p>
                <p className={`font-black uppercase tracking-wide text-xs sm:text-sm ${inspectTrx?.is_rejected ? 'text-rose-600' : inspectTrx?.is_sent ? 'text-emerald-600' : inspectTrx?.is_ready ? 'text-indigo-600' : 'text-amber-600'}`}>
                  {inspectTrx?.is_rejected ? '✕ Di-Reject Admin' : inspectTrx?.is_sent ? '✓ Transaksi Selesai' : inspectTrx?.is_ready ? '✓ Siap Diambil' : '⏳ Sedang Diproses Gudang'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 pl-0.5">Daftar Produk Dibeli</p>
              {inspectTrx?.items && inspectTrx.items.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl px-6 bg-white shadow-sm">
                  {inspectTrx.items.map((subItem: any, idx: number) => {
                    const itemPrice = Number(subItem.product_item?.price || 0);
                    return (
                      <div key={idx} className="py-5 flex justify-between items-center gap-4 text-base sm:text-lg hover:bg-slate-50/50">
                        <div className="space-y-1">
                          <p className="font-black text-slate-800 uppercase tracking-tight text-base sm:text-xl">{subItem.product_item?.name || 'Varian Produk'}</p>
                          <p className="text-xs sm:text-sm text-slate-400 font-bold">Jumlah: {subItem.count} pcs x {formatRupiah(itemPrice)}</p>
                        </div>
                        <p className="font-black text-slate-900 font-mono text-right text-base sm:text-xl">{formatRupiah(itemPrice * subItem.count)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-sm font-bold text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed">Data manifest item produk kosong.</div>
              )}
            </div>
          </div>

          <div className="p-8 py-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-0.5">
              <p className="text-xs uppercase font-black text-slate-400 tracking-widest">Total Nilai Transaksi</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-4xl font-black text-[#165dfc] tracking-tight">{formatRupiah(calculatedGrandTotal)}</p>
                
                {/* ✅ PENANDA 2: LABEL NOTIFIKASI STATUS DI FOOTER MODAL */}
                {inspectTrx?.is_rejected ? (
                  <span className="text-[10px] font-black uppercase text-white bg-rose-600 px-2 py-0.5 rounded-md font-sans shadow-sm">REJECTED</span>
                ) : inspectTrx?.is_sent ? (
                  <span className="text-[10px] font-black uppercase text-white bg-emerald-600 px-2 py-0.5 rounded-md font-sans shadow-sm">TERKIRIM</span>
                ) : inspectTrx?.is_paid ? (
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded-md font-sans">LUNAS</span>
                ) : null}
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {inspectTrx && !inspectTrx.is_ready && !inspectTrx.is_rejected && activeTab === 'requested' && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRejectAlertOpen(true)}
                    className="w-full sm:w-auto h-14 px-6 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <XCircle className="h-5 w-5 text-rose-500" /> Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsReadyAlertOpen(true)}
                    className="w-full sm:w-auto h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <PackageCheck className="h-5 w-5" /> Set Ready
                  </button>
                </>
              )}

              {inspectTrx && inspectTrx.is_paid && !inspectTrx.is_sent && activeTab === 'paid' && (
                <button
                  type="button"
                  onClick={() => setIsShipAlertOpen(true)}
                  className="w-full sm:w-auto h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Truck className="h-5 w-5" /> Kirim / Sudah Diambil
                </button>
              )}

              <button type="button" onClick={() => { setIsDetailOpen(false); setInspectTrx(null); }} className="w-full sm:w-auto h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg cursor-pointer">Tutup</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* ⚠️ MODAL OVERLAY ALERT KONFIRMASI: SET READY */}
      {/* ========================================================================= */}
      <AlertDialog open={isReadyAlertOpen} onOpenChange={setIsReadyAlertOpen}>
        <AlertDialogContent className="bg-white border-none rounded-[32px] p-8 shadow-2xl max-w-[90vw] sm:max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <AlertDialogHeader className="text-left space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Konfirmasi Pesanan Siap?</AlertDialogTitle>
            <AlertDialogDescription className="text-base sm:text-lg font-medium text-slate-600 leading-relaxed normal-case">
              Apakah Anda yakin bahwa semua produk fisik untuk nota pesanan <strong className="font-extrabold text-slate-900">#{inspectTrx?.number}</strong> telah selesai dikemas dan <strong className="text-indigo-600">siap diambil pembeli</strong>? Aksi ini akan menggeser data ke tab berikutnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-row items-center gap-3 justify-end">
            <AlertDialogCancel className="h-12 px-6 bg-slate-50 hover:bg-slate-100 border-none text-slate-600 rounded-2xl text-sm font-bold uppercase cursor-pointer mt-0" onClick={() => setIsReadyAlertOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={isReadyPending} onClick={handleSetTransactionReady} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2">
              {isReadyPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ya, Sudah Siap'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========================================================================= */}
      {/* ⚠️ MODAL OVERLAY ALERT KONFIRMASI: SET KIRIM / SUDAH DIAMBIL */}
      {/* ========================================================================= */}
      <AlertDialog open={isShipAlertOpen} onOpenChange={setIsShipAlertOpen}>
        <AlertDialogContent className="bg-white border-none rounded-[32px] p-8 shadow-2xl max-w-[90vw] sm:max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <AlertDialogHeader className="text-left space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Truck className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Konfirmasi Pengiriman Produk?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base sm:text-lg font-medium text-slate-600 leading-relaxed normal-case">
              Apakah Anda menyatakan bahwa barang belanjaan untuk nomor transaksi <strong className="font-extrabold text-slate-900">#{inspectTrx?.number}</strong> secara fisik <strong className="text-emerald-600">telah diserahkan ke kurir / dibawa pulang pembeli</strong>? Tindakan ini akan menutup transaksi secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-row items-center gap-3 justify-end">
            <AlertDialogCancel className="h-12 px-6 bg-slate-50 hover:bg-slate-100 border-none text-slate-600 rounded-2xl text-sm font-bold uppercase cursor-pointer mt-0" onClick={() => setIsShipAlertOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={isShipPending} onClick={handleSetTransactionShipped} className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2">
              {isShipPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ya, Selesai Kirim'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========================================================================= */}
      {/* ⚠️ MODAL OVERLAY ALERT KONFIRMASI: REJECT TRANSAKSI */}
      {/* ========================================================================= */}
      <AlertDialog open={isRejectAlertOpen} onOpenChange={setIsRejectAlertOpen}>
        <AlertDialogContent className="bg-white border-none rounded-[32px] p-8 shadow-2xl max-w-[90vw] sm:max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <AlertDialogHeader className="text-left space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
              <XCircle className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Tolak Transaksi Masuk?</AlertDialogTitle>
            <AlertDialogDescription className="text-base sm:text-lg font-medium text-slate-600 leading-relaxed normal-case">
              Apakah Anda yakin ingin menolak transaksi <strong className="font-extrabold text-slate-900">#{inspectTrx?.number}</strong>? Dokumen invoice ini akan dibatalkan dan digeser secara permanen ke tab <strong className="text-rose-600">Tereject</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-row items-center gap-3 justify-end">
            <AlertDialogCancel className="h-12 px-6 bg-slate-50 hover:bg-slate-100 border-none text-slate-600 rounded-2xl text-sm font-bold uppercase cursor-pointer mt-0" onClick={() => setIsRejectAlertOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={isRejectPending} onClick={handleRejectTransaction} className="h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-rose-600/10 flex items-center justify-center gap-2">
              {isRejectPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ya, Tolak Transaksi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}