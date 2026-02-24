/**
 * Schedule timeline page -- Server Component wrapper.
 * In production, this will fetch timeline items from Supabase.
 * For now, renders a placeholder.
 */
export default function SchedulePage({
  params,
}: {
  params: { id: string };
}): React.JSX.Element {
  // TODO: fetch timeline items from Supabase
  return (
    <div className="max-w-md mx-auto p-4 text-gray-500">
      Schedule for child {params.id} -- data loading not yet implemented.
    </div>
  );
}
