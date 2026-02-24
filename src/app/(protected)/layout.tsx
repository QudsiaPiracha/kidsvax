function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-screen bg-warm-white">
      <main className="pb-20">{children}</main>
    </div>
  );
}

export default ProtectedLayout;
