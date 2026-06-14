'use client';

import { useState, useRef, useTransition } from 'react';
import { X, UploadCloud, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { importCategoriesAction } from './import-actions';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportCategoryModal({ isOpen, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setErrorMsg("Format file harus berupa .CSV");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmitImport = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      
      // PARSER CSV SEDERHANA & ROBUST
      // Membaca baris demi baris, membuang spasi kosong, dan memisahkan koma/semikolon
      const lines = text.split(/\r?\n/);
      const parsedRows: Array<{ name: string }> = [];

      // Asumsi file CSV memiliki header di baris pertama (misal: "name" atau "Nama Kategori")
      // Kita iterasi mulai dari indeks 1 (baris kedua)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Lewati baris kosong
        
        // Membersihkan tanda kutip ganda jika ada dari file Excel
        const nameValue = line.split(/[;,]/)[0]?.replace(/^"|"$/g, '').trim();
        if (nameValue) {
          parsedRows.push({ name: nameValue });
        }
      }

      // Jalankan Eksekusi Server Action di dalam Transition Area
      startTransition(async () => {
        const result = await importCategoriesAction(parsedRows);
        
        if (!result.success) {
          setErrorMsg(result.error || 'Gagal memproses file.');
          toast.error(result.error);
          return;
        }

        toast.success(result.message || 'Data kategori berhasil diimpor massal!');
        handleCloseModal();
      });
    };

    reader.readAsText(selectedFile);
  };

  const handleCloseModal = () => {
    if (isPending) return;
    setSelectedFile(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={handleCloseModal} 
      />
      
      {/* Container Konten Popup */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200 border border-slate-100">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Import Massal</h2>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Unggah berkas CSV untuk kategori baru.</p>
          </div>
          <button 
            disabled={isPending}
            onClick={handleCloseModal} 
            className="p-2 hover:bg-slate-50 disabled:opacity-30 rounded-full text-slate-400 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Zona Input / Drag Zone Drop File */}
        <div className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isPending && fileInputRef.current?.click()}
            className={`w-full min-h-[180px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer select-none
              ${dragActive ? 'border-[#165dfc] bg-[#165dfc]/5 scale-[1.01]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'}
              ${isPending ? 'opacity-40 pointer-events-none' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-3 animate-in zoom-in-95 duration-100">
                <div className="w-14 h-14 bg-blue-50 text-[#165dfc] rounded-2xl flex items-center justify-center border border-blue-100">
                  <FileSpreadsheet className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 truncate max-w-[280px]">{selectedFile.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Siap Di-Import
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Tarik & lepas file di sini, atau klik untuk telusuri</p>
                  <p className="text-[10px] font-semibold text-slate-400">Mendukung berkas koma-terpisah (.CSV)</p>
                </div>
              </div>
            )}
          </div>

          {/* Alert Error Umpan Balik */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-600 leading-normal normal-case">{errorMsg}</p>
            </div>
          )}

          {/* Info Format Template Unduhan */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-[11px] font-medium text-slate-500 space-y-1 leading-relaxed">
            <p className="font-bold text-slate-700 uppercase tracking-wide text-[9px] text-[#165dfc]">Panduan Format Struktur CSV:</p>
            <p>1. Baris pertama diisi kolom <code className="bg-white px-1.5 py-0.5 border rounded font-mono text-slate-700 font-bold">name</code></p>
            <p>2. Baris berikutnya diisi nama kategori baru secara vertikal berurutan.</p>
          </div>

          {/* Aksi Tombol Eksekusi Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleCloseModal}
              className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 rounded-2xl text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer transition-all text-center"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending || !selectedFile}
              onClick={handleSubmitImport}
              className="flex-1 bg-[#165dfc] text-white py-3.5 rounded-2xl font-bold text-xs tracking-widest shadow-lg shadow-[#165dfc]/10 hover:bg-[#124ecb] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none disabled:cursor-not-allowed uppercase"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Mengunggah...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Proses Import
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}