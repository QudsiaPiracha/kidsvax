import {
  anonymizeChildData,
  parseInsightsResult,
  runInsightsAgent,
} from "@/lib/agents/insights-agent";
import type { ServiceResult } from "@/lib/services/children";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

interface SupabaseLike {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: unknown;
    }>;
  };
  from: (table: string) => SupabaseQueryLike;
}

interface SupabaseQueryLike {
  select: (cols?: string) => SupabaseQueryLike;
  insert: (data: Record<string, unknown>) => SupabaseQueryLike;
  delete: () => SupabaseQueryLike;
  eq: (col: string, val: string) => SupabaseQueryLike;
  gte: (col: string, val: string) => SupabaseQueryLike;
  order: (col: string, opts?: Record<string, boolean>) => Promise<{
    data: Record<string, unknown>[] | null;
    error: { message: string } | null;
  }>;
  single: () => Promise<{
    data: Record<string, unknown> | null;
    error: unknown;
  }>;
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

async function getAuthUserId(sb: SupabaseLike): Promise<string | null> {
  const { data: { user } } = await sb.auth.getUser();
  return user?.id ?? null;
}

async function verifyChildOwnership(
  childId: string,
  sb: SupabaseLike,
  userId: string
): Promise<{ child: Record<string, unknown> | null; error: ServiceResult | null }> {
  const { data, error } = await sb
    .from("children").select("*").eq("id", childId).single();
  if (error || !data) return { child: null, error: { status: 404, body: { error: "Child not found" } } };
  if (data.user_id !== userId) return { child: null, error: { status: 403, body: { error: "Forbidden" } } };
  return { child: data, error: null };
}

// -----------------------------------------------------------------------
// GET Insights
// -----------------------------------------------------------------------

export async function getInsights(
  childId: string,
  supabase: SupabaseLike,
  language: string
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const { error: ownerErr } = await verifyChildOwnership(childId, supabase, userId);
  if (ownerErr) return ownerErr;

  const now = new Date().toISOString();
  const { data } = await supabase
    .from("ai_insights").select("*")
    .eq("child_id", childId)
    .gte("expires_at", now)
    .order("created_at", { ascending: false });

  const filtered = (data ?? []).filter(
    (row) => row.language === language
  );

  return { status: 200, body: { insights: filtered } };
}

// -----------------------------------------------------------------------
// Refresh Insights
// -----------------------------------------------------------------------

export async function refreshInsights(
  childId: string,
  supabase: SupabaseLike,
  language: string
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const { child, error: ownerErr } = await verifyChildOwnership(childId, supabase, userId);
  if (ownerErr) return ownerErr;

  const { data: measurements } = await supabase
    .from("growth_measurements").select("*")
    .eq("child_id", childId)
    .order("measured_date", { ascending: true });

  const anonymized = anonymizeChildData(
    child as { date_of_birth: string; gender: "male" | "female" },
    (measurements ?? []) as Array<{ height_cm: number; weight_kg: number; measured_date: string }>,
    []
  );

  // Invalidate old cached insights
  await (supabase.from("ai_insights").delete().eq("child_id", childId) as unknown as
    { gte: (col: string, val: string) => Promise<{ error: unknown }> }
  ).gte("expires_at", "1970-01-01");

  const insightsResult = await runInsightsAgent(anonymized);
  const parsed = typeof insightsResult === "string"
    ? parseInsightsResult(insightsResult)
    : insightsResult;

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: saved, error: saveErr } = await supabase
    .from("ai_insights")
    .insert({
      child_id: childId,
      content: JSON.stringify(parsed),
      language,
      expires_at: expiresAt,
    } as Record<string, unknown>)
    .select().single();

  if (saveErr) return { status: 500, body: { error: "Failed to save insights" } };
  return { status: 201, body: { insight: saved } };
}
