/**
 * Child detail page -- Server Component wrapper.
 * In production, this will fetch child data from Supabase.
 * For now, renders a placeholder.
 */
export default function ChildDetailPage({
  params,
}: {
  params: { id: string };
}): React.JSX.Element {
  // TODO: fetch child data, pediatrician, stats from Supabase
  return (
    <div className="max-w-md mx-auto p-4 text-gray-500">
      Child detail for {params.id} -- data loading not yet implemented.
    </div>
  );
}
