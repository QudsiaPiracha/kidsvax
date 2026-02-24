function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white px-4">
      <div className="w-full max-w-md rounded-lg border border-sage-100 bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
