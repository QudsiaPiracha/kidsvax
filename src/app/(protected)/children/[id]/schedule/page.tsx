/**
 * Schedule timeline page -- Server Component wrapper.
 * In production, this will fetch timeline items from Supabase.
 * For now, renders a placeholder.
 */
export default async function SchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  // TODO: fetch timeline items from Supabase
  return (
    <div className="max-w-md mx-auto p-4 text-gray-500">
      Schedule for child {id} -- data loading not yet implemented.
    </div>
  );
}
