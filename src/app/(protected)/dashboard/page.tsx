import { Dashboard } from "@/components/Dashboard";

/**
 * Dashboard page -- Server Component wrapper.
 * In production, this will fetch children data from Supabase.
 * For now, renders the Dashboard with an empty array.
 */
export default function DashboardPage(): React.JSX.Element {
  // TODO: fetch children summaries from Supabase
  return <Dashboard children={[]} />;
}
