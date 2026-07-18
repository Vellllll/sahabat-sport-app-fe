// app/(storefront)/checkout/[id]/_components/checkout-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileCheck, Loader2, Landmark, Check, ChevronsUpDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BankAccountItem } from '@/lib/api/transactions';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { uploadPaymentReceipt } from '../actions'; // ✅ Import Server Action baru

interface Props {
  transactionId: string;
  bankAccounts: BankAccountItem[];
}

export function CheckoutForm({ transactionId, bankAccounts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>('');
  const [openPopover, setOpenPopover] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const activeBank = bankAccounts.find(b => b.number === selectedAccountNumber);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setFile(null);

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // ✅ REFACTOR: Sesuaikan limits backend NestJS (2MB maksimal)
      const maxSizeBytes = 2 * 1024 * 1024; 

      if (selectedFile.size > maxSizeBytes) {
        const errorMsg = 'Ukuran gambar terlalu besar. Maksimal batas yang diizinkan backend adalah 2MB.';
        setFileError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountNumber || !file || fileError) return;

    startTransition(async () => {
      // ✅ BENTUK MULTIPART FORM DATA SESUAI KONTRAK NESTJS
      const dataPayload = new FormData();
      // 'image' disamakan dengan FileInterceptor('image') di backend NestJS Anda
      dataPayload.append('image', file); 

      // Panggil Server Action untuk melakukan upload file biner
      const result = await uploadPaymentReceipt(transactionId, dataPayload);

      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success('Bukti transfer berhasil diunggah! Transaksi Anda berhasil diperbarui.');
        // Berpindah kembali ke halaman detail transaksi secara instan
        router.push(`/transactions/${transactionId}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-slate-700">
      
      {/* 1. SELECTION DROP-DOWN COMBOBOX BANK */}
      <div className="space-y-2 flex flex-col">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 pl-1">
          <Landmark className="h-3.5 w-3.5" /> 1. Pilih Bank Tujuan Transfer
        </label>
        
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full h-12 bg-slate-50 hover:bg-slate-50 border-slate-100 justify-between font-bold text-xs px-4 rounded-xl text-left text-slate-700 focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all"
            >
              <span className="truncate">
                {activeBank ? `${activeBank.bank_name} — ${activeBank.name}` : "CARI & PILIH REKENING BANK TOKO..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40 text-slate-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden">
            <Command className="bg-white">
              <CommandInput placeholder="Ketik nama bank atau pemilik..." className="text-xs font-bold placeholder:text-slate-400 text-slate-700" />
              <CommandList className="max-h-[240px] overflow-y-auto p-1.5">
                <CommandEmpty className="text-center py-4 text-xs font-semibold text-slate-400">Rekening tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  {bankAccounts.map((bank) => (
                    <CommandItem
                      key={bank.number}
                      value={`${bank.bank_name} ${bank.name} ${bank.number}`}
                      onSelect={() => {
                        setSelectedAccountNumber(bank.number);
                        setFile(null);
                        setFileError(null);
                        setOpenPopover(false);
                      }}
                      className="flex items-center justify-between text-xs font-bold py-3 px-3 rounded-lg hover:bg-slate-50 focus:bg-slate-50 cursor-pointer text-slate-700 data-[selected='true']:bg-slate-50"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span>{bank.bank_name}</span>
                        <span className="text-[10px] font-semibold text-slate-400 normal-case">a.n. {bank.name}</span>
                      </div>
                      <Check className={cn("h-4 w-4 text-brand", selectedAccountNumber === bank.number ? "opacity-100" : "opacity-0")} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* REKENING DETIL DISPLAY */}
      {activeBank && (
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-left space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nomor Rekening {activeBank.bank_name} Resmi Toko</p>
          <p className="text-lg font-black text-slate-900 tracking-tight select-all">{activeBank.number}</p>
          <p className="text-[11px] font-bold text-slate-500">Atas Nama: <span className="text-slate-700 font-extrabold">{activeBank.name}</span></p>
        </div>
      )}

      {/* 2. FILE UPLOADER COMPONENT (STRICTLY FOR IMAGES ONLY) */}
      {selectedAccountNumber && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-3 duration-500">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 pl-1">
            <UploadCloud className="h-3.5 w-3.5" /> 2. Unggah Bukti Transfer Resmi
          </label>
          
          <div className="relative">
            {/* ✅ REFACTOR: accept dikunci hanya gambar (.png, .jpg, .jpeg) sesuai regex backend */}
            <input
              type="file"
              id="payment-receipt"
              accept="image/png, image/jpeg, image/jpg" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              disabled={isPending}
            />
            
            <div className={cn(
              "border rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-2",
              fileError 
                ? "border-red-200 bg-red-50/20 text-red-800 animate-shake"
                : file 
                  ? "border-emerald-200 bg-emerald-50/20 text-emerald-800"
                  : "border-slate-200 bg-slate-50/30 hover:bg-slate-50/70 text-slate-500 border-dashed"
            )}>
              {fileError ? (
                <>
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-red-500"><AlertCircle className="h-5 w-5" /></div>
                  <p className="text-xs font-black">Berkas Gambar Ditolak</p>
                  <p className="text-[10px] font-medium text-red-600/80">Klik area ini untuk mengganti gambar bukti baru</p>
                </>
              ) : file ? (
                <>
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-emerald-500"><FileCheck className="h-5 w-5" /></div>
                  <p className="text-xs font-black truncate max-w-[260px]">{file.name}</p>
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wide">Gambar Siap Diunggah</p>
                </>
              ) : (
                <>
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400"><UploadCloud className="h-5 w-5" /></div>
                  <p className="text-xs font-bold text-slate-800">Klik atau seret gambar bukti ke sini</p>
                  <p className="text-[10px] font-medium text-slate-400">Mendukung format PNG, JPG, atau JPEG (Maks. 2MB)</p>
                </>
              )}
            </div>
          </div>

          {/* INLINE ERROR DISPLAY */}
          {fileError && (
            <p className="text-[11px] font-bold text-red-600 flex items-center gap-1.5 px-1 animate-in fade-in duration-200">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fileError}
            </p>
          )}
        </div>
      )}

      {/* ACTIONS SUBMIT BUTTON */}
      {file && !fileError && (
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed animate-in fade-in duration-300"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sedang Mengunggah Berkas...
            </>
          ) : (
            'Konfirmasi Pembayaran Saya'
          )}
        </button>
      )}

    </form>
  );
}