// app/(auth)/login/page.tsx
'use client'

import { useActionState, useEffect, useState } from 'react'
import { authenticate } from './actions'
import { SubmitButton } from './_components/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, ShieldCheck, Check, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { LoginState } from './types'

export default function LoginPage() {
  const [state, formAction] = useActionState<LoginState | undefined, FormData>(authenticate, {})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row w-full overflow-x-hidden">
      
      {/* SISI KIRI: BRAND SHOWCASE */}
      <div className="hidden md:flex md:w-5/12 bg-slate-950 p-12 flex-col justify-between relative overflow-hidden text-white select-none">
        <div className="absolute top-[-30%] left-[-10%] w-[90%] h-[70%] rounded-full bg-blue-600/15 blur-[130px]" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[70%] h-[60%] rounded-full bg-indigo-500/10 blur-[110px]" />

        <div className="inline-flex items-center gap-2 text-xl font-black tracking-tight z-10">
          <span className="bg-brand text-white px-3 py-1.5 rounded-2xl text-base font-black shadow-lg shadow-brand/30">S</span>
          Sahabat<span className="text-brand">Sport</span>
        </div>

        <div className="space-y-6 z-10 max-w-sm my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-brand">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Authorized Dealer
          </div>
          <h2 className="text-4xl font-black tracking-tight leading-[1.15] text-slate-50">
            Kembali Ke <span className="text-brand">Performa</span> Puncakmu.
          </h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Masuk untuk melanjutkan belanja, memantau riwayat pengiriman barang secara real-time, dan mengklaim garansi resmi distributor Anda.
          </p>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0"><Check className="w-3 h-3 stroke-[3]" /></div>
              <p className="text-xs font-semibold text-slate-300">Instant Shipping Track Integration</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0"><Check className="w-3 h-3 stroke-[3]" /></div>
              <p className="text-xs font-semibold text-slate-300">Secure Direct API B2B Authenticated</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 z-10 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-brand" /> Verified Endpoint Encrypted
        </div>
      </div>

      {/* SISI KANAN: WORKSPACE FORM */}
      <div className="flex-1 bg-[#F8FAFC] md:bg-white flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative">
        <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="md:hidden text-center space-y-2 mb-4">
            <div className="inline-flex items-center gap-2 text-lg font-black text-slate-900 tracking-tight">
              <span className="bg-brand text-white px-2.5 py-1 rounded-xl text-sm font-black">S</span>
              SahabatSport
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Selamat Datang Kembali</h1>
            <p className="text-slate-400 text-sm font-medium">Silakan masukkan kredensial akun Anda untuk mengakses dashboard belanja etalase.</p>
          </div>

          <form action={formAction} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="email_or_phone_number" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Email / Nomor Handphone
              </Label>
              <Input
                id="email_or_phone_number"
                name="email_or_phone_number"
                type="text"
                placeholder="budi@mail.com atau 0812..."
                required
                defaultValue={state?.fields?.email_or_phone_number}
                className="h-13 bg-slate-50 md:bg-slate-50/70 border border-slate-100/70 focus:border-brand rounded-2xl px-5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all w-full"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kata Sandi</Label>
                <Link href="/forgot-password" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">Lupa Sandi?</Link>
              </div>
              <div className="relative w-full">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi Anda"
                  required
                  className="h-13 bg-slate-50 md:bg-slate-50/70 border border-slate-100/70 focus:border-brand rounded-2xl pl-5 pr-12 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Pertahankan Sesi Login</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="remember_me" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
              </label>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-400">Belum memiliki akun Sahabat Sport?</p>
              <Link href="/register" className="text-xs font-black uppercase tracking-widest text-brand hover:text-brand-hover flex items-center gap-1.5 transition-all hover:gap-2">
                Daftar Akun Baru <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </form>
        </div>
      </div>

    </div>
  )
}