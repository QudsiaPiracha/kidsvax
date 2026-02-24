/**
 * Child detail page -- Server Component wrapper.
 * In production, this will fetch child data from Supabase.
 * For now, renders a placeholder.
 */
export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  // TODO: fetch child data, pediatrician, stats from Supabase
  return (
    <div className="max-w-md mx-auto p-4 text-gray-500">
      Child detail for {id} -- data loading not yet implemented.
    </div>
  );
}
