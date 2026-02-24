import { updateUExamSchema } from "@/lib/validations/u-exam";
import type { ServiceResult } from "@/lib/services/children";

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
  update: (data: Record<string, unknown>) => SupabaseQueryLike;
  eq: (col: string, val: string) => SupabaseQueryLike;
  order: (col: string, opts?: Record<string, unknown>) => Promise<{
    data: Record<string, unknown>[] | null;
    error: { message: string } | null;
  }>;
  single: () => Promise<{
    data: Record<string, unknown> | null;
    error: unknown;
  }>;
}

async function getAuthUserId(
  supabase: SupabaseLike
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Compute a status badge based on record status and scheduled date. */
function computeStatusBadge(
  status: string,
  scheduledDate: string
): string {
  if (status === "completed") return "completed";
  if (status === "skipped") return "skipped";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(scheduledDate);
  scheduled.setHours(0, 0, 0, 0);

  if (scheduled < today) return "overdue";
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  if (scheduled <= twoWeeks) return "upcoming";
  return "scheduled";
}

export async function listUExamRecords(
  childId: string,
  supabase: SupabaseLike
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const { data: child, error: childErr } = await supabase
    .from("children")
    .select("id, user_id")
    .eq("id", childId)
    .single();

  if (childErr || !child) {
    return { status: 404, body: { error: "Child not found" } };
  }
  if (child.user_id !== userId) {
    return { status: 403, body: { error: "Forbidden" } };
  }

  const query = supabase
    .from("u_exam_records")
    .select("*, u_exams(*)")
    .eq("child_id", childId);

  const { data, error } = await query.order("scheduled_date", {
    ascending: true,
  });

  if (error) return { status: 500, body: { error: error.message } };

  const records = (data ?? []).map((rec) => ({
    ...rec,
    status_badge: computeStatusBadge(
      rec.status as string,
      rec.scheduled_date as string
    ),
  }));

  return { status: 200, body: { records } };
}

export async function updateUExamRecord(
  recordId: string,
  supabase: SupabaseLike,
  input: unknown
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const { data: record, error: fetchErr } = await supabase
    .from("u_exam_records")
    .select("*, children(id, user_id)")
    .eq("id", recordId)
    .single();

  if (fetchErr || !record) {
    return { status: 404, body: { error: "Record not found" } };
  }

  const children = record.children as Record<string, unknown>;
  if (children.user_id !== userId) {
    return { status: 403, body: { error: "Forbidden" } };
  }

  const parsed = updateUExamSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, body: { error: parsed.error.issues[0].message } };
  }

  const { data: updated, error: updateErr } = await supabase
    .from("u_exam_records")
    .update(parsed.data as unknown as Record<string, unknown>)
    .eq("id", recordId)
    .select()
    .single();

  if (updateErr) {
    return { status: 500, body: { error: (updateErr as { message: string }).message } };
  }
  return { status: 200, body: { record: updated } };
}
