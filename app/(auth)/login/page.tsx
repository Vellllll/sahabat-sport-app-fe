// app/(auth)/login/page.tsx
'use client'

import { useActionState, useEffect } from 'react' // 🟢 1. IMPORT USEEFFECT
import { authenticate } from './actions'
import { SubmitButton } from './_components/submit-button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner' // 🟢 2. IMPORT TOAST SONNER

export default function CustomerLoginPage() {
  const [state, formAction] = useActionState(authenticate, undefined)

  // 🟢 3. MONITOR STATE ERROR SECARA REAKTIF
  // Ketika server action mengembalikan object state baru yang berisi string error,
  // panggil toast.error secara instan untuk memunculkan popup premium.
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-md space-y-6">
        
        {/* HEADER AREA (BRANDING HARMONY) */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xl font-black text-slate-900 tracking-tight">
            <span className="bg-[#165dfc] text-white px-3 py-1.5 rounded-2xl text-base font-black shadow-lg shadow-[#165dfc]/20">S</span>
            Sahabat<span className="text-[#165dfc]">Sport</span>
          </div>
          <div className="pt-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Selamat Datang Kembali!
            </h1>
            <p className="text-slate-400 mt-1 text-xs font-semibold uppercase tracking-wider">
              Masuk untuk mulai belanja varian favoritmu
            </p>
          </div>
        </div>

        {/* CONTAINER CARD FORM */}
        <Card className="border border-slate-100/80 shadow-[0_20px_50px_rgba(0,0,0,0.03)] bg-white rounded-[32px] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <form action={formAction} className="space-y-5">
              
              {/* INPUT EMAIL / NO HP */}
              <div className="space-y-1.5">
                <Label htmlFor="email_or_phone_number" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Email atau Nomor HP
                </Label>
                <Input 
                  id="email_or_phone_number" 
                  name="email_or_phone_number"
                  type="text" 
                  placeholder="Contoh: nama@mail.com atau 0812..." 
                  required 
                  className="h-13 bg-slate-50 border border-slate-100/50 rounded-2xl px-5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all"
                />
              </div>

              {/* INPUT PASSWORD */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Kata Sandi
                  </Label>
                  <button type="button" className="text-[10px] font-bold uppercase tracking-wider text-[#165dfc] hover:text-[#124ecb] transition-colors">
                    Lupa Sandi?
                  </button>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  className="h-13 bg-slate-50 border border-slate-100/50 rounded-2xl px-5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all"
                />
              </div>

              {/* 🟢 REFACTOR: Boks Alert Merah Statis di Sini Sudah Dihapus Total */}

              {/* ACTION SUBMIT BUTTON */}
              <div className="pt-3">
                <SubmitButton />
              </div>

              {/* FOOTER MULTI-LINK DIVERTER */}
              <div className="pt-4 border-t border-slate-50 flex flex-col items-center gap-2">
                <p className="text-xs font-semibold text-slate-400">
                  Belum memiliki akun Sahabat Sport?
                </p>
                <a 
                  href="/register" 
                  className="text-xs font-black uppercase tracking-widest text-[#165dfc] hover:text-[#124ecb] flex items-center gap-1.5 transition-all hover:gap-2"
                >
                  Daftar Sekarang <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* SECURITY CONFIDENCE BADGE */}
        <div className="flex items-center justify-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Enkripsi SSL Keamanan 256-Bit
          </p>
        </div>
        
      </div>
    </div>
  )
}