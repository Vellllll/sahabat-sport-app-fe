'use client'

import { useActionState } from 'react'
import { registerUser } from './actions'
import { SubmitButton } from '../login/_components/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RegisterState } from './types'

export default function RegisterPage() {
  const [state, formAction] = useActionState<RegisterState | undefined, FormData>(registerUser, undefined)

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
              Bergabung Bersama Kami
            </h1>
            <p className="text-slate-400 mt-1 text-xs font-semibold uppercase tracking-wider">
              Buat akun baru untuk kemudahan lacak pesanan
            </p>
          </div>
        </div>

        {/* CONTAINER CARD FORM */}
        <Card className="border border-slate-100/80 shadow-[0_20px_50px_rgba(0,0,0,0.03)] bg-white rounded-[32px] overflow-hidden">
          <CardContent className="p-8 md:p-10">

            {/* ALERT SUCCESS */}
            {state?.success && (
              <Alert className="mb-5 border-emerald-100 bg-emerald-50/60 p-4 rounded-2xl">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <AlertDescription className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                    {state.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* ALERT ERROR */}
            {state?.error && (
              <Alert className="mb-5 border-red-100 bg-red-50/60 p-4 rounded-2xl">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <AlertDescription className="text-xs font-bold uppercase tracking-wide text-red-700">
                    {state.error}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <form action={formAction} className="space-y-5">
              
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Nama Lengkap
                </Label>
                <Input
                  id="name" 
                  name="name" 
                  type="text" 
                  placeholder="Masukkan nama lengkap Anda" 
                  required
                  defaultValue={state?.fields?.name}
                  className="h-13 bg-slate-50 border border-slate-100/50 rounded-2xl px-5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all"
                />
              </div>

              {/* Email / No HP */}
              <div className="space-y-1.5">
                <Label htmlFor="email_or_phone_number" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Email atau No. Handphone
                </Label>
                <Input
                  id="email_or_phone_number" 
                  name="email_or_phone_number" 
                  type="text" 
                  placeholder="nama@mail.com atau 0812..." 
                  required
                  defaultValue={state?.fields?.email_or_phone_number}
                  className="h-13 bg-slate-50 border border-slate-100/50 rounded-2xl px-5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all"
                />
              </div>

              {/* Grid Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Password
                  </Label>
                  <Input
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="••••••" 
                    required
                    defaultValue={state?.fields?.password}
                    className="h-13 bg-slate-50 border border-slate-100/50 rounded-2xl px-5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="password_confirmation" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Konfirmasi
                  </Label>
                  <Input
                    id="password_confirmation" 
                    name="password_confirmation" 
                    type="password" 
                    placeholder="••••••" 
                    required
                    defaultValue={state?.fields?.password_confirmation}
                    className="h-13 bg-slate-50 border border-slate-100/50 rounded-2xl px-5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#165dfc] focus:ring-4 focus:ring-[#165dfc]/5 transition-all"
                  />
                </div>
              </div>

              {/* Action Submit Button */}
              <div className="pt-3">
                <SubmitButton />
              </div>

              {/* DIVERTER LINK */}
              <div className="pt-4 border-t border-slate-50 flex flex-col items-center gap-2">
                <p className="text-xs font-semibold text-slate-400">
                  Sudah memiliki akun Sahabat Sport?
                </p>
                <Link 
                  href="/login" 
                  className="text-xs font-black uppercase tracking-widest text-[#165dfc] hover:text-[#124ecb] flex items-center gap-1.5 transition-all hover:gap-2"
                >
                  Masuk Di Sini <ArrowRight className="w-3.5 h-3.5" />
                </Link>
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