// app/(auth)/register/page.tsx
'use client'

import { useActionState, useEffect, useState } from 'react'
import { registerUser } from './actions'
import { SubmitButton } from '../login/_components/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Sparkles, 
  UserPlus,
  Truck,
  TicketPercent,
  Star,
  BadgeCheck,
  Headphones,
  Mail,
  Lock,
  Flame,
  User
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { RegisterState } from './types'

export default function RegisterPage() {
  const [state, formAction] = useActionState<RegisterState | undefined, FormData>(registerUser, { success: false })
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    
    if (state?.success && state?.message) {
      toast.success('Registrasi Berhasil!', {
        description: state.message,
        icon: <UserPlus className="h-5 w-5 text-emerald-500" />,
        duration: 4000,
      });

      const redirectTimeout = setTimeout(() => {
        router.push('/login');
      }, 1500);

      return () => clearTimeout(redirectTimeout);
    }
  }, [state, router]);

  const checks = {
    length: passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    lowercase: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    symbol: /[^A-Za-z0-9]/.test(passwordValue),
  }

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
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Sahabat%20Sport,%20saya%20butuh%20bantuan%20pendaftaran" 
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
          <div className="hidden lg:flex lg:col-span-6 flex-col rounded-3xl overflow-hidden bg-slate-950 text-white relative shadow-2xl shadow-blue-950/20 border border-slate-800/80 min-h-[660px]">
            
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
                  Satu Akun Untuk Seluruh Olahraga
                </div>

                <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white">
                  Bergabung dengan Komunitas <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200">SahabatSport</span>.
                </h1>

                <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-xl">
                  Daftarkan diri Anda untuk menikmati kemudahan belanja peralatan olahraga resmi, jaminan garansi distributor 100% original, serta keuntungan member eksklusif.
                </p>
              </div>

              {/* Shopper Perks & Member Privileges Cards */}
              <div className="grid grid-cols-2 gap-3 my-8">
                
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 transition-all hover:bg-white/10 hover:border-brand/40">
                  <div className="flex items-center gap-2 text-brand">
                    <div className="p-1.5 rounded-lg bg-brand/20 text-blue-400">
                      <TicketPercent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-white">Voucher Sambutan</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-300 leading-snug">
                    Penawaran diskon khusus saat menyelesaikan transaksi pertamamu.
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
                    Garansi distributor resmi & jaminan uang kembali jika tiruan.
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
                    Status pesanan terintegrasi langsung dengan nomor resi real-time.
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

          {/* SISI KANAN: WORKSPACE FORMULIR REGISTER E-COMMERCE */}
          <div className="lg:col-span-6 w-full flex justify-center">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
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
              <div className="space-y-1.5 mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Buat Akun Baru
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  Lengkapi data di bawah untuk menikmati pengalaman belanja yang lebih cepat.
                </p>
              </div>

              {/* Authentication Form */}
              <form action={formAction} className="space-y-4">
                
                {/* Field: Nama Lengkap */}
                <div className="space-y-1.5">
                  <Label 
                    htmlFor="name" 
                    className="text-xs font-bold text-slate-700"
                  >
                    Nama Lengkap
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="contoh: Budi Santoso"
                      required
                      defaultValue={state?.fields?.name}
                      className="h-12 pl-10 pr-4 rounded-xl bg-slate-50/70 border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Field: Email / Nomor HP */}
                <div className="space-y-1.5">
                  <Label 
                    htmlFor="email_or_phone_number" 
                    className="text-xs font-bold text-slate-700"
                  >
                    Email atau No. Handphone
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

                {/* Fields: Kata Sandi & Konfirmasi (Side-by-Side on Tablet/Desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label 
                      htmlFor="password" 
                      className="text-xs font-bold text-slate-700"
                    >
                      Kata Sandi
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 karakter"
                        required
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        className="h-12 pl-10 pr-10 rounded-xl bg-slate-50/70 border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Confirmation */}
                  <div className="space-y-1.5">
                    <Label 
                      htmlFor="password_confirmation" 
                      className="text-xs font-bold text-slate-700"
                    >
                      Konfirmasi Sandi
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type={showPasswordConfirm ? "text" : "password"}
                        placeholder="Ulangi kata sandi"
                        required
                        defaultValue={state?.fields?.password_confirmation}
                        className="h-12 pl-10 pr-10 rounded-xl bg-slate-50/70 border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        aria-label={showPasswordConfirm ? "Sembunyikan konfirmasi sandi" : "Tampilkan konfirmasi sandi"}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Password Criteria Dynamic Feedback */}
                {passwordValue.length > 0 && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-y-2 gap-x-3 text-[11px] font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className={`flex items-center gap-1.5 ${checks.length ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {checks.length ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 text-slate-300" />} Min. 8 Karakter
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
                    <div className={`flex items-center gap-1.5 col-span-2 ${checks.symbol ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {checks.symbol ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 text-slate-300" />} 1 Simbol (@, $, !, %, *, #, ?, &)
                    </div>
                  </div>
                )}

                {/* Terms Notice */}
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Dengan mendaftar, Anda menyetujui <Link href="#" className="text-brand hover:underline font-semibold">Syarat & Ketentuan</Link> serta <Link href="#" className="text-brand hover:underline font-semibold">Kebijakan Privasi</Link> SahabatSport.
                </p>

                {/* Submit Action */}
                <div className="pt-2">
                  <SubmitButton 
                    label="DAFTAR SEKARANG" 
                    loadingLabel="Mendaftarkan Akun..."
                    icon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
                  />
                </div>

              </form>

              {/* Callout Box: Already Have An Account? */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-3xl">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold text-slate-800">Sudah memiliki akun?</p>
                  <p className="text-[11px] font-medium text-slate-500">Masuk untuk melanjutkan pesanan Anda</p>
                </div>
                <Link 
                  href="/login" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-brand/30 text-brand hover:bg-brand hover:text-white text-xs font-black tracking-wide shadow-xs transition-all duration-150 shrink-0"
                >
                  <span>Masuk Di Sini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* 3. COMMERCE FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white py-5 px-4 sm:px-8 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-slate-600">100% Transaksi Aman & Terenkripsi SSL 256-bit</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>© 2026 SahabatSport Indonesia</span>
            <span>•</span>
            <Link href="#" className="hover:text-slate-600 transition-colors">Syarat & Ketentuan</Link>
            <span>•</span>
            <Link href="#" className="hover:text-slate-600 transition-colors">Kebijakan Privasi</Link>
            <span>•</span>
            <Link href="#" className="hover:text-slate-600 transition-colors">Pusat Bantuan</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}