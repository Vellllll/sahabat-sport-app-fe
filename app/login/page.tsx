'use client'

import { useActionState } from 'react'
import { authenticate } from './actions'
import { SubmitButton } from './_components/submit-button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingBag, ArrowRight } from 'lucide-react'

export default function CustomerLoginPage() {
  const [state, formAction] = useActionState(authenticate, undefined)

  return (
    <div className="min-h-screen bg-white md:bg-blue-50/30 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md">
        
        {/* Header Area */}
        <div className="p-8 text-center md:pt-0">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-6 shadow-xl shadow-blue-200">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Halo, Pelanggan Setia!
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Masuk untuk mulai belanja dan cek pesananmu.
          </p>
        </div>

        <Card className="border-none md:border md:border-blue-100 shadow-none md:shadow-2xl md:shadow-blue-900/5 bg-white rounded-t-[2.5rem] md:rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <form action={formAction} className="space-y-6">
              
              {/* INPUT EMAIL / NO HP */}
              <div className="space-y-2">
                <Label htmlFor="email_or_phone_number" className="text-slate-600 text-sm font-semibold ml-1">
                  Email atau Nomor HP
                </Label>
                <Input 
                  id="email_or_phone_number" 
                  name="email_or_phone_number" // DIUBAH AGAR SESUAI API
                  type="text" 
                  placeholder="Contoh: arvel@mail.com atau 0812..." 
                  required 
                  className="h-14 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-base px-5"
                />
              </div>

              {/* INPUT PASSWORD */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="text-slate-600 text-sm font-semibold">
                    Kata Sandi
                  </Label>
                  <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                    Lupa?
                  </button>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  className="h-14 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-base px-5"
                />
              </div>

              {/* ERROR MESSAGE */}
              {state?.error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold text-center border border-red-100 animate-in fade-in zoom-in duration-200">
                  {state.error}
                </div>
              )}

              <div className="pt-2">
                <SubmitButton />
              </div>

              {/* REGISTER LINK */}
              <div className="flex flex-col items-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  Belum punya akun?
                  <a href="/register" className="text-blue-600 font-bold flex items-center gap-1 hover:underline">
                    Daftar Sekarang <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* FOOTER */}
        <div className="mt-8 text-center px-8">
          <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
            Data kamu terlindungi dengan enkripsi SSL 256-bit.
          </p>
        </div>
      </div>
    </div>
  )
}