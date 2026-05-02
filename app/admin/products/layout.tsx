import { Metadata } from 'next'

// Metadata untuk judul tab dan SEO
export const metadata: Metadata = {
  title: 'Admin | Katalog Produk',
  description: 'Silakan buat akun untuk mulai berbelanja',
}

// Komponen Layout harus menjadi DEFAULT EXPORT
export default function ProductLayout({
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