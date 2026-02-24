import { updateReminderPrefsSchema } from "@/lib/validations/reminder";
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
  upsert: (data: Record<string, unknown>) => SupabaseQueryLike;
  eq: (col: string, val: string) => SupabaseQueryLike;
  single: () => Promise<{
    data: Record<string, unknown> | null;
    error: { message: string } | null;
  }>;
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

async function getAuthUserId(sb: SupabaseLike): Promise<string | null> {
  const { data: { user } } = await sb.auth.getUser();
  return user?.id ?? null;
}

// -----------------------------------------------------------------------
// GET Preferences
// -----------------------------------------------------------------------

export async function getReminderPreferences(
  supabase: SupabaseLike
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const { data, error } = await supabase
    .from("reminder_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    return { status: 200, body: { preferences: defaultPreferences(userId) } };
  }
  return { status: 200, body: { preferences: data } };
}

// -----------------------------------------------------------------------
// PUT Preferences
// -----------------------------------------------------------------------

export async function updateReminderPreferences(
  supabase: SupabaseLike,
  input: unknown
): Promise<ServiceResult> {
  const userId = await getAuthUserId(supabase);
  if (!userId) return { status: 401, body: { error: "Unauthorized" } };

  const parsed = updateReminderPrefsSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, body: { error: parsed.error.issues[0].message } };
  }

  const { data, error } = await supabase
    .from("reminder_preferences")
    .upsert({
      user_id: userId,
      ...parsed.data,
    } as Record<string, unknown>)
    .select()
    .single();

  if (error) {
    return { status: 500, body: { error: error.message } };
  }
  return { status: 200, body: { preferences: data } };
}

// -----------------------------------------------------------------------
// Defaults
// -----------------------------------------------------------------------

function defaultPreferences(userId: string) {
  return {
    user_id: userId,
    u_exam_reminders: true,
    vaccination_reminders: true,
    reminder_days_before_u_exam: 14,
    reminder_days_before_vaccination: 7,
  };
}
