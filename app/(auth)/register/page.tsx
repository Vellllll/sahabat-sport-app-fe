// app/(auth)/register/page.tsx
'use client'

import { useActionState, useEffect, useState } from 'react'
import { registerUser } from './actions'
import { SubmitButton } from '../login/_components/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, CheckCircle2, ShieldCheck, Check, X, Eye, EyeOff, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from 'sonner'
import { RegisterState } from './types'

export default function RegisterPage() {
  const [state, formAction] = useActionState<RegisterState | undefined, FormData>(registerUser, { success: false })
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const checks = {
    length: passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    lowercase: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    symbol: /[^A-Za-z0-9]/.test(passwordValue),
  }

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row w-full overflow-x-hidden">
      
      {/* SISI KIRI: BRAND SHOWCASE */}
      <div className="hidden md:flex md:w-5/12 bg-slate-950 p-12 flex-col justify-between relative overflow-hidden text-white select-none">
        <div className="absolute top-[-20%] left-[-25%] w-[80%] h-[60%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-emerald-500/10 blur-[100px]" />

        <div className="inline-flex items-center gap-2 text-xl font-black tracking-tight z-10">
          <span className="bg-[#165dfc] text-white px-3 py-1.5 rounded-2xl text-base font-black shadow-lg shadow-[#165dfc]/30">S</span>
          Sahabat<span className="text-[#165dfc]">Sport</span>
        </div>

        <div className="space-y-6 z-10 max-w-sm my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-[#165dfc]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Varian Terlengkap
          </div>
          <h2 className="text-4xl font-black tracking-tight leading-[1.15] text-slate-50">
            Satu Akun Untuk <span className="text-[#165dfc]">Seluruh</span> Kebutuhan Olahragamu.
          </h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Dapatkan akses prioritas pelacakan pesanan instan, penawaran harga authorized dealer eksklusif, dan jaminan 100% produk original.
          </p>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0"><Check className="w-3 h-3 stroke-[3]" /></div>
              <p className="text-xs font-semibold text-slate-300">Authorized Distributor Resmi</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0"><Check className="w-3 h-3 stroke-[3]" /></div>
              <p className="text-xs font-semibold text-slate-300">Sistem Enkripsi Transaksi SSL Aman</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 z-10 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Enkripsi Keamanan 256-Bit
        </div>
      </div>

      {/* SISI KANAN: WORKSPACE FORMULIR */}
      <div className="flex-1 bg-[#F8FAFC] md:bg-white flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative">
        <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="md:hidden text-center space-y-2 mb-4">
            <div className="inline-flex items-center gap-2 text-lg font-black text-slate-900 tracking-tight">
              <span className="bg-[#165dfc] text-white px-2.5 py-1 rounded-xl text-sm font-black">S</span>
              SahabatSport
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buat Akun Baru</h1>
            <p className="text-slate-400 text-sm font-medium">Bergabunglah sekarang dan rasakan kemudahan belanja perlengkapan olahraga berkelas dunia.</p>
          </div>

          {state?.success && (
            <Alert className="border-emerald-100 bg-emerald-50/60 p-5 rounded-2xl shadow-sm animate-in zoom-in duration-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h5 className="text-sm font-black text-emerald-900 uppercase tracking-wide">Pendaftaran Sukses!</h5>
                  <AlertDescription className="text-xs font-bold text-emerald-700 leading-relaxed">
                    {state.message}. Silakan klik tombol masuk di bawah untuk mengakses akun etalase Anda.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <form action={formAction} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</Label>
                <Input
                  id="name" 
                  name="name" 
                  type="text" 
                  placeholder="Contoh: Budi Santoso" 
                  required
                  defaultValue={state?.fields?.name}
                  className="h-13 bg-slate-50 md:bg-slate-50/70 border border-slate-100/70 focus:border-[#165dfc] rounded-2xl px-5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-[#165dfc]/5 transition-all w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email_or_phone_number" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / Nomor Handphone</Label>
                <Input
                  id="email_or_phone_number" 
                  name="email_or_phone_number" 
                  type="text" 
                  placeholder="budi@mail.com / 0812..." 
                  required
                  defaultValue={state?.fields?.email_or_phone_number}
                  className="h-13 bg-slate-50 md:bg-slate-50/70 border border-slate-100/70 focus:border-[#165dfc] rounded-2xl px-5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-[#165dfc]/5 transition-all w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</Label>
                <div className="relative w-full">
                  <Input
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Minimal 8 karakter" 
                    required
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    className="h-13 bg-slate-50 md:bg-slate-50/70 border border-slate-100/70 focus:border-[#165dfc] rounded-2xl pl-5 pr-12 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-[#165dfc]/5 transition-all w-full"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="password_confirmation" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Sandi</Label>
                <Input
                  id="password_confirmation" 
                  name="password_confirmation" 
                  type="password" 
                  placeholder="Ulangi kata sandi Anda" 
                  required
                  defaultValue={state?.fields?.password_confirmation}
                  className="h-13 bg-slate-50 md:bg-slate-50/70 border border-slate-100/70 focus:border-[#165dfc] rounded-2xl px-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-[#165dfc]/5 transition-all w-full"
                />
              </div>
            </div>

            {passwordValue.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1 duration-200">
                <div className={`flex items-center gap-1.5 ${checks.length ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {checks.length ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 text-slate-300" />} Min. 8 Huruf
                </div>
                <div className={`flex items-center gap-1.5 ${checks.uppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {checks.uppercase ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 text-slate-300" />} 1 Huruf Besar
                </div>
                <div className={`flex items-center gap-1.5 ${checks.lowercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {checks.lowercase ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 text-slate-300" />} 1 Huruf Kecil
                </div>
                <div className={`flex items-center gap-1.5 ${checks.number ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {checks.number ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 text-slate-300" />} 1 Angka
                </div>
                <div className={`flex items-center gap-1.5 ${checks.symbol ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {checks.symbol ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 text-slate-300" />} 1 Simbol (@,!,#)
                </div>
              </div>
            )}

            <div className="pt-2">
              <SubmitButton />
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-400">Sudah menjadi member Sahabat Sport?</p>
              <Link href="/login" className="text-xs font-black uppercase tracking-widest text-[#165dfc] hover:text-[#124ecb] flex items-center gap-1.5 transition-all hover:gap-2">
                Masuk Di Sini <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </form>
        </div>
      </div>

    </div>
  )
}