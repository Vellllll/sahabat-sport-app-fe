// app/(auth)/login/page.tsx
'use client'

import { useActionState, useEffect, useState } from 'react'
import { authenticate } from './actions'
import { SubmitButton } from './_components/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShoppingBag,
  Truck,
  TicketPercent,
  Star,
  BadgeCheck,
  Headphones,
  Mail,
  Lock,
  Flame
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-800">
      
      {/* 1. TOP COMMERCE HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Official Store Badge */}
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="flex items-center gap-2 group transition-transform active:scale-95"
            >
              <span className="bg-brand text-white px-3 py-1.5 rounded-xl text-base font-black shadow-md shadow-brand/25 group-hover:bg-brand-hover transition-colors">
                S
              </span>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Sahabat<span className="text-brand">Sport</span>
              </span>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-brand border border-blue-100">
              <BadgeCheck className="w-3.5 h-3.5 text-brand" />
              Toko Resmi
            </span>
          </div>

          {/* Quick Header Actions: Back to Store & CS */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali Belanja</span>
            </Link>

            <div className="hidden sm:block h-4 w-px bg-slate-200" />

            <Link 
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Sahabat%20Sport,%20saya%20butuh%20bantuan%20login" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Butuh Bantuan?</span>
              <span className="font-bold text-brand hover:underline">Hubungi CS</span>
            </Link>
          </div>

        </div>
      </header>

      {/* 2. MAIN COMMERCE CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* SISI KIRI: SPORT E-COMMERCE SHOWCASE (Desktop) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col rounded-3xl overflow-hidden bg-slate-950 text-white relative shadow-2xl shadow-blue-950/20 border border-slate-800/80 min-h-[620px]">
            
            {/* Background Hero Photography */}
            <div className="absolute inset-0 z-0">
              <Image 
                src="/images/sport_login_hero.jpg" 
                alt="Sahabat Sport Equipment Showcase"
                fill
                priority
                className="object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000 hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Inner Content Showcase */}
            <div className="relative z-10 p-10 flex flex-col justify-between h-full flex-1">
              
              {/* Top Tagline */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/25 text-xs font-black tracking-wide text-blue-300">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Pusat Perlengkapan Olahraga Original
                </div>

                <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white">
                  Performa Maksimal Dimulai dari <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200">Peralatan Terbaik</span>.
                </h1>

                <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-xl">
                  Masuk ke akun Anda untuk mengakses katalog terlengkap, checkout cepat dengan diskon member eksklusif, dan lacak status pengiriman pesanan Anda secara instan.
                </p>
              </div>

              {/* Shopper Perks & Member Privileges Cards */}
              <div className="grid grid-cols-2 gap-3 my-8">
                
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 transition-all hover:bg-white/10 hover:border-brand/40">
                  <div className="flex items-center gap-2 text-brand">
                    <div className="p-1.5 rounded-lg bg-brand/20 text-blue-400">
                      <TicketPercent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-white">Diskon Member</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-300 leading-snug">
                    Voucher cashback & potongan harga langsung di keranjang.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 transition-all hover:bg-white/10 hover:border-brand/40">
                  <div className="flex items-center gap-2 text-brand">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-white">Bebas Ongkir</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-300 leading-snug">
                    Dukungan ekspedisi terpercaya ke seluruh pelosok Indonesia.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 transition-all hover:bg-white/10 hover:border-brand/40">
                  <div className="flex items-center gap-2 text-brand">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-white">100% Produk Asli</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-300 leading-snug">
                    Garansi resmi distributor & uang kembali jika tidak original.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 transition-all hover:bg-white/10 hover:border-brand/40">
                  <div className="flex items-center gap-2 text-brand">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-white">Pelacakan Cepat</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-300 leading-snug">
                    Pantau status pengemasan hingga kurir tiba di depan rumah.
                  </p>
                </div>

              </div>

              {/* Social Proof & Category Tags */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-200">
                    4.9 / 5 <span className="text-slate-400 font-normal">(50.000+ Pesanan Sukses)</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <span>#Badminton</span>
                  <span>•</span>
                  <span>#Running</span>
                  <span>•</span>
                  <span>#SportApparel</span>
                </div>
              </div>

            </div>

          </div>

          {/* SISI KANAN: WORKSPACE LOGIN E-COMMERCE */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Mobile Brand Logo & Header */}
              <div className="lg:hidden flex flex-col items-center text-center mb-6 space-y-2">
                <div className="inline-flex items-center gap-2">
                  <span className="bg-brand text-white px-2.5 py-1 rounded-xl text-sm font-black shadow-md shadow-brand/25">
                    S
                  </span>
                  <span className="text-xl font-black text-slate-900 tracking-tight">
                    Sahabat<span className="text-brand">Sport</span>
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">Official Sports Equipment Store</p>
              </div>

              {/* Welcome Title */}
              <div className="space-y-1.5 mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Masuk ke Akun
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  Silakan masukkan kredensial akun Anda untuk melanjutkan belanja.
                </p>
              </div>

              {/* Authentication Form */}
              <form action={formAction} className="space-y-4">
                
                {/* Field: Email / Nomor HP */}
                <div className="space-y-1.5">
                  <Label 
                    htmlFor="email_or_phone_number" 
                    className="text-xs font-bold text-slate-700 flex items-center justify-between"
                  >
                    <span>Email atau No. Handphone</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <Input
                      id="email_or_phone_number"
                      name="email_or_phone_number"
                      type="text"
                      placeholder="contoh: budi@mail.com atau 08123456789"
                      required
                      defaultValue={state?.fields?.email_or_phone_number}
                      className="h-12 pl-10 pr-4 rounded-xl bg-slate-50/70 border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Field: Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label 
                      htmlFor="password" 
                      className="text-xs font-bold text-slate-700"
                    >
                      Kata Sandi
                    </Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs font-bold text-brand hover:text-brand-hover hover:underline transition-colors"
                    >
                      Lupa Kata Sandi?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan kata sandi akun"
                      required
                      className="h-12 pl-10 pr-11 rounded-xl bg-slate-50/70 border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      name="remember_me" 
                      defaultChecked 
                      className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand accent-brand cursor-pointer" 
                    />
                    <span className="text-xs font-semibold text-slate-600">
                      Ingat sesi saya di perangkat ini
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <SubmitButton 
                    label="MASUK KE AKUN BELANJA" 
                    loadingLabel="Sedang Memverifikasi..."
                    icon={<ShoppingBag className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
                  />
                </div>

              </form>

              {/* Callout Box: Register New Member */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-3xl">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold text-slate-800">Belum punya akun?</p>
                  <p className="text-[11px] font-medium text-slate-500">Daftar & dapatkan voucher pengguna baru</p>
                </div>
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-brand/30 text-brand hover:bg-brand hover:text-white text-xs font-black tracking-wide shadow-xs transition-all duration-150 shrink-0"
                >
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  )
}