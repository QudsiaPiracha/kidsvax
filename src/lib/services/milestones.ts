import { toggleMilestoneSchema } from "@/lib/validations/milestone";

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
  update: (data: Record<string, unknown>) => SupabaseQueryLike;
  delete: () => SupabaseQueryLike;
  eq: (col: string, val: string) => SupabaseQueryLike;
  order: (col: string, opts?: Record<string, boolean>) => Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
  single: () => Promise<{
    data: Record<string, unknown> | null;
    error: unknown;
  }>;
}

export interface ServiceResult {
  status: number;
  body?: Record<string, unknown> | null;
}

async function getAuthUserId(
  supabase: SupabaseLike
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function verifyChildOwnership(
  childId: string,
  supabase: SupabaseLike,
  userId: string
): Promise<ServiceResult | null> {
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .single();

  if (error || !data) {
    return { status: 404, body: { error: "Child not found" } };
  }
  if (data.user_id !== userId) {
    return { status: 403, body: { error: "Forbidden" } };
  }
  return null;
}

interface MilestoneRecord {
  id: string;
  child_id: string;
  milestone_id: string;
  achieved: boolean;
  observed_date: string | null;
  milestone: {
    id: string;
    u_exam: string;
    category: string;
    title_en: string;
    title_de: string;
  };
}

function groupByUExam(
  records: MilestoneRecord[]
): Record<string, MilestoneRecord[]> {
  const groups: Record<string, MilestoneRecord[]> = {};
  for (const rec of records) {
    const exam = rec.milestone?.u_exam ?? "unknown";
    if (!groups[exam]) groups[exam] = [];
    groups[exam].push(rec);
  }
  return groups;
}

export async function listMilestones(
  childId: string,
  supabase: SupabaseLike
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const ownerError = await verifyChildOwnership(childId, supabase, userId);
  if (ownerError) return ownerError;

  const { data, error } = await supabase
    .from("milestone_records")
    .select("*, milestone:milestones(*)")
    .eq("child_id", childId)
    .order("milestone_id", { ascending: true });

  if (error) {
    return { status: 500, body: { error: error.message } };
  }

  const grouped = groupByUExam(
    (data as unknown as MilestoneRecord[]) ?? []
  );
  return { status: 200, body: { milestones: grouped } };
}

export async function toggleMilestone(
  recordId: string,
  supabase: SupabaseLike,
  input: unknown
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const parsed = toggleMilestoneSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, body: { error: parsed.error.issues[0].message } };
  }

  const { data: existing, error: fetchErr } = await supabase
    .from("milestone_records")
    .select("*")
    .eq("id", recordId)
    .single();

  if (fetchErr || !existing) {
    return { status: 404, body: { error: "Record not found" } };
  }

  const ownerError = await verifyChildOwnership(
    existing.child_id as string,
    supabase,
    userId
  );
  if (ownerError) return ownerError;

  const today = new Date().toISOString().split("T")[0];
  const updates: Record<string, unknown> = {
    achieved: parsed.data.achieved,
    observed_date: parsed.data.achieved
      ? parsed.data.observed_date ?? today
      : null,
  };

  const { data, error } = await supabase
    .from("milestone_records")
    .update(updates)
    .eq("id", recordId)
    .select()
    .single();

  if (error) {
    return {
      status: 500,
      body: { error: (error as { message: string }).message },
    };
  }
  return { status: 200, body: { record: data } };
}
