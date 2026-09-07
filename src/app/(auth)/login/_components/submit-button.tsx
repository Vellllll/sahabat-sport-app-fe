'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps {
  label?: string;
  loadingLabel?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function SubmitButton({ 
  label = "MASUK KE AKUN", 
  loadingLabel = "Memproses...",
  className = "",
  icon
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`group relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand py-3.5 px-6 text-xs font-black tracking-wider text-white shadow-lg shadow-brand/25 transition-all duration-200 hover:bg-brand-hover hover:shadow-xl hover:shadow-brand/35 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed uppercase cursor-pointer ${className}`}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          {icon}
        </>
      )}
    </button>
  )
}