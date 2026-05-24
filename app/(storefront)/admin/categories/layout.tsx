import { Metadata } from 'next'

// Metadata untuk judul tab dan SEO
export const metadata: Metadata = {
  title: 'Admin | Kategori Produk',
}

// Komponen Layout harus menjadi DEFAULT EXPORT
export default function ProductCategoryLayout({
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