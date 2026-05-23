import { Metadata } from 'next'

// Metadata untuk judul tab dan SEO
export const metadata: Metadata = {
  title: 'Daftar Akun Baru',
  description: 'Silakan buat akun untuk mulai berbelanja',
}

// Komponen Layout harus menjadi DEFAULT EXPORT
export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      {children}
    </section>
  )
}