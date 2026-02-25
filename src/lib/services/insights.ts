import { generateGrowthInsights } from "@/lib/growth-insights";
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
  lt: (col: string, val: string) => SupabaseQueryLike;
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

  // Invalidate old cached insights for this child
  await supabase.from("ai_insights").delete().eq("child_id", childId)
    .lt("expires_at", new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false });

  // Generate insights locally from WHO percentile data
  const dateOfBirth = child?.date_of_birth as string;
  const gender = child?.gender as string;
  const measArray = (measurements ?? []).map((m) => ({
    measured_date: m.measured_date as string,
    weight_kg: m.weight_kg as number | null,
    height_cm: m.height_cm as number | null,
    head_circumference_cm: m.head_circumference_cm as number | null,
  }));

  const insights = generateGrowthInsights({
    measurements: measArray,
    dateOfBirth,
    gender,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: saved, error: saveErr } = await supabase
    .from("ai_insights")
    .insert({
      child_id: childId,
      insight_type: "growth",
      content: insights,
      language,
      expires_at: expiresAt,
    } as Record<string, unknown>)
    .select("*").single();

  if (saveErr) {
    const msg = typeof saveErr === "object" && saveErr !== null && "message" in saveErr
      ? (saveErr as { message: string }).message
      : "Unknown error saving insights";
    return { status: 500, body: { error: msg } };
  }
  return { status: 201, body: { insight: saved } };
}
