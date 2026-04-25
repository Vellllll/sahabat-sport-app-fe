'use client'

import { useActionState, useEffect } from 'react' // Tambah useEffect
import { registerUser } from './actions'
import { SubmitButton } from '../login/_components/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react' // Tambah icon
import Link from 'next/link'
import { useSearchParams } from 'next/navigation' // Tambah ini
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Pastikan sudah install alert shadcn
import { RegisterState } from './types'

const initialState: RegisterState = {
  success: false,
  error: '',
  message: '',
  fields: {
    name: '',
    email_or_phone_number: '',
    password: '',
    password_confirmation: ''
  }
}

export default function RegisterPage() {
  const [state, formAction] = useActionState<RegisterState | undefined, FormData>(registerUser, undefined)
  const searchParams = useSearchParams()

  return (
    <div className="min-h-screen bg-white md:bg-blue-50/30 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md">

        {/* Header Section */}
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-200">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Buat Akun Baru</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Gabung sekarang dan nikmati kemudahan belanja.</p>
        </div>

        <Card className="border-none md:border md:border-blue-100 shadow-none md:shadow-2xl md:shadow-blue-900/5 bg-white rounded-t-[2.5rem] md:rounded-[2rem]">
          <CardContent className="p-8 md:p-10">

            {/* ALERT SUCCESS */}
            {/* Alert Sukses menggunakan state dari action */}
            {state?.success && (
              <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            {/* ALERT ERROR */}
            {state?.error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-bold">Gagal</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <form action={formAction} className="space-y-5">
              {/* Input Nama Lengkap */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-600 text-sm font-semibold ml-1">Nama Lengkap</Label>
                <Input
                  id="name" name="name" type="text" placeholder="Masukkan nama lengkap" required
                  defaultValue={state?.fields?.name}
                  className="h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 px-4"
                />
              </div>

              {/* Input email_or_phone_number */}
              <div className="space-y-1.5">
                <Label htmlFor="email_or_phone_number" className="text-slate-600 text-sm font-semibold ml-1">Email atau No. Handphone</Label>
                <Input
                  id="email_or_phone_number" name="email_or_phone_number" type="text" placeholder="email@toko.com atau 0812..." required
                  defaultValue={state?.fields?.email_or_phone_number}
                  className="h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 px-4"
                />
              </div>

              {/* Input Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-600 text-sm font-semibold ml-1">Password</Label>
                  <Input
                    id="password" name="password" type="password" placeholder="••••••" required
                    defaultValue={state?.fields?.password}
                    className="h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 px-4"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password_confirmation" className="text-slate-600 text-sm font-semibold ml-1">Konfirmasi</Label>
                  <Input
                    id="password_confirmation" name="password_confirmation" type="password" placeholder="••••••" required
                    defaultValue={state?.fields?.password_confirmation}
                    className="h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 px-4"
                  />
                </div>
              </div>

              <div className="pt-2">
                <SubmitButton />
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-slate-500 font-medium">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">
                    Masuk di sini <ArrowLeft className="w-3 h-3 rotate-180" />
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Tambahan */}
        <div className="mt-8 px-10 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] leading-relaxed">
            Data kamu terlindungi dengan enkripsi SSL 256-bit.
          </p>
        </div>
      </div>
    </div>
  )
}