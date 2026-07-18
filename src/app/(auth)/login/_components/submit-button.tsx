'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps {
  label?: string;
  loadingLabel?: string;
}

export function SubmitButton({ label = "MASUK KE AKUN", loadingLabel = "Memproses..." }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand py-4 text-xs font-black tracking-[0.15em] text-white shadow-lg shadow-brand/20 hover:bg-brand-hover transition-all disabled:opacity-60 uppercase cursor-pointer"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  )
}