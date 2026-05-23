// app/(auth)/layout.tsx
export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Di sini bersih tanpa Navbar, langsung merender form login / register */}
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
    );
  }