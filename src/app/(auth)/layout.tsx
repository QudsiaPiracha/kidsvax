import Link from "next/link";

function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      {/* Minimal nav */}
      <nav className="px-6 py-5">
        <Link href="/" className="text-xl font-bold text-sage-700 hover:text-sage-800 transition-colors">
          KidsVax
        </Link>
      </nav>

      {/* Auth card */}
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-sage-100 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        Data hosted in EU (Frankfurt). DSGVO/GDPR compliant.
      </footer>
    </div>
  );
}

export default AuthLayout;
